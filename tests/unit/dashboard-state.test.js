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

  it("initialises sections, collapsedSections and visibleDerivedTasks on PROJECT_SELECTED", () => {
    const sectionA = Object.freeze({ id: "G:2", name: "Fase A", sourceRow: 2 });
    const taskA = Object.freeze({ ...sampleTask, id: "G:3", sectionId: "G:2",
      plannedStart: "2026-01-01", plannedEnd: "2026-01-10", actualClose: "2026-01-09" });
    const store = createDashboardStore({ filters: { controlDate: "2026-01-10" } });
    store.dispatch({ type: "PROJECT_SELECTED", plan: {
      sheetId: "G",
      tasks: [taskA],
      sections: [sectionA],
      qualityIssues: [],
      date1904: false,
    } });
    const state = store.getState();

    expect(state.sections).toHaveLength(1);
    expect(state.sections[0]).toMatchObject({ id: "G:2", name: "Fase A" });
    expect(state.collapsedSections).toHaveLength(0);
    expect(state.visibleDerivedTasks).toHaveLength(1);
  });

  it("SECTION_TOGGLED collapses a section and filters visibleDerivedTasks", () => {
    const sectionA = Object.freeze({ id: "G:2", name: "Fase A", sourceRow: 2 });
    const taskA = Object.freeze({ ...sampleTask, id: "G:3", sectionId: "G:2",
      plannedStart: "2026-01-01", plannedEnd: "2026-01-10", actualClose: "2026-01-09" });
    const taskNoSection = Object.freeze({ ...sampleTask, id: "G:5", sectionId: null,
      plannedStart: "2026-01-01", plannedEnd: "2026-01-10", actualClose: "2026-01-09" });
    const store = createDashboardStore({ filters: { controlDate: "2026-01-10" } });
    store.dispatch({ type: "PROJECT_SELECTED", plan: {
      sheetId: "G",
      tasks: [taskA, taskNoSection],
      sections: [sectionA],
      qualityIssues: [],
      date1904: false,
    } });

    store.dispatch({ type: "SECTION_TOGGLED", sectionId: "G:2" });
    const collapsed = store.getState();
    expect(collapsed.collapsedSections).toContain("G:2");
    expect(collapsed.visibleDerivedTasks).toHaveLength(1);
    expect(collapsed.visibleDerivedTasks[0].id).toBe("G:5");

    // Toggle again — expands
    store.dispatch({ type: "SECTION_TOGGLED", sectionId: "G:2" });
    const expanded = store.getState();
    expect(expanded.collapsedSections).toHaveLength(0);
    expect(expanded.visibleDerivedTasks).toHaveLength(2);
  });

  it("metrics are NOT affected by SECTION_TOGGLED (invariant ADR-0001)", () => {
    const sectionA = Object.freeze({ id: "G:2", name: "Fase A", sourceRow: 2 });
    const taskA = Object.freeze({ ...sampleTask, id: "G:3", sectionId: "G:2",
      plannedStart: "2026-01-01", plannedEnd: "2026-01-10", actualClose: "2026-01-09" });
    const store = createDashboardStore({ filters: { controlDate: "2026-01-10" } });
    store.dispatch({ type: "PROJECT_SELECTED", plan: {
      sheetId: "G",
      tasks: [taskA],
      sections: [sectionA],
      qualityIssues: [],
      date1904: false,
    } });
    const metricsBefore = store.getState().metrics;

    store.dispatch({ type: "SECTION_TOGGLED", sectionId: "G:2" });
    const metricsAfter = store.getState().metrics;

    expect(metricsAfter.total).toBe(metricsBefore.total);
    expect(metricsAfter.completed).toBe(metricsBefore.completed);
    expect(metricsAfter.completionRatio).toBe(metricsBefore.completionRatio);
  });

  it("PROJECT_SELECTED resets collapsedSections to empty", () => {
    const sectionA = Object.freeze({ id: "G:2", name: "Fase A", sourceRow: 2 });
    const taskA = Object.freeze({ ...sampleTask, id: "G:3", sectionId: "G:2",
      plannedStart: "2026-01-01", plannedEnd: "2026-01-10", actualClose: "2026-01-09" });
    const store = createDashboardStore({ filters: { controlDate: "2026-01-10" } });
    store.dispatch({ type: "PROJECT_SELECTED", plan: {
      sheetId: "G", tasks: [taskA], sections: [sectionA], qualityIssues: [], date1904: false,
    } });
    store.dispatch({ type: "SECTION_TOGGLED", sectionId: "G:2" });
    expect(store.getState().collapsedSections).toHaveLength(1);

    // Re-selecting project resets collapse state
    store.dispatch({ type: "PROJECT_SELECTED", plan: {
      sheetId: "G", tasks: [taskA], sections: [sectionA], qualityIssues: [], date1904: false,
    } });
    expect(store.getState().collapsedSections).toHaveLength(0);
    expect(store.getState().visibleDerivedTasks).toHaveLength(1);
  });

  it("WORKBOOK_LOADED resets sections and collapsedSections", () => {
    const store = createDashboardStore();
    store.dispatch({ type: "WORKBOOK_LOADED", sourceFile: "plan.xlsx", sheets: [{ id: "G" }] });
    const state = store.getState();
    expect(state.sections).toHaveLength(0);
    expect(state.collapsedSections).toHaveLength(0);
    expect(state.visibleDerivedTasks).toHaveLength(0);
  });
});
