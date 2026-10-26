import { describe, expect, it } from "vitest";

import { computeGanttLayout } from "../../dashboard-assets/dashboard-view.js";

const HEADER_HEIGHT = 72; // YEAR_HEADER_HEIGHT(28) + PERIOD_HEADER_HEIGHT(44)
const ROW_HEIGHT = 60;

const sampleTask = Object.freeze({
  id: "G:3",
  name: "Tarea A",
  plannedStart: "2026-01-05",
  plannedEnd: "2026-01-09",
  completionFraction: 0.5,
  milestone: false,
  sectionId: "G:2",
});

const sampleSection = Object.freeze({
  id: "G:2",
  name: "Fase A",
  sourceRow: 2,
});

describe("computeGanttLayout — legacy (plain tasks array)", () => {
  it("handles a plain tasks array (backward compat — no kind field)", () => {
    const layout = computeGanttLayout([sampleTask], { controlDate: "2026-01-10", scale: "week" });
    expect(layout.rows).toHaveLength(1);
    expect(layout.rows[0].task).toBe(sampleTask);
    expect(layout.rows[0].y).toBe(HEADER_HEIGHT);
  });

  it("returns a single-row layout for one task", () => {
    const layout = computeGanttLayout([sampleTask], { controlDate: "2026-01-10", scale: "week" });
    expect(layout.height).toBe(HEADER_HEIGHT + ROW_HEIGHT);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.controlX).toBeGreaterThan(0);
  });
});

describe("computeGanttLayout — mixed entries (sections + tasks)", () => {
  it("section entry gets kind:'section' row with x=0 and y at correct position", () => {
    const entries = [
      { kind: "section", data: sampleSection },
      { kind: "task", data: sampleTask },
    ];
    const layout = computeGanttLayout(entries, { controlDate: "2026-01-10", scale: "week" });

    expect(layout.rows).toHaveLength(2);
    expect(layout.rows[0].kind).toBe("section");
    expect(layout.rows[0].data).toBe(sampleSection);
    expect(layout.rows[0].x).toBe(0);
    expect(layout.rows[0].y).toBe(HEADER_HEIGHT);
    expect(layout.rows[0].height).toBe(ROW_HEIGHT);
  });

  it("task entry after a section gets correct y and x", () => {
    const entries = [
      { kind: "section", data: sampleSection },
      { kind: "task", data: sampleTask },
    ];
    const layout = computeGanttLayout(entries, { controlDate: "2026-01-10", scale: "week" });

    const taskRow = layout.rows[1];
    expect(taskRow.kind).toBe("task");
    expect(taskRow.task).toBe(sampleTask);
    expect(taskRow.y).toBe(HEADER_HEIGHT + ROW_HEIGHT);
    expect(taskRow.x).toBeGreaterThanOrEqual(0);
    expect(taskRow.width).toBeGreaterThan(0);
  });

  it("SVG height accounts for all entries (sections + tasks)", () => {
    const entries = [
      { kind: "section", data: sampleSection },
      { kind: "task", data: sampleTask },
      { kind: "task", data: { ...sampleTask, id: "G:4", plannedStart: "2026-01-12", plannedEnd: "2026-01-16" } },
    ];
    const layout = computeGanttLayout(entries, { controlDate: "2026-01-20", scale: "week" });
    expect(layout.height).toBe(HEADER_HEIGHT + 3 * ROW_HEIGHT);
    expect(layout.rows).toHaveLength(3);
  });

  it("firstTaskX and controlX are computed from task entries only (not sections)", () => {
    const taskOnly = computeGanttLayout(
      [{ kind: "task", data: sampleTask }],
      { controlDate: "2026-01-10", scale: "week" }
    );
    const withSection = computeGanttLayout(
      [{ kind: "section", data: sampleSection }, { kind: "task", data: sampleTask }],
      { controlDate: "2026-01-10", scale: "week" }
    );
    // firstTaskX and controlX must be identical regardless of whether a leading section is present
    expect(withSection.firstTaskX).toBe(taskOnly.firstTaskX);
    expect(withSection.controlX).toBe(taskOnly.controlX);
  });

  it("layout with only a section entry (no tasks) still returns valid dimensions", () => {
    const entries = [{ kind: "section", data: sampleSection }];
    const layout = computeGanttLayout(entries, { controlDate: "2026-01-10", scale: "week" });
    expect(layout.rows).toHaveLength(1);
    expect(layout.rows[0].kind).toBe("section");
    expect(layout.height).toBe(HEADER_HEIGHT + ROW_HEIGHT);
    expect(layout.width).toBeGreaterThan(0);
  });

  it("empty entries array returns minimum 1-row height", () => {
    const layout = computeGanttLayout([], { controlDate: "2026-01-10", scale: "week" });
    expect(layout.rows).toHaveLength(0);
    expect(layout.height).toBe(HEADER_HEIGHT + ROW_HEIGHT); // Math.max(1, 0) = 1
    expect(layout.width).toBeGreaterThan(0);
  });

  it("rows are in the same order as the input entries", () => {
    const taskB = Object.freeze({ ...sampleTask, id: "G:5", plannedStart: "2026-01-12", plannedEnd: "2026-01-16" });
    const sectionB = Object.freeze({ id: "G:6", name: "Fase B", sourceRow: 6 });
    const entries = [
      { kind: "section", data: sampleSection },
      { kind: "task", data: sampleTask },
      { kind: "section", data: sectionB },
      { kind: "task", data: taskB },
    ];
    const layout = computeGanttLayout(entries, { controlDate: "2026-01-20", scale: "week" });
    expect(layout.rows[0].kind).toBe("section");
    expect(layout.rows[0].data).toBe(sampleSection);
    expect(layout.rows[1].kind).toBe("task");
    expect(layout.rows[1].task).toBe(sampleTask);
    expect(layout.rows[2].kind).toBe("section");
    expect(layout.rows[2].data).toBe(sectionB);
    expect(layout.rows[3].kind).toBe("task");
    expect(layout.rows[3].task).toBe(taskB);
  });
});
