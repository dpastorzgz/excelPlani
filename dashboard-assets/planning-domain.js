/**
 * Reglas puras del cuadro de mando. Todas las fechas cruzan este módulo como
 * valores date-only (`YYYY-MM-DD`); nunca se comparan instantes ni zonas horarias.
 */

const DAY_MS = 86_400_000;

function pad2(value) {
  return String(value).padStart(2, "0");
}
function formatParts(year, month, day) {
  return `${String(year).padStart(4, "0")}-${pad2(month)}-${pad2(day)}`;
}

function validParts(year, month, day) {
  if (![year, month, day].every(Number.isInteger) || month < 1 || month > 12 || day < 1) {
    return false;
  }
  const check = new Date(Date.UTC(year, month - 1, day));
  return check.getUTCFullYear() === year
    && check.getUTCMonth() === month - 1
    && check.getUTCDate() === day;
}

export function normalizeDateOnly(value, { date1904 = false } = {}) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      return null;
    }
    return formatParts(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const wholeDays = Math.floor(value);
    const adjustedDays = date1904 ? wholeDays : wholeDays - (wholeDays >= 60 ? 1 : 0);
    const epoch = date1904
      ? Date.UTC(1904, 0, 1)
      : Date.UTC(1899, 11, 31);
    const date = new Date(epoch + adjustedDays * DAY_MS);
    return formatParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(String(value).trim());
  if (!match) {
    return null;
  }
  const [, yearText, monthText, dayText] = match;
  const parts = [Number(yearText), Number(monthText), Number(dayText)];
  return validParts(...parts) ? formatParts(...parts) : null;
}

export function getTargetDate(task, options = {}) {
  return normalizeDateOnly(task.baselineEnd, options)
    ?? normalizeDateOnly(task.plannedEnd, options);
}

function looksCurrentlyComplete(task) {
  const status = String(task.status ?? "").trim().toLocaleLowerCase("es");
  return task.completionFraction === 1
    || ["completada", "completado", "complete", "completed", "finalizada", "finalizado"]
      .includes(status);
}

function ordinal(dateOnly) {
  const [year, month, day] = dateOnly.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function computeExpectedProgress(plannedStart, plannedEnd, control) {
  const startOrd = ordinal(plannedStart);
  const endOrd = ordinal(plannedEnd);
  const ctrlOrd = ordinal(control);
  if (endOrd <= startOrd) return ctrlOrd >= endOrd ? 1 : 0;
  return Math.min(1, Math.max(0, (ctrlOrd - startOrd) / (endOrd - startOrd)));
}

export function classifyTaskAtDate(task, controlDate, options = {}) {
  const control = normalizeDateOnly(controlDate, options);
  const target = getTargetDate(task, options);
  const actualClose = normalizeDateOnly(task.actualClose, options);
  const plannedStart = normalizeDateOnly(task.plannedStart, options);
  const plannedEnd = normalizeDateOnly(task.plannedEnd, options);
  const inconsistencies = [];

  if (!control || !target || !plannedStart || !plannedEnd) {
    return Object.freeze({
      valid: false,
      completed: false,
      delayed: false,
      completedOnTime: false,
      completedLate: false,
      overdueWhileOpen: false,
      behindSchedule: false,
      completionKnown: false,
      delayKnown: false,
      target,
      actualClose,
      inconsistencies: Object.freeze(inconsistencies),
    });
  }
  if (looksCurrentlyComplete(task) && !actualClose) {
    inconsistencies.push("COMPLETE_WITHOUT_ACTUAL_CLOSE");
  }

  const completed = Boolean(actualClose && actualClose <= control);
  const completionUnknown = looksCurrentlyComplete(task) && !actualClose;
  const overdueWhileOpen = target < control && !completed && !completionUnknown;
  const completedOnTime = completed && actualClose <= target;
  const completedLate = completed && actualClose > target;
  const expectedProgress = completionUnknown || completed
    ? 0
    : computeExpectedProgress(plannedStart, plannedEnd, control);
  const behindSchedule = !completed && !completionUnknown
    && Number(task.completionFraction) < expectedProgress;

  return Object.freeze({
    valid: true,
    completed,
    delayed: overdueWhileOpen,
    completedOnTime,
    completedLate,
    overdueWhileOpen,
    behindSchedule,
    completionKnown: !completionUnknown,
    delayKnown: !completionUnknown,
    target,
    actualClose,
    inconsistencies: Object.freeze(inconsistencies),
  });
}
function taskInterval(task, options) {
  const start = normalizeDateOnly(task.plannedStart, options);
  const end = normalizeDateOnly(task.plannedEnd, options);
  if (task.milestone) {
    const point = start ?? end;
    return point ? [point, point] : null;
  }
  return start && end ? [start, end] : null;
}

function overlapsDateRange(task, dateFrom, dateTo, options) {
  const interval = taskInterval(task, options);
  if (!interval) {
    return false;
  }
  const from = normalizeDateOnly(dateFrom, options);
  const to = normalizeDateOnly(dateTo, options);
  return (!from || interval[1] >= from) && (!to || interval[0] <= to);
}

export function deriveDashboard(tasks, filters, { date1904 = false, projectStart = null, projectEnd = null } = {}) {
  const options = { date1904 };
  const controlDate = normalizeDateOnly(filters.controlDate, options);
  const selectedAssignees = new Set(filters.assignees ?? []);
  const completion = filters.completion ?? "all";
  const derivedTasks = [];
  let excluded = 0;

  for (const task of tasks ?? []) {
    const classification = classifyTaskAtDate(task, controlDate, options);
    if (!classification.valid) {
      excluded += 1;
      continue;
    }
    if (selectedAssignees.size > 0 && !selectedAssignees.has(task.assignee || "Sin asignar")) {
      continue;
    }
    if (!overlapsDateRange(task, filters.dateFrom, filters.dateTo, options)) {
      continue;
    }
    if (completion === "completed" && !classification.completed) {
      continue;
    }
    if (completion === "open" && classification.completed) {
      continue;
    }
    if (completion === "delayed" && !classification.delayed) {
      continue;
    }
    derivedTasks.push(Object.freeze({ ...task, classification }));
  }

  const total = derivedTasks.length;
  const completed = derivedTasks.filter((task) => task.classification.completed).length;
  const delayed = derivedTasks.filter((task) => task.classification.delayed).length;
  const completedOnTime = derivedTasks.filter((task) => task.classification.completedOnTime).length;
  const completedLate = derivedTasks.filter((task) => task.classification.completedLate).length;
  const behindSchedule = derivedTasks.filter((task) => task.classification.behindSchedule).length;
  const tasksInProgress = total - completed;

  const ps = normalizeDateOnly(projectStart);
  const pe = normalizeDateOnly(projectEnd);
  const ctrl = normalizeDateOnly(filters.controlDate);
  let timeElapsed = null;
  let timeRemaining = null;
  let daysRemaining = null;
  if (ps && pe && ctrl) {
    const sOrd = ordinal(ps);
    const eOrd = ordinal(pe);
    const cOrd = ordinal(ctrl);
    const duration = eOrd - sOrd;
    if (duration > 0) {
      timeElapsed = Math.round((cOrd - sOrd) / duration * 100);
      timeRemaining = 100 - timeElapsed;
    }
    daysRemaining = eOrd - cOrd;
  }

  return Object.freeze({
    tasks: Object.freeze(derivedTasks),
    metrics: Object.freeze({
      total,
      completed,
      completionRatio: total === 0 ? null : completed / total,
      delayed,
      completedOnTime,
      completedLate,
      behindSchedule,
      tasksInProgress,
      timeElapsed,
      timeRemaining,
      daysRemaining,
      excluded,
    }),
  });
}
