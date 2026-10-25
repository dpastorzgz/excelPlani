import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputRoot = path.join(repositoryRoot, "dist", "html-project-dashboard");

const allowedAssets = [
  "manifest.sha256",
  "dashboard.html",
  "dashboard-config.js",
  "start-dashboard.cmd",
  "start-dashboard.mjs",
  "start-dashboard.ps1",
  "dashboard-assets/dashboard.css",
  "dashboard-assets/app.js",
  "dashboard-assets/dashboard-state.js",
  "dashboard-assets/dashboard-view.js",
  "dashboard-assets/planning-domain.js",
  "dashboard-assets/presentation-exporter.js",
  "dashboard-assets/workbook-gateway.js",
  "dashboard-assets/THIRD_PARTY_NOTICES.txt",
  "dashboard-assets/vendor/LICENSE.sheetjs.txt",
  "dashboard-assets/vendor/xlsx-0.20.3.min.js",
];

const forbiddenWorkbookExtension = /\.(?:xls|xlsx|xlsm|xlsb)$/iu;

async function isFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(path.join(directory, entry.name), relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

async function validateOutput() {
  if (!await isFile(path.join(outputRoot, "dashboard-config.js"))) {
    throw new Error("The release artifact is missing dashboard-config.js.");
  }

  const outputFiles = await listFiles(outputRoot);
  const unexpectedFiles = outputFiles.filter((file) => !allowedAssets.includes(file.replaceAll("\\", "/")));
  const copiedWorkbooks = outputFiles.filter((file) => forbiddenWorkbookExtension.test(file));

  if (unexpectedFiles.length > 0) {
    throw new Error(`Unexpected release assets: ${unexpectedFiles.join(", ")}`);
  }
  if (copiedWorkbooks.length > 0) {
    throw new Error(`Workbook files must not be copied to dist: ${copiedWorkbooks.join(", ")}`);
  }

  return outputFiles.map((file) => file.replaceAll("\\", "/")).sort();
}

async function build() {
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  for (const relativePath of allowedAssets) {
    if (relativePath === "manifest.sha256") {
      continue;
    }
    const sourcePath = path.join(repositoryRoot, relativePath);
    if (!await isFile(sourcePath)) {
      continue;
    }
    if (forbiddenWorkbookExtension.test(relativePath)) {
      throw new Error(`Workbook is not an allowed build asset: ${relativePath}`);
    }

    const destinationPath = path.join(outputRoot, relativePath);
    await mkdir(path.dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
  }

  const releaseFiles = (await listFiles(outputRoot))
    .map((file) => file.replaceAll("\\", "/"))
    .sort();
  const manifestLines = [];
  for (const file of releaseFiles) {
    const digest = createHash("sha256")
      .update(await readFile(path.join(outputRoot, file)))
      .digest("hex");
    manifestLines.push(`${digest}  ${file}`);
  }
  await writeFile(path.join(outputRoot, "manifest.sha256"), `${manifestLines.join("\n")}\n`, "utf8");

  return validateOutput();
}

const validateOnly = process.argv.includes("--validate-only");
const files = validateOnly ? await validateOutput() : await build();
console.log(`${validateOnly ? "Validated" : "Built"} ${files.length} local assets in ${path.relative(repositoryRoot, outputRoot)}.`);
for (const file of files) {
  console.log(`- ${file}`);
}
