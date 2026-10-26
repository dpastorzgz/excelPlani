/**
 * Único punto de cambio del libro de planificación cargado por el dashboard.
 * Debe ser un nombre de fichero relativo situado junto a dashboard.html.
 */
export const WORKBOOK_FILE = "diagramaGanttBase.xlsm";

const supportedWorkbookExtension = /\.(?:xlsx|xlsm)$/iu;
const unsafeFileName = /[\\/:*?"<>|]/u;

export function validateWorkbookFileName(fileName) {
  if (typeof fileName !== "string" || fileName.trim() !== fileName || fileName.length === 0) {
    throw new TypeError("WORKBOOK_FILE must be a non-empty filename without surrounding whitespace.");
  }
  const hasControlCharacter = [...fileName].some((character) => character.codePointAt(0) < 32);
  if (fileName === "." || fileName === ".." || unsafeFileName.test(fileName) || hasControlCharacter) {
    throw new TypeError("WORKBOOK_FILE must be a safe relative filename, not a path or URL.");
  }
  if (!supportedWorkbookExtension.test(fileName)) {
    throw new TypeError("WORKBOOK_FILE must use the .xlsx or .xlsm extension.");
  }

  return fileName;
}

export const DASHBOARD_CONFIG = Object.freeze({
  workbookFile: validateWorkbookFileName(WORKBOOK_FILE),
});
