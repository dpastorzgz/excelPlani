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
  return { day: 52, week: 12, month: 4 }[scale] ?? 12;
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

export function computeGanttLayout(tasks, {
  controlDate,
  scale = "week",
  viewport = {},
} = {}) {
  const datedTasks = tasks.map((task) => ({
    task,
    start: normalizeDateOnly(task.plannedStart),
    end: normalizeDateOnly(task.plannedEnd),
  })).filter(({ start, end }) => start && end);
  const dates = datedTasks.flatMap(({ start, end }) => [ordinal(start), ordinal(end)]);
  const control = normalizeDateOnly(controlDate);
  const controlOrdinal = control ? ordinal(control) : null;
  const bounds = controlOrdinal === null ? dates : [...dates, controlOrdinal];
  const fallback = control ? ordinal(control) : ordinal("2026-01-01");
  const startOrdinal = viewport.start
    ? ordinal(viewport.start)
    : Math.min(...(bounds.length ? bounds : [fallback]));
  const endOrdinal = viewport.end
    ? ordinal(viewport.end)
    : Math.max(...(bounds.length ? bounds : [fallback + 30]));
  const normalizedEndOrdinal = Math.max(endOrdinal, startOrdinal + 1);
  const daySpan = normalizedEndOrdinal - startOrdinal + 1;
  const pixelsPerDay = Math.max(scalePixels(scale), MIN_CHART_WIDTH / daySpan);
  const width = daySpan * pixelsPerDay;
  const rows = datedTasks.map(({ task, start, end }, index) => {
    const startDay = ordinal(start);
    const endDay = ordinal(end);
    return Object.freeze({
      task,
      x: (startDay - startOrdinal) * pixelsPerDay,
      y: HEADER_HEIGHT + index * ROW_HEIGHT,
      width: task.milestone ? 14 : Math.max(pixelsPerDay, (endDay - startDay + 1) * pixelsPerDay),
      height: ROW_HEIGHT,
    });
  });
  const ticks = createPeriodBands(startOrdinal, normalizedEndOrdinal, scale, pixelsPerDay);
  const years = createYearBands(startOrdinal, normalizedEndOrdinal, pixelsPerDay);
  const firstTaskOrdinal = dates.length ? Math.min(...dates) : startOrdinal;
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
    const layout = computeGanttLayout(state.derivedTasks, {
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
    const taskItems = layout.rows.map(({ task, x }) => {
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
    replaceChildren(elements.list, taskItems);
    elements.list.setAttribute("aria-busy", "false");

    const title = svgElement(document, "title", { id: "gantt-svg-title" }, "Línea temporal del proyecto");
    const description = svgElement(document, "desc", { id: "gantt-svg-description" },
      `${layout.rows.length} tareas a fecha ${state.filters.controlDate ?? "sin definir"}.`);
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
        class: "gantt-period-cell",
        x: tick.x,
        y: YEAR_HEADER_HEIGHT,
        width: tick.width,
        height: PERIOD_HEADER_HEIGHT,
      }));
      nodes.push(svgElement(document, "line", { class: "gantt-grid-line", x1: tick.x, y1: HEADER_HEIGHT, x2: tick.x, y2: layout.height }));
      nodes.push(svgElement(document, "text", {
        class: "gantt-tick",
        x: tick.x + tick.width / 2,
        y: YEAR_HEADER_HEIGHT + 27,
        "text-anchor": "middle",
      }, tick.label));
    }
    for (const row of layout.rows) {
      const group = svgElement(document, "g", {
        class: "gantt-row",
        "data-task-id": row.task.id,
      });
      group.append(svgElement(document, "rect", {
        class: "gantt-row-highlight",
        x: 0,
        y: row.y,
        width: layout.width,
        height: ROW_HEIGHT,
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
          class: "gantt-progress-label",
          x: row.x + row.width + 6,
          y: row.y + 28,
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
    elements.empty.hidden = state.status !== "ready" || state.derivedTasks.length > 0;
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

  const unsubscribe = store.subscribe(render);
  render(store.getState());
  return Object.freeze({ render, destroy: unsubscribe, closeDetail });
}
