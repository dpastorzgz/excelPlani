// @vitest-environment jsdom

import { readFile } from "node:fs/promises";

import { beforeEach, describe, expect, it, vi } from "vitest";

globalThis.__DASHBOARD_DISABLE_AUTO_START__ = true;
const { createDashboardApplication } = await import("../../dashboard-assets/app.js");

const html = await readFile("dashboard.html", "utf8");

beforeEach(() => {
  document.open();
  document.write(html);
  document.close();
});

function descriptor() {
  return { id: "Gantt", name: "Proyecto", metadata: { statusDate: "2026-05-15" } };
}

describe("dashboard application composition", () => {
  it("loads, auto-selects one project and renders a coherent snapshot", async () => {
    const task = {
      id: "Gantt:9", name: "Entregar", assignee: "Ana", plannedStart: "2026-05-01", plannedEnd: "2026-05-10",
      baselineEnd: null, actualClose: "2026-05-09", completionFraction: 1, status: "Completada", milestone: false,
    };
    const loadWorkbook = vi.fn(async () => ({ sourceFile: "plan.xlsm", workbook: {}, sheets: [descriptor()] }));
    const createPlan = vi.fn(() => ({
      sourceFile: "plan.xlsm", sheetId: "Gantt", sheetName: "Proyecto", statusDate: "2026-05-15",
      date1904: false, tasks: [task], qualityIssues: [],
    }));
    const app = createDashboardApplication({
      document, config: { workbookFile: "plan.xlsm" }, xlsx: {}, loadWorkbook, createPlan,
    });
    await app.reload();
    expect(loadWorkbook).toHaveBeenCalledWith("plan.xlsm", { xlsx: {} });
    expect(createPlan).toHaveBeenCalledOnce();
    expect(app.store.getState()).toMatchObject({ status: "ready", selectedSheetId: "Gantt", metrics: { total: 1, completed: 1 } });
    expect(app.store.getState().filters.controlDate).toBe("2026-05-15");
    expect(document.querySelector("#kpi-total").textContent).toBe("1");
    expect(document.querySelector("#kpi-closed-on-time").textContent).toBe("1");
  });

  it("keeps multiple projects selectable and reports typed load failures", async () => {
    const firstLoad = vi.fn(async () => ({
      sourceFile: "plan.xlsm", workbook: {}, sheets: [descriptor(), { id: "Otro", name: "Otro", metadata: {} }],
    }));
    const createPlan = vi.fn((_workbook, selected) => ({
      sheetId: selected.id, sheetName: selected.name, statusDate: null, date1904: false, tasks: [], qualityIssues: [],
    }));
    const app = createDashboardApplication({ document, config: { workbookFile: "plan.xlsm" }, loadWorkbook: firstLoad, createPlan });
    await app.reload();
    expect(app.store.getState().selectedSheetId).toBe("Gantt");
    app.selectProject("Otro");
    expect(app.store.getState()).toMatchObject({ selectedSheetId: "Otro", status: "empty" });
    await app.reload();
    expect(app.store.getState().selectedSheetId).toBe("Otro");
  });

  it("does not expose exportCurrentSnapshot and does not render the copy button", () => {
    const app = createDashboardApplication({ document, loadWorkbook: vi.fn() });
    expect(typeof app.exportCurrentSnapshot).toBe("undefined");
    expect(document.querySelector("#copy-dashboard-button")).toBeNull();
  });
});
