import { describe, expect, it } from "vitest";

import {
  DASHBOARD_CONFIG,
  validateWorkbookFileName,
  WORKBOOK_FILE,
} from "../../dashboard-config.js";

describe("dashboard workbook configuration", () => {
  it("exposes the configured workbook from one immutable object", () => {
    expect(WORKBOOK_FILE).toMatch(/\.(?:xlsx|xlsm)$/iu);
    expect(DASHBOARD_CONFIG).toEqual({ workbookFile: WORKBOOK_FILE });
    expect(Object.isFrozen(DASHBOARD_CONFIG)).toBe(true);
  });

  it.each([
    "planning.xlsx",
    "planificación proyecto.xlsm",
    "PROJECT.XLSX",
  ])("accepts safe workbook filename %s", (fileName) => {
    expect(validateWorkbookFileName(fileName)).toBe(fileName);
  });

  it.each([
    "",
    " planning.xlsx",
    "planning.xlsx ",
    "../planning.xlsx",
    "folder/planning.xlsx",
    "folder\\planning.xlsx",
    "C:\\planning.xlsx",
    "https://example.test/planning.xlsx",
    "planning.xls",
    "planning.csv",
  ])("rejects unsafe or unsupported value %j", (fileName) => {
    expect(() => validateWorkbookFileName(fileName)).toThrow();
  });
});
