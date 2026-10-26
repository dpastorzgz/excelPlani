/**
 * Adapta libros Excel leídos en memoria a planes de proyecto independientes de
 * coordenadas. No modifica el fichero, no ejecuta VBA y no contiene reglas de
 * completitud o retraso.
 */

const MAX_HEADER_SCAN_ROWS = 50;
const MAX_METADATA_SCAN_ROWS = 20;

const FIELD_DEFINITIONS = Object.freeze({
  wbs: ["edt", "wbs"],
  name: ["tarea", "nombre de tarea", "task", "task name"],
  assignee: ["asignado", "asignada", "responsable", "assigned to", "assignee"],
  durationDays: ["duracion", "duracion dias", "duration", "duration days"],
  plannedStart: ["inicio", "fecha inicio", "start", "start date"],
  plannedEnd: ["fin", "fecha fin", "end", "finish", "end date"],
  completionFraction: ["% completado", "porcentaje completado", "avance", "% complete"],
  status: ["estado", "status"],
  comments: ["comentarios", "comentario", "comments", "notes"],
  baselineEnd: ["fin linea base", "fecha fin linea base", "baseline end", "baseline finish"],
  actualClose: ["fecha cierre real", "cierre real", "actual close", "actual finish"],
  riskLevel: ["nivel de riesgo", "riesgo", "risk level", "risk"],
  blocked: ["bloqueada", "bloqueado", "blocked"],
  milestone: ["hito", "milestone"],
});

const REQUIRED_FIELDS = Object.freeze([
  "name",
  "plannedStart",
  "plannedEnd",
  "completionFraction",
  "status",
]);

const RECOMMENDED_FIELDS = Object.freeze(["actualClose", "milestone"]);

const METADATA_DEFINITIONS = Object.freeze({
  projectStart: ["fecha inicio proyecto", "inicio proyecto", "project start"],
  projectEnd: ["fecha fin visible", "fin proyecto", "project end"],
  statusDate: ["fecha de estado", "fecha estado", "status date", "as of date"],
});

export class WorkbookGatewayError extends Error {
  constructor(code, message, options = {}) {
    super(message, options);
    this.name = "WorkbookGatewayError";
    this.code = code;
  }
}

/**
 * @typedef {object} QualityIssue
 * @property {string} code
 * @property {"error"|"warning"} severity
 * @property {string} message
 * @property {number|null} row
 * @property {string|null} affectedMetric
 */

export function createQualityIssue(code, severity, message, {
  row = null,
  affectedMetric = null,
} = {}) {
  return Object.freeze({ code, severity, message, row, affectedMetric });
}

export function normalizeHeader(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLocaleLowerCase("es")
    .replace(/\s+/gu, " ");
}

function normalizedAliasLookup(definitions) {
  return Object.fromEntries(
    Object.entries(definitions).map(([field, aliases]) => [
      field,
      new Set(aliases.map(normalizeHeader)),
    ]),
  );
}

const FIELD_ALIASES = normalizedAliasLookup(FIELD_DEFINITIONS);
const METADATA_ALIASES = normalizedAliasLookup(METADATA_DEFINITIONS);

function requireXlsx(xlsx) {
  if (!xlsx?.read || !xlsx?.utils?.sheet_to_json) {
    throw new WorkbookGatewayError(
      "XLSX_UNAVAILABLE",
      "No se ha cargado el lector local de Excel.",
    );
  }
  return xlsx;
}

function worksheetRows(worksheet, xlsx, rowLimit) {
  const options = {
    header: 1,
    raw: true,
    defval: null,
    blankrows: true,
  };
  if (Number.isInteger(rowLimit) && rowLimit > 0) {
    options.range = { s: { r: 0, c: 0 }, e: { r: rowLimit - 1, c: 255 } };
  }
  return xlsx.utils.sheet_to_json(worksheet, options);
}

export function findGanttHeader(rows, maxRows = MAX_HEADER_SCAN_ROWS) {
  const scanLimit = Math.min(rows.length, maxRows);

  for (let rowIndex = 0; rowIndex < scanLimit; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const headerMap = {};

    row.forEach((cellValue, columnIndex) => {
      const normalizedCell = normalizeHeader(cellValue);
      if (!normalizedCell) {
        return;
      }

      for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
        if (headerMap[field] === undefined && aliases.has(normalizedCell)) {
          headerMap[field] = columnIndex;
        }
      }
    });

    if (REQUIRED_FIELDS.every((field) => headerMap[field] !== undefined)) {
      return Object.freeze({
        headerRowIndex: rowIndex,
        headerRowNumber: rowIndex + 1,
        headerMap: Object.freeze(headerMap),
      });
    }
  }

  return null;
}

function fieldMatches(value) {
  const normalized = normalizeHeader(value);
  return Object.entries(FIELD_ALIASES)
    .filter(([, aliases]) => aliases.has(normalized))
    .map(([field]) => field);
}

function headerQualityIssues(headerRow, headerRowNumber) {
  const occurrences = new Map();
  headerRow.forEach((value) => {
    for (const field of fieldMatches(value)) {
      occurrences.set(field, (occurrences.get(field) ?? 0) + 1);
    }
  });
  return [...occurrences.entries()]
    .filter(([, count]) => count > 1)
    .map(([field]) => createQualityIssue(
      "DUPLICATE_HEADER",
      "error",
      `El encabezado de ${field} aparece más de una vez.`,
      { row: headerRowNumber, affectedMetric: field },
    ));
}

function missingRecommendedHeaderIssues(headerMap, headerRowNumber) {
  return RECOMMENDED_FIELDS
    .filter((field) => headerMap[field] === undefined)
    .map((field) => createQualityIssue(
      "MISSING_RECOMMENDED_HEADER",
      "warning",
      field === "actualClose"
        ? "Falta Fecha cierre real; no se reconstruirá la completitud histórica de tareas cerradas."
        : "Falta Hito; las tareas se mostrarán como barras normales.",
      { row: headerRowNumber, affectedMetric: field },
    ));
}

function readMetadata(rows) {
  const metadata = {};
  const scanLimit = Math.min(rows.length, MAX_METADATA_SCAN_ROWS);

  for (let rowIndex = 0; rowIndex < scanLimit; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    row.forEach((cellValue, columnIndex) => {
      const normalizedCell = normalizeHeader(cellValue);
      if (!normalizedCell) {
        return;
      }
      for (const [field, aliases] of Object.entries(METADATA_ALIASES)) {
        if (metadata[field] === undefined && aliases.has(normalizedCell)) {
          metadata[field] = row[columnIndex + 1] ?? null;
        }
      }
    });
  }

  return Object.freeze(metadata);
}

export function detectGanttSheets(workbook, xlsx = globalThis.XLSX) {
  const parser = requireXlsx(xlsx);
  const descriptors = [];

  for (const sheetName of workbook?.SheetNames ?? []) {
    const worksheet = workbook.Sheets?.[sheetName];
    if (!worksheet) {
      continue;
    }
    const rows = worksheetRows(worksheet, parser, MAX_HEADER_SCAN_ROWS);
    const header = findGanttHeader(rows);
    if (!header) {
      continue;
    }

    descriptors.push(Object.freeze({
      id: sheetName,
      name: sheetName,
      headerRowIndex: header.headerRowIndex,
      headerRowNumber: header.headerRowNumber,
      headerMap: header.headerMap,
      metadata: readMetadata(rows),
    }));
  }

  return Object.freeze(descriptors);
}

function textValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function numericValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const number = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : value;
}

function completionValue(value) {
  const number = numericValue(value);
  if (typeof number !== "number") {
    return number;
  }
  return number > 1 && number <= 100 ? number / 100 : number;
}

function booleanValue(value) {
  const normalized = normalizeHeader(value);
  if (["si", "yes", "true", "1", "x"].includes(normalized)) {
    return true;
  }
  if (["no", "false", "0"].includes(normalized)) {
    return false;
  }
  return value === true ? true : value === false ? false : null;
}

function isBlank(value) {
  return value === null || value === undefined || value === "";
}

function isDateLike(value) {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }
  return /^\d{4}-\d{2}-\d{2}$/u.test(String(value).trim());
}

function dateOrder(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getFullYear() * 10_000 + (value.getMonth() + 1) * 100 + value.getDate();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(String(value).trim());
  return match ? Number(`${match[1]}${match[2]}${match[3]}`) : null;
}

function issueForField(code, message, sourceRow, field) {
  return createQualityIssue(code, "error", message, {
    row: sourceRow,
    affectedMetric: field,
  });
}

function validateTaskValues(task, rawRow, descriptor, worksheet, xlsx) {
  const issues = [];
  for (const field of ["plannedStart", "plannedEnd", "baselineEnd", "actualClose"]) {
    const value = task[field];
    if (!isBlank(value) && !isDateLike(value)) {
      issues.push(issueForField("INVALID_DATE", `La fecha de ${field} no es válida.`, task.sourceRow, field));
    }
  }
  const startOrder = dateOrder(task.plannedStart);
  const endOrder = dateOrder(task.plannedEnd);
  if (startOrder !== null && endOrder !== null && startOrder > endOrder) {
    issues.push(issueForField(
      "INVALID_DATE_RANGE",
      "La fecha de inicio es posterior a la fecha de fin.",
      task.sourceRow,
      "plannedEnd",
    ));
  }
  if (
    typeof task.completionFraction !== "number"
    || task.completionFraction < 0
    || task.completionFraction > 1
  ) {
    issues.push(issueForField(
      "INVALID_COMPLETION",
      "El porcentaje completado debe estar entre 0 y 100 %.",
      task.sourceRow,
      "completionFraction",
    ));
  }
  for (const field of ["blocked", "milestone"]) {
    const rawValue = mappedValue(rawRow, descriptor.headerMap, field);
    if (!isBlank(rawValue) && task[field] === null) {
      issues.push(issueForField("INVALID_BOOLEAN", `El valor de ${field} no es reconocible.`, task.sourceRow, field));
    }
  }
  const normalizedStatus = normalizeHeader(task.status);
  if (
    isBlank(task.actualClose)
    && (task.completionFraction === 1 || ["completo", "completado", "completada", "complete", "completed"].includes(normalizedStatus))
  ) {
    issues.push(createQualityIssue(
      "COMPLETE_WITHOUT_ACTUAL_CLOSE",
      "warning",
      "La tarea figura completa pero no tiene fecha de cierre real; no se atribuye a una fecha histórica.",
      { row: task.sourceRow, affectedMetric: "completed" },
    ));
  }
  for (const [field, columnIndex] of Object.entries(descriptor.headerMap)) {
    const address = xlsx.utils.encode_cell({ r: task.sourceRow - 1, c: columnIndex });
    const cell = worksheet[address];
    if (cell?.f && cell.v === undefined) {
      issues.push(issueForField(
        "FORMULA_WITHOUT_CACHED_VALUE",
        `La fórmula de ${field} no contiene un valor calculado disponible.`,
        task.sourceRow,
        field,
      ));
    }
  }
  return issues;
}

function mappedValue(row, headerMap, field) {
  const columnIndex = headerMap[field];
  return columnIndex === undefined ? null : row[columnIndex];
}

function taskFromRow(row, descriptor, sourceRow) {
  const { headerMap } = descriptor;
  const name = textValue(mappedValue(row, headerMap, "name"));
  if (!name) {
    return null;
  }

  const assignee = textValue(mappedValue(row, headerMap, "assignee"));
  return Object.freeze({
    id: `${descriptor.id}:${sourceRow}`,
    wbs: textValue(mappedValue(row, headerMap, "wbs")),
    name,
    assignee: assignee || "Sin asignar",
    durationDays: numericValue(mappedValue(row, headerMap, "durationDays")),
    plannedStart: mappedValue(row, headerMap, "plannedStart"),
    plannedEnd: mappedValue(row, headerMap, "plannedEnd"),
    baselineEnd: mappedValue(row, headerMap, "baselineEnd"),
    actualClose: mappedValue(row, headerMap, "actualClose"),
    completionFraction: completionValue(mappedValue(row, headerMap, "completionFraction")),
    status: textValue(mappedValue(row, headerMap, "status")),
    comments: textValue(mappedValue(row, headerMap, "comments")),
    riskLevel: textValue(mappedValue(row, headerMap, "riskLevel")),
    blocked: booleanValue(mappedValue(row, headerMap, "blocked")),
    milestone: booleanValue(mappedValue(row, headerMap, "milestone")),
    sourceRow,
  });
}

export function createProjectPlan(
  workbook,
  descriptor,
  { xlsx = globalThis.XLSX, sourceFile = "" } = {},
) {
  const parser = requireXlsx(xlsx);
  const worksheet = workbook?.Sheets?.[descriptor?.id];
  if (!worksheet) {
    throw new WorkbookGatewayError("SHEET_NOT_FOUND", "La hoja seleccionada no existe en el libro.");
  }

  const rows = worksheetRows(worksheet, parser);
  const tasks = [];
  const qualityIssues = [
    ...headerQualityIssues(rows[descriptor.headerRowIndex] ?? [], descriptor.headerRowNumber),
    ...missingRecommendedHeaderIssues(descriptor.headerMap, descriptor.headerRowNumber),
  ];
  for (let rowIndex = descriptor.headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const rawRow = rows[rowIndex] ?? [];
    const task = taskFromRow(rawRow, descriptor, rowIndex + 1);
    if (task) {
      tasks.push(task);
      qualityIssues.push(...validateTaskValues(task, rawRow, descriptor, worksheet, parser));
    }
  }

  return Object.freeze({
    sourceFile,
    sheetId: descriptor.id,
    sheetName: descriptor.name,
    statusDate: descriptor.metadata.statusDate ?? null,
    projectStart: descriptor.metadata.projectStart ?? null,
    projectEnd: descriptor.metadata.projectEnd ?? null,
    date1904: Boolean(workbook?.Workbook?.WBProps?.date1904),
    tasks: Object.freeze(tasks),
    qualityIssues: Object.freeze(qualityIssues),
  });
}

export function parseWorkbookBuffer(arrayBuffer, xlsx = globalThis.XLSX) {
  const parser = requireXlsx(xlsx);
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new WorkbookGatewayError(
      "WORKBOOK_PARSE_FAILED",
      "El fichero no contiene datos de un libro Excel.",
    );
  }
  try {
    const workbook = parser.read(arrayBuffer, {
      type: "array",
      cellDates: true,
      cellFormula: true,
    });
    if (!Array.isArray(workbook.SheetNames) || workbook.SheetNames.length === 0) {
      throw new Error("Workbook contains no worksheets.");
    }
    return workbook;
  } catch (error) {
    throw new WorkbookGatewayError(
      "WORKBOOK_PARSE_FAILED",
      "El fichero no se ha podido interpretar como un libro Excel compatible.",
      { cause: error },
    );
  }
}

export async function loadProjectWorkbook(
  workbookFile,
  {
    fetchImpl = globalThis.fetch,
    xlsx = globalThis.XLSX,
    signal,
  } = {},
) {
  if (typeof fetchImpl !== "function") {
    throw new WorkbookGatewayError("FETCH_UNAVAILABLE", "El navegador no permite leer el libro local.");
  }
  if (!/\.(?:xlsx|xlsm)$/iu.test(workbookFile)) {
    throw new WorkbookGatewayError("WORKBOOK_EXTENSION_UNSUPPORTED", "El libro debe usar .xlsx o .xlsm.");
  }

  const response = await fetchImpl(encodeURIComponent(workbookFile), {
    method: "GET",
    cache: "no-store",
    credentials: "same-origin",
    signal,
  });
  if (!response.ok) {
    if (response.status === 423) {
      throw new WorkbookGatewayError(
        "WORKBOOK_LOCKED",
        "El libro está cambiando mientras se lee. Guárdelo y pulse Recargar libro.",
      );
    }
    throw new WorkbookGatewayError(
      "WORKBOOK_FETCH_FAILED",
      `No se ha podido leer el libro configurado (HTTP ${response.status}).`,
    );
  }

  const workbook = parseWorkbookBuffer(await response.arrayBuffer(), xlsx);
  const sheets = detectGanttSheets(workbook, xlsx);
  if (sheets.length === 0) {
    throw new WorkbookGatewayError(
      "GANTT_HEADERS_MISSING",
      "No se ha encontrado una hoja con todos los encabezados Gantt obligatorios.",
    );
  }
  return Object.freeze({ sourceFile: workbookFile, workbook, sheets });
}
