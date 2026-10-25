import { describe, expect, it, vi } from "vitest";

import {
  createDashboardStore,
  dashboardReducer,
} from "../../dashboard-assets/dashboard-state.js";

const sampleTask = Object.freeze({
  id: "Gantt:2",
  name: "Preparar",
  assignee: "Ana",
  plannedStart: "2026-01-01",
  plannedEnd: "2026-01-10",
  baselineEnd: null,
  actualClose: "2026-01-09",
  completionFraction: 1,
  status: "Completada",
  milestone: false,
});

describe("dashboard state", () => {
  it("maintains one immutable tasks → filters → derivedTasks → metrics snapshot", () => {
    const store = createDashboardStore({ filters: { controlDate: "2026-01-10" } });
    const before = store.getState();
    store.dispatch({ type: "PROJECT_SELECTED", plan: {
      sheetId: "Gantt",
      tasks: [sampleTask],
      qualityIssues: [],
      date1904: false,
    } });
    const loaded = store.getState();
    expect(loaded).not.toBe(before);
    expect(loaded.tasks).toHaveLength(1);
    expect(loaded.derivedTasks).toHaveLength(1);
    expect(loaded.metrics).toMatchObject({ total: 1, completed: 1, completionRatio: 1 });
    expect(Object.isFrozen(loaded)).toBe(true);
    expect(Object.isFrozen(loaded.filters)).toBe(true);

    store.dispatch({ type: "FILTERS_CHANGED", filters: { assignees: ["Bruno"] } });
    expect(store.getState().tasks).toHaveLength(1);
    expect(store.getState().derivedTasks).toHaveLength(0);
    expect(store.getState().metrics.completionRatio).toBeNull();
    expect(loaded.metrics.total).toBe(1);
  });

  it("supports load, selection, filter, scale and viewport action sequences", () => {
    const listener = vi.fn();
    const store = createDashboardStore({ filters: { controlDate: "2026-01-10" } });
    const unsubscribe = store.subscribe(listener);
    store.dispatch({ type: "LOAD_STARTED" });
    expect(store.getState()).toMatchObject({ status: "loading", metrics: { total: 0 } });
    store.dispatch({ type: "WORKBOOK_LOADED", sourceFile: "plan.xlsm", sheets: [{ id: "Gantt" }] });
    store.dispatch({ type: "SCALE_CHANGED", scale: "month" });
    store.dispatch({ type: "VIEWPORT_CHANGED", viewport: { start: "2026-01-01", end: "2026-03-01" } });
    expect(store.getState()).toMatchObject({
      status: "ready",
      sourceFile: "plan.xlsm",
      scale: "month",
      viewport: { start: "2026-01-01", end: "2026-03-01" },
    });
    unsubscribe();
    expect(listener).toHaveBeenCalledTimes(4);
  });

  it("clears stale tasks and KPIs when loading or selection fails", () => {
    const populated = createDashboardStore({
      tasks: [sampleTask],
      filters: { controlDate: "2026-01-10" },
    }).getState();
    const failed = dashboardReducer(populated, {
      type: "LOAD_FAILED",
      code: "BROKEN",
      message: "No se pudo cargar",
    });
    expect(failed).toMatchObject({ status: "error", tasks: [], derivedTasks: [], metrics: { total: 0 } });
    expect(failed.error).toEqual({ code: "BROKEN", message: "No se pudo cargar" });
  });

  it("rejects invalid dates, date ranges, completion filters and scales", () => {
    const store = createDashboardStore();
    expect(() => store.dispatch({ type: "FILTERS_CHANGED", filters: { controlDate: "31/12/2026" } }))
      .toThrow(TypeError);
    expect(() => store.dispatch({ type: "FILTERS_CHANGED", filters: {
      dateFrom: "2026-02-01", dateTo: "2026-01-01",
    } })).toThrow(RangeError);
    expect(() => store.dispatch({ type: "FILTERS_CHANGED", filters: { completion: "unknown" } }))
      .toThrow(TypeError);
    expect(() => store.dispatch({ type: "SCALE_CHANGED", scale: "year" })).toThrow(TypeError);
  });
});
