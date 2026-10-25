import { performance } from "node:perf_hooks";

import { describe, expect, it } from "vitest";

import {
  classifyTaskAtDate,
  deriveDashboard,
  getTargetDate,
  normalizeDateOnly,
} from "../../dashboard-assets/planning-domain.js";

function task(overrides = {}) {
  return {
    id: "Gantt:1",
    name: "Tarea",
    assignee: "Ana",
    plannedStart: "2026-01-01",
    plannedEnd: "2026-01-10",
    baselineEnd: null,
    actualClose: null,
    completionFraction: 0,
    status: "Pendiente",
    milestone: false,
    ...overrides,
  };
}

describe("planning date-only domain", () => {
  it("normalizes strict date-only values, Dates and both Excel date systems", () => {
    expect(normalizeDateOnly("2024-02-29")).toBe("2024-02-29");
    expect(normalizeDateOnly("2023-02-29")).toBeNull();
    expect(normalizeDateOnly(new Date(2026, 4, 9, 23, 59))).toBe("2026-05-09");
    expect(normalizeDateOnly(1)).toBe("1900-01-01");
    expect(normalizeDateOnly(60)).toBe("1900-02-28");
    expect(normalizeDateOnly(61)).toBe("1900-03-01");
    expect(normalizeDateOnly(0, { date1904: true })).toBe("1904-01-01");
    expect(normalizeDateOnly(59, { date1904: true })).toBe("1904-02-29");
    expect(normalizeDateOnly(null)).toBeNull();
    expect(normalizeDateOnly(new Date("invalid"))).toBeNull();
    expect(normalizeDateOnly(Number.NaN)).toBeNull();
    expect(normalizeDateOnly("not-a-date")).toBeNull();
  });

  it("prefers baseline end and classifies boundary completion and delay", () => {
    const sample = task({ baselineEnd: "2026-01-08", actualClose: "2026-01-08" });
    expect(getTargetDate(sample)).toBe("2026-01-08");
    expect(classifyTaskAtDate(sample, "2026-01-07")).toMatchObject({ completed: false, delayed: false });
    expect(classifyTaskAtDate(sample, "2026-01-08")).toMatchObject({ completed: true, delayed: false });
    expect(classifyTaskAtDate(task({ actualClose: "2026-01-12" }), "2026-01-12"))
      .toMatchObject({ completed: true, delayed: true });
    expect(classifyTaskAtDate(task(), "2026-01-11")).toMatchObject({ completed: false, delayed: true });
  });

  it("does not invent historical completion when current state lacks a close date", () => {
    const result = classifyTaskAtDate(task({ completionFraction: 1, status: "Completada" }), "2026-01-20");
    expect(result.completed).toBe(false);
    expect(result.delayed).toBe(false);
    expect(result.completionKnown).toBe(false);
    expect(result.delayKnown).toBe(false);
    expect(result.inconsistencies).toContain("COMPLETE_WITHOUT_ACTUAL_CLOSE");
  });

  it("excludes tasks without the minimum valid date context", () => {
    expect(classifyTaskAtDate(task({ plannedEnd: null }), "2026-01-20").valid).toBe(false);
    expect(classifyTaskAtDate(task(), "invalid").valid).toBe(false);
  });
});

describe("planning filters and metrics", () => {
  const tasks = [
    task({ id: "1", assignee: "Ana", actualClose: "2026-01-08" }),
    task({ id: "2", assignee: "Bruno", plannedStart: "2026-01-10", plannedEnd: "2026-01-20" }),
    task({ id: "3", assignee: "Sin asignar", plannedStart: "2026-01-20", plannedEnd: "2026-01-20", milestone: true }),
    task({ id: "4", plannedStart: "incorrecta" }),
    task({ id: "5", assignee: "Bruno", plannedStart: "2026-01-01", plannedEnd: "2026-01-10" }),
  ];

  it("intersects assignee, inclusive overlap and completion filters", () => {
    const base = { controlDate: "2026-01-15", assignees: [], dateFrom: null, dateTo: null, completion: "all" };
    expect(deriveDashboard(tasks, base).metrics).toEqual({
      total: 4,
      completed: 1,
      completionRatio: 1 / 4,
      delayed: 1,
      excluded: 1,
    });
    expect(deriveDashboard(tasks, { ...base, assignees: ["Ana"], completion: "completed" }).tasks.map(({ id }) => id))
      .toEqual(["1"]);
    expect(deriveDashboard(tasks, { ...base, dateFrom: "2026-01-20", dateTo: "2026-01-20" }).tasks.map(({ id }) => id))
      .toEqual(["2", "3"]);
    expect(deriveDashboard(tasks, { ...base, completion: "delayed" }).tasks.map(({ id }) => id))
      .toEqual(["5"]);
  });

  it("distinguishes an empty set from a zero ratio", () => {
    const result = deriveDashboard([], { controlDate: "2026-01-15", completion: "all" });
    expect(result.metrics).toEqual({ total: 0, completed: 0, completionRatio: null, delayed: 0, excluded: 0 });
  });

  it("derives 1,000 tasks within 300 ms", () => {
    const thousand = Array.from({ length: 1000 }, (_, index) => task({ id: String(index) }));
    const startedAt = performance.now();
    const result = deriveDashboard(thousand, { controlDate: "2026-01-15", completion: "all" });
    expect(result.tasks).toHaveLength(1000);
    expect(performance.now() - startedAt).toBeLessThan(300);
  });
});
