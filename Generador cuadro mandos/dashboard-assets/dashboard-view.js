import { normalizeDateOnly } from "./planning-domain.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const ROW_HEIGHT = 60;
const YEAR_HEADER_HEIGHT = 28;
const PERIOD_HEADER_HEIGHT = 44;
const HEADER_HEIGHT = YEAR_HEADER_HEIGHT + PERIOD_HEADER_HEIGHT;
const MIN_CHART_WIDTH = 896;
const MONTH_NAMES_ES = Object.freeze([
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]);

function ordinal(dateOnly) {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function fromOrdinal(value) {
  const date = new Date(value * 86_400_000);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function scalePixels(scale) {
  return { day: 52, week: 12, month: 4, year: 1 }[scale] ?? 12;
}

function dateParts(value) {
  const date = new Date(value * 86_400_000);
  return Object.freeze({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  });
}

function ordinalFromParts(year, month, day) {
  return Math.floor(Date.UTC(year, month, day) / 86_400_000);
}

function dayMonthLabel(value) {
  const { month, day } = dateParts(value);
  return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}`;
}

function createPeriodBands(startOrdinal, endOrdinal, scale, pixelsPerDay) {
  const bands = [];
  let cursor = startOrdinal;
  while (cursor <= endOrdinal) {
    const parts = dateParts(cursor);
    const next = scale === "month"
      ? ordinalFromParts(parts.year, parts.month + 1, 1)
      : cursor + (scale === "day" ? 1 : 7);
    const endExclusive = Math.min(endOrdinal + 1, next);
    bands.push(Object.freeze({
      date: fromOrdinal(cursor),
      label: scale === "month" ? MONTH_NAMES_ES[parts.month] : dayMonthLabel(cursor),
      x: (cursor - startOrdinal) * pixelsPerDay,
      width: (endExclusive - cursor) * pixelsPerDay,
    }));
    cursor = endExclusive;
  }
  return Object.freeze(bands);
}

function createYearBands(startOrdinal, endOrdinal, pixelsPerDay) {
  const bands = [];
  let cursor = startOrdinal;
  while (cursor <= endOrdinal) {
    const { year } = dateParts(cursor);
    const endExclusive = Math.min(endOrdinal + 1, ordinalFromParts(year + 1, 0, 1));
    bands.push(Object.freeze({
      label: String(year),
      x: (cursor - startOrdinal) * pixelsPerDay,
      width: (endExclusive - cursor) * pixelsPerDay,
    }));
    cursor = endExclusive;
  }
  return Object.freeze(bands);
}

/**
 * Computes Gantt layout from an ordered array of entries.
 * Each entry is {kind: "task"|"section", data, ...extra}.
 * Legacy: plain task objects (without .kind) are treated as task entries.
 */
export function computeGanttLayout(entries, {
  controlDate,
  scale = "week",
  viewport = {},
  fitWidth = null,
} = {}) {
  // Normalize: support legacy plain tasks array
  const normalizedEntries = (entries ?? []).map((entry) =>
    (entry && entry.kind) ? entry : { kind: "task", data: entry }
  );

  // Only task entries with valid dates contribute to time-axis bounds
  const datedTaskInfos = normalizedEntries
    .filter(({ kind }) => kind === "task")
    .map(({ data: task }) => ({
      task,
      start: normalizeDateOnly(task.plannedStart),
      end: normalizeDateOnly(task.plannedEnd),
    }))
    .filter(({ start, end }) => start && end);

  const taskDateMap = new Map(
    datedTaskInfos.map(({ task, start, end }) => [task, { start, end }])
  );

  const dates = datedTaskInfos.flatMap(({ start, end }) => [ordinal(start), ordinal(end)]);

  // Also include summary ranges from collapsed sections so the axis spans correctly
  const summaryDates = normalizedEntries
    .filter(({ kind, summaryStart, summaryEnd }) => kind === "section" && summaryStart && summaryEnd)
    .flatMap(({ summaryStart, summaryEnd }) => {
      const s = normalizeDateOnly(summaryStart);
      const e = normalizeDateOnly(summaryEnd);
      return (s && e) ? [ordinal(s), ordinal(e)] : [];
    });
  const allDates = [...dates, ...summaryDates];

  const control = normalizeDateOnly(controlDate);
  const controlOrdinal = control ? ordinal(control) : null;
  const bounds = controlOrdinal === null ? allDates : [...allDates, controlOrdinal];
  const fallbackOrd = control ? ordinal(control) : ordinal("2026-01-01");
  const startOrdinal = viewport.start
    ? ordinal(viewport.start)
    : Math.min(...(bounds.length ? bounds : [fallbackOrd]));
  const endOrdinal = viewport.end
    ? ordinal(viewport.end)
    : Math.max(...(bounds.length ? bounds : [fallbackOrd + 30]));
  const normalizedEndOrdinal = Math.max(endOrdinal, startOrdinal + 1);
  const daySpan = normalizedEndOrdinal - startOrdinal + 1;
  const pixelsPerDay = fitWidth !== null
    ? Math.max(1, fitWidth / daySpan)
    : Math.max(scalePixels(scale), MIN_CHART_WIDTH / daySpan);
  const width = daySpan * pixelsPerDay;

  // Build rows for all entries; task entries without valid dates are skipped
  const rowEntries = normalizedEntries.filter(({ kind, data }) => {
    if (kind === "section") return true;
    return taskDateMap.has(data);
  });

  const rows = rowEntries.map((entry, index) => {
    const { kind, data } = entry;
    const y = HEADER_HEIGHT + index * ROW_HEIGHT;
    if (kind === "section") {
      // Compute summary bar position for collapsed sections
      let summaryX = null;
      let summaryWidth = null;
      const sumStart = entry.summaryStart ? normalizeDateOnly(entry.summaryStart) : null;
      const sumEnd = entry.summaryEnd ? normalizeDateOnly(entry.summaryEnd) : null;
      if (sumStart && sumEnd) {
        const sumStartDay = ordinal(sumStart);
        const sumEndDay = ordinal(sumEnd);
        summaryX = (sumStartDay - startOrdinal) * pixelsPerDay;
        summaryWidth = Math.max(pixelsPerDay, (sumEndDay - sumStartDay + 1) * pixelsPerDay);
      }
      return Object.freeze({
        kind: "section",
        data,
        x: 0,
        y,
        width: 0,
        height: ROW_HEIGHT,
        collapsed: entry.collapsed ?? false,
        summaryX,
        summaryWidth,
        allCompleted: entry.allCompleted ?? false,
      });
    }
    const task = data;
    const info = taskDateMap.get(task);
    const startDay = ordinal(info.start);
    const endDay = ordinal(info.end);
    return Object.freeze({
      kind: "task",
      task,
      x: (startDay - startOrdinal) * pixelsPerDay,
      y,
      width: task.milestone ? 14 : Math.max(pixelsPerDay, (endDay - startDay + 1) * pixelsPerDay),
      height: ROW_HEIGHT,
    });
  });

  const ticks = createPeriodBands(startOrdinal, normalizedEndOrdinal, scale, pixelsPerDay);
  const years = createYearBands(startOrdinal, normalizedEndOrdinal, pixelsPerDay);
  const firstTaskOrdinal = allDates.length ? Math.min(...allDates) : startOrdinal;
  return Object.freeze({
    width,
    height: HEADER_HEIGHT + Math.max(1, rows.length) * ROW_HEIGHT,
    rows: Object.freeze(rows),
    ticks,
    years,
    firstTaskX: (firstTaskOrdinal - startOrdinal) * pixelsPerDay,
    controlX: controlOrdinal === null ? null : (controlOrdinal - startOrdinal) * pixelsPerDay,
    pixelsPerDay,
  });
}

function setText(element, value) {
  element.textContent = value;
}

function replaceChildren(element, children = []) {
  element.replaceChildren(...children);
}

function svgElement(document, tag, attributes = {}, text = null) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, String(value));
  }
  if (text !== null) {
    element.textContent = text;
  }
  return element;
}

function filterContext(filters) {
  const parts = [`Fecha de control: ${filters.controlDate ?? "sin definir"}`];
  if (filters.assignees.length) parts.push(`Asignado: ${filters.assignees.join(", ")}`);
  if (filters.dateFrom || filters.dateTo) parts.push(`Intervalo: ${filters.dateFrom ?? "…"} – ${filters.dateTo ?? "…"}`);
  if (filters.completion !== "all") parts.push(`Estado: ${filters.completion}`);
  return parts.join(" · ");
}

function detailEntries(task) {
  return [
    ["Tarea", task.name],
    ["Asignado", task.assignee || "Sin asignar"],
    ["Inicio", normalizeDateOnly(task.plannedStart) ?? "No disponible"],
    ["Fin", normalizeDateOnly(task.plannedEnd) ?? "No disponible"],
    ["Estado", task.status || "No informado"],
    ["Comentarios", task.comments || "Sin comentarios"],
  ];
}

/**
 * Builds the interleaved ordered list of entries (sections + tasks).
 * - Sections with tasks in allDerivedTasks are always included (even when collapsed).
 * - Collapsed sections include summary bar metadata.
 * - Task entries only include tasks from visibleDerivedTasks (collapsed tasks excluded).
 */
function buildGanttEntries(sections, visibleDerivedTasks, allDerivedTasks, collapsedSections) {
  const collapsedSet = new Set(collapsedSections ?? []);

  // Map sectionId → all tasks from allDerivedTasks
  const sectionTasksMap = new Map();
  for (const task of allDerivedTasks ?? []) {
    if (task.sectionId != null) {
      if (!sectionTasksMap.has(task.sectionId)) {
        sectionTasksMap.set(task.sectionId, []);
      }
      sectionTasksMap.get(task.sectionId).push(task);
    }
  }

  // Include sections that have at least one task in allDerivedTasks
  const activeSections = (sections ?? []).filter((s) => sectionTasksMap.has(s.id));

  const sectionEntries = activeSections.map((s) => {
    const isCollapsed = collapsedSet.has(s.id);
    const tasks = sectionTasksMap.get(s.id) ?? [];
    let summaryStart = null;
    let summaryEnd = null;
    let allCompleted = false;
    if (isCollapsed && tasks.length > 0) {
      const starts = tasks.map((t) => normalizeDateOnly(t.plannedStart)).filter(Boolean);
      const ends = tasks.map((t) => normalizeDateOnly(t.plannedEnd)).filter(Boolean);
      if (starts.length && ends.length) {
        summaryStart = starts.reduce((a, b) => (a < b ? a : b));
        summaryEnd = ends.reduce((a, b) => (a > b ? a : b));
      }
      allCompleted = tasks.every((t) => t.classification?.completed);
    }
    return {
      kind: "section",
      data: s,
      sourceRow: s.sourceRow,
      collapsed: isCollapsed,
      summaryStart,
      summaryEnd,
      allCompleted,
    };
  });

  // Only include task entries for visible (non-collapsed) tasks
  const taskEntries = (visibleDerivedTasks ?? []).map((task) => ({
    kind: "task",
    data: task,
    sourceRow: task.sourceRow,
  }));

  return [...sectionEntries, ...taskEntries].sort((a, b) => a.sourceRow - b.sourceRow);
}

export function createDashboardView({ document, store, handlers = {} }) {
  const byId = (id) => document.getElementById(id);
  const elements = {
    sheet: byId("project-sheet"), controlDate: byId("control-date"), assignees: byId("assignee-filter"),
    dateFrom: byId("range-start"), dateTo: byId("range-end"), completion: byId("completion-filter"),
    form: byId("dashboard-filters"), total: byId("kpi-total"), context: byId("active-filter-context"),
    loading: byId("loading-status"), error: byId("global-error"), warnings: byId("quality-warnings"),
    sourceStatus: byId("source-status"), sourceFile: byId("source-file-name"), list: byId("gantt-task-list"),
    chart: byId("gantt-chart"), scroll: byId("gantt-scroll-region"), empty: byId("empty-state"),
    dialog: byId("task-details"), detailTitle: byId("task-details-title"), detail: byId("task-detail-content"),
    timeElapsed: byId("kpi-time-elapsed"),
    timeRemaining: byId("kpi-time-remaining"),
    daysRemaining: byId("kpi-days-remaining"),
    closedOnTime: byId("kpi-closed-on-time"),
    closedLate: byId("kpi-closed-late"),
    inProgress: byId("kpi-in-progress"),
    behindSchedule: byId("kpi-behind-schedule"),
  };
  let lastTaskTrigger = null;

  function dispatchFilters() {
    store.dispatch({ type: "FILTERS_CHANGED", filters: {
      controlDate: elements.controlDate.value || null,
      assignees: [...elements.assignees.selectedOptions].map(({ value }) => value),
      dateFrom: elements.dateFrom.value || null,
      dateTo: elements.dateTo.value || null,
      completion: elements.completion.value,
    } });
  }

  function openDetail(task, trigger) {
    lastTaskTrigger = trigger;
    setText(elements.detailTitle, task.name);
    const entries = detailEntries(task).flatMap(([term, value]) => {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      setText(dt, term);
      setText(dd, value);
      return [dt, dd];
    });
    replaceChildren(elements.detail, entries);
    if (typeof elements.dialog.showModal === "function") elements.dialog.showModal();
    else elements.dialog.setAttribute("open", "");
  }

  function closeDetail() {
    if (typeof elements.dialog.close === "function") elements.dialog.close();
    else elements.dialog.removeAttribute("open");
    lastTaskTrigger?.focus();
  }

  function renderProjects(state) {
    const options = state.sheets.map((sheet) => {
      const option = document.createElement("option");
      option.value = sheet.id;
      setText(option, sheet.name);
      option.selected = sheet.id === state.selectedSheetId;
      return option;
    });
    if (!options.length) {
      const option = document.createElement("option");
      setText(option, state.status === "loading" ? "Cargando proyectos…" : "Sin proyectos disponibles");
      options.push(option);
    }
    replaceChildren(elements.sheet, options);
    elements.sheet.disabled = state.sheets.length === 0;
  }

  function renderAssignees(state) {
    const selected = new Set(state.filters.assignees);
    const names = [...new Set(state.tasks.map(({ assignee }) => assignee || "Sin asignar"))]
      .sort((left, right) => left.localeCompare(right, "es"));
    const options = names.map((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.selected = selected.has(name);
      setText(option, name);
      return option;
    });
    replaceChildren(elements.assignees, options);
  }

  function renderGantt(state) {
    const visibleTasks = state.visibleDerivedTasks ?? state.derivedTasks;
    const allDerivedTasks = state.derivedTasks;
    const sections = state.sections ?? [];
    const collapsedSections = state.collapsedSections ?? [];

    const ganttEntries = buildGanttEntries(sections, visibleTasks, allDerivedTasks, collapsedSections);

    const layout = computeGanttLayout(ganttEntries, {
      controlDate: state.filters.controlDate,
      scale: state.scale,
      viewport: state.viewport,
    });

    const taskItemsById = new Map();
    const rowGroupsById = new Map();
    const setRowHighlight = (taskId, highlighted) => {
      taskItemsById.get(taskId)?.classList.toggle("is-highlighted", highlighted);
      rowGroupsById.get(taskId)?.classList.toggle("is-highlighted", highlighted);
    };

    // Build HTML task-list panel (sections + visible tasks interleaved)
    const listItems = layout.rows.map((row) => {
      if (row.kind === "section") {
        const section = row.data;
        const isCollapsed = collapsedSections.includes(section.id);
        const sectionGroupId = `section-group-${section.id.replace(/[^a-zA-Z0-9-_]/gu, "_")}`;
        const item = document.createElement("div");
        item.className = "gantt-section-header";
        item.setAttribute("role", "listitem");
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "gantt-section-toggle";
        toggle.setAttribute("aria-expanded", String(!isCollapsed));
        toggle.setAttribute("aria-controls", sectionGroupId);
        toggle.setAttribute("aria-label", `${isCollapsed ? "Expandir" : "Colapsar"} sección ${section.name}`);
        setText(toggle, section.name);
        toggle.addEventListener("click", () => {
          store.dispatch({ type: "SECTION_TOGGLED", sectionId: section.id });
        });
        item.append(toggle);
        return item;
      }

      // kind === "task"
      const { task, x } = row;
      const item = document.createElement("div");
      item.className = "gantt-task-item";
      item.setAttribute("role", "listitem");
      item.addEventListener("pointerenter", () => setRowHighlight(task.id, true));
      item.addEventListener("pointerleave", () => setRowHighlight(task.id, false));
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gantt-task-button";
      button.dataset.taskId = task.id;
      setText(button, `${task.milestone ? "◆ Hito: " : ""}${task.name}`);
      button.addEventListener("click", () => openDetail(task, button));
      button.addEventListener("focus", () => {
        setRowHighlight(task.id, true);
        elements.scroll.scrollLeft = Math.max(0, x - 40);
      });
      button.addEventListener("blur", () => setRowHighlight(task.id, false));
      item.append(button);
      if (task.assignee && task.assignee !== "Sin asignar") {
        const assigneeSpan = document.createElement("span");
        assigneeSpan.className = "gantt-task-assignee";
        assigneeSpan.textContent = task.assignee;
        item.append(assigneeSpan);
      }
      taskItemsById.set(task.id, item);
      return item;
    });
    replaceChildren(elements.list, listItems);
    elements.list.setAttribute("aria-busy", "false");

    // Build SVG
    const title = svgElement(document, "title", { id: "gantt-svg-title" }, "Línea temporal del proyecto");
    const description = svgElement(document, "desc", { id: "gantt-svg-description" },
      `${layout.rows.filter((r) => r.kind === "task").length} tareas a fecha ${state.filters.controlDate ?? "sin definir"}.`);
    const nodes = [title, description];
    for (const year of layout.years) {
      nodes.push(svgElement(document, "rect", {
        class: "gantt-year-band", x: year.x, y: 0, width: year.width, height: YEAR_HEADER_HEIGHT,
      }));
      nodes.push(svgElement(document, "text", {
        class: "gantt-year-label", x: year.x + year.width / 2, y: 19, "text-anchor": "middle",
      }, year.label));
    }
    for (const tick of layout.ticks) {
      nodes.push(svgElement(document, "rect", {
        class: "gantt-period-cell", x: tick.x, y: YEAR_HEADER_HEIGHT, width: tick.width, height: PERIOD_HEADER_HEIGHT,
      }));
      nodes.push(svgElement(document, "line", { class: "gantt-grid-line", x1: tick.x, y1: HEADER_HEIGHT, x2: tick.x, y2: layout.height }));
      nodes.push(svgElement(document, "text", {
        class: "gantt-tick", x: tick.x + tick.width / 2, y: YEAR_HEADER_HEIGHT + 27, "text-anchor": "middle",
      }, tick.label));
    }
    for (const row of layout.rows) {
      if (row.kind === "section") {
        // Shaded background band — no text label in SVG (name shown in left panel only)
        const group = svgElement(document, "g", { class: "gantt-section-row" });
        group.append(svgElement(document, "rect", {
          class: "gantt-section-band", x: 0, y: row.y, width: layout.width, height: ROW_HEIGHT,
        }));
        // Summary bar for collapsed sections
        if (row.collapsed && row.summaryX !== null && row.summaryWidth !== null) {
          group.append(svgElement(document, "rect", {
            class: `gantt-section-summary-bar${row.allCompleted ? " is-completed" : ""}`,
            x: row.summaryX, y: row.y + 12, width: row.summaryWidth, height: 24, rx: 4,
          }));
        }
        nodes.push(group);
        continue;
      }

      // kind === "task"
      const group = svgElement(document, "g", { class: "gantt-row", "data-task-id": row.task.id });
      group.append(svgElement(document, "rect", {
        class: "gantt-row-highlight", x: 0, y: row.y, width: layout.width, height: ROW_HEIGHT,
      }));
      group.addEventListener("pointerenter", () => setRowHighlight(row.task.id, true));
      group.addEventListener("pointerleave", () => setRowHighlight(row.task.id, false));
      rowGroupsById.set(row.task.id, group);
      const delayed = row.task.classification?.delayed || row.task.classification?.behindSchedule;
      if (row.task.milestone) {
        const msCx = row.x + layout.pixelsPerDay / 2;
        group.append(svgElement(document, "rect", {
          class: `gantt-milestone${delayed ? " is-delayed" : ""}`,
          x: msCx - 8, y: row.y + 16, width: 16, height: 16,
          transform: `rotate(45 ${msCx} ${row.y + 24})`,
        }));
      } else {
        group.append(svgElement(document, "rect", {
          class: `gantt-bar${delayed ? " is-delayed" : ""}`,
          x: row.x, y: row.y + 12, width: row.width, height: 24, rx: 4,
        }));
        const progress = Math.max(0, Math.min(1, Number(row.task.completionFraction) || 0));
        group.append(svgElement(document, "rect", {
          class: "gantt-progress", x: row.x, y: row.y + 12, width: row.width * progress, height: 24, rx: 4,
        }));
        group.append(svgElement(document, "text", {
          class: "gantt-progress-label", x: row.x + row.width + 6, y: row.y + 28,
        }, `Avance ${Math.round(progress * 100)}%`));
      }
      nodes.push(group);
    }
    if (layout.controlX !== null) {
      nodes.push(svgElement(document, "line", {
        class: "gantt-control-line", x1: layout.controlX, y1: 0, x2: layout.controlX, y2: layout.height,
      }));
    }
    elements.chart.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);
    elements.chart.setAttribute("width", String(layout.width));
    elements.chart.setAttribute("height", String(layout.height));
    replaceChildren(elements.chart, nodes);
    elements.scroll.scrollLeft = Math.max(0, layout.firstTaskX - 16);
    // Use layout.rows (sections + tasks) so the Gantt stays visible when all tasks are collapsed
    elements.empty.hidden = state.status !== "ready" || layout.rows.length > 0;
    byId("gantt-shell").hidden = !elements.empty.hidden;
  }

  function setDateValue(el, value) {
    if (document.activeElement !== el) {
      el.value = value ?? "";
    }
  }

  function render(state) {
    renderProjects(state);
    renderAssignees(state);
    setDateValue(elements.controlDate, state.filters.controlDate);
    setDateValue(elements.dateFrom, state.filters.dateFrom);
    setDateValue(elements.dateTo, state.filters.dateTo);
    elements.completion.value = state.filters.completion;
    setText(elements.total, String(state.metrics.total));
    const te = state.metrics.timeElapsed;
    const tr = state.metrics.timeRemaining;
    const dr = state.metrics.daysRemaining;
    setText(elements.timeElapsed, te !== null ? `${te} %` : "—");
    setText(elements.timeRemaining, tr !== null ? `${tr} %` : "—");
    setText(elements.daysRemaining, dr !== null ? `${dr} días` : "Días hasta fecha fin");
    setText(elements.closedOnTime, String(state.metrics.completedOnTime ?? 0));
    setText(elements.closedLate, String(state.metrics.completedLate ?? 0));
    setText(elements.inProgress, String(state.metrics.tasksInProgress ?? 0));
    setText(elements.behindSchedule, String(state.metrics.behindSchedule ?? 0));
    setText(elements.context, filterContext(state.filters));
    setText(elements.sourceFile, state.sourceFile || "Libro configurado en el código");
    elements.loading.hidden = state.status !== "loading";
    elements.error.hidden = state.status !== "error";
    setText(elements.error, state.error?.message ?? "");
    elements.warnings.hidden = state.qualityIssues.length === 0;
    setText(elements.warnings, state.qualityIssues.length
      ? `${state.qualityIssues.length} avisos de calidad. ${state.metrics.excluded} tareas excluidas de los indicadores.`
      : "");
    setText(elements.sourceStatus.lastElementChild, {
      loading: "Cargando el libro configurado",
      error: "No se pudo cargar el libro",
      empty: "Proyecto sin tareas",
      ready: "Datos preparados localmente",
    }[state.status] ?? "Pendiente de carga");
    for (const button of document.querySelectorAll("[data-scale]")) {
      button.setAttribute("aria-pressed", String(button.dataset.scale === state.scale));
    }
    renderGantt(state);
  }

  elements.form.addEventListener("change", dispatchFilters);
  elements.form.addEventListener("reset", () => globalThis.queueMicrotask(dispatchFilters));
  byId("clear-assignee-filter").addEventListener("click", () => {
    for (const option of elements.assignees.options) option.selected = false;
    dispatchFilters();
  });
  byId("clear-date-range").addEventListener("click", () => {
    elements.dateFrom.value = "";
    elements.dateTo.value = "";
    dispatchFilters();
  });
  elements.sheet.addEventListener("change", () => handlers.selectProject?.(elements.sheet.value));
  byId("reload-workbook-button").addEventListener("click", () => handlers.reload?.());
  byId("presentation-mode-button").addEventListener("click", () => {
    document.body.classList.toggle("presentation-mode");
  });
  byId("empty-clear-filters-button").addEventListener("click", () => elements.form.reset());
  for (const button of document.querySelectorAll("[data-scale]")) {
    button.addEventListener("click", () => {
      store.dispatch({ type: "SCALE_CHANGED", scale: button.dataset.scale });
    });
  }
  byId("close-task-details").addEventListener("click", closeDetail);
  elements.dialog.addEventListener("close", () => lastTaskTrigger?.focus());

  // ── Full Gantt view (TASK-004 … TASK-008) ──────────────────────────────
  const fullDialog = byId("full-gantt-dialog");
  const fullList = byId("full-gantt-task-list");
  const fullChart = byId("full-gantt-chart");
  const fullScroll = byId("full-gantt-scroll-region");

  let fullGanttScale = "month";
  let fullGanttZoom = 0.7;
  let hiddenTaskIds = new Set();

  function applyFullGanttZoom() {
    const shell = fullDialog?.querySelector(".full-gantt-shell");
    if (shell) shell.style.zoom = String(fullGanttZoom);
    const label = byId("full-gantt-zoom-label");
    if (label) label.textContent = `${Math.round(fullGanttZoom * 100)}%`;
  }

  function renderFullGantt(state) {
    if (!fullDialog?.open) return;
    const allDerivedTasks = state.derivedTasks;
    const visibleTasks = (state.visibleDerivedTasks ?? state.derivedTasks)
      .filter((t) => !hiddenTaskIds.has(t.id));
    const sections = state.sections ?? [];
    const collapsedSections = state.collapsedSections ?? [];

    const ganttEntries = buildGanttEntries(sections, visibleTasks, allDerivedTasks, collapsedSections);
    // Auto-fit: use available dialog width so the full timeline always fits on screen
    const availableWidth = (fullScroll?.clientWidth || globalThis.innerWidth || 900) - 4;
    const layout = computeGanttLayout(ganttEntries, {
      controlDate: state.filters.controlDate,
      scale: fullGanttScale,
      viewport: {},
      fitWidth: availableWidth,
    });

    // Update scale buttons
    if (fullDialog) {
      for (const btn of fullDialog.querySelectorAll("[data-full-scale]")) {
        btn.setAttribute("aria-pressed", String(btn.dataset.fullScale === fullGanttScale));
      }
    }

    // Hover highlight maps for full Gantt
    const fullTaskItemsById = new Map();
    const fullRowGroupsById = new Map();
    const setFullRowHighlight = (taskId, highlighted) => {
      fullTaskItemsById.get(taskId)?.classList.toggle("is-highlighted", highlighted);
      fullRowGroupsById.get(taskId)?.classList.toggle("is-highlighted", highlighted);
    };

    // Build HTML task-list panel inside full dialog
    const listItems = layout.rows.map((row) => {
      if (row.kind === "section") {
        const section = row.data;
        const isCollapsed = collapsedSections.includes(section.id);
        const item = document.createElement("div");
        item.className = "gantt-section-header";
        item.setAttribute("role", "listitem");
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "gantt-section-toggle";
        toggle.setAttribute("aria-expanded", String(!isCollapsed));
        toggle.setAttribute("aria-label", `${isCollapsed ? "Expandir" : "Colapsar"} sección ${section.name}`);
        setText(toggle, section.name);
        toggle.addEventListener("click", () => {
          store.dispatch({ type: "SECTION_TOGGLED", sectionId: section.id });
        });
        item.append(toggle);
        return item;
      }
      // kind === "task"
      const { task } = row;
      const item = document.createElement("div");
      item.className = "gantt-task-item";
      item.setAttribute("role", "listitem");
      item.addEventListener("pointerenter", () => setFullRowHighlight(task.id, true));
      item.addEventListener("pointerleave", () => setFullRowHighlight(task.id, false));
      fullTaskItemsById.set(task.id, item);
      const isHidden = hiddenTaskIds.has(task.id);

      const hideBtn = document.createElement("button");
      hideBtn.type = "button";
      hideBtn.className = `full-gantt-hide-toggle${isHidden ? " is-hidden" : ""}`;
      hideBtn.setAttribute("aria-label", `${isHidden ? "Mostrar" : "Ocultar"} tarea ${task.name}`);
      hideBtn.setAttribute("aria-pressed", String(isHidden));
      setText(hideBtn, isHidden ? "👁" : "🙈");
      hideBtn.addEventListener("click", () => {
        if (hiddenTaskIds.has(task.id)) {
          hiddenTaskIds.delete(task.id);
        } else {
          hiddenTaskIds.add(task.id);
        }
        renderFullGantt(store.getState());
      });

      const nameBtn = document.createElement("button");
      nameBtn.type = "button";
      nameBtn.className = "gantt-task-button";
      setText(nameBtn, `${task.milestone ? "◆ Hito: " : ""}${task.name}`);
      nameBtn.addEventListener("click", () => openDetail(task, nameBtn));

      item.append(hideBtn, nameBtn);
      if (task.assignee && task.assignee !== "Sin asignar") {
        const assigneeSpan = document.createElement("span");
        assigneeSpan.className = "gantt-task-assignee";
        assigneeSpan.textContent = task.assignee;
        item.append(assigneeSpan);
      }
      return item;
    });
    // Prepend a spacer matching HEADER_HEIGHT so task rows align with SVG rows
    const headerSpacer = document.createElement("div");
    headerSpacer.style.cssText = `height:${HEADER_HEIGHT}px;flex-shrink:0;background:var(--surface-muted);border-bottom:1px solid var(--line-strong);`;
    headerSpacer.setAttribute("aria-hidden", "true");
    replaceChildren(fullList, [headerSpacer, ...listItems]);
    fullList.setAttribute("aria-busy", "false");

    // Build SVG for full view (same rendering logic as renderGantt)
    const rotateTickLabels = fullGanttScale === "day";
    const svgNodes = [
      svgElement(document, "title", {}, "Gantt completo del proyecto"),
    ];
    for (const year of layout.years) {
      svgNodes.push(svgElement(document, "rect", {
        class: "gantt-year-band", x: year.x, y: 0, width: year.width, height: YEAR_HEADER_HEIGHT,
      }));
      svgNodes.push(svgElement(document, "text", {
        class: "gantt-year-label", x: year.x + year.width / 2, y: 19, "text-anchor": "middle",
      }, year.label));
    }
    for (const tick of layout.ticks) {
      svgNodes.push(svgElement(document, "rect", {
        class: "gantt-period-cell", x: tick.x, y: YEAR_HEADER_HEIGHT, width: tick.width, height: PERIOD_HEADER_HEIGHT,
      }));
      svgNodes.push(svgElement(document, "line", { class: "gantt-grid-line", x1: tick.x, y1: HEADER_HEIGHT, x2: tick.x, y2: layout.height }));
      const tickCx = tick.x + tick.width / 2;
      if (rotateTickLabels) {
        // Vertical label centred within the period band, rotated -90°
        const tickCy = YEAR_HEADER_HEIGHT + PERIOD_HEADER_HEIGHT / 2;
        svgNodes.push(svgElement(document, "text", {
          class: "gantt-tick",
          x: tickCx,
          y: tickCy,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          transform: `rotate(-90 ${tickCx} ${tickCy})`,
        }, tick.label));
      } else {
        svgNodes.push(svgElement(document, "text", {
          class: "gantt-tick", x: tickCx, y: YEAR_HEADER_HEIGHT + 27, "text-anchor": "middle",
        }, tick.label));
      }
    }
    for (const row of layout.rows) {
      if (row.kind === "section") {
        const group = svgElement(document, "g", { class: "gantt-section-row" });
        group.append(svgElement(document, "rect", {
          class: "gantt-section-band", x: 0, y: row.y, width: layout.width, height: ROW_HEIGHT,
        }));
        if (row.collapsed && row.summaryX !== null && row.summaryWidth !== null) {
          group.append(svgElement(document, "rect", {
            class: `gantt-section-summary-bar${row.allCompleted ? " is-completed" : ""}`,
            x: row.summaryX, y: row.y + 12, width: row.summaryWidth, height: 24, rx: 4,
          }));
        }
        svgNodes.push(group);
        continue;
      }
      const { task } = row;
      const group = svgElement(document, "g", { class: "gantt-row", "data-task-id": task.id });
      group.append(svgElement(document, "rect", {
        class: "gantt-row-highlight", x: 0, y: row.y, width: layout.width, height: ROW_HEIGHT,
      }));
      group.addEventListener("pointerenter", () => setFullRowHighlight(task.id, true));
      group.addEventListener("pointerleave", () => setFullRowHighlight(task.id, false));
      fullRowGroupsById.set(task.id, group);
      const delayed = task.classification?.delayed || task.classification?.behindSchedule;
      if (task.milestone) {
        const msCx = row.x + layout.pixelsPerDay / 2;
        group.append(svgElement(document, "rect", {
          class: `gantt-milestone${delayed ? " is-delayed" : ""}`,
          x: msCx - 8, y: row.y + 16, width: 16, height: 16,
          transform: `rotate(45 ${msCx} ${row.y + 24})`,
        }));
      } else {
        group.append(svgElement(document, "rect", {
          class: `gantt-bar${delayed ? " is-delayed" : ""}`,
          x: row.x, y: row.y + 12, width: row.width, height: 24, rx: 4,
        }));
        const progress = Math.max(0, Math.min(1, Number(task.completionFraction) || 0));
        group.append(svgElement(document, "rect", {
          class: "gantt-progress", x: row.x, y: row.y + 12, width: row.width * progress, height: 24, rx: 4,
        }));
        group.append(svgElement(document, "text", {
          class: "gantt-progress-label", x: row.x + row.width + 6, y: row.y + 28,
        }, `Avance ${Math.round(progress * 100)}%`));
      }
      svgNodes.push(group);
    }
    if (layout.controlX !== null) {
      svgNodes.push(svgElement(document, "line", {
        class: "gantt-control-line", x1: layout.controlX, y1: 0, x2: layout.controlX, y2: layout.height,
      }));
    }
    fullChart.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);
    fullChart.setAttribute("width", String(layout.width));
    fullChart.setAttribute("height", String(layout.height));
    replaceChildren(fullChart, svgNodes);
    fullScroll.scrollLeft = Math.max(0, layout.firstTaskX - 16);
  }

  function openFullGantt() {
    hiddenTaskIds = new Set();
    fullGanttScale = "month";
    fullGanttZoom = 0.7;
    if (typeof fullDialog.showModal === "function") {
      fullDialog.showModal();
    } else {
      fullDialog.setAttribute("open", "");
    }
    applyFullGanttZoom();
    renderFullGantt(store.getState());
    byId("full-gantt-close")?.focus();
  }

  function closeFullGantt() {
    if (typeof fullDialog.close === "function") {
      fullDialog.close();
    } else {
      fullDialog.removeAttribute("open");
    }
    byId("full-gantt-open-button")?.focus();
  }

  byId("full-gantt-zoom-out")?.addEventListener("click", () => {
    fullGanttZoom = Math.max(0.3, Math.round((fullGanttZoom - 0.1) * 10) / 10);
    applyFullGanttZoom();
  });
  byId("full-gantt-zoom-in")?.addEventListener("click", () => {
    fullGanttZoom = Math.min(2.0, Math.round((fullGanttZoom + 0.1) * 10) / 10);
    applyFullGanttZoom();
  });
  byId("full-gantt-open-button")?.addEventListener("click", openFullGantt);
  byId("full-gantt-close")?.addEventListener("click", closeFullGantt);
  fullDialog?.addEventListener("cancel", (e) => { e.preventDefault(); closeFullGantt(); });

  for (const btn of document.querySelectorAll("[data-full-scale]")) {
    btn.addEventListener("click", () => {
      fullGanttScale = btn.dataset.fullScale;
      renderFullGantt(store.getState());
    });
  }

  const unsubscribe = store.subscribe((state) => {
    render(state);
    // Close full Gantt when project changes (TASK-008)
    if (fullDialog?.open && state.selectedSheetId !== store.getState().selectedSheetId) {
      closeFullGantt();
    }
    renderFullGantt(state);
  });
  render(store.getState());
  return Object.freeze({ render, destroy: unsubscribe, closeDetail });
}
