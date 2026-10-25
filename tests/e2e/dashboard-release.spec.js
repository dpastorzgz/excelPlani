import { expect, test } from "@playwright/test";

import { WORKBOOK_FILE } from "../../dashboard-config.js";

test("uses only loopback resources and enforces the release CSP", async ({ page }) => {
  const requestedHosts = new Set();
  page.on("request", (request) => requestedHosts.add(new URL(request.url()).hostname));
  const response = await page.goto("/dashboard.html");
  await expect(page.locator("#source-status")).not.toContainText("Cargando");
  await expect(page.locator("#global-error")).toBeHidden();
  const selectedSheet = await page.locator("#project-sheet").inputValue();
  const firstSheet = await page.locator("#project-sheet option").first().getAttribute("value");
  expect(selectedSheet).toBe(firstSheet);
  await expect(page.locator("#source-file-name")).toHaveText(WORKBOOK_FILE);
  await expect(page.locator("#control-date")).toHaveValue(/^\d{4}-\d{2}-\d{2}$/u);
  expect(Number(await page.locator("#kpi-total").textContent())).toBeGreaterThan(0);
  expect([...requestedHosts]).toEqual(["127.0.0.1"]);
  const csp = response.headers()["content-security-policy"];
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("connect-src 'self'");
  expect(csp).toContain("object-src 'none'");
});
