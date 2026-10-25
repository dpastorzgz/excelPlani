import { expect, test } from "@playwright/test";
import * as XLSX from "xlsx";

function workbookBytes() {
  const rows = [
    ["Planificación E2E"],
    ["Fecha de estado", "2026-05-15"],
    [],
    ["EDT", "Tarea", "Asignado", "Duración", "Inicio", "Fin", "% completado", "Estado", "Comentarios", "Fin línea base", "Fecha cierre real", "Nivel de riesgo", "Bloqueada", "Hito"],
    ["1.1", "Definir alcance", "Ana", 5, "2026-04-27", "2026-05-01", 100, "Completo", "Validado", "2026-05-01", "2026-05-01", "Bajo", "No", "No"],
    ["1.2", "Aprobar diseño", "Bruno", 1, "2026-05-04", "2026-05-04", 0, "Pendiente", "", "2026-05-04", null, "Medio", "Sí", "Sí"],
    ["1.3", "Publicar", "Ana", 1, "2026-05-20", "2026-05-20", 0, "Pendiente", "", "2026-05-20", null, "Bajo", "No", "Sí"],
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), "Proyecto E2E");
  return Buffer.from(XLSX.write(workbook, { type: "array", bookType: "xlsx" }));
}

test.beforeEach(async ({ page }) => {
  const body = workbookBytes();
  await page.route("**/*.xlsm", (route) => route.fulfill({
    status: 200,
    contentType: "application/vnd.ms-excel.sheet.macroEnabled.12",
    body,
  }));
  await page.goto("/dashboard.html");
  await expect(page.locator("#source-status")).toContainText("Datos preparados localmente");
});

test("loads a project and keeps KPIs, filters and Gantt on the same control date", async ({ page }) => {
  await expect(page.locator("#project-sheet")).toHaveValue("Proyecto E2E");
  await expect(page.locator("#control-date")).toHaveValue("2026-05-15");
  await expect(page.locator("#kpi-total")).toHaveText("3");
  await expect(page.locator("#kpi-completed")).toHaveText("1");
  await expect(page.locator("#kpi-completion-ratio")).toHaveText("33 %");
  await expect(page.locator("#kpi-delayed")).toHaveText("1");
  await expect(page.locator(".gantt-task-button")).toHaveCount(3);
  await expect(page.locator(".gantt-control-line")).toHaveCount(1);

  await page.locator("#assignee-filter").selectOption("Ana");
  await expect(page.locator("#kpi-total")).toHaveText("2");
  await expect(page.locator(".gantt-task-button")).toHaveCount(2);

  await page.locator("#completion-filter").selectOption("completed");
  await expect(page.locator("#kpi-total")).toHaveText("1");
  await expect(page.locator(".gantt-task-button")).toHaveText(["Definir alcance"]);
});

test("clears resource and planned-date filters without resetting the other controls", async ({ page }) => {
  await page.locator("#assignee-filter").selectOption("Ana");
  await expect(page.locator("#kpi-total")).toHaveText("2");
  await page.locator("#clear-assignee-filter").click();
  await expect(page.locator("#kpi-total")).toHaveText("3");
  await expect(page.locator("#assignee-filter")).toHaveValues([]);

  await page.locator("#range-start").fill("2026-05-19");
  await page.locator("#range-end").fill("2026-05-21");
  await expect(page.locator("#kpi-total")).toHaveText("1");
  await page.locator("#clear-date-range").click();
  await expect(page.locator("#kpi-total")).toHaveText("3");
  await expect(page.locator("#range-start")).toHaveValue("");
  await expect(page.locator("#range-end")).toHaveValue("");
});

test("supports keyboard task detail and restores focus", async ({ page }) => {
  const firstTask = page.locator(".gantt-task-button").first();
  await firstTask.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#task-details")).toBeVisible();
  await expect(page.locator("#task-details-title")).toHaveText("Definir alcance");
  await page.locator("#close-task-details").click();
  await expect(firstTask).toBeFocused();
});

test("falls back to downloading the same 1920x1080 PNG when clipboard is denied", async ({ page }) => {
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write: async () => { throw new Error("denied"); } },
    });
  });
  const downloadPromise = page.waitForEvent("download");
  await page.locator("#copy-dashboard-button").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("dashboard-2026-05-15.png");
  await expect(page.locator("#source-status")).toContainText("Imagen descargada");
});
