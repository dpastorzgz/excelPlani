import { DASHBOARD_CONFIG } from "../dashboard-config.js";
import { createDashboardStore } from "./dashboard-state.js";
import { createDashboardView } from "./dashboard-view.js";
import {
  createProjectPlan,
  loadProjectWorkbook,
  WorkbookGatewayError,
} from "./workbook-gateway.js";

function todayDateOnly(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function createDashboardApplication({
  document = globalThis.document,
  config = DASHBOARD_CONFIG,
  xlsx = globalThis.XLSX,
  loadWorkbook = loadProjectWorkbook,
  createPlan = createProjectPlan,
  now = new Date(),
} = {}) {
  const store = createDashboardStore({ filters: { controlDate: null } });
  let loadedWorkbook = null;

  function selectProject(sheetId) {
    const descriptor = loadedWorkbook?.sheets.find(({ id }) => id === sheetId);
    if (!descriptor) return;
    const plan = createPlan(loadedWorkbook.workbook, descriptor, {
      xlsx,
      sourceFile: loadedWorkbook.sourceFile,
    });
    store.dispatch({ type: "PROJECT_SELECTED", plan });
    if (!store.getState().filters.controlDate) {
      store.dispatch({ type: "FILTERS_CHANGED", filters: { controlDate: todayDateOnly(now) } });
    }
  }

  async function reload() {
    const previouslySelectedSheet = store.getState().selectedSheetId;
    store.dispatch({ type: "LOAD_STARTED" });
    try {
      loadedWorkbook = await loadWorkbook(config.workbookFile, { xlsx });
      store.dispatch({
        type: "WORKBOOK_LOADED",
        sourceFile: loadedWorkbook.sourceFile,
        sheets: loadedWorkbook.sheets,
      });
      const initialSheet = loadedWorkbook.sheets.find(({ id }) => id === previouslySelectedSheet)
        ?? loadedWorkbook.sheets[0];
      if (initialSheet) selectProject(initialSheet.id);
    } catch (error) {
      const known = error instanceof WorkbookGatewayError;
      store.dispatch({
        type: "LOAD_FAILED",
        code: known ? error.code : "UNEXPECTED_ERROR",
        message: known ? error.message : "Se produjo un error inesperado al preparar el cuadro de mando.",
      });
    }
  }

  const view = createDashboardView({
    document,
    store,
    handlers: { selectProject, reload },
  });

  return Object.freeze({ store, view, reload, selectProject });
}

if (typeof document !== "undefined" && !globalThis.__DASHBOARD_DISABLE_AUTO_START__) {
  createDashboardApplication().reload();
}
