import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { performance } from "node:perf_hooks";

import { describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";

import {
  createProjectPlan,
  detectGanttSheets,
  findGanttHeader,
  loadProjectWorkbook,
  normalizeHeader,
  parseWorkbookBuffer,
  WorkbookGatewayError,
} from "../../dashboard-assets/workbook-gateway.js";

const repositoryRoot = new URL("../../", import.meta.url);

async function workbookFromFixture(fileName) {
  const fixture = JSON.parse(
    await readFile(new URL(`../fixtures/${fileName}`, import.meta.url), "utf8"),
  );
  const workbook = XLSX.utils.book_new();
  for (const [sheetName, rows] of Object.entries(fixture.sheets)) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), sheetName);
  }
  return workbook;
}

function workbookArray(workbook) {
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}

describe("workbook gateway", () => {
  it("normalizes whitespace, case and Spanish diacritics", () => {
    expect(normalizeHeader("  Fin   LÍNEA base ")).toBe("fin linea base");
    expect(normalizeHeader("DURACIÓN")).toBe("duracion");
  });

  it("finds a compatible header away from the first row", () => {
    const header = findGanttHeader([
      ["Título"],
      [],
      ["Tarea", "Inicio", "Fin", "% completado", "Estado", "Fecha cierre real", "Hito"],
    ]);
    expect(header.headerRowNumber).toBe(3);
    expect(header.headerMap).toMatchObject({
      name: 0,
      plannedStart: 1,
      plannedEnd: 2,
      completionFraction: 3,
      status: 4,
      actualClose: 5,
      milestone: 6,
    });
  });

  it("detects one Gantt sheet, metadata and tasks without fixed columns", async () => {
    const workbook = await workbookFromFixture("gantt-single.json");
    const sheets = detectGanttSheets(workbook, XLSX);

    expect(sheets).toHaveLength(1);
    expect(sheets[0]).toMatchObject({
      id: "Proyecto Norte",
      headerRowNumber: 5,
      metadata: {
        statusDate: "2026-05-15",
        projectStart: "2026-04-27",
        projectEnd: "2026-06-21",
      },
    });

    const plan = createProjectPlan(workbook, sheets[0], {
      xlsx: XLSX,
      sourceFile: "planificación.xlsx",
    });
    expect(plan.tasks).toHaveLength(2);
    expect(plan.tasks[0]).toMatchObject({
      id: "Proyecto Norte:6",
      wbs: "1.1",
      name: "Definir alcance",
      assignee: "Ana",
      durationDays: 5,
      completionFraction: 1,
      blocked: false,
      milestone: false,
      sourceRow: 6,
    });
    expect(plan.tasks[1]).toMatchObject({
      assignee: "Sin asignar",
      blocked: true,
      milestone: true,
    });
  });

  it("detects multiple projects and English aliases independently", async () => {
    const workbook = await workbookFromFixture("gantt-multiple.json");
    const sheets = detectGanttSheets(workbook, XLSX);

    expect(sheets.map(({ name }) => name)).toEqual(["Gantt Alpha", "Gantt Beta"]);
    expect(sheets.map(({ headerRowNumber }) => headerRowNumber)).toEqual([2, 3]);
    const beta = createProjectPlan(workbook, sheets[1], { xlsx: XLSX });
    expect(beta.tasks[0]).toMatchObject({ name: "Beta", assignee: "Bruno", milestone: true });
  });

  it("loads bytes through the injected read-only fetch boundary", async () => {
    const workbook = await workbookFromFixture("gantt-single.json");
    const bytes = workbookArray(workbook);
    const fetchImpl = vi.fn(async () => new Response(bytes, { status: 200 }));

    const result = await loadProjectWorkbook("planificación local.xlsx", { fetchImpl, xlsx: XLSX });

    expect(fetchImpl).toHaveBeenCalledWith(
      "planificaci%C3%B3n%20local.xlsx",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result.sheets).toHaveLength(1);
  });

  it("parses workbook ArrayBuffers and reports corrupt input", async () => {
    const workbook = await workbookFromFixture("gantt-single.json");
    expect(parseWorkbookBuffer(workbookArray(workbook), XLSX).SheetNames).toContain("Proyecto Norte");
    expect(() => parseWorkbookBuffer(new Uint8Array(), XLSX)).toThrow(WorkbookGatewayError);
  });

  it("rejects unavailable readers, unsupported files, failed fetches and missing sheets", async () => {
    const workbook = await workbookFromFixture("gantt-single.json");
    expect(() => detectGanttSheets(workbook, null)).toThrowError(
      expect.objectContaining({ code: "XLSX_UNAVAILABLE" }),
    );
    expect(() => createProjectPlan(workbook, { id: "No existe" }, { xlsx: XLSX })).toThrowError(
      expect.objectContaining({ code: "SHEET_NOT_FOUND" }),
    );
    await expect(loadProjectWorkbook("plan.csv", { fetchImpl: vi.fn(), xlsx: XLSX })).rejects.toMatchObject({
      code: "WORKBOOK_EXTENSION_UNSUPPORTED",
    });
    await expect(loadProjectWorkbook("plan.xlsx", { fetchImpl: null, xlsx: XLSX })).rejects.toMatchObject({
      code: "FETCH_UNAVAILABLE",
    });
    await expect(loadProjectWorkbook("plan.xlsx", {
      fetchImpl: vi.fn(async () => new Response(null, { status: 404 })),
      xlsx: XLSX,
    })).rejects.toMatchObject({ code: "WORKBOOK_FETCH_FAILED" });
    await expect(loadProjectWorkbook("plan.xlsx", {
      fetchImpl: vi.fn(async () => new Response(null, { status: 423 })),
      xlsx: XLSX,
    })).rejects.toMatchObject({ code: "WORKBOOK_LOCKED" });
    const noGantt = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(noGantt, XLSX.utils.aoa_to_sheet([["Notas"]]), "Notas");
    await expect(loadProjectWorkbook("plan.xlsx", {
      fetchImpl: vi.fn(async () => new Response(workbookArray(noGantt), { status: 200 })),
      xlsx: XLSX,
    })).rejects.toMatchObject({ code: "GANTT_HEADERS_MISSING" });
  });

  it("reports typed row quality issues and preserves invalid source values", () => {
    const rows = [
      [
        "Tarea", "Inicio", "Fin", "Fin", "% completado", "Estado",
        "Fecha cierre real", "Bloqueada", "Hito",
      ],
      ["Inválida", "ayer", "2026-01-01", "2026-01-02", "mucho", "Pendiente", null, "quizá", "tal vez"],
    ];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gantt");
    const [descriptor] = detectGanttSheets(workbook, XLSX);
    const plan = createProjectPlan(workbook, descriptor, { xlsx: XLSX });

    expect(plan.tasks[0].plannedStart).toBe("ayer");
    expect(plan.tasks[0].completionFraction).toBe("mucho");
    expect(plan.qualityIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "DUPLICATE_HEADER", severity: "error", row: 1, affectedMetric: "plannedEnd" }),
      expect.objectContaining({ code: "INVALID_DATE", severity: "error", row: 2, affectedMetric: "plannedStart" }),
      expect.objectContaining({ code: "INVALID_COMPLETION", severity: "error", row: 2, affectedMetric: "completionFraction" }),
      expect.objectContaining({ code: "INVALID_BOOLEAN", severity: "error", row: 2, affectedMetric: "blocked" }),
    ]));
  });

  it("reports formulas without cached values", () => {
    const rows = [
      ["Tarea", "Inicio", "Fin", "% completado", "Estado", "Fecha cierre real", "Hito"],
      ["Fórmula", "2026-01-01", "2026-01-02", null, "Pendiente", null, "No"],
    ];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    worksheet.D2 = { t: "n", f: "1/2" };
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gantt");
    const [descriptor] = detectGanttSheets(workbook, XLSX);
    const plan = createProjectPlan(workbook, descriptor, { xlsx: XLSX });

    expect(plan.qualityIssues).toContainEqual(expect.objectContaining({
      code: "FORMULA_WITHOUT_CACHED_VALUE",
      row: 2,
      affectedMetric: "completionFraction",
    }));
  });

  it("detects the real reference workbook without changing it", async () => {
    const workbookUrl = new URL("diagramaGanttBase.xlsm", repositoryRoot);
    const bytesBefore = await readFile(workbookUrl);
    const statBefore = await stat(workbookUrl);
    const hashBefore = createHash("sha256").update(bytesBefore).digest("hex");
    const workbook = parseWorkbookBuffer(bytesBefore, XLSX);
    const sheets = detectGanttSheets(workbook, XLSX);
    const descriptor = sheets.find(({ name }) => name === "Gantt");

    expect(descriptor).toBeDefined();
    expect(descriptor.headerRowNumber).toBe(8);
    expect(descriptor.headerMap).toMatchObject({
      name: 1,
      assignee: 2,
      plannedStart: 4,
      plannedEnd: 5,
      baselineEnd: 9,
      actualClose: 10,
      milestone: 13,
    });
    const plan = createProjectPlan(workbook, descriptor, { xlsx: XLSX });
    expect(Array.isArray(plan.tasks)).toBe(true);
    expect(plan.tasks.every(({ name }) => typeof name === "string" && name.length > 0)).toBe(true);

    const bytesAfter = await readFile(workbookUrl);
    const statAfter = await stat(workbookUrl);
    expect(createHash("sha256").update(bytesAfter).digest("hex")).toBe(hashBefore);
    expect(statAfter.mtimeMs).toBe(statBefore.mtimeMs);
  }, 20_000);

  it("treats X and x as boolean true for Hito and Bloqueada without INVALID_BOOLEAN warnings", () => {
    const rows = [
      ["Tarea", "Inicio", "Fin", "% completado", "Estado", "Fecha cierre real", "Hito", "Bloqueada"],
      ["Hito X", "2026-03-01", "2026-03-01", 0, "Pendiente", null, "X", null],
      ["Hito x", "2026-03-02", "2026-03-02", 0, "Pendiente", null, "x", null],
      ["Bloqueada X", "2026-03-05", "2026-03-10", 0, "Pendiente", null, null, "X"],
      ["Normal", "2026-03-15", "2026-03-20", 0, "Pendiente", null, "No", "No"],
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Gantt");
    const [descriptor] = detectGanttSheets(workbook, XLSX);
    const plan = createProjectPlan(workbook, descriptor, { xlsx: XLSX });

    expect(plan.qualityIssues.filter(({ code }) => code === "INVALID_BOOLEAN")).toHaveLength(0);
    expect(plan.tasks[0].milestone).toBe(true);
    expect(plan.tasks[1].milestone).toBe(true);
    expect(plan.tasks[2].blocked).toBe(true);
    expect(plan.tasks[3].milestone).toBe(false);
    expect(plan.tasks[3].blocked).toBe(false);
  });

  it("accepts a compatible workbook without optional close or milestone columns", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Tarea", "Asignado", "Inicio", "Fin", "% completado", "Estado"],
      ["Kickoff", "Susana", "2026-08-05", "2026-08-05", 1, "Completo"],
      ["Análisis", "Susana", "2026-08-10", "2026-09-07", 0.5, "En progreso"],
    ]), "Gantt");
    const sheets = detectGanttSheets(workbook, XLSX);

    expect(sheets).toHaveLength(1);
    expect(sheets[0]).toMatchObject({ name: "Gantt", headerRowNumber: 1 });
    expect(sheets[0].headerMap).not.toHaveProperty("actualClose");
    expect(sheets[0].headerMap).not.toHaveProperty("milestone");
    const plan = createProjectPlan(workbook, sheets[0], { xlsx: XLSX });
    expect(plan.tasks).toHaveLength(2);
    expect(plan.qualityIssues.filter(({ code }) => code === "MISSING_RECOMMENDED_HEADER")).toHaveLength(2);
    expect(plan.qualityIssues.some(({ code }) => code === "INVALID_DATE_RANGE")).toBe(false);
  });

  it("detects section rows (no assignee, no duration, no dates) and excludes them from tasks", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Tarea", "Asignado", "Duración días", "Inicio", "Fin", "% completado", "Estado"],
      ["Fase 1", null, null, null, null, null, null],
      ["Definir requisitos", "Ana", 5, "2026-01-05", "2026-01-09", 1, "Completada"],
      ["Fase 2", null, null, null, null, null, null],
      ["Desarrollo", "Luis", 10, "2026-01-12", "2026-01-23", 0.5, "En progreso"],
    ]), "Gantt");
    const [descriptor] = detectGanttSheets(workbook, XLSX);
    const plan = createProjectPlan(workbook, descriptor, { xlsx: XLSX });

    // Tasks array contains only non-section rows
    expect(plan.tasks).toHaveLength(2);
    expect(plan.tasks[0].name).toBe("Definir requisitos");
    expect(plan.tasks[1].name).toBe("Desarrollo");

    // Sections array is populated
    expect(plan.sections).toHaveLength(2);
    expect(plan.sections[0]).toMatchObject({ name: "Fase 1", sourceRow: 2 });
    expect(plan.sections[1]).toMatchObject({ name: "Fase 2", sourceRow: 4 });
    expect(plan.sections[0].id).toBe(`Gantt:2`);
    expect(plan.sections[1].id).toBe(`Gantt:4`);
  });

  it("assigns sectionId to each task based on the preceding section", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Tarea", "Inicio", "Fin", "% completado", "Estado"],
      ["Tarea sin sección", "2026-01-01", "2026-01-02", 0, "Pendiente"],
      ["Sección A", null, null, null, null],
      ["Tarea A1", "2026-01-05", "2026-01-06", 0, "Pendiente"],
      ["Tarea A2", "2026-01-07", "2026-01-08", 0, "Pendiente"],
      ["Sección B", null, null, null, null],
      ["Tarea B1", "2026-01-10", "2026-01-11", 0, "Pendiente"],
    ]), "Gantt");
    const [descriptor] = detectGanttSheets(workbook, XLSX);
    const plan = createProjectPlan(workbook, descriptor, { xlsx: XLSX });

    expect(plan.tasks).toHaveLength(4);
    expect(plan.tasks[0].sectionId).toBeNull();
    expect(plan.tasks[1].sectionId).toBe("Gantt:3");
    expect(plan.tasks[2].sectionId).toBe("Gantt:3");
    expect(plan.tasks[3].sectionId).toBe("Gantt:6");
  });

  it("returns empty sections array and null sectionId when no section rows exist", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Tarea", "Asignado", "Inicio", "Fin", "% completado", "Estado"],
      ["Tarea 1", "Ana", "2026-01-01", "2026-01-05", 0.5, "En progreso"],
    ]), "Gantt");
    const [descriptor] = detectGanttSheets(workbook, XLSX);
    const plan = createProjectPlan(workbook, descriptor, { xlsx: XLSX });

    expect(plan.sections).toHaveLength(0);
    expect(plan.tasks[0].sectionId).toBeNull();
  });

  it("does not generate quality issues for section rows", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Tarea", "Inicio", "Fin", "% completado", "Estado"],
      ["Fase 1", null, null, null, null],
      ["Tarea 1", "2026-01-01", "2026-01-05", 0, "Pendiente"],
    ]), "Gantt");
    const [descriptor] = detectGanttSheets(workbook, XLSX);
    const plan = createProjectPlan(workbook, descriptor, { xlsx: XLSX });

    // No quality issues for the section row itself (INVALID_COMPLETION etc. should not fire for sections)
    const sectionRowIssues = plan.qualityIssues.filter((qi) => qi.row === 2);
    expect(sectionRowIssues).toHaveLength(0);
  });

  it("treats a row with name but partial dates as a task (not a section)", () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
      ["Tarea", "Inicio", "Fin", "% completado", "Estado"],
      ["Tarea con solo inicio", "2026-01-01", null, 0, "Pendiente"],
    ]), "Gantt");
    const [descriptor] = detectGanttSheets(workbook, XLSX);
    const plan = createProjectPlan(workbook, descriptor, { xlsx: XLSX });

    // Has a plannedStart but no plannedEnd — still a task, not a section
    expect(plan.tasks).toHaveLength(1);
    expect(plan.sections).toHaveLength(0);
  });

  it("prepares 1,000 mapped tasks within the three-second budget", () => {
    const rows = [
      ["Tarea", "Inicio", "Fin", "% completado", "Estado", "Fecha cierre real", "Hito"],
    ];
    for (let index = 1; index <= 1000; index += 1) {
      rows.push([`Tarea ${index}`, "2026-01-01", "2026-01-02", 0, "Pendiente", null, "No"]);
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Gantt 1000");

    const startedAt = performance.now();
    const sheets = detectGanttSheets(workbook, XLSX);
    const plan = createProjectPlan(workbook, sheets[0], { xlsx: XLSX });
    const elapsed = performance.now() - startedAt;

    expect(plan.tasks).toHaveLength(1000);
    expect(elapsed).toBeLessThan(3000);
  });
});
