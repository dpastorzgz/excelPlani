import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/dashboard.html");
});

test("uses semantic landmarks and external assets only", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resumen del proyecto" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gantt del proyecto" })).toBeVisible();
  await expect(page.locator("label[for='control-date']")).toHaveText("Fecha de control");

  expect(await page.locator("style").count()).toBe(0);
  expect(await page.locator("[style]").count()).toBe(0);
  expect(await page.locator("[onclick], [onchange], [oninput], [onload]").count()).toBe(0);
  const inlineScripts = await page.locator("script:not([src])").evaluateAll((scripts) =>
    scripts.filter((script) => script.textContent.trim().length > 0).length,
  );
  expect(inlineScripts).toBe(0);

  await expect(page.locator("link[href='dashboard-assets/dashboard.css']")).toHaveCount(1);
  await expect(page.locator("script[src='dashboard-config.js']")).toHaveCount(1);
  await expect(page.locator("script[src='dashboard-assets/vendor/xlsx-0.20.3.min.js']")).toHaveCount(1);
  await expect(page.locator("script[src='dashboard-assets/app.js']")).toHaveCount(1);
});

test("has no serious or critical automated accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter(({ impact }) =>
    impact === "critical" || impact === "serious",
  );
  expect(blockingViolations).toEqual([]);
  expect(results.passes.some(({ id }) => id === "color-contrast")).toBe(true);
});

test("moves keyboard focus through the skip link and primary controls", async ({ page }) => {
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido principal" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  await page.getByLabel("Fecha de control").focus();
  await expect(page.getByLabel("Fecha de control")).toBeFocused();
  await page.getByRole("button", { name: "Copiar imagen para PowerPoint" }).focus();
  await expect(page.getByRole("button", { name: "Copiar imagen para PowerPoint" })).toBeFocused();
});
