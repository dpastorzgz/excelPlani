// @vitest-environment jsdom

import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { createDashboardStore } from "../../dashboard-assets/dashboard-state.js";
import { computeGanttLayout, createDashboardView } from "../../dashboard-assets/dashboard-view.js";

const html = await readFile("dashboard.html", "utf8");

function sampleTask(overrides = {}) {
  return {
    id: "Gantt:9",
    name: "Definir alcance",
    assignee: "Ana",
    plannedStart: "2026-01-01",
    plannedEnd: "2026-01-10",
    baselineEnd: null,
    actualClose: null,
    completionFraction: 0.5,
    status: "En curso",
    comments: "Validar con negocio",
    milestone: false,
    ...overrides,
  };
}

function plan(tasks) {
  return { sheetId: "Gantt", tasks, qualityIssues: [], date1904: false };
}

beforeEach(() => {
  document.open();
  document.write(html);
  document.close();
  HTMLDialogElement.prototype.showModal = function showModal() { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

describe("dashboard view", () => {
  it("renders controls, KPIs, status and untrusted task text safely", () => {
    const maliciousName = '<img src=x onerror="globalThis.compromised=true">';
    const store = createDashboardStore({
      status: "ready",
      sourceFile: "plan.xlsm",
      sheets: [{ id: "Gantt", name: "Proyecto" }],
      selectedSheetId: "Gantt",
      tasks: [sampleTask({ name: maliciousName })],
      filters: { controlDate: "2026-01-05" },
    });
    const view = createDashboardView({ document, store });

    expect(document.querySelector("#kpi-total").textContent).toBe("1");
    expect(document.querySelector("#source-file-name").textContent).toBe("plan.xlsm");
    expect(document.querySelector(".gantt-task-button").textContent).toBe(maliciousName);
    expect(document.querySelector("#gantt-task-list img")).toBeNull();
    expect(globalThis.compromised).toBeUndefined();
    view.destroy();
  });

  it("binds combined filters and scale to one store snapshot", () => {
    const store = createDashboardStore({
      status: "ready",
      tasks: [sampleTask(), sampleTask({ id: "2", assignee: "Bruno" })],
      filters: { controlDate: "2026-01-05" },
    });
    createDashboardView({ document, store });
    const assignees = document.querySelector("#assignee-filter");
    [...assignees.options].find(({ value }) => value === "Ana").selected = true;
    assignees.dispatchEvent(new Event("change", { bubbles: true }));
    expect(store.getState().filters.assignees).toEqual(["Ana"]);
    expect(document.querySelector("#kpi-total").textContent).toBe("1");

    document.querySelector('[data-scale="month"]').click();
    expect(store.getState().scale).toBe("month");
    expect(document.querySelector('[data-scale="month"]').getAttribute("aria-pressed")).toBe("true");
  });

  it("clears resource and date filters independently", () => {
    const store = createDashboardStore({
      status: "ready",
      tasks: [sampleTask(), sampleTask({ id: "2", assignee: "Bruno" })],
      filters: {
        controlDate: "2026-01-05",
        assignees: ["Ana"],
        dateFrom: "2026-01-02",
        dateTo: "2026-01-08",
      },
    });
    createDashboardView({ document, store });

    document.querySelector("#clear-assignee-filter").click();
    expect(store.getState().filters.assignees).toEqual([]);
    expect(store.getState().filters.dateFrom).toBe("2026-01-02");

    document.querySelector("#clear-date-range").click();
    expect(store.getState().filters.dateFrom).toBeNull();
    expect(store.getState().filters.dateTo).toBeNull();
  });

  it("opens task details with the keyboard target and restores focus on close", () => {
    const store = createDashboardStore({
      status: "ready",
      tasks: [sampleTask()],
      filters: { controlDate: "2026-01-05" },
    });
    createDashboardView({ document, store });
    const trigger = document.querySelector(".gantt-task-button");
    trigger.focus();
    trigger.click();
    expect(document.querySelector("#task-details").hasAttribute("open")).toBe(true);
    expect(document.querySelector("#task-details-title").textContent).toBe("Definir alcance");
    document.querySelector("#close-task-details").click();
    expect(document.activeElement).toBe(trigger);
  });

  it("links task focus and pointer hover to the complete Gantt row", () => {
    const store = createDashboardStore({
      status: "ready", tasks: [sampleTask()], filters: { controlDate: "2026-01-05" },
    });
    createDashboardView({ document, store });
    const item = document.querySelector(".gantt-task-item");
    const button = document.querySelector(".gantt-task-button");
    const row = document.querySelector(".gantt-row");

    item.dispatchEvent(new Event("pointerenter"));
    expect(item.classList.contains("is-highlighted")).toBe(true);
    expect(row.classList.contains("is-highlighted")).toBe(true);
    item.dispatchEvent(new Event("pointerleave"));
    expect(row.classList.contains("is-highlighted")).toBe(false);

    button.focus();
    expect(row.classList.contains("is-highlighted")).toBe(true);
    button.blur();
    expect(row.classList.contains("is-highlighted")).toBe(false);
  });

  it("announces quality and error states without retaining stale KPIs", () => {
    const store = createDashboardStore({ filters: { controlDate: "2026-01-05" } });
    createDashboardView({ document, store });
    store.dispatch({ type: "PROJECT_SELECTED", plan: {
      ...plan([sampleTask()]),
      qualityIssues: [{ code: "INVALID_DATE", severity: "error" }],
    } });
    expect(document.querySelector("#quality-warnings").hidden).toBe(false);
    store.dispatch({ type: "LOAD_FAILED", code: "BROKEN", message: "Libro no válido" });
    expect(document.querySelector("#global-error").textContent).toBe("Libro no válido");
    expect(document.querySelector("#kpi-total").textContent).toBe("0");
  });

  it("delegates project and reload actions — copy button no longer present", () => {
    const handlers = { selectProject: vi.fn(), reload: vi.fn() };
    const store = createDashboardStore({
      status: "ready", sheets: [{ id: "Gantt", name: "Gantt" }], filters: { controlDate: "2026-01-05" },
    });
    createDashboardView({ document, store, handlers });
    document.querySelector("#project-sheet").dispatchEvent(new Event("change"));
    document.querySelector("#reload-workbook-button").click();
    expect(handlers.selectProject).toHaveBeenCalledWith("Gantt");
    expect(handlers.reload).toHaveBeenCalledOnce();
    expect(document.querySelector("#copy-dashboard-button")).toBeNull();
  });

  it("renders assignee below task name and hides it for unassigned tasks", () => {
    const store = createDashboardStore({
      status: "ready",
      tasks: [
        sampleTask({ assignee: "María López" }),
        sampleTask({ id: "2", assignee: "Sin asignar" }),
        sampleTask({ id: "3", assignee: "" }),
      ],
      filters: { controlDate: "2026-01-05" },
    });
    createDashboardView({ document, store });
    const items = document.querySelectorAll(".gantt-task-item");
    const assignees = document.querySelectorAll(".gantt-task-assignee");
    expect(assignees).toHaveLength(1);
    expect(assignees[0].textContent).toBe("María López");
    expect(items[1].querySelector(".gantt-task-assignee")).toBeNull();
    expect(items[2].querySelector(".gantt-task-assignee")).toBeNull();
  });

  it("renders Avance XX% labels on task bars and not on milestones", () => {
    const store = createDashboardStore({
      status: "ready",
      tasks: [
        sampleTask({ completionFraction: 0.55 }),
        sampleTask({ id: "2", completionFraction: 0, milestone: true }),
        sampleTask({ id: "3", completionFraction: 1 }),
      ],
      filters: { controlDate: "2026-01-05" },
    });
    createDashboardView({ document, store });
    const labels = document.querySelectorAll(".gantt-progress-label");
    expect(labels).toHaveLength(2);
    expect(labels[0].textContent).toBe("Avance 55%");
    expect(labels[1].textContent).toBe("Avance 100%");
  });

  it("setDateValue does not overwrite a focused date input but updates an unfocused one", () => {
    const store = createDashboardStore({
      status: "ready",
      tasks: [sampleTask()],
      filters: { controlDate: "2026-01-05" },
    });
    createDashboardView({ document, store });
    const input = document.querySelector("#control-date");
    expect(input.value).toBe("2026-01-05");

    input.focus();
    store.dispatch({ type: "FILTERS_CHANGED", filters: {
      controlDate: "2026-02-10",
      assignees: [],
      dateFrom: null,
      dateTo: null,
      completion: "all",
    } });
    expect(input.value).toBe("2026-01-05");

    input.blur();
    store.dispatch({ type: "FILTERS_CHANGED", filters: {
      controlDate: "2026-03-15",
      assignees: [],
      dateFrom: null,
      dateTo: null,
      completion: "all",
    } });
    expect(input.value).toBe("2026-03-15");
  });

  it("toggles a clean presentation view without losing the current snapshot", () => {
    const store = createDashboardStore({
      status: "ready", tasks: [sampleTask()], filters: { controlDate: "2026-01-05", assignees: ["Ana"] },
    });
    createDashboardView({ document, store });
    document.querySelector("#presentation-mode-button").click();
    expect(document.body.classList.contains("presentation-mode")).toBe(true);
    expect(store.getState().filters.assignees).toEqual(["Ana"]);
    expect(store.getState().metrics.total).toBe(1);
  });

  it("renders 1,000 aligned task controls and SVG marks in under one second", () => {
    const tasks = Array.from({ length: 1000 }, (_, index) => sampleTask({ id: String(index), name: `Tarea ${index}` }));
    const store = createDashboardStore({ status: "ready", tasks, filters: { controlDate: "2026-01-05" } });
    const startedAt = performance.now();
    createDashboardView({ document, store });
    const elapsed = performance.now() - startedAt;
    expect(document.querySelectorAll(".gantt-task-button")).toHaveLength(1000);
    expect(document.querySelectorAll(".gantt-bar")).toHaveLength(1000);
    expect(elapsed).toBeLessThan(1000);
  });
});

describe("Gantt layout", () => {
  it("positions inclusive bars, milestones, ticks and the control line", () => {
    const layout = computeGanttLayout([
      sampleTask(),
      sampleTask({ id: "2", plannedStart: "2026-01-10", plannedEnd: "2026-01-10", milestone: true }),
    ], { controlDate: "2026-01-05", scale: "day" });
    expect(layout.rows[0].x).toBe(0);
    expect(layout.rows[0].width).toBeCloseTo(896);
    expect(layout.rows[1].x).toBeCloseTo(806.4);
    expect(layout.rows[1].width).toBe(14);
    expect(layout.controlX).toBeCloseTo(358.4);
    expect(layout.ticks[0].date).toBe("2026-01-01");
    expect(layout.ticks[0].label).toBe("01/01");
    expect(layout.years).toEqual([expect.objectContaining({ label: "2026" })]);
  });

  it("keeps the control line in the full interval and scrolls initially to the tasks", () => {
    const layout = computeGanttLayout([
      sampleTask({ plannedStart: "2026-08-01", plannedEnd: "2026-08-10" }),
    ], { controlDate: "2026-04-27", scale: "week" });
    expect(layout.rows[0].x).toBeGreaterThan(0);
    expect(layout.firstTaskX).toBe(layout.rows[0].x);
    expect(layout.ticks[0]).toMatchObject({ date: "2026-04-27", label: "27/04" });
    expect(layout.controlX).toBe(0);
  });

  it("formats day, week and month headers in Spanish and groups them by year", () => {
    const tasks = [sampleTask({ plannedStart: "2026-12-29", plannedEnd: "2027-02-03" })];
    const day = computeGanttLayout(tasks, { controlDate: "2027-01-10", scale: "day" });
    const week = computeGanttLayout(tasks, { controlDate: "2027-01-10", scale: "week" });
    const month = computeGanttLayout(tasks, { controlDate: "2027-01-10", scale: "month" });

    expect(day.ticks.every(({ label, width }) => /^\d{2}\/\d{2}$/u.test(label) && width >= 52)).toBe(true);
    expect(week.ticks.every(({ label }) => /^\d{2}\/\d{2}$/u.test(label))).toBe(true);
    expect(month.ticks.map(({ label }) => label)).toEqual(["Diciembre", "Enero", "Febrero"]);
    expect(month.years.map(({ label }) => label)).toEqual(["2026", "2027"]);
  });

  it("lays out 1,000 tasks in under one second", () => {
    const tasks = Array.from({ length: 1000 }, (_, index) => sampleTask({ id: String(index) }));
    const startedAt = performance.now();
    const layout = computeGanttLayout(tasks, { controlDate: "2026-01-05", scale: "week" });
    expect(layout.rows).toHaveLength(1000);
    expect(performance.now() - startedAt).toBeLessThan(1000);
  });
});
