import { deriveDashboard, normalizeDateOnly } from "./planning-domain.js";

const SCALES = new Set(["day", "week", "month"]);
const COMPLETION_FILTERS = new Set(["all", "completed", "open", "delayed"]);

function freezeFilters(filters) {
  return Object.freeze({
    controlDate: filters.controlDate ?? null,
    assignees: Object.freeze([...(filters.assignees ?? [])]),
    dateFrom: filters.dateFrom ?? null,
    dateTo: filters.dateTo ?? null,
    completion: filters.completion ?? "all",
  });
}
function freezeViewport(viewport = {}) {
  return Object.freeze({
    start: viewport.start ?? null,
    end: viewport.end ?? null,
    fitToTasks: Boolean(viewport.fitToTasks),
  });
}
function createInitialState(overrides = {}) {
  const tasks = Object.freeze([...(overrides.tasks ?? [])]);
  const filters = freezeFilters(overrides.filters ?? {});
  const projectStart = overrides.projectStart ?? null;
  const projectEnd = overrides.projectEnd ?? null;
  const derived = deriveDashboard(tasks, filters, { date1904: Boolean(overrides.date1904), projectStart, projectEnd });
  return Object.freeze({
    status: overrides.status ?? "idle",
    sourceFile: overrides.sourceFile ?? "",
    sheets: Object.freeze([...(overrides.sheets ?? [])]),
    selectedSheetId: overrides.selectedSheetId ?? null,
    tasks,
    qualityIssues: Object.freeze([...(overrides.qualityIssues ?? [])]),
    date1904: Boolean(overrides.date1904),
    projectStart,
    projectEnd,
    filters,
    scale: overrides.scale ?? "week",
    viewport: freezeViewport(overrides.viewport),
    derivedTasks: derived.tasks,
    metrics: derived.metrics,
    error: overrides.error ?? null,
  });
}

function recalculate(state, updates = {}) {
  const tasks = updates.tasks ?? state.tasks;
  const filters = updates.filters ?? state.filters;
  const date1904 = updates.date1904 ?? state.date1904;
  const projectStart = updates.projectStart ?? state.projectStart ?? null;
  const projectEnd = updates.projectEnd ?? state.projectEnd ?? null;
  const derived = deriveDashboard(tasks, filters, { date1904, projectStart, projectEnd });
  return Object.freeze({
    ...state,
    ...updates,
    tasks: Object.freeze([...tasks]),
    filters: freezeFilters(filters),
    date1904,
    projectStart,
    projectEnd,
    derivedTasks: derived.tasks,
    metrics: derived.metrics,
  });
}

function validateDate(value, field) {
  if (value !== null && value !== "" && !normalizeDateOnly(value)) {
    throw new TypeError(`${field} debe ser una fecha YYYY-MM-DD válida.`);
  }
  return value || null;
}

export function dashboardReducer(state, action) {
  switch (action.type) {
    case "LOAD_STARTED":
      return createInitialState({
        ...state,
        status: "loading",
        tasks: [],
        qualityIssues: [],
        error: null,
      });
    case "WORKBOOK_LOADED":
      return createInitialState({
        ...state,
        status: "ready",
        sourceFile: action.sourceFile,
        sheets: action.sheets,
        selectedSheetId: null,
        tasks: [],
        qualityIssues: [],
        error: null,
      });
    case "PROJECT_SELECTED":
      {
        const filters = !state.filters.controlDate && action.plan.statusDate
          ? { ...state.filters, controlDate: normalizeDateOnly(action.plan.statusDate, { date1904: action.plan.date1904 }) }
          : state.filters;
      return recalculate(state, {
        status: action.plan.tasks.length === 0 ? "empty" : "ready",
        selectedSheetId: action.plan.sheetId,
        tasks: action.plan.tasks,
        qualityIssues: action.plan.qualityIssues,
        date1904: action.plan.date1904,
        projectStart: action.plan.projectStart ?? null,
        projectEnd: action.plan.projectEnd ?? null,
        filters,
        error: null,
      });
      }
    case "FILTERS_CHANGED": {
      const next = { ...state.filters, ...action.filters };
      if (Object.hasOwn(action.filters, "controlDate")) {
        next.controlDate = validateDate(action.filters.controlDate, "controlDate");
      }
      if (Object.hasOwn(action.filters, "dateFrom")) {
        next.dateFrom = validateDate(action.filters.dateFrom, "dateFrom");
      }
      if (Object.hasOwn(action.filters, "dateTo")) {
        next.dateTo = validateDate(action.filters.dateTo, "dateTo");
      }
      if (!COMPLETION_FILTERS.has(next.completion)) {
        throw new TypeError("El filtro de completitud no es válido.");
      }
      if (next.dateFrom && next.dateTo && next.dateFrom > next.dateTo) {
        throw new RangeError("La fecha desde no puede ser posterior a la fecha hasta.");
      }
      return recalculate(state, { filters: next, error: null });
    }
    case "SCALE_CHANGED":
      if (!SCALES.has(action.scale)) {
        throw new TypeError("La escala del Gantt no es válida.");
      }
      return Object.freeze({ ...state, scale: action.scale });
    case "VIEWPORT_CHANGED":
      return Object.freeze({ ...state, viewport: freezeViewport(action.viewport) });
    case "LOAD_FAILED":
      return createInitialState({
        ...state,
        status: "error",
        tasks: [],
        qualityIssues: [],
        error: Object.freeze({ code: action.code, message: action.message }),
      });
    default:
      return state;
  }
}

export function createDashboardStore(initialState = {}) {
  let state = createInitialState(initialState);
  const listeners = new Set();
  return Object.freeze({
    getState() {
      return state;
    },
    dispatch(action) {
      const nextState = dashboardReducer(state, action);
      if (nextState !== state) {
        state = nextState;
        for (const listener of listeners) {
          listener(state, action);
        }
      }
      return action;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}
