import path from "node:path";

import { expect, test } from "@playwright/test";

const evidenceDirectory = path.resolve(
  "work-item/html-project-dashboard/_evidence/phase-05/TASK-006-css-layout",
);

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/dashboard.html");
});

test("keeps the desktop dashboard aligned and captures visual evidence", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(".kpi-grid")).toHaveCSS("display", "grid");

  const kpiBoxes = await page.locator(".kpi-card").evaluateAll((cards) =>
    cards.map((card) => card.getBoundingClientRect().toJSON()),
  );
  expect(kpiBoxes).toHaveLength(4);
  expect(new Set(kpiBoxes.map(({ y }) => Math.round(y))).size).toBe(1);

  const gantt = page.locator(".gantt-shell");
  await expect(gantt).toBeVisible();
  expect((await gantt.boundingBox()).width).toBeGreaterThan(700);

  const filterPanelBox = await page.locator(".filter-panel").boundingBox();
  const rangeEndBox = await page.getByLabel("Hasta").boundingBox();
  expect(rangeEndBox.x + rangeEndBox.width).toBeLessThanOrEqual(
    filterPanelBox.x + filterPanelBox.width,
  );
  await page.screenshot({ path: path.join(evidenceDirectory, "dashboard-wide.png"), fullPage: true });
});

test("keeps every task row aligned with its Gantt mark at every scale", async ({ page }) => {
  const taskCount = Number(await page.locator("#kpi-total").textContent());
  await expect(page.locator("#fit-tasks-button")).toHaveCount(0);
  await expect(page.locator(".gantt-task-button")).toHaveCount(taskCount);

  for (const scale of ["day", "week", "month"]) {
    const timeline = page.locator("#gantt-scroll-region");
    await timeline.evaluate((element) => { element.scrollLeft = 400; });
    await page.locator(`[data-scale="${scale}"]`).click();
    expect(await timeline.evaluate((element) => element.scrollLeft)).toBe(0);

    const taskCenters = await page.locator(".gantt-task-button").evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return box.top + box.height / 2;
      }),
    );
    const markCenters = await page.locator(".gantt-bar, .gantt-milestone").evaluateAll((marks) =>
      marks.map((mark) => {
        const box = mark.getBoundingClientRect();
        return box.top + box.height / 2;
      }),
    );
    expect(markCenters).toHaveLength(taskCenters.length);
    taskCenters.forEach((center, index) => expect(Math.abs(center - markCenters[index])).toBeLessThan(1));
  }

  const listDimensions = await page.locator("#gantt-task-list").evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(listDimensions.scrollHeight).toBe(listDimensions.clientHeight);
});

test("highlights the complete row and uses only the scrolling SVG grid", async ({ page }) => {
  const firstTask = page.locator(".gantt-task-button").first();
  const firstItem = page.locator(".gantt-task-item").first();
  const firstRow = page.locator(".gantt-row").first();

  await firstTask.hover();
  await expect(firstItem).toHaveClass(/is-highlighted/u);
  await expect(firstRow).toHaveClass(/is-highlighted/u);

  const backgroundImage = await page.locator("#gantt-scroll-region").evaluate((element) =>
    getComputedStyle(element).backgroundImage,
  );
  expect(backgroundImage).toBe("none");
});

test("shows Spanish time headers and a dashed red control date", async ({ page }) => {
  const lineStyle = await page.locator(".gantt-control-line").evaluate((element) => {
    const style = getComputedStyle(element);
    return { stroke: style.stroke, dash: style.strokeDasharray };
  });
  expect(lineStyle.stroke).toBe("rgb(166, 27, 27)");
  expect(lineStyle.dash).not.toBe("none");
  await expect(page.locator(".gantt-year-label").first()).toHaveText(/^\d{4}$/u);

  await page.locator('[data-scale="day"]').click();
  await expect(page.locator(".gantt-tick").first()).toHaveText(/^\d{2}\/\d{2}$/u);
  await page.locator('[data-scale="week"]').click();
  await expect(page.locator(".gantt-tick").first()).toHaveText(/^\d{2}\/\d{2}$/u);
  await page.locator('[data-scale="month"]').click();
  await expect(page.locator(".gantt-tick").first()).toHaveText(
    /^(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)$/u,
  );

  const fills = await page.locator("#gantt-chart").evaluate((chart) => ({
    year: getComputedStyle(chart.querySelector(".gantt-year-band")).fill,
    period: getComputedStyle(chart.querySelector(".gantt-period-cell")).fill,
  }));
  expect(fills.year).toBe("rgb(63, 79, 95)");
  expect(fills.period).toBe("rgb(237, 241, 244)");
});

test("remains usable at a narrow viewport and 200 percent text scale", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });

  await expect(page.getByRole("heading", { name: "Resumen del proyecto" })).toBeVisible();
  await expect(page.getByLabel("Fecha de control")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar imagen para PowerPoint" })).toBeVisible();
  await expect(page.locator("#gantt-scroll-region")).toBeVisible();
  expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(660);
  await page.screenshot({ path: path.join(evidenceDirectory, "dashboard-zoom-200.png"), fullPage: true });
});

test("uses reduced motion and visible high-contrast focus", async ({ page }) => {
  const loadingIndicator = page.locator(".loading-indicator");
  const reducedAnimationDuration = await loadingIndicator.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration),
  );
  expect(reducedAnimationDuration).toBeLessThanOrEqual(0.00001);

  const controlDate = page.getByLabel("Fecha de control");
  await controlDate.focus();
  const outline = await controlDate.evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor };
  });
  expect(outline.style).not.toBe("none");
  expect(Number.parseFloat(outline.width)).toBeGreaterThanOrEqual(3);
  expect(outline.color).not.toBe("rgba(0, 0, 0, 0)");
});
