const EXPORT_WIDTH = 1920;
const EXPORT_HEIGHT = 1080;

export function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function metricCard(label, value, x, accent) {
  return `<g transform="translate(${x} 190)">
    <rect width="420" height="170" rx="18" fill="#ffffff" stroke="#bcccdc"/>
    <rect width="420" height="10" rx="5" fill="${accent}"/>
    <text x="32" y="58" class="label">${escapeXml(label)}</text>
    <text x="32" y="132" class="value">${escapeXml(value)}</text>
  </g>`;
}

function taskRows(tasks) {
  return tasks.slice(0, 12).map((task, index) => {
    const y = 505 + index * 41;
    const delayed = task.classification?.delayed;
    const marker = task.milestone ? "◆" : delayed ? "!" : "—";
    const color = delayed ? "#a61b1b" : task.milestone ? "#8a5a00" : "#147d70";
    return `<g transform="translate(70 ${y})">
      <text x="0" y="25" fill="${color}" font-weight="700">${marker}</text>
      <text x="34" y="25" class="task">${escapeXml(task.name)}</text>
      <text x="890" y="25" class="small">${escapeXml(task.assignee || "Sin asignar")}</text>
      <text x="1260" y="25" class="small">${escapeXml(task.plannedStart ?? "—")} – ${escapeXml(task.plannedEnd ?? "—")}</text>
      <line x1="0" y1="39" x2="1720" y2="39" stroke="#d9e2ec"/>
    </g>`;
  }).join("");
}

export function composeDashboardSvg(snapshot) {
  const metrics = snapshot.metrics ?? {};
  const filters = snapshot.filters ?? {};
  const ratio = metrics.completionRatio === null || metrics.completionRatio === undefined
    ? "—"
    : `${Math.round(metrics.completionRatio * 100)} %`;
  const context = [
    `Fecha de control: ${filters.controlDate ?? "sin definir"}`,
    filters.assignees?.length ? `Asignado: ${filters.assignees.join(", ")}` : "Todos los responsables",
    filters.dateFrom || filters.dateTo ? `Intervalo: ${filters.dateFrom ?? "…"} – ${filters.dateTo ?? "…"}` : "Todo el intervalo",
  ].join(" · ");
  const tasks = snapshot.derivedTasks ?? snapshot.tasks ?? [];
  const overflow = tasks.length > 12
    ? `<text x="70" y="1030" class="small">+ ${tasks.length - 12} tareas adicionales en el cuadro interactivo</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${EXPORT_WIDTH}" height="${EXPORT_HEIGHT}" viewBox="0 0 ${EXPORT_WIDTH} ${EXPORT_HEIGHT}" role="img" aria-label="Cuadro de mando del proyecto">
  <style>
    text { font-family: Arial, sans-serif; fill: #102a43; }
    .eyebrow { font-size: 22px; font-weight: 700; letter-spacing: 2px; fill: #486581; }
    .title { font-size: 56px; font-weight: 800; }
    .label { font-size: 24px; font-weight: 700; fill: #486581; }
    .value { font-size: 62px; font-weight: 800; }
    .task { font-size: 22px; font-weight: 700; }
    .small { font-size: 18px; fill: #486581; }
  </style>
  <rect width="1920" height="1080" fill="#f4f7fa"/>
  <rect width="1920" height="16" fill="#147d70"/>
  <text x="70" y="70" class="eyebrow">SEGUIMIENTO DEL PROYECTO</text>
  <text x="70" y="140" class="title">${escapeXml(snapshot.projectName ?? snapshot.sheetName ?? "Cuadro de mando")}</text>
  <text x="70" y="175" class="small">${escapeXml(context)}</text>
  ${metricCard("Tareas del proyecto", metrics.total ?? 0, 70, "#486581")}
  ${metricCard("Completadas a fecha", metrics.completed ?? 0, 520, "#147d70")}
  ${metricCard("Porcentaje completado", ratio, 970, "#1769aa")}
  ${metricCard("Retrasadas a fecha", metrics.delayed ?? 0, 1420, "#a61b1b")}
  <text x="70" y="440" class="label">Planificación visible</text>
  <text x="994" y="440" class="small">Responsable</text>
  <text x="1364" y="440" class="small">Intervalo</text>
  ${taskRows(tasks)}
  ${overflow}
</svg>`;
}

export function rasterizeSvgToPng(svg, {
  document = globalThis.document,
  ImageCtor = globalThis.Image,
  URLImpl = globalThis.URL,
  BlobCtor = globalThis.Blob,
} = {}) {
  return new Promise((resolve, reject) => {
    const svgBlob = new BlobCtor([svg], { type: "image/svg+xml;charset=utf-8" });
    const sourceUrl = URLImpl.createObjectURL(svgBlob);
    const image = new ImageCtor();
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = EXPORT_WIDTH;
        canvas.height = EXPORT_HEIGHT;
        const context = canvas.getContext("2d");
        context.fillStyle = "#f4f7fa";
        context.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
        context.drawImage(image, 0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
        canvas.toBlob((blob) => {
          URLImpl.revokeObjectURL(sourceUrl);
          if (blob) resolve(blob);
          else reject(new Error("No se pudo generar el PNG."));
        }, "image/png");
      } catch (error) {
        URLImpl.revokeObjectURL(sourceUrl);
        reject(error);
      }
    };
    image.onerror = () => {
      URLImpl.revokeObjectURL(sourceUrl);
      reject(new Error("No se pudo rasterizar la vista de presentación."));
    };
    image.src = sourceUrl;
  });
}

function downloadBlob(blob, filename, { document, URLImpl }) {
  const url = URLImpl.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URLImpl.revokeObjectURL(url);
}

export async function copyPngOrDownload(blob, {
  filename,
  navigator = globalThis.navigator,
  ClipboardItemCtor = globalThis.ClipboardItem,
  document = globalThis.document,
  URLImpl = globalThis.URL,
} = {}) {
  if (navigator?.clipboard?.write && ClipboardItemCtor) {
    try {
      await navigator.clipboard.write([new ClipboardItemCtor({ "image/png": blob })]);
      return Object.freeze({ method: "clipboard", message: "Imagen copiada al portapapeles." });
    } catch {
      // Una denegación de permisos se resuelve mediante descarga explícita.
    }
  }
  downloadBlob(blob, filename, { document, URLImpl });
  return Object.freeze({ method: "download", message: `Imagen descargada como ${filename}.` });
}

export async function exportDashboard(snapshot, options = {}) {
  const svg = composeDashboardSvg(snapshot);
  const rasterize = options.rasterize ?? rasterizeSvgToPng;
  const blob = await rasterize(svg, options);
  const date = snapshot.filters?.controlDate ?? "sin-fecha";
  return copyPngOrDownload(blob, { ...options, filename: `dashboard-${date}.png` });
}
