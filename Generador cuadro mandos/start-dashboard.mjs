import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  [".xlsm", "application/vnd.ms-excel.sheet.macroEnabled.12"],
]);

function readOption(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function readIntegerOption(name, fallback, minimum, maximum) {
  const raw = readOption(name, String(fallback));
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(`${name} debe ser un numero entre ${minimum} y ${maximum}.`);
  }
  return value;
}

const root = path.resolve(readOption("--root", DEFAULT_ROOT));
const port = readIntegerOption("--port", 0, 0, 65535);
const idleTimeoutSeconds = readIntegerOption("--idle-timeout-seconds", 1800, 1, 86400);
const maxRequests = readIntegerOption("--max-requests", 0, 0, 10000);
const noBrowser = process.argv.includes("--no-browser");
const rootPrefix = `${root}${path.sep}`.toLocaleLowerCase("en-US");

let requestCount = 0;
let lastActivity = Date.now();

async function readStableFile(filePath) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const before = await stat(filePath);
    const content = await readFile(filePath);
    const after = await stat(filePath);
    if (before.size === after.size && before.mtimeMs === after.mtimeMs) return content;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const error = new Error("El archivo ha cambiado durante la lectura.");
  error.code = "EBUSY";
  throw error;
}

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, "http://127.0.0.1");
  const decoded = decodeURIComponent(url.pathname);
  if (decoded.includes("\0") || decoded.includes("\\")) throw new Error("INVALID_PATH");
  const relative = decoded.replace(/^\/+/, "") || "dashboard.html";
  const candidate = path.resolve(root, relative);
  if (!candidate.toLocaleLowerCase("en-US").startsWith(rootPrefix)) throw new Error("FORBIDDEN");
  return candidate;
}

function send(response, method, statusCode, reason, body, contentType = "text/plain; charset=utf-8") {
  const bytes = Buffer.isBuffer(body) ? body : Buffer.from(body, "utf8");
  response.writeHead(statusCode, reason, {
    "Content-Type": contentType,
    "Content-Length": bytes.length,
    "Cache-Control": "no-store",
    "Content-Security-Policy": "default-src 'self'; img-src 'self' blob: data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(method === "HEAD" ? undefined : bytes);
}

const server = createServer(async (request, response) => {
  requestCount += 1;
  lastActivity = Date.now();
  const method = request.method?.toUpperCase() ?? "";
  if (method !== "GET" && method !== "HEAD") {
    send(response, method, 405, "Method Not Allowed", "Method Not Allowed");
    return;
  }

  let filePath;
  try {
    filePath = resolveRequestPath(request.url ?? "/");
  } catch (error) {
    const forbidden = error.message === "FORBIDDEN";
    send(response, method, forbidden ? 403 : 400, forbidden ? "Forbidden" : "Bad Request", forbidden ? "Forbidden" : "Bad Request");
    return;
  }

  try {
    const body = await readStableFile(filePath);
    send(response, method, 200, "OK", body, CONTENT_TYPES.get(path.extname(filePath).toLowerCase()) ?? "application/octet-stream");
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      send(response, method, 404, "Not Found", "Not Found");
    } else if (["EBUSY", "EPERM", "EACCES"].includes(error.code)) {
      send(response, method, 423, "Locked", "Locked");
    } else {
      console.error(`[ERROR] ${error.message}`);
      send(response, method, 500, "Internal Server Error", "Internal Server Error");
    }
  }
});

const idleTimer = setInterval(() => {
  if (maxRequests > 0 && requestCount >= maxRequests) {
    console.log("DASHBOARD_SERVER_STOP=max-requests");
    server.close();
  } else if (Date.now() - lastActivity >= idleTimeoutSeconds * 1000) {
    console.log("DASHBOARD_SERVER_STOP=idle-timeout");
    server.close();
  }
}, 250);
idleTimer.unref();

server.on("close", () => clearInterval(idleTimer));
server.on("error", (error) => {
  console.error(`[ERROR] No se pudo iniciar el servidor: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  const address = server.address();
  const dashboardUrl = `http://127.0.0.1:${address.port}/dashboard.html`;
  console.log(`DASHBOARD_URL=${dashboardUrl}`);
  console.log("Mantenga esta ventana abierta mientras utiliza el cuadro de mando.");

  if (!noBrowser && process.platform === "win32") {
    const opener = spawn("rundll32.exe", ["url.dll,FileProtocolHandler", dashboardUrl], {
      detached: true,
      stdio: "ignore",
    });
    opener.unref();
  }
});
