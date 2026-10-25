import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { DASHBOARD_CONFIG } from "../dashboard-config.js";

const repositoryRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputRoot = path.join(repositoryRoot, "dist", "html-project-dashboard");
const workbookPath = path.join(repositoryRoot, DASHBOARD_CONFIG.workbookFile);
const requiredAssets = [
  "dashboard.html",
  "dashboard-config.js",
  "start-dashboard.cmd",
  "start-dashboard.mjs",
  "start-dashboard.ps1",
  "dashboard-assets/app.js",
  "dashboard-assets/dashboard-state.js",
  "dashboard-assets/dashboard-view.js",
  "dashboard-assets/planning-domain.js",
  "dashboard-assets/presentation-exporter.js",
  "dashboard-assets/workbook-gateway.js",
  "dashboard-assets/dashboard.css",
  "dashboard-assets/vendor/xlsx-0.20.3.min.js",
  "dashboard-assets/vendor/LICENSE.sheetjs.txt",
  "dashboard-assets/THIRD_PARTY_NOTICES.txt",
  "manifest.sha256",
];

async function listFiles(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path.join(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function fail(message) {
  throw new Error(`Release validation failed: ${message}`);
}

const workbookBefore = await stat(workbookPath);
const workbookBytes = await readFile(workbookPath);
const workbookHashBefore = digest(workbookBytes);

const files = await listFiles(outputRoot);
for (const required of requiredAssets) {
  if (!files.includes(required)) fail(`missing ${required}`);
}
if (files.some((file) => /\.(?:xls|xlsx|xlsm|xlsb)$/iu.test(file))) fail("a workbook was copied to dist");

const manifest = await readFile(path.join(outputRoot, "manifest.sha256"), "utf8");
const manifestEntries = new Map(manifest.trim().split(/\r?\n/u).map((line) => {
  const match = /^([a-f0-9]{64}) {2}(.+)$/u.exec(line);
  if (!match) fail(`invalid manifest line: ${line}`);
  return [match[2], match[1]];
}));
for (const file of files.filter((file) => file !== "manifest.sha256")) {
  const actual = digest(await readFile(path.join(outputRoot, file)));
  if (manifestEntries.get(file) !== actual) fail(`checksum mismatch for ${file}`);
}

const executableFiles = files.filter((file) => (
  /\.(?:html|js|css|ps1|cmd)$/iu.test(file) && !file.includes("/vendor/")
));
const publicRuntimeReference = /(?:src|href|url\(|fetch\()[^\n]*(?:https?:)?\/\//iu;
const forbiddenDataSink = /\b(?:localStorage|sessionStorage|indexedDB|sendBeacon|google-analytics|googletagmanager)\b/iu;
for (const file of executableFiles) {
  const source = await readFile(path.join(outputRoot, file), "utf8");
  if (publicRuntimeReference.test(source)) fail(`public runtime URL in ${file}`);
  if (forbiddenDataSink.test(source)) fail(`persistence or telemetry API in ${file}`);
}

const html = await readFile(path.join(outputRoot, "dashboard.html"), "utf8");
if (/<style(?:\s|>)/iu.test(html) || /<script(?![^>]*\bsrc=)[^>]*>\s*\S/iu.test(html)) {
  fail("dashboard.html contains inline CSS or JavaScript");
}

const configSource = await readFile(path.join(repositoryRoot, "dashboard-config.js"), "utf8");
if ((configSource.match(/export const WORKBOOK_FILE\s*=/gu) ?? []).length !== 1) {
  fail("WORKBOOK_FILE is not defined in exactly one authoritative location");
}

const workbookAfter = await stat(workbookPath);
if (workbookAfter.mtimeMs !== workbookBefore.mtimeMs || digest(await readFile(workbookPath)) !== workbookHashBefore) {
  fail("the source workbook changed during release validation");
}

console.log(`PASS release: ${files.length} local assets, manifest verified, workbook unchanged.`);
