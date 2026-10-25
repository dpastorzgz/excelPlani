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

export async function mockProjectWorkbook(page) {
  const body = workbookBytes();
  await page.route("**/*.xlsm", (route) => route.fulfill({
    status: 200,
    contentType: "application/vnd.ms-excel.sheet.macroEnabled.12",
    body,
  }));
}
