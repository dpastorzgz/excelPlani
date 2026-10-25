import { expect, test } from "@playwright/test";

import { mockProjectWorkbook } from "./workbook-fixture.js";

test.beforeEach(async ({ page }) => {
  await mockProjectWorkbook(page);
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
