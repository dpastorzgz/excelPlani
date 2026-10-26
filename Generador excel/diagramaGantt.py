from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import textwrap
from typing import Iterable

from openpyxl import Workbook, load_workbook
from openpyxl.cell import MergedCell
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation


TITLE_FONT = Font(size=16, bold=True, color="1F1F1F")
HEADER_FILL = PatternFill("solid", fgColor="1F4E78")
HEADER_FONT = Font(color="FFFFFF", bold=True)
SUBHEADER_FILL = PatternFill("solid", fgColor="D9EAF7")
INFO_FILL = PatternFill("solid", fgColor="F4F7FB")
COMPLETE_FILL = PatternFill("solid", fgColor="70AD47")
MID_FILL = PatternFill("solid", fgColor="9BBB59")
LOW_FILL = PatternFill("solid", fgColor="FFD966")
PENDING_FILL = PatternFill("solid", fgColor="F4B183")
ZERO_FILL = PatternFill("solid", fgColor="BDD7EE")
OUTSIDE_FILL = PatternFill("solid", fgColor="F3F3F3")
WEEKEND_FILL = PatternFill("solid", fgColor="EAEAEA")
STATUS_DATE_FILL = PatternFill("solid", fgColor="FFF2CC")
STATUS_FONT = Font(bold=True, color="C00000")
THIN_SIDE = Side(style="thin", color="D9D9D9")
THICK_STATUS_SIDE = Side(style="medium", color="C00000")
THIN_BORDER = Border(left=THIN_SIDE, right=THIN_SIDE, top=THIN_SIDE, bottom=THIN_SIDE)
STATUS_BORDER = Border(left=THICK_STATUS_SIDE, right=THICK_STATUS_SIDE)

CONFIG_START_DATE = "B2"
CONFIG_VISIBLE_WEEKS = "B3"
CONFIG_VISIBLE_END = "D2"
CONFIG_STATUS_DATE = "D3"
TIMELINE_START_COL = 15
MONTH_ROW = 8
WEEKDAY_ROW = 9
DAY_ROW = 10
TASK_HEADER_ROW = 11
TASK_START_ROW = 12
TEMPLATE_MONTH_ROW = 5
TEMPLATE_WEEKDAY_ROW = 6
TEMPLATE_DAY_ROW = 7
TEMPLATE_TASK_START_ROW = 9
MAX_WEEKS = 104
MAX_TASKS = 1000
ALLOWED_STATES = ["Completo", "En progreso", "Pendiente"]
ALLOWED_RISK_LEVELS = ["Bajo", "Medio", "Alto"]
YES_NO_OPTIONS = ["Sí", "No"]
TASK_INPUT_LAST_COL = 14
BASELINE_END_COL = 10
ACTUAL_CLOSE_COL = 11
RISK_LEVEL_COL = 12
BLOCKED_COL = 13
MILESTONE_COL = 14
SCRIPT_DIR = Path(__file__).resolve().parent
TEMPLATE_XLSM_NAME = "diagramaGanttBase.xlsm"
INFO_SHEET_NAME = "Info"
INFO_PROJECT_NAME_CELL = "B5"


@dataclass
class Task:
    tarea: str
    asignado: str
    inicio: date
    fin: date
    completado: int
    estado: str


@dataclass
class Resource:
    nombre_completo: str
    alias: str
    categoria: str
    ciudad: str
    subcategoria: str
    pais: str
    email: str


@dataclass
class Incident:
    alias: str
    fecha: date
    descripcion: str


DEFAULT_TASKS = [
    #Task("Analisis inicial", "Ana", date(2026, 4, 27), date(2026, 5, 1), 100, "Completo"),
    #Task("Diseno funcional", "Luis", date(2026, 4, 29), date(2026, 5, 8), 65, "En progreso"),
    #Task("Desarrollo backend", "Marta", date(2026, 5, 4), date(2026, 5, 22), 35, "En progreso"),
    #Task("Pruebas", "Jorge", date(2026, 5, 18), date(2026, 5, 29), 10, "Pendiente"),
]

DEFAULT_RESOURCES = [
    #Resource("Ana Gomez", "Ana", "Analisis", "Madrid", "Funcional", "Espana", "ana.gomez@empresa.com"),
    #Resource("Luis Martin", "Luis", "Diseno", "Barcelona", "UX", "Espana", "luis.martin@empresa.com"),
    #Resource("Marta Ruiz", "Marta", "Desarrollo", "Valencia", "Backend", "Espana", "marta.ruiz@empresa.com"),
    #Resource("Jorge Diaz", "Jorge", "QA", "Sevilla", "Testing", "Espana", "jorge.diaz@empresa.com"),
]

DEFAULT_INCIDENTS = [
    #Incident("Ana", date(2026, 4, 30), "Vacaciones"),
    #Incident("Luis", date(2026, 5, 5), "Enfermedad"),
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Genera un Excel con un diagrama de Gantt editable en el escritorio."
    )
    parser.add_argument(
        "--fecha-inicio",
        default="2026-04-27",
        help="Fecha de inicio del proyecto en formato YYYY-MM-DD.",
    )
    parser.add_argument(
        "--semanas",
        type=int,
        default=8,
        help="Numero de semanas visibles al abrir el diagrama.",
    )
    parser.add_argument(
        "--salida",
        default=None,
        help="Ruta completa del fichero de salida. Por defecto: Documents\\Codex\\diagramaGanttBaseN.xlsm",
    )
    return parser.parse_args()


def parse_iso_date(value: str) -> date:
    return datetime.strptime(value, "%Y-%m-%d").date()


def build_output_path(custom_output: str | None) -> Path:
    if custom_output:
        return Path(custom_output).expanduser().resolve()
    default_dir = Path(r"C:\Users\dpastopu\Documents\Codex")
    base_name = "diagramaGanttBase"
    pattern = re.compile(rf"^{re.escape(base_name)}(\d+)?\.(xlsx|xlsm)$", re.IGNORECASE)
    max_suffix = 0

    if default_dir.exists():
        for file_path in default_dir.glob(f"{base_name}*.*"):
            match = pattern.match(file_path.name)
            if not match:
                continue
            suffix = match.group(1)
            number = int(suffix) if suffix else 0
            max_suffix = max(max_suffix, number)

    next_suffix = max_suffix + 1
    return (default_dir / f"{base_name}{next_suffix}.xlsm").resolve()


def resolve_template_xlsm() -> Path:
    candidates = [
        SCRIPT_DIR / TEMPLATE_XLSM_NAME,
        Path(r"C:\Users\dpastopu\Documents\Codex") / TEMPLATE_XLSM_NAME,
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()
    raise FileNotFoundError(
        f"No se ha encontrado la plantilla XLSM base: {TEMPLATE_XLSM_NAME}"
    )


def normalize_tasks(tasks: Iterable[Task]) -> list[Task]:
    normalized = []
    for task in tasks:
        if task.fin < task.inicio:
            raise ValueError(
                f"La tarea '{task.tarea}' tiene una fecha fin anterior a la fecha inicio."
            )
        if not 0 <= task.completado <= 100:
            raise ValueError(
                f"La tarea '{task.tarea}' tiene un porcentaje completado fuera del rango 0-100."
            )
        if task.estado not in ALLOWED_STATES:
            raise ValueError(
                f"La tarea '{task.tarea}' tiene un estado no permitido: {task.estado}."
            )
        normalized.append(task)
    return normalized


def business_days_inclusive(start_date: date, end_date: date) -> int:
    days = 0
    current = start_date
    while current <= end_date:
        if current.weekday() < 5:
            days += 1
        current = date.fromordinal(current.toordinal() + 1)
    return days


def formula_for_timeline_date(column_index: int) -> str:
    first_timeline_col = get_column_letter(TIMELINE_START_COL)
    current_col = get_column_letter(column_index)
    return (
        f'=IF(OR(${CONFIG_START_DATE}="",${CONFIG_VISIBLE_END}=""),"",'
        f'IF(${CONFIG_START_DATE}+COLUMN({current_col}${DAY_ROW})-COLUMN(${first_timeline_col}${DAY_ROW})<='
        f'${CONFIG_VISIBLE_END},'
        f'${CONFIG_START_DATE}+COLUMN({current_col}${DAY_ROW})-COLUMN(${first_timeline_col}${DAY_ROW}),""))'
    )


def timeline_cell_formula(column_index: int, row_index: int) -> str:
    col_letter = get_column_letter(column_index)
    return (
        f'=IF({col_letter}${DAY_ROW}="","",'
        f'IF(WEEKDAY({col_letter}${DAY_ROW},2)>5,9,'
        f'IF(AND(ISNUMBER($E{row_index}),ISNUMBER($F{row_index}),'
        f'{col_letter}${DAY_ROW}>=$E{row_index},{col_letter}${DAY_ROW}<=$F{row_index}),'
        f'IF(NETWORKDAYS($E{row_index},{col_letter}${DAY_ROW})<=ROUND(NETWORKDAYS($E{row_index},$F{row_index})*$G{row_index},0),2,1),"")))'
    )


def configure_layout(ws, total_days: int) -> None:
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = f"{get_column_letter(TIMELINE_START_COL)}{TASK_START_ROW}"

    widths = {
        "A": 12,
        "B": 28,
        "C": 16,
        "D": 10,
        "E": 12,
        "F": 12,
        "G": 14,
        "H": 13,
        "I": 26,
        "J": 15,
        "K": 16,
        "L": 15,
        "M": 12,
        "N": 10,
    }
    for column_letter, width in widths.items():
        ws.column_dimensions[column_letter].width = width

    for col in range(TIMELINE_START_COL, TIMELINE_START_COL + total_days):
        ws.column_dimensions[get_column_letter(col)].width = 4.0

    row_heights = {
        1: 26,
        2: 22,
        3: 22,
        4: 22,
        5: 22,
        6: 22,
        7: 18,
        8: 22,
        9: 22,
        10: 24,
        11: 24,
    }
    for row_idx, height in row_heights.items():
        ws.row_dimensions[row_idx].height = height
    for row in range(TASK_START_ROW, TASK_START_ROW + MAX_TASKS):
        ws.row_dimensions[row].height = 22


def write_static_content(ws, project_start: date, visible_weeks: int, total_days: int) -> None:
    timeline_end_value = project_start.fromordinal(project_start.toordinal() + (visible_weeks * 7) - 1)

    ws["A1"] = "Planificacion del proyecto"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:E1")

    config_rows = [
        ("A2", "Fecha inicio proyecto", CONFIG_START_DATE, project_start),
        ("A3", "Semanas visibles", CONFIG_VISIBLE_WEEKS, visible_weeks),
        ("C2", "Fecha fin visible", CONFIG_VISIBLE_END, timeline_end_value),
        ("C3", "Fecha de estado", CONFIG_STATUS_DATE, project_start),
    ]
    for label_cell, label, value_cell, value in config_rows:
        ws[label_cell] = label
        ws[label_cell].fill = INFO_FILL
        ws[label_cell].font = Font(bold=True)
        ws[label_cell].border = THIN_BORDER
        ws[value_cell] = value
        ws[value_cell].border = THIN_BORDER
        ws[value_cell].fill = PatternFill("solid", fgColor="FFFFFF")
        ws[value_cell].alignment = Alignment(horizontal="center")

    ws[CONFIG_START_DATE].number_format = "dd/mm/aaaa"
    ws[CONFIG_VISIBLE_END].number_format = "dd/mm/aaaa"
    ws[CONFIG_STATUS_DATE].number_format = "dd/mm/aaaa"

    for row in range(1, 8):
        for col in range(6, 10):
            ws.cell(row=row, column=col).value = None

    headers = [
        "EDT",
        "Tarea",
        "Asignado",
        "Duracion",
        "Inicio",
        "Fin",
        "% completado",
        "Estado",
        "Comentarios",
        "Fin linea base",
        "Fecha cierre real",
        "Nivel de riesgo",
        "Bloqueada",
        "Hito",
    ]
    for column_index, header in enumerate(headers, start=1):
        cell = ws.cell(row=TASK_HEADER_ROW, column=column_index, value=header)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = THIN_BORDER

    for col in range(TIMELINE_START_COL, TIMELINE_START_COL + total_days):
        month_cell = ws.cell(row=MONTH_ROW, column=col)
        weekday_cell = ws.cell(row=WEEKDAY_ROW, column=col)
        day_cell = ws.cell(row=DAY_ROW, column=col)
        header_cell = ws.cell(row=TASK_HEADER_ROW, column=col)
        timeline_formula = formula_for_timeline_date(col)
        col_letter = get_column_letter(col)

        if col == TIMELINE_START_COL:
            month_cell.value = f'=IF({col_letter}${DAY_ROW}="","",{col_letter}${DAY_ROW})'
        else:
            prev_col = get_column_letter(col - 1)
            month_cell.value = (
                f'=IF({col_letter}${DAY_ROW}="","",'
                f'IF(MONTH({col_letter}${DAY_ROW})<>MONTH({prev_col}${DAY_ROW}),'
                f'{col_letter}${DAY_ROW},""))'
            )

        weekday_cell.value = f'=IF({col_letter}${DAY_ROW}="","",{col_letter}${DAY_ROW})'
        day_cell.value = timeline_formula
        header_cell.value = ""

        month_cell.number_format = '[$-es-ES]mmm aaaa'
        weekday_cell.number_format = "ddd"
        day_cell.number_format = "dd"

        for cell in (month_cell, weekday_cell, day_cell, header_cell):
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = THIN_BORDER

        month_cell.fill = SUBHEADER_FILL
        weekday_cell.fill = SUBHEADER_FILL
        day_cell.fill = SUBHEADER_FILL
        header_cell.fill = OUTSIDE_FILL


def populate_tasks(ws, tasks: list[Task]) -> None:
    last_task_row = TASK_START_ROW + MAX_TASKS - 1
    for row in range(TASK_START_ROW, last_task_row + 1):
        for col in range(1, TASK_INPUT_LAST_COL + 1):
            cell = ws.cell(row=row, column=col)
            cell.border = THIN_BORDER
            cell.alignment = Alignment(
                horizontal="left" if col in (1, 2, 3, 9) else "center",
                vertical="center",
            )
            if col in (5, 6, BASELINE_END_COL, ACTUAL_CLOSE_COL):
                cell.number_format = "dd/mm/aaaa"
            if col == 7:
                cell.number_format = "0%"
            if col == 6:
                cell.value = f'=IF(OR(D{row}="",E{row}=""),"",WORKDAY.INTL(E{row},D{row}-1,1))'

        for timeline_col in range(TIMELINE_START_COL, TIMELINE_START_COL + (MAX_WEEKS * 7)):
            gantt_cell = ws.cell(row=row, column=timeline_col)
            gantt_cell.value = timeline_cell_formula(timeline_col, row)
            # Hide any numeric helper values while keeping text symbols such as
            # the milestone star visible in the calendar.
            gantt_cell.number_format = ";;;@"
            gantt_cell.alignment = Alignment(horizontal="center", vertical="center")
            gantt_cell.border = THIN_BORDER

    for index, task in enumerate(tasks, start=TASK_START_ROW):
        ws.cell(row=index, column=1, value="")
        ws.cell(row=index, column=2, value=task.tarea)
        ws.cell(row=index, column=3, value=task.asignado)
        ws.cell(row=index, column=4, value=business_days_inclusive(task.inicio, task.fin))
        ws.cell(row=index, column=5, value=task.inicio)
        ws.cell(row=index, column=7, value=task.completado / 100)
        ws.cell(row=index, column=8, value=task.estado)
        ws.cell(row=index, column=9, value="")
        ws.cell(row=index, column=BASELINE_END_COL, value=task.fin)


def write_resources_sheet(ws, resources: list[Resource]) -> None:
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "A2"
    ws["A1"] = "Recursos del proyecto"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:G1")

    headers = ["Nombre completo", "Alias", "Categoria", "Ciudad", "Subcategoria", "Pais", "Email"]
    for column_index, header in enumerate(headers, start=1):
        cell = ws.cell(row=2, column=column_index, value=header)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = THIN_BORDER

    for row_index, resource in enumerate(resources, start=3):
        values = [
            resource.nombre_completo,
            resource.alias,
            resource.categoria,
            resource.ciudad,
            resource.subcategoria,
            resource.pais,
            resource.email,
        ]
        for column_index, value in enumerate(values, start=1):
            cell = ws.cell(row=row_index, column=column_index, value=value)
            cell.border = THIN_BORDER
            cell.alignment = Alignment(horizontal="left", vertical="center")

    widths = {
        "A": 26,
        "B": 14,
        "C": 18,
        "D": 16,
        "E": 18,
        "F": 14,
        "G": 30,
        "H": 14,
        "I": 16,
        "J": 10,
    }
    for column_letter, width in widths.items():
        ws.column_dimensions[column_letter].width = width
    ws["H2"] = "Estados"
    ws["H3"] = "Completo"
    ws["H4"] = "En progreso"
    ws["H5"] = "Pendiente"
    ws.column_dimensions["H"].hidden = True
    ws["I2"] = "Niveles de riesgo"
    for row_index, risk_level in enumerate(ALLOWED_RISK_LEVELS, start=3):
        ws.cell(row=row_index, column=9, value=risk_level)
    ws.column_dimensions["I"].hidden = True
    ws["J2"] = "Si / No"
    for row_index, option in enumerate(YES_NO_OPTIONS, start=3):
        ws.cell(row=row_index, column=10, value=option)
    ws.column_dimensions["J"].hidden = True


def write_incidents_sheet(ws) -> None:
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "A3"
    ws["A1"] = "Ausencias de recursos"
    ws["A1"].font = TITLE_FONT
    ws.merge_cells("A1:C1")

    headers = ["Alias", "Fecha incidencia", "Descripcion"]
    for column_index, header in enumerate(headers, start=1):
        cell = ws.cell(row=2, column=column_index, value=header)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = THIN_BORDER

    for row_index in range(3, 203):
        for column_index in range(1, 4):
            cell = ws.cell(row=row_index, column=column_index)
            cell.border = THIN_BORDER
            cell.alignment = Alignment(horizontal="left", vertical="center")
            if column_index == 2:
                cell.number_format = "dd/mm/aaaa"

    widths = {
        "A": 18,
        "B": 18,
        "C": 42,
    }
    for column_letter, width in widths.items():
        ws.column_dimensions[column_letter].width = width


def write_info_sheet(workbook: Workbook) -> None:
    if INFO_SHEET_NAME in workbook.sheetnames:
        ws = workbook[INFO_SHEET_NAME]
        for merged_range in list(ws.merged_cells.ranges):
            ws.unmerge_cells(str(merged_range))
        ws.delete_rows(1, ws.max_row)
    else:
        ws = workbook.create_sheet(INFO_SHEET_NAME, 0)

    if workbook.index(ws) != 0:
        workbook.move_sheet(ws, offset=-workbook.index(ws))

    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "A9"
    ws.sheet_properties.tabColor = "1F4E78"
    ws.column_dimensions["A"].width = 29
    ws.column_dimensions["B"].width = 92
    ws.column_dimensions["C"].width = 3
    ws.column_dimensions["D"].width = 18
    ws.column_dimensions["E"].width = 18
    ws.column_dimensions["F"].width = 18

    ws.merge_cells("A1:F1")
    ws["A1"] = "Guia de uso del planificador Gantt"
    ws["A1"].font = Font(name="Arial", size=16, bold=True, color="1F1F1F")
    ws["A1"].alignment = Alignment(vertical="center")
    ws.row_dimensions[1].height = 28

    ws.merge_cells("A2:F2")
    ws["A2"] = (
        "Los proyectos comparten las hojas Recursos y Ausencias. "
        "Cada pestaña Gantt mantiene sus propias fechas y tareas."
    )
    ws["A2"].font = Font(name="Arial", size=10, italic=True, color="595959")

    ws.merge_cells("A3:F3")
    ws["A3"] = "Crear un nuevo proyecto"
    ws["A3"].fill = HEADER_FILL
    ws["A3"].font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
    ws["A3"].alignment = Alignment(vertical="center")
    ws.row_dimensions[3].height = 22

    ws["A4"] = "Instrucciones"
    ws["B4"] = (
        "Escribe un nombre de pestaña y pulsa Crear pestaña Gantt. "
        "Se creara una copia limpia del Gantt con los mismos recursos y ausencias."
    )
    ws["A5"] = "Nombre de la nueva pestaña"
    ws[INFO_PROJECT_NAME_CELL] = ""
    ws[INFO_PROJECT_NAME_CELL].fill = PatternFill("solid", fgColor="FFF2CC")
    ws[INFO_PROJECT_NAME_CELL].border = Border(
        left=Side(style="medium", color="BF9000"),
        right=Side(style="medium", color="BF9000"),
        top=Side(style="medium", color="BF9000"),
        bottom=Side(style="medium", color="BF9000"),
    )
    ws[INFO_PROJECT_NAME_CELL].font = Font(name="Arial", size=10, bold=True)
    ws[INFO_PROJECT_NAME_CELL].alignment = Alignment(vertical="center")
    ws.row_dimensions[5].height = 24

    sections = [
        (
            "Hoja Gantt",
            [
                ("Fecha inicio proyecto", "Primer dia mostrado en el calendario y fecha inicial del proyecto."),
                ("Semanas visibles", "Numero de semanas que aparecen en el calendario. Al cambiarlo se ajusta la fecha fin visible."),
                ("Fecha fin visible", "Ultimo dia mostrado. Tambien puede editarse y recalcula las semanas visibles."),
                ("Fecha de estado", "Fecha de corte resaltada en amarillo para comparar la situacion del proyecto."),
                ("EDT", "Codigo opcional de la estructura de desglose del trabajo."),
                ("Tarea", "Nombre o descripcion breve de la actividad."),
                ("Asignado", "Alias del recurso responsable. Se selecciona desde la hoja Recursos."),
                ("Duracion", "Dias laborables necesarios. La fecha Fin se calcula automaticamente."),
                ("Inicio", "Fecha de comienzo de la tarea."),
                ("Fin", "Fecha final calculada con fines de semana y ausencias. Si se edita, se recalcula la duracion."),
                ("Fin linea base", "Fecha comprometida originalmente. Se completa al calcular la tarea por primera vez y no cambia con ausencias o replanificaciones."),
                ("Fecha cierre real", "Fecha en la que se termino realmente la tarea. Al marcarla Completo se propone automaticamente la fecha del dia."),
                ("% completado", "Avance de la tarea. Controla el color del Gantt y el avance ponderado de Informes."),
                ("Estado", "Completo, En progreso o Pendiente. Se usa en colores, alertas e informes."),
                ("Comentarios", "Notas libres sobre dependencias, riesgos o decisiones."),
                ("Nivel de riesgo", "Bajo, Medio o Alto. Permite priorizar las tareas que requieren atencion."),
                ("Bloqueada", "Indica si la tarea no puede avanzar por una dependencia o impedimento."),
                ("Hito", "Si se marca Si, la duracion se fija en un dia y el Gantt lo representa con una estrella amarilla."),
                ("Conflictos", "Si un recurso tiene tareas solapadas en dias laborables, su alias aparece en rojo y negrita."),
            ],
        ),
        (
            "Hoja Recursos",
            [
                ("Nombre completo", "Nombre de la persona o recurso."),
                ("Alias", "Identificador usado para asignar tareas y registrar ausencias. Debe ser unico."),
                ("Categoria", "Area, perfil o funcion principal del recurso."),
                ("Ciudad / Pais", "Ubicacion del recurso."),
                ("Email", "Dato de contacto."),
                ("Uso compartido", "Todas las pestañas Gantt utilizan esta misma lista de recursos."),
            ],
        ),
        (
            "Hoja Ausencias",
            [
                ("Alias", "Recurso afectado por la ausencia."),
                ("Fecha incidencia", "Dia no laborable para ese recurso: vacaciones, enfermedad u otra indisponibilidad."),
                ("Descripcion", "Motivo o detalle de la ausencia."),
                ("Efecto", "La fecha aparece en gris y alarga automaticamente las tareas afectadas sin cambiar su duracion laborable."),
                ("Uso compartido", "Una ausencia recalcula las tareas de todas las pestañas Gantt del libro."),
            ],
        ),
        (
            "Hoja Informes",
            [
                ("Inicio / fin del proyecto", "Fechas que delimitan el periodo analizado."),
                ("Fecha de estado", "Fecha de corte usada para comparar tiempo transcurrido y avance."),
                ("% tiempo consumido", "Parte del periodo del proyecto que ya ha transcurrido."),
                ("% avance ponderado", "Promedio de avance ponderado por la duracion de las tareas."),
                ("Tareas totales / completas", "Volumen total y tareas cuya fecha de cierre real es igual o anterior a la fecha de estado."),
                ("Jornadas por recurso", "Dias de trabajo asignados a cada recurso."),
                ("Tareas por estado", "Recuento de tareas completas, en progreso y pendientes."),
                ("Ausencias por recurso", "Numero de incidencias registradas para cada alias."),
                ("Graficos", "Comparan avance frente a tiempo y muestran la distribucion de tareas por estado."),
                ("Ambito", "Los informes actuales resumen la pestaña principal llamada Gantt."),
            ],
        ),
    ]

    row = 8
    for section_title, items in sections:
        ws.merge_cells(start_row=row, start_column=1, end_row=row, end_column=2)
        section_cell = ws.cell(row=row, column=1, value=section_title)
        section_cell.fill = SUBHEADER_FILL
        section_cell.font = Font(name="Arial", size=10, bold=True, color="1F1F1F")
        section_cell.border = Border(bottom=Side(style="medium", color="9EADBA"))
        row += 1
        for field_name, description in items:
            field_cell = ws.cell(row=row, column=1, value=field_name)
            description_cell = ws.cell(row=row, column=2, value=description)
            field_cell.font = Font(name="Arial", size=10, bold=True)
            description_cell.font = Font(name="Arial", size=10)
            field_cell.fill = INFO_FILL
            field_cell.alignment = Alignment(vertical="top")
            description_cell.alignment = Alignment(wrap_text=True, vertical="top")
            field_cell.border = Border(bottom=Side(style="thin", color="E7E6E6"))
            description_cell.border = Border(bottom=Side(style="thin", color="E7E6E6"))
            ws.row_dimensions[row].height = 30
            row += 1
        row += 1


def add_resource_alias_name(wb: Workbook, resources_count: int) -> None:
    last_row = max(3, resources_count + 2)
    defined_name = DefinedName("AliasRecursos", attr_text=f"=Recursos!$B$3:$B${last_row}")
    wb.defined_names["AliasRecursos"] = defined_name
    wb.defined_names["EstadosTarea"] = DefinedName(
        "EstadosTarea",
        attr_text="=Recursos!$H$3:$H$5",
    )
    wb.defined_names["NivelesRiesgo"] = DefinedName(
        "NivelesRiesgo",
        attr_text="=Recursos!$I$3:$I$5",
    )
    wb.defined_names["OpcionesSiNo"] = DefinedName(
        "OpcionesSiNo",
        attr_text="=Recursos!$J$3:$J$4",
    )


def add_validations(wb: Workbook, ws) -> None:
    dv_weeks = DataValidation(
        type="whole",
        operator="between",
        formula1="1",
        formula2=str(MAX_WEEKS),
        allow_blank=False,
    )
    dv_weeks.prompt = f"Introduce un numero entre 1 y {MAX_WEEKS}."
    dv_weeks.error = f"Solo se permiten semanas entre 1 y {MAX_WEEKS}."
    ws.add_data_validation(dv_weeks)
    dv_weeks.add(ws[CONFIG_VISIBLE_WEEKS])

    dv_percent = DataValidation(
        type="decimal",
        operator="between",
        formula1="0",
        formula2="1",
        allow_blank=True,
    )
    dv_percent.prompt = "Introduce un porcentaje entre 0% y 100%."
    dv_percent.error = "El porcentaje debe estar entre 0% y 100%."
    ws.add_data_validation(dv_percent)
    dv_percent.add(f"G{TASK_START_ROW}:G{TASK_START_ROW + MAX_TASKS - 1}")

    dv_state = DataValidation(type="list", formula1="=EstadosTarea", allow_blank=True)
    dv_state.prompt = "Selecciona un estado valido."
    dv_state.error = "Solo puedes usar: Completo, En progreso o Pendiente."
    ws.add_data_validation(dv_state)
    dv_state.add(f"H{TASK_START_ROW}:H{TASK_START_ROW + MAX_TASKS - 1}")

    dv_assigned = DataValidation(
        type="list",
        formula1="=AliasRecursos",
        allow_blank=True,
    )
    dv_assigned.prompt = "Selecciona un alias de la pestaña Recursos."
    dv_assigned.error = "Solo puedes usar un alias definido en la hoja Recursos."
    ws.add_data_validation(dv_assigned)
    dv_assigned.add(f"C{TASK_START_ROW}:C{TASK_START_ROW + MAX_TASKS - 1}")

    dv_date = DataValidation(type="date", operator="greaterThan", formula1="DATE(2020,1,1)")
    dv_date.allow_blank = True
    dv_date.prompt = "Introduce una fecha valida."
    dv_date.error = "La celda debe contener una fecha valida."
    ws.add_data_validation(dv_date)
    dv_date.add(ws[CONFIG_START_DATE])
    dv_date.add(ws[CONFIG_VISIBLE_END])
    dv_date.add(ws[CONFIG_STATUS_DATE])
    dv_date.add(f"J{TASK_START_ROW}:K{TASK_START_ROW + MAX_TASKS - 1}")
    dv_duration = DataValidation(
        type="whole",
        operator="between",
        formula1="1",
        formula2="999",
        allow_blank=True,
    )
    dv_duration.prompt = "Introduce la duracion en dias habiles."
    dv_duration.error = "La duracion debe ser un numero entero de dias habiles."
    ws.add_data_validation(dv_duration)
    dv_duration.add(f"D{TASK_START_ROW}:D{TASK_START_ROW + MAX_TASKS - 1}")

    dv_risk = DataValidation(type="list", formula1="=NivelesRiesgo", allow_blank=True)
    dv_risk.prompt = "Selecciona Bajo, Medio o Alto."
    dv_risk.error = "Selecciona un nivel de riesgo valido."
    ws.add_data_validation(dv_risk)
    dv_risk.add(f"L{TASK_START_ROW}:L{TASK_START_ROW + MAX_TASKS - 1}")

    for column_letter in ("M", "N"):
        dv_yes_no = DataValidation(type="list", formula1="=OpcionesSiNo", allow_blank=True)
        dv_yes_no.prompt = "Selecciona Si o No."
        dv_yes_no.error = "Solo se permite Si o No."
        ws.add_data_validation(dv_yes_no)
        dv_yes_no.add(f"{column_letter}{TASK_START_ROW}:{column_letter}{TASK_START_ROW + MAX_TASKS - 1}")


def add_incidents_validations(ws) -> None:
    dv_alias = DataValidation(type="list", formula1="=AliasRecursos", allow_blank=True)
    dv_alias.prompt = "Selecciona un alias definido en la hoja Recursos."
    dv_alias.error = "Solo puedes usar un alias definido en la hoja Recursos."
    ws.add_data_validation(dv_alias)
    dv_alias.add("A3:A202")

    dv_date = DataValidation(type="date", operator="greaterThan", formula1="DATE(2020,1,1)")
    dv_date.allow_blank = True
    dv_date.prompt = "Introduce una fecha valida."
    dv_date.error = "La celda debe contener una fecha valida."
    ws.add_data_validation(dv_date)
    dv_date.add("B3:B202")


def add_conditional_formatting(ws, total_days: int) -> None:
    last_timeline_col = TIMELINE_START_COL + total_days - 1
    first_timeline_letter = get_column_letter(TIMELINE_START_COL)
    last_timeline_letter = get_column_letter(last_timeline_col)
    gantt_range = f"{first_timeline_letter}{TASK_START_ROW}:{last_timeline_letter}{TASK_START_ROW + MAX_TASKS - 1}"
    header_range = f"{first_timeline_letter}{MONTH_ROW}:{last_timeline_letter}{DAY_ROW}"
    header_blank_formula = f'{first_timeline_letter}${DAY_ROW}=""'
    gantt_blank_formula = f'{first_timeline_letter}${DAY_ROW}=""'

    ws.conditional_formatting.add(
        header_range,
        FormulaRule(formula=[header_blank_formula], fill=OUTSIDE_FILL, stopIfTrue=True),
    )
    ws.conditional_formatting.add(
        gantt_range,
        FormulaRule(formula=[gantt_blank_formula], fill=OUTSIDE_FILL, stopIfTrue=True),
    )

    add_weekend_column_rules(ws, total_days)

    state_range = f"H{TASK_START_ROW}:H{TASK_START_ROW + MAX_TASKS - 1}"
    ws.conditional_formatting.add(
        state_range,
        FormulaRule(formula=[f'H{TASK_START_ROW}="Completo"'], fill=COMPLETE_FILL),
    )
    ws.conditional_formatting.add(
        state_range,
        FormulaRule(formula=[f'H{TASK_START_ROW}="En progreso"'], fill=LOW_FILL),
    )
    ws.conditional_formatting.add(
        state_range,
        FormulaRule(formula=[f'H{TASK_START_ROW}="Pendiente"'], fill=ZERO_FILL),
    )

    risk_range = f"L{TASK_START_ROW}:L{TASK_START_ROW + MAX_TASKS - 1}"
    ws.conditional_formatting.add(
        risk_range,
        FormulaRule(formula=[f'L{TASK_START_ROW}="Alto"'], fill=PatternFill("solid", fgColor="F4CCCC")),
    )
    ws.conditional_formatting.add(
        risk_range,
        FormulaRule(formula=[f'L{TASK_START_ROW}="Medio"'], fill=LOW_FILL),
    )
    ws.conditional_formatting.add(
        f"M{TASK_START_ROW}:M{TASK_START_ROW + MAX_TASKS - 1}",
        FormulaRule(formula=[f'M{TASK_START_ROW}="Sí"'], fill=PatternFill("solid", fgColor="F4CCCC")),
    )
    ws.conditional_formatting.add(
        f"N{TASK_START_ROW}:N{TASK_START_ROW + MAX_TASKS - 1}",
        FormulaRule(formula=[f'N{TASK_START_ROW}="Sí"'], fill=STATUS_DATE_FILL),
    )


def add_weekend_column_rules(ws, total_days: int) -> None:
    last_task_row = TASK_START_ROW + MAX_TASKS - 1
    for col in range(TIMELINE_START_COL, TIMELINE_START_COL + total_days):
        col_letter = get_column_letter(col)
        weekend_formula = f'AND({col_letter}${DAY_ROW}<>"",WEEKDAY({col_letter}${DAY_ROW},2)>5)'
        header_col_range = f"{col_letter}{MONTH_ROW}:{col_letter}{DAY_ROW}"
        gantt_col_range = f"{col_letter}{TASK_START_ROW}:{col_letter}{last_task_row}"

        ws.conditional_formatting.add(
            header_col_range,
            FormulaRule(formula=[weekend_formula], fill=WEEKEND_FILL, stopIfTrue=True),
        )
        ws.conditional_formatting.add(
            gantt_col_range,
            FormulaRule(formula=[weekend_formula], fill=WEEKEND_FILL, stopIfTrue=True),
        )


def create_workbook(
    project_start: date,
    visible_weeks: int,
    tasks: list[Task],
    resources: list[Resource],
) -> Workbook:
    if not 1 <= visible_weeks <= MAX_WEEKS:
        raise ValueError(f"El numero de semanas debe estar entre 1 y {MAX_WEEKS}.")

    total_days = MAX_WEEKS * 7
    wb = Workbook()
    ws = wb.active
    ws.title = "Gantt"
    resources_ws = wb.create_sheet("Recursos")
    incidents_ws = wb.create_sheet("Ausencias")
    write_info_sheet(wb)

    wb.calculation.fullCalcOnLoad = True
    wb.calculation.forceFullCalc = True

    configure_layout(ws, total_days)
    write_static_content(ws, project_start, visible_weeks, total_days)
    populate_tasks(ws, tasks)
    write_resources_sheet(resources_ws, resources)
    write_incidents_sheet(incidents_ws)
    add_resource_alias_name(wb, len(resources))
    add_validations(wb, ws)
    add_incidents_validations(incidents_ws)
    add_conditional_formatting(ws, total_days)
    merge_visible_months(ws, project_start, visible_weeks)

    return wb


def clear_range_values(ws, start_row: int, end_row: int, start_col: int, end_col: int) -> None:
    for row in range(start_row, end_row + 1):
        for col in range(start_col, end_col + 1):
            ws.cell(row=row, column=col).value = None


def populate_template_workbook(
    workbook: Workbook,
    project_start: date,
    visible_weeks: int,
    tasks: list[Task],
    resources: list[Resource],
    incidents: list[Incident],
) -> None:
    write_info_sheet(workbook)
    gantt_ws = workbook["Gantt"]
    resources_ws = workbook["Recursos"]
    incidencias_ws = workbook["Ausencias"]
    # Keep all task fields (A:N) visible while the timeline scrolls from O onward.
    # The template previously retained the old J-based split, which hid the five
    # fields added before the timeline in newly generated workbooks.
    gantt_ws.freeze_panes = (
        f"{get_column_letter(TIMELINE_START_COL)}{TEMPLATE_TASK_START_ROW}"
    )
    # Always open at the top of the sheet. A saved A6 scroll position made rows
    # 1:5 appear to be missing even though their contents were still present.
    gantt_ws.sheet_view.topLeftCell = "A1"
    visible_end = project_start.fromordinal(project_start.toordinal() + (visible_weeks * 7) - 1)

    gantt_ws[CONFIG_START_DATE] = project_start
    gantt_ws[CONFIG_VISIBLE_WEEKS] = visible_weeks
    gantt_ws[CONFIG_VISIBLE_END] = visible_end
    gantt_ws[CONFIG_STATUS_DATE] = project_start

    clear_range_values(gantt_ws, 9, 1008, 1, TASK_INPUT_LAST_COL)
    for index, task in enumerate(tasks, start=9):
        gantt_ws.cell(row=index, column=1, value="")
        gantt_ws.cell(row=index, column=2, value=task.tarea)
        gantt_ws.cell(row=index, column=3, value=task.asignado)
        gantt_ws.cell(row=index, column=4, value=business_days_inclusive(task.inicio, task.fin))
        gantt_ws.cell(row=index, column=5, value=task.inicio)
        gantt_ws.cell(row=index, column=6, value=task.fin)
        gantt_ws.cell(row=index, column=7, value=task.completado / 100)
        gantt_ws.cell(row=index, column=8, value=task.estado)
        gantt_ws.cell(row=index, column=9, value="")
        gantt_ws.cell(row=index, column=BASELINE_END_COL, value=task.fin)

    clear_range_values(resources_ws, 3, 202, 1, 6)
    for index, resource in enumerate(resources, start=3):
        resources_ws.cell(row=index, column=1, value=resource.nombre_completo)
        resources_ws.cell(row=index, column=2, value=resource.alias)
        resources_ws.cell(row=index, column=3, value=resource.categoria)
        resources_ws.cell(row=index, column=4, value=resource.ciudad)
        resources_ws.cell(row=index, column=5, value=resource.pais)
        resources_ws.cell(row=index, column=6, value=resource.email)

    clear_range_values(incidencias_ws, 3, 202, 1, 3)
    for index, incident in enumerate(incidents, start=3):
        incidencias_ws.cell(row=index, column=1, value=incident.alias)
        incidencias_ws.cell(row=index, column=2, value=incident.fecha)
        incidencias_ws.cell(row=index, column=3, value=incident.descripcion)


def create_xlsm_from_template(
    output_path: Path,
    project_start: date,
    visible_weeks: int,
    tasks: list[Task],
    resources: list[Resource],
    incidents: list[Incident],
) -> None:
    template_path = resolve_template_xlsm()
    shutil.copy2(template_path, output_path)
    workbook = load_workbook(output_path, keep_vba=True)
    try:
        populate_template_workbook(workbook, project_start, visible_weeks, tasks, resources, incidents)
        workbook.save(output_path)
    finally:
        workbook.close()


def merge_visible_months(ws, project_start: date, visible_weeks: int) -> None:
    for merged_range in list(ws.merged_cells.ranges):
        if merged_range.min_row == MONTH_ROW and merged_range.max_row == MONTH_ROW:
            ws.unmerge_cells(str(merged_range))

    start_col = TIMELINE_START_COL
    end_col = TIMELINE_START_COL + (visible_weeks * 7) - 1

    current_start = start_col
    current_month = project_start.month
    current_year = project_start.year

    for offset in range(visible_weeks * 7):
        current_date = project_start.fromordinal(project_start.toordinal() + offset)
        col = TIMELINE_START_COL + offset
        if current_date.month != current_month or current_date.year != current_year:
            if col - 1 > current_start:
                ws.merge_cells(
                    start_row=MONTH_ROW,
                    start_column=current_start,
                    end_row=MONTH_ROW,
                    end_column=col - 1,
                )
            current_start = col
            current_month = current_date.month
            current_year = current_date.year

    if end_col > current_start:
        ws.merge_cells(
            start_row=MONTH_ROW,
            start_column=current_start,
            end_row=MONTH_ROW,
            end_column=end_col,
        )

    for col in range(end_col + 1, TIMELINE_START_COL + (MAX_WEEKS * 7)):
        if isinstance(ws.cell(row=MONTH_ROW, column=col), MergedCell):
            continue
        ws.cell(row=MONTH_ROW, column=col).alignment = Alignment(horizontal="center", vertical="center")


def macro_module_code(
    month_row: int = MONTH_ROW,
    weekday_row: int = WEEKDAY_ROW,
    day_row: int = DAY_ROW,
    task_start_row: int = TASK_START_ROW,
) -> str:
    last_timeline_col = TIMELINE_START_COL + (MAX_WEEKS * 7) - 1
    last_task_row = task_start_row + MAX_TASKS - 1
    return textwrap.dedent(
        f"""
        Option Explicit

        Public isRefreshing As Boolean
        Private lastRenderedTaskRow As Long
        Private lastRenderedTimelineCol As Long

        Public Function IsGanttWorksheet(ByVal ws As Worksheet) As Boolean
            On Error GoTo NotGantt
            IsGanttWorksheet = ( _
                StrComp(Trim(CStr(ws.Cells({task_start_row - 1}, 2).Value)), "Tarea", vbTextCompare) = 0 And _
                StrComp(Trim(CStr(ws.Cells({task_start_row - 1}, 3).Value)), "Asignado", vbTextCompare) = 0 And _
                StrComp(Trim(CStr(ws.Cells({task_start_row - 1}, 4).Value)), "Duracion", vbTextCompare) = 0 _
            )
            Exit Function
        NotGantt:
            IsGanttWorksheet = False
        End Function

        Private Function WorksheetNameExists(ByVal sheetName As String) As Boolean
            Dim ws As Worksheet
            On Error Resume Next
            Set ws = ThisWorkbook.Worksheets(sheetName)
            WorksheetNameExists = Not ws Is Nothing
            On Error GoTo 0
        End Function

        Private Function IsValidWorksheetName(ByVal sheetName As String) As Boolean
            Dim invalidCharacters As Variant
            Dim invalidCharacter As Variant

            sheetName = Trim(sheetName)
            If sheetName = "" Or Len(sheetName) > 31 Then Exit Function
            invalidCharacters = Array(":", "\\", "/", "?", "*", "[", "]")
            For Each invalidCharacter In invalidCharacters
                If InStr(1, sheetName, CStr(invalidCharacter), vbBinaryCompare) > 0 Then Exit Function
            Next invalidCharacter
            IsValidWorksheetName = True
        End Function

        Public Sub CreateNewGanttProject(Optional ByVal showMessages As Boolean = True)
            Dim infoWs As Worksheet
            Dim templateWs As Worksheet
            Dim newWs As Worksheet
            Dim projectName As String
            Dim weeksValue As Long

            On Error GoTo CleanUp
            Set infoWs = ThisWorkbook.Worksheets("{INFO_SHEET_NAME}")
            projectName = Trim(CStr(infoWs.Range("{INFO_PROJECT_NAME_CELL}").Value))

            If projectName = "" Then
                MsgBox "Escribe el nombre de la nueva pestaña.", vbExclamation, "Nuevo proyecto"
                Exit Sub
            End If
            If Not IsValidWorksheetName(projectName) Then
                MsgBox "El nombre debe tener entre 1 y 31 caracteres y no puede contener : \\ / ? * [ ]", vbExclamation, "Nuevo proyecto"
                Exit Sub
            End If
            If WorksheetNameExists(projectName) Then
                MsgBox "Ya existe una pestaña con ese nombre.", vbExclamation, "Nuevo proyecto"
                Exit Sub
            End If

            Application.ScreenUpdating = False
            Application.EnableEvents = False

            Set templateWs = ThisWorkbook.Worksheets("Gantt")
            templateWs.Copy After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count)
            Set newWs = ActiveSheet
            newWs.Name = projectName
            newWs.Range(newWs.Cells({task_start_row}, 1), newWs.Cells({last_task_row}, {TASK_INPUT_LAST_COL})).ClearContents
            newWs.Range("A1").Value = "Planificacion del proyecto - " & projectName
            newWs.Range("{CONFIG_START_DATE}").Value = Date
            If IsNumeric(newWs.Range("{CONFIG_VISIBLE_WEEKS}").Value) Then
                weeksValue = CLng(newWs.Range("{CONFIG_VISIBLE_WEEKS}").Value)
            End If
            If weeksValue < 1 Then weeksValue = 8
            newWs.Range("{CONFIG_VISIBLE_WEEKS}").Value = weeksValue
            newWs.Range("{CONFIG_VISIBLE_END}").Value = Date + (weeksValue * 7) - 1
            newWs.Range("{CONFIG_STATUS_DATE}").Value = Date
            infoWs.Range("{INFO_PROJECT_NAME_CELL}").ClearContents

            newWs.Calculate
            RefreshGanttMonthHeaders newWs
            RefreshGanttWeekendColumns 0, newWs
            newWs.Activate
            If showMessages Then
                MsgBox "Se ha creado la pestaña '" & projectName & "'.", vbInformation, "Nuevo proyecto"
            End If

        CleanUp:
            Application.EnableEvents = True
            Application.ScreenUpdating = True
            If Err.Number <> 0 Then
                MsgBox "No se pudo crear el proyecto: " & Err.Description, vbCritical, "Nuevo proyecto"
            End If
        End Sub

        Private Function IsWeekendDate(ByVal workDate As Date) As Boolean
            IsWeekendDate = (Weekday(workDate, vbMonday) > 5)
        End Function

        Private Function HasResourceIncident(ByVal aliasText As String, ByVal workDate As Date) As Boolean
            Dim wsInc As Worksheet
            Dim row As Long
            Dim incidentAlias As String
            Dim incidentDate As Variant

            aliasText = Trim(CStr(aliasText))
            If aliasText = "" Then
                HasResourceIncident = False
                Exit Function
            End If

            Set wsInc = ThisWorkbook.Worksheets("Ausencias")
            For row = 3 To 202
                incidentAlias = Trim(CStr(wsInc.Cells(row, 1).Value))
                incidentDate = wsInc.Cells(row, 2).Value
                If incidentAlias <> "" And IsDate(incidentDate) Then
                    If StrComp(incidentAlias, aliasText, vbTextCompare) = 0 Then
                        If CLng(CDate(incidentDate)) = CLng(workDate) Then
                            HasResourceIncident = True
                            Exit Function
                        End If
                    End If
                End If
            Next row
        End Function

        Private Function IsNonWorkingDay(ByVal aliasText As String, ByVal workDate As Date) As Boolean
            IsNonWorkingDay = IsWeekendDate(workDate) Or HasResourceIncident(aliasText, workDate)
        End Function

        Private Function NormalizeAliasList(ByVal aliasText As String) As String
            NormalizeAliasList = Replace(Replace(Replace(Trim(CStr(aliasText)), ",", ";"), "/", ";"), "|", ";")
        End Function

        Private Function SharesAssignedAlias(ByVal leftAliases As String, ByVal rightAliases As String) As Boolean
            Dim leftParts() As String
            Dim rightParts() As String
            Dim leftPart As Variant
            Dim rightPart As Variant
            Dim leftAlias As String
            Dim rightAlias As String

            leftAliases = NormalizeAliasList(leftAliases)
            rightAliases = NormalizeAliasList(rightAliases)
            If leftAliases = "" Or rightAliases = "" Then Exit Function

            leftParts = Split(leftAliases, ";")
            rightParts = Split(rightAliases, ";")

            For Each leftPart In leftParts
                leftAlias = Trim(CStr(leftPart))
                If leftAlias <> "" Then
                    For Each rightPart In rightParts
                        rightAlias = Trim(CStr(rightPart))
                        If rightAlias <> "" Then
                            If StrComp(leftAlias, rightAlias, vbTextCompare) = 0 Then
                                SharesAssignedAlias = True
                                Exit Function
                            End If
                        End If
                    Next rightPart
                End If
            Next leftPart
        End Function

        Private Function HasOperationalOverlap( _
            ByVal leftAliases As String, _
            ByVal leftStart As Date, _
            ByVal leftEnd As Date, _
            ByVal rightAliases As String, _
            ByVal rightStart As Date, _
            ByVal rightEnd As Date _
        ) As Boolean
            Dim leftParts() As String
            Dim rightParts() As String
            Dim leftPart As Variant
            Dim rightPart As Variant
            Dim leftAlias As String
            Dim rightAlias As String
            Dim overlapStart As Date
            Dim overlapEnd As Date
            Dim currentDate As Date

            If rightEnd < leftStart Or leftEnd < rightStart Then Exit Function

            overlapStart = leftStart
            If rightStart > overlapStart Then overlapStart = rightStart
            overlapEnd = leftEnd
            If rightEnd < overlapEnd Then overlapEnd = rightEnd

            leftAliases = NormalizeAliasList(leftAliases)
            rightAliases = NormalizeAliasList(rightAliases)
            If leftAliases = "" Or rightAliases = "" Then Exit Function

            leftParts = Split(leftAliases, ";")
            rightParts = Split(rightAliases, ";")

            For Each leftPart In leftParts
                leftAlias = Trim(CStr(leftPart))
                If leftAlias <> "" Then
                    For Each rightPart In rightParts
                        rightAlias = Trim(CStr(rightPart))
                        If rightAlias <> "" Then
                            If StrComp(leftAlias, rightAlias, vbTextCompare) = 0 Then
                                currentDate = overlapStart
                                Do While currentDate <= overlapEnd
                                    If Not IsNonWorkingDay(leftAlias, currentDate) Then
                                        HasOperationalOverlap = True
                                        Exit Function
                                    End If
                                    currentDate = DateAdd("d", 1, currentDate)
                                Loop
                            End If
                        End If
                    Next rightPart
                End If
            Next leftPart
        End Function

        Private Function WorkingDaysBetween(ByVal aliasText As String, ByVal startDate As Date, ByVal endDate As Date) As Long
            Dim currentDate As Date
            Dim daysCount As Long

            If endDate < startDate Then
                WorkingDaysBetween = 0
                Exit Function
            End If

            currentDate = startDate
            daysCount = 0
            Do While currentDate <= endDate
                If Not IsNonWorkingDay(aliasText, currentDate) Then
                    daysCount = daysCount + 1
                End If
                currentDate = DateAdd("d", 1, currentDate)
            Loop

            WorkingDaysBetween = daysCount
        End Function

        Private Function LastBusinessDay(ByVal aliasText As String, ByVal startValue As Date, ByVal durationValue As Long) As Date
            Dim currentDate As Date
            Dim workedDays As Long

            currentDate = startValue
            workedDays = 0

            Do While workedDays < durationValue
                If Not IsNonWorkingDay(aliasText, currentDate) Then
                    workedDays = workedDays + 1
                End If
                If workedDays < durationValue Then
                    currentDate = DateAdd("d", 1, currentDate)
                End If
            Loop

            LastBusinessDay = currentDate
        End Function

        Private Function IsYesValue(ByVal cellValue As Variant) As Boolean
            Dim normalizedValue As String
            normalizedValue = LCase$(Trim$(CStr(cellValue)))
            IsYesValue = (normalizedValue = "sí" Or normalizedValue = "si" Or Left$(normalizedValue, 1) = "s")
        End Function

        Public Sub ApplyMilestoneRule(ByVal ws As Worksheet, ByVal row As Long)
            If IsYesValue(ws.Cells(row, {MILESTONE_COL}).Value) Then
                ws.Cells(row, 4).Value = 1
            End If
        End Sub

        Public Sub EnsureTaskBaseline(ByVal ws As Worksheet, ByVal row As Long)
            If IsDate(ws.Cells(row, 6).Value) Then
                If Trim$(CStr(ws.Cells(row, {BASELINE_END_COL}).Value)) = "" Then
                    ws.Cells(row, {BASELINE_END_COL}).Value = ws.Cells(row, 6).Value
                    ws.Cells(row, {BASELINE_END_COL}).NumberFormat = "dd/mm/yyyy"
                End If
            End If
        End Sub

        Public Sub UpdateTaskClosureDate(ByVal ws As Worksheet, ByVal row As Long)
            If StrComp(Trim$(CStr(ws.Cells(row, 8).Value)), "Completo", vbTextCompare) = 0 Then
                If Not IsDate(ws.Cells(row, {ACTUAL_CLOSE_COL}).Value) Then
                    ws.Cells(row, {ACTUAL_CLOSE_COL}).Value = Date
                    ws.Cells(row, {ACTUAL_CLOSE_COL}).NumberFormat = "dd/mm/yyyy"
                End If
            Else
                ws.Cells(row, {ACTUAL_CLOSE_COL}).ClearContents
            End If
        End Sub

        Public Sub UpdateTaskEndFromDuration(ByVal ws As Worksheet, ByVal row As Long)
            Dim durationValue As Variant
            Dim startValue As Variant
            Dim aliasText As String

            ApplyMilestoneRule ws, row
            aliasText = Trim(CStr(ws.Cells(row, 3).Value))
            durationValue = ws.Cells(row, 4).Value2
            startValue = ws.Cells(row, 5).Value

            If IsDate(startValue) And IsNumeric(durationValue) Then
                If CLng(durationValue) > 0 Then
                    ws.Cells(row, 6).Value = LastBusinessDay(aliasText, CDate(startValue), CLng(durationValue))
                    EnsureTaskBaseline ws, row
                Else
                    ws.Cells(row, 6).ClearContents
                End If
            ElseIf Trim(CStr(durationValue)) = "" Then
                ws.Cells(row, 6).ClearContents
            End If
        End Sub

        Public Sub UpdateTaskDurationFromDates(ByVal ws As Worksheet, ByVal row As Long)
            Dim startValue As Variant
            Dim endValue As Variant
            Dim aliasText As String

            aliasText = Trim(CStr(ws.Cells(row, 3).Value))
            startValue = ws.Cells(row, 5).Value
            endValue = ws.Cells(row, 6).Value

            If IsDate(startValue) And IsDate(endValue) Then
                If IsYesValue(ws.Cells(row, {MILESTONE_COL}).Value) Then
                    ws.Cells(row, 4).Value = 1
                    UpdateTaskEndFromDuration ws, row
                ElseIf CDate(endValue) >= CDate(startValue) Then
                    ws.Cells(row, 4).Value = WorkingDaysBetween(aliasText, CDate(startValue), CDate(endValue))
                    EnsureTaskBaseline ws, row
                Else
                    ws.Cells(row, 4).ClearContents
                End If
            ElseIf Trim(CStr(startValue)) = "" Or Trim(CStr(endValue)) = "" Then
                ws.Cells(row, 4).ClearContents
            End If
        End Sub

        Public Sub SyncVisibleRange(ByVal ws As Worksheet, ByVal changedAddress As String)
            Dim startValue As Variant
            Dim weeksValue As Variant
            Dim endValue As Variant
            Dim visibleDays As Long

            startValue = ws.Range("{CONFIG_START_DATE}").Value
            weeksValue = ws.Range("{CONFIG_VISIBLE_WEEKS}").Value
            endValue = ws.Range("{CONFIG_VISIBLE_END}").Value

            If Not IsDate(startValue) Then Exit Sub

            changedAddress = UCase$(Trim$(changedAddress))

            If changedAddress = "{CONFIG_START_DATE}" Or changedAddress = "{CONFIG_VISIBLE_WEEKS}" Then
                If IsNumeric(weeksValue) Then
                    If CLng(weeksValue) > 0 Then
                        ws.Range("{CONFIG_VISIBLE_END}").Value = CDate(startValue) + (CLng(weeksValue) * 7) - 1
                    End If
                End If
            ElseIf changedAddress = "{CONFIG_VISIBLE_END}" Then
                If IsDate(endValue) Then
                    visibleDays = CLng(CDate(endValue)) - CLng(CDate(startValue)) + 1
                    If visibleDays < 1 Then
                        visibleDays = 1
                        ws.Range("{CONFIG_VISIBLE_END}").Value = CDate(startValue)
                    End If
                    ws.Range("{CONFIG_VISIBLE_WEEKS}").Value = Application.WorksheetFunction.RoundUp(visibleDays / 7, 0)
                End If
            End If
        End Sub

        Private Sub FormatMonthSegment( _
            ByVal ws As Worksheet, _
            ByVal startCol As Long, _
            ByVal endCol As Long, _
            ByVal monthDate As Date _
        )
            Dim monthRange As Range

            If endCol < startCol Then Exit Sub

            Set monthRange = ws.Range( _
                ws.Cells({month_row}, startCol), _
                ws.Cells({month_row}, endCol) _
            )

            If endCol > startCol Then monthRange.Merge

            With ws.Cells({month_row}, startCol).MergeArea
                .Cells(1, 1).Value = DateSerial(Year(monthDate), Month(monthDate), 1)
                .NumberFormat = "[$-es-ES]mmm yyyy"
                .HorizontalAlignment = xlCenter
                .VerticalAlignment = xlCenter
                .Interior.Color = RGB(217, 234, 247)
            End With
        End Sub

        Public Sub RefreshMonthHeaders(ByVal ws As Worksheet)
            Dim col As Long
            Dim segmentStart As Long
            Dim lastVisibleCol As Long
            Dim currentMonth As Long
            Dim currentYear As Long
            Dim dayValue As Variant
            Dim previousAlerts As Boolean

            On Error GoTo CleanUp

            previousAlerts = Application.DisplayAlerts
            Application.DisplayAlerts = False

            With ws.Range( _
                ws.Cells({month_row}, {TIMELINE_START_COL}), _
                ws.Cells({month_row}, {last_timeline_col}) _
            )
                .UnMerge
                .ClearContents
                .NumberFormat = "[$-es-ES]mmm yyyy"
                .HorizontalAlignment = xlCenter
                .VerticalAlignment = xlCenter
            End With

            segmentStart = 0
            lastVisibleCol = 0

            For col = {TIMELINE_START_COL} To {last_timeline_col}
                dayValue = ws.Cells({day_row}, col).Value

                If IsDate(dayValue) Then
                    lastVisibleCol = col

                    If segmentStart = 0 Then
                        segmentStart = col
                        currentMonth = Month(CDate(dayValue))
                        currentYear = Year(CDate(dayValue))
                    ElseIf Month(CDate(dayValue)) <> currentMonth Or _
                           Year(CDate(dayValue)) <> currentYear Then
                        FormatMonthSegment ws, segmentStart, col - 1, _
                            DateSerial(currentYear, currentMonth, 1)
                        segmentStart = col
                        currentMonth = Month(CDate(dayValue))
                        currentYear = Year(CDate(dayValue))
                    End If
                ElseIf segmentStart > 0 Then
                    Exit For
                End If
            Next col

            If segmentStart > 0 And lastVisibleCol >= segmentStart Then
                FormatMonthSegment ws, segmentStart, lastVisibleCol, _
                    DateSerial(currentYear, currentMonth, 1)
            End If

        CleanUp:
            Application.DisplayAlerts = previousAlerts
        End Sub

        Public Sub RefreshGanttMonthHeaders(Optional ByVal targetWs As Worksheet)
            Dim ws As Worksheet

            If targetWs Is Nothing Then
                Set ws = ThisWorkbook.Worksheets("Gantt")
            Else
                Set ws = targetWs
            End If
            ws.Range( _
                ws.Cells({day_row}, {TIMELINE_START_COL}), _
                ws.Cells({day_row}, {last_timeline_col}) _
            ).Calculate
            RefreshMonthHeaders ws
        End Sub

        Private Function LastUsedTaskRow(ByVal ws As Worksheet) As Long
            Dim inputColumns As Variant
            Dim inputColumn As Variant
            Dim candidateRow As Long
            Dim resultRow As Long

            inputColumns = Array(2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14)
            resultRow = {task_start_row} - 1

            For Each inputColumn In inputColumns
                candidateRow = ws.Cells({last_task_row}, CLng(inputColumn)).End(xlUp).Row
                If candidateRow >= {task_start_row} Then
                    If Trim(CStr(ws.Cells(candidateRow, CLng(inputColumn)).Value)) <> "" Then
                        If candidateRow > resultRow Then resultRow = candidateRow
                    End If
                End If
            Next inputColumn

            LastUsedTaskRow = resultRow
        End Function

        Private Function LastVisibleTimelineColumn(ByVal ws As Worksheet) As Long
            Dim col As Long
            Dim resultCol As Long
            Dim dayValue As Variant

            resultCol = {TIMELINE_START_COL} - 1

            For col = {TIMELINE_START_COL} To {last_timeline_col}
                dayValue = ws.Cells({day_row}, col).Value
                If IsDate(dayValue) Then
                    resultCol = col
                ElseIf resultCol >= {TIMELINE_START_COL} Then
                    Exit For
                End If
            Next col

            LastVisibleTimelineColumn = resultCol
        End Function

        Public Sub RefreshEntireGantt()
            Dim ws As Worksheet

            For Each ws In ThisWorkbook.Worksheets
                If IsGanttWorksheet(ws) Then
                    RefreshGanttMonthHeaders ws
                    RefreshGanttWeekendColumns 0, ws
                End If
            Next ws
        End Sub

        Public Sub RefreshGanttWeekendColumns(Optional ByVal minimumTaskRow As Long = 0, Optional ByVal targetWs As Worksheet)
            Dim ws As Worksheet
            Dim col As Long
            Dim row As Long
            Dim dayValue As Variant
            Dim isWeekend As Boolean
            Dim progressValue As Variant
            Dim stateValue As String
            Dim aliasText As String
            Dim startValue As Variant
            Dim endValue As Variant
            Dim taskColor As Long
            Dim hasTaskColor As Boolean
            Dim statusDate As Variant
            Dim statusCol As Long
            Dim hasIncident As Boolean
            Dim otherRow As Long
            Dim lastUsedRow As Long
            Dim renderEndRow As Long
            Dim lastVisibleCol As Long
            Dim clearEndCol As Long
            Dim isMilestone As Boolean

            If isRefreshing Then Exit Sub
            isRefreshing = True

            On Error GoTo CleanUp

            If targetWs Is Nothing Then
                Set ws = ThisWorkbook.Worksheets("Gantt")
            Else
                Set ws = targetWs
            End If
            Application.ScreenUpdating = False
            statusDate = ws.Range("{CONFIG_STATUS_DATE}").Value
            statusCol = 0

            lastUsedRow = LastUsedTaskRow(ws)
            lastVisibleCol = LastVisibleTimelineColumn(ws)

            renderEndRow = lastUsedRow
            If minimumTaskRow > renderEndRow Then renderEndRow = minimumTaskRow
            If lastRenderedTaskRow > renderEndRow Then renderEndRow = lastRenderedTaskRow
            If renderEndRow < {task_start_row} Then renderEndRow = {task_start_row}

            clearEndCol = lastVisibleCol
            If lastRenderedTimelineCol > clearEndCol Then clearEndCol = lastRenderedTimelineCol
            If clearEndCol < {TIMELINE_START_COL} Then clearEndCol = {TIMELINE_START_COL}

            ws.Range( _
                ws.Cells({task_start_row}, {TIMELINE_START_COL}), _
                ws.Cells({last_task_row}, clearEndCol) _
            ).Interior.Pattern = xlNone
            ws.Range( _
                ws.Cells({task_start_row}, {TIMELINE_START_COL}), _
                ws.Cells({last_task_row}, clearEndCol) _
            ).Replace What:=ChrW(&H2605), Replacement:="", LookAt:=xlWhole, SearchOrder:=xlByRows, MatchCase:=False
            With ws.Range( _
                ws.Cells({task_start_row}, {TIMELINE_START_COL}), _
                ws.Cells({last_task_row}, clearEndCol) _
            ).Font
                .Color = RGB(0, 0, 0)
                .Bold = False
                .Size = 10
            End With

            If lastVisibleCol < {last_timeline_col} Then
                ws.Range( _
                    ws.Cells({month_row}, lastVisibleCol + 1), _
                    ws.Cells({day_row}, {last_timeline_col}) _
                ).Interior.Color = RGB(243, 243, 243)
            End If

            For col = {TIMELINE_START_COL} To lastVisibleCol
                dayValue = ws.Cells({day_row}, col).Value

                isWeekend = IsWeekendDate(CDate(dayValue))
                If isWeekend Then
                    ws.Range(ws.Cells({month_row}, col), ws.Cells({day_row}, col)).Interior.Color = RGB(234, 234, 234)
                    ws.Range(ws.Cells({task_start_row}, col), ws.Cells({last_task_row}, col)).Interior.Color = RGB(234, 234, 234)
                Else
                    ws.Range(ws.Cells({month_row}, col), ws.Cells({day_row}, col)).Interior.Color = RGB(217, 234, 247)
                End If

                With ws.Range(ws.Cells({month_row}, col), ws.Cells(renderEndRow, col))
                    .Borders(xlEdgeLeft).LineStyle = xlContinuous
                    .Borders(xlEdgeLeft).Weight = xlThin
                    .Borders(xlEdgeLeft).Color = RGB(217, 217, 217)
                    .Borders(xlEdgeRight).LineStyle = xlContinuous
                    .Borders(xlEdgeRight).Weight = xlThin
                    .Borders(xlEdgeRight).Color = RGB(217, 217, 217)
                End With

                If IsDate(statusDate) Then
                    If CLng(CDate(dayValue)) = CLng(CDate(statusDate)) Then
                        statusCol = col
                        ws.Range(ws.Cells({weekday_row}, col), ws.Cells({day_row}, col)).Interior.Color = RGB(255, 242, 204)
                    End If
                End If
            Next col

            If statusCol > 0 Then
                ws.Cells({month_row}, statusCol).MergeArea.Interior.Color = RGB(255, 242, 204)
                With ws.Range(ws.Cells({month_row}, statusCol), ws.Cells(renderEndRow, statusCol))
                    .Borders(xlEdgeRight).LineStyle = xlContinuous
                    .Borders(xlEdgeRight).Weight = xlMedium
                    .Borders(xlEdgeRight).Color = RGB(192, 0, 0)
                End With
                If statusCol < lastVisibleCol Then
                    With ws.Range(ws.Cells({month_row}, statusCol + 1), ws.Cells(renderEndRow, statusCol + 1))
                        .Borders(xlEdgeLeft).LineStyle = xlContinuous
                        .Borders(xlEdgeLeft).Weight = xlMedium
                        .Borders(xlEdgeLeft).Color = RGB(192, 0, 0)
                    End With
                End If
            End If

            ws.Range(ws.Cells({task_start_row}, 6), ws.Cells(renderEndRow, {TASK_INPUT_LAST_COL})).Interior.Pattern = xlNone
            With ws.Range(ws.Cells({task_start_row}, 3), ws.Cells(renderEndRow, 3)).Font
                .Bold = False
                .Color = RGB(0, 0, 0)
            End With

            For row = {task_start_row} To lastUsedRow
                aliasText = Trim(CStr(ws.Cells(row, 3).Value))
                progressValue = ws.Cells(row, 7).Value
                stateValue = Trim(CStr(ws.Cells(row, 8).Value))
                startValue = ws.Cells(row, 5).Value
                endValue = ws.Cells(row, 6).Value
                isMilestone = IsYesValue(ws.Cells(row, {MILESTONE_COL}).Value)

                If IsNumeric(progressValue) Then
                    If progressValue >= 1 Then
                        taskColor = RGB(112, 173, 71)
                        ws.Cells(row, 7).Interior.Color = taskColor
                        hasTaskColor = True
                    ElseIf progressValue > 0 Then
                        taskColor = RGB(244, 177, 131)
                        ws.Cells(row, 7).Interior.Color = taskColor
                        hasTaskColor = True
                    Else
                        taskColor = RGB(189, 215, 238)
                        ws.Cells(row, 7).Interior.Color = taskColor
                        hasTaskColor = True
                    End If
                Else
                    ws.Cells(row, 7).Interior.Pattern = xlNone
                    hasTaskColor = False
                End If

                Select Case stateValue
                    Case "Completo"
                        ws.Cells(row, 8).Interior.Color = RGB(112, 173, 71)
                    Case "En progreso"
                        ws.Cells(row, 8).Interior.Color = RGB(244, 177, 131)
                    Case "Pendiente"
                        ws.Cells(row, 8).Interior.Color = RGB(189, 215, 238)
                    Case Else
                        ws.Cells(row, 8).Interior.Pattern = xlNone
                End Select

                For col = {TIMELINE_START_COL} To lastVisibleCol
                    dayValue = ws.Cells({day_row}, col).Value
                    If IsDate(dayValue) Then
                        isWeekend = IsWeekendDate(CDate(dayValue))
                        hasIncident = False
                        If Not isWeekend Then
                            hasIncident = HasResourceIncident(aliasText, CDate(dayValue))
                        End If

                        If IsDate(startValue) And IsDate(endValue) And _
                           isMilestone And CLng(CDate(dayValue)) = CLng(CDate(endValue)) Then
                            ' A milestone is always identified by an icon, even if its
                            ' date coincides with a weekend or a resource absence.
                            ws.Cells(row, col).Value = ChrW(&H2605)
                            With ws.Cells(row, col)
                                .NumberFormat = ";;;@"
                                .Font.Name = "Segoe UI Symbol"
                                .Font.Color = RGB(255, 192, 0)
                                .Font.Bold = True
                                .Font.Size = 10
                                .HorizontalAlignment = xlCenter
                                .VerticalAlignment = xlCenter
                                .ShrinkToFit = True
                            End With
                        ElseIf isWeekend Or hasIncident Then
                            ws.Cells(row, col).Interior.Color = RGB(234, 234, 234)
                        Else
                            ws.Cells(row, col).Interior.Pattern = xlNone
                            If IsDate(startValue) And IsDate(endValue) Then
                                If Not isMilestone And CDate(dayValue) >= CDate(startValue) And CDate(dayValue) <= CDate(endValue) And hasTaskColor Then
                                    ws.Cells(row, col).Interior.Color = taskColor
                                End If
                            End If
                        End If
                    End If
                Next col
            Next row

            For row = {task_start_row} To lastUsedRow
                If Trim(CStr(ws.Cells(row, 3).Value)) <> "" And IsDate(ws.Cells(row, 5).Value) And IsDate(ws.Cells(row, 6).Value) Then
                    For otherRow = row + 1 To lastUsedRow
                        If Trim(CStr(ws.Cells(otherRow, 3).Value)) <> "" And IsDate(ws.Cells(otherRow, 5).Value) And IsDate(ws.Cells(otherRow, 6).Value) Then
                            If SharesAssignedAlias(CStr(ws.Cells(row, 3).Value), CStr(ws.Cells(otherRow, 3).Value)) Then
                                If HasOperationalOverlap( _
                                    CStr(ws.Cells(row, 3).Value), _
                                    CDate(ws.Cells(row, 5).Value), _
                                    CDate(ws.Cells(row, 6).Value), _
                                    CStr(ws.Cells(otherRow, 3).Value), _
                                    CDate(ws.Cells(otherRow, 5).Value), _
                                    CDate(ws.Cells(otherRow, 6).Value) _
                                ) Then
                                    ws.Cells(row, 3).Font.Bold = True
                                    ws.Cells(row, 3).Font.Color = RGB(192, 0, 0)
                                    ws.Cells(otherRow, 3).Font.Bold = True
                                    ws.Cells(otherRow, 3).Font.Color = RGB(192, 0, 0)
                                End If
                            End If
                        End If
                    Next otherRow
                End If
            Next row

            lastRenderedTaskRow = lastUsedRow
            lastRenderedTimelineCol = lastVisibleCol

        CleanUp:
            Application.ScreenUpdating = True
            isRefreshing = False
        End Sub

        Public Sub RefreshReports()
            Dim reportsWs As Worksheet
            Dim ganttWs As Worksheet
            Dim resourcesWs As Worksheet
            Dim incidentsWs As Worksheet
            Dim row As Long
            Dim resourceRow As Long
            Dim outputRow As Long
            Dim totalTasks As Long
            Dim completeTasks As Long
            Dim inProgressTasks As Long
            Dim pendingTasks As Long
            Dim absenceCount As Long
            Dim resourceAbsences As Long
            Dim assignedDays As Double
            Dim weightedProgress As Double
            Dim totalDuration As Double
            Dim durationValue As Double
            Dim progressValue As Double
            Dim projectStart As Variant
            Dim projectEnd As Variant
            Dim statusDate As Variant
            Dim firstAssignment As Variant
            Dim lastAssignment As Variant
            Dim aliasText As String
            Dim taskAliases As String
            Dim stateValue As String
            Dim timeConsumed As Double

            On Error GoTo CleanUp
            Application.ScreenUpdating = False
            Application.EnableEvents = False

            Set reportsWs = ThisWorkbook.Worksheets("Informes")
            Set ganttWs = ThisWorkbook.Worksheets("Gantt")
            Set resourcesWs = ThisWorkbook.Worksheets("Recursos")
            Set incidentsWs = ThisWorkbook.Worksheets("Ausencias")

            projectStart = ganttWs.Range("{CONFIG_START_DATE}").Value
            projectEnd = ganttWs.Range("{CONFIG_VISIBLE_END}").Value
            statusDate = ganttWs.Range("{CONFIG_STATUS_DATE}").Value
            If Not IsDate(statusDate) Then statusDate = Date

            For row = {task_start_row} To {last_task_row}
                If Trim(CStr(ganttWs.Cells(row, 2).Value)) <> "" Then
                    totalTasks = totalTasks + 1
                    durationValue = 0
                    progressValue = 0
                    If IsNumeric(ganttWs.Cells(row, 4).Value) Then durationValue = CDbl(ganttWs.Cells(row, 4).Value)
                    If IsNumeric(ganttWs.Cells(row, 7).Value) Then progressValue = CDbl(ganttWs.Cells(row, 7).Value)
                    If progressValue < 0 Then progressValue = 0
                    If progressValue > 1 Then progressValue = 1
                    totalDuration = totalDuration + durationValue
                    weightedProgress = weightedProgress + (durationValue * progressValue)

                    stateValue = Trim(CStr(ganttWs.Cells(row, 8).Value))
                    If StrComp(stateValue, "Completo", vbTextCompare) = 0 And _
                       Not IsDate(ganttWs.Cells(row, {ACTUAL_CLOSE_COL}).Value) Then
                        ganttWs.Cells(row, {ACTUAL_CLOSE_COL}).Value = Date
                        ganttWs.Cells(row, {ACTUAL_CLOSE_COL}).NumberFormat = "dd/mm/yyyy"
                    End If

                    If IsDate(ganttWs.Cells(row, {ACTUAL_CLOSE_COL}).Value) And _
                       CDate(ganttWs.Cells(row, {ACTUAL_CLOSE_COL}).Value) <= CDate(statusDate) Then
                        completeTasks = completeTasks + 1
                    ElseIf StrComp(stateValue, "En progreso", vbTextCompare) = 0 Or progressValue > 0 Then
                        inProgressTasks = inProgressTasks + 1
                    Else
                        pendingTasks = pendingTasks + 1
                    End If

                    If IsDate(ganttWs.Cells(row, 5).Value) Then
                        If Not IsDate(projectStart) Or CDate(ganttWs.Cells(row, 5).Value) < CDate(projectStart) Then
                            projectStart = ganttWs.Cells(row, 5).Value
                        End If
                    End If
                    If IsDate(ganttWs.Cells(row, 6).Value) Then
                        If Not IsDate(projectEnd) Or CDate(ganttWs.Cells(row, 6).Value) > CDate(projectEnd) Then
                            projectEnd = ganttWs.Cells(row, 6).Value
                        End If
                    End If
                End If
            Next row

            For row = 3 To 202
                If Trim(CStr(incidentsWs.Cells(row, 1).Value)) <> "" And IsDate(incidentsWs.Cells(row, 2).Value) Then
                    absenceCount = absenceCount + 1
                End If
            Next row

            If IsDate(projectStart) And IsDate(projectEnd) And IsDate(statusDate) Then
                If CDate(projectEnd) > CDate(projectStart) Then
                    timeConsumed = (CDbl(CDate(statusDate)) - CDbl(CDate(projectStart))) / _
                        (CDbl(CDate(projectEnd)) - CDbl(CDate(projectStart)))
                    If timeConsumed < 0 Then timeConsumed = 0
                    If timeConsumed > 1 Then timeConsumed = 1
                End If
            End If

            reportsWs.Range("B4").Value = projectStart
            reportsWs.Range("B5").Value = projectEnd
            reportsWs.Range("B6").Value = statusDate
            reportsWs.Range("B7").Value = timeConsumed
            If totalDuration > 0 Then
                reportsWs.Range("B8").Value = weightedProgress / totalDuration
            Else
                reportsWs.Range("B8").Value = 0
            End If
            reportsWs.Range("B9").Value = totalTasks
            reportsWs.Range("B10").Value = completeTasks
            reportsWs.Range("B11").Value = absenceCount
            reportsWs.Range("B4:B6").NumberFormat = "dd/mm/yyyy"
            reportsWs.Range("B7:B8").NumberFormat = "0%"

            reportsWs.Range("A15:D214").ClearContents
            reportsWs.Range("I15:J214").ClearContents
            reportsWs.Range("B14").Value = "Jornadas"
            outputRow = 15

            For resourceRow = 3 To 202
                aliasText = Trim(CStr(resourcesWs.Cells(resourceRow, 2).Value))
                If aliasText <> "" Then
                    assignedDays = 0
                    firstAssignment = Empty
                    lastAssignment = Empty
                    resourceAbsences = 0

                    For row = {task_start_row} To {last_task_row}
                        taskAliases = Trim(CStr(ganttWs.Cells(row, 3).Value))
                        If SharesAssignedAlias(aliasText, taskAliases) Then
                            If IsNumeric(ganttWs.Cells(row, 4).Value) Then assignedDays = assignedDays + CDbl(ganttWs.Cells(row, 4).Value)
                            If IsDate(ganttWs.Cells(row, 5).Value) Then
                                If Not IsDate(firstAssignment) Or CDate(ganttWs.Cells(row, 5).Value) < CDate(firstAssignment) Then
                                    firstAssignment = ganttWs.Cells(row, 5).Value
                                End If
                            End If
                            If IsDate(ganttWs.Cells(row, 6).Value) Then
                                If Not IsDate(lastAssignment) Or CDate(ganttWs.Cells(row, 6).Value) > CDate(lastAssignment) Then
                                    lastAssignment = ganttWs.Cells(row, 6).Value
                                End If
                            End If
                        End If
                    Next row

                    For row = 3 To 202
                        If StrComp(Trim(CStr(incidentsWs.Cells(row, 1).Value)), aliasText, vbTextCompare) = 0 And _
                           IsDate(incidentsWs.Cells(row, 2).Value) Then
                            resourceAbsences = resourceAbsences + 1
                        End If
                    Next row

                    reportsWs.Cells(outputRow, 1).Value = aliasText
                    reportsWs.Cells(outputRow, 2).Value = assignedDays
                    If IsDate(firstAssignment) Then reportsWs.Cells(outputRow, 3).Value = firstAssignment
                    If IsDate(lastAssignment) Then reportsWs.Cells(outputRow, 4).Value = lastAssignment
                    reportsWs.Cells(outputRow, 9).Value = aliasText
                    reportsWs.Cells(outputRow, 10).Value = resourceAbsences
                    outputRow = outputRow + 1
                End If
            Next resourceRow

            reportsWs.Range("C15:D214").NumberFormat = "dd/mm/yyyy"
            reportsWs.Range("G15").Value = completeTasks
            reportsWs.Range("G16").Value = inProgressTasks
            reportsWs.Range("G17").Value = pendingTasks
            reportsWs.Range("M2").Value = 0
            reportsWs.Range("M3").Value = timeConsumed
            reportsWs.Range("M4").Value = 1
            reportsWs.Range("N2").Value = 0
            reportsWs.Range("N3").Value = reportsWs.Range("B8").Value
            reportsWs.Range("N4").Value = 1
            reportsWs.Calculate

        CleanUp:
            Application.EnableEvents = True
            Application.ScreenUpdating = True
            If Err.Number <> 0 Then
                MsgBox "No se pudieron actualizar los informes: " & Err.Description, vbExclamation, "Informes"
            End If
        End Sub
        """
    ).strip()


def workbook_event_code() -> str:
    return textwrap.dedent(
        f"""
        Option Explicit

        Private Sub Workbook_Open()
            On Error Resume Next
            Application.EnableEvents = False
            RefreshEntireGantt
            Application.EnableEvents = True
        End Sub
        """
    ).strip()

def gantt_sheet_event_code(task_start_row: int = TASK_START_ROW) -> str:
    last_task_row = task_start_row + MAX_TASKS - 1
    return textwrap.dedent(
        f"""
        Option Explicit

        Private Sub Worksheet_Change(ByVal Target As Range)
            Dim changedRange As Range
            Dim taskChangedRange As Range
            Dim changedCell As Range
            Dim rowNumber As Long
            Dim minimumTaskRow As Long
            Dim calendarChanged As Boolean

            On Error GoTo CleanUp
            If Intersect(Target, Me.Range("B2:B3,D2:D3,C{task_start_row}:N{last_task_row}")) Is Nothing Then Exit Sub

            Application.EnableEvents = False

            If Not Intersect(Target, Me.Range("B2:B3,D2")) Is Nothing Then
                SyncVisibleRange Me, Target.Cells(1, 1).Address(False, False)
                calendarChanged = True
            End If

            Set changedRange = Intersect(Target, Me.Range("C{task_start_row}:N{last_task_row}"))
            If Not changedRange Is Nothing Then
                For Each changedCell In changedRange.Cells
                    rowNumber = changedCell.Row
                    If rowNumber >= {task_start_row} And rowNumber <= {last_task_row} Then
                        If changedCell.Column = 3 Or changedCell.Column = 4 Or changedCell.Column = 5 Then
                            UpdateTaskEndFromDuration Me, rowNumber
                        ElseIf changedCell.Column = 6 Then
                            UpdateTaskDurationFromDates Me, rowNumber
                        ElseIf changedCell.Column = 8 Then
                            UpdateTaskClosureDate Me, rowNumber
                        ElseIf changedCell.Column = {MILESTONE_COL} Then
                            ApplyMilestoneRule Me, rowNumber
                            UpdateTaskEndFromDuration Me, rowNumber
                        End If
                    End If
                Next changedCell
            End If

            Set taskChangedRange = Intersect(Target, Me.Range("C{task_start_row}:N{last_task_row}"))
            If Not taskChangedRange Is Nothing Then
                For Each changedCell In taskChangedRange.Cells
                    If changedCell.Row > minimumTaskRow Then minimumTaskRow = changedCell.Row
                Next changedCell
            End If

            If calendarChanged Then
                RefreshGanttMonthHeaders Me
            End If
            RefreshGanttWeekendColumns minimumTaskRow, Me

        CleanUp:
            Application.EnableEvents = True
        End Sub

        """
    ).strip()


def incidents_sheet_event_code(task_start_row: int = TASK_START_ROW) -> str:
    last_task_row = task_start_row + MAX_TASKS - 1
    return textwrap.dedent(
        f"""
        Option Explicit

        Private Sub Worksheet_Change(ByVal Target As Range)
            Dim changedCell As Range
            Dim rowNumber As Long
            Dim mustRefresh As Boolean
            Dim ganttWs As Worksheet

            On Error GoTo CleanUp
            If Intersect(Target, Me.Range("A3:C202")) Is Nothing Then Exit Sub

            Application.EnableEvents = False

            If Not Intersect(Target, Me.Range("B3:B202")) Is Nothing Then
                mustRefresh = True
            ElseIf Not Intersect(Target, Me.Range("A3:A202")) Is Nothing Then
                For Each changedCell In Intersect(Target, Me.Range("A3:A202")).Cells
                    rowNumber = changedCell.Row
                    If Trim(CStr(Me.Cells(rowNumber, 2).Value)) <> "" Then
                        mustRefresh = True
                        Exit For
                    End If
                Next changedCell
            End If

            If mustRefresh Then
                For Each ganttWs In ThisWorkbook.Worksheets
                    If IsGanttWorksheet(ganttWs) Then
                        For rowNumber = {task_start_row} To {last_task_row}
                            If Trim(CStr(ganttWs.Cells(rowNumber, 3).Value)) <> "" Then
                                UpdateTaskEndFromDuration ganttWs, rowNumber
                            End If
                        Next rowNumber
                        RefreshGanttWeekendColumns 0, ganttWs
                    End If
                Next ganttWs
            End If

        CleanUp:
            Application.EnableEvents = True
        End Sub
        """
    ).strip()


def update_xlsm_macro_code(workbook_path: Path, *, template_layout: bool = False) -> None:
    if template_layout:
        module_code = macro_module_code(
            month_row=TEMPLATE_MONTH_ROW,
            weekday_row=TEMPLATE_WEEKDAY_ROW,
            day_row=TEMPLATE_DAY_ROW,
            task_start_row=TEMPLATE_TASK_START_ROW,
        )
        sheet_code = gantt_sheet_event_code(task_start_row=TEMPLATE_TASK_START_ROW)
        incidents_code = incidents_sheet_event_code(task_start_row=TEMPLATE_TASK_START_ROW)
    else:
        module_code = macro_module_code()
        sheet_code = gantt_sheet_event_code()
        incidents_code = incidents_sheet_event_code()

    ps_script = f"""param(
    [string]$WorkbookPath
)

$ErrorActionPreference = "Stop"

$moduleCode = @'
{module_code}
'@

$workbookCode = @'
{workbook_event_code()}
'@

$sheetCode = @'
{sheet_code}
'@

$incidentsSheetCode = @'
{incidents_code}
'@

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {{
    $workbook = $excel.Workbooks.Open($WorkbookPath)
    $components = $workbook.VBProject.VBComponents
    $module = $null

    try {{
        $module = $components.Item("GanttAutomation")
    }} catch {{
        $module = $components.Add(1)
        $module.Name = "GanttAutomation"
    }}

    if ($module.CodeModule.CountOfLines -gt 0) {{
        $module.CodeModule.DeleteLines(1, $module.CodeModule.CountOfLines)
    }}
    $module.CodeModule.AddFromString($moduleCode)

    $thisWorkbook = $components.Item("ThisWorkbook")
    if ($thisWorkbook.CodeModule.CountOfLines -gt 0) {{
        $thisWorkbook.CodeModule.DeleteLines(1, $thisWorkbook.CodeModule.CountOfLines)
    }}
    $thisWorkbook.CodeModule.AddFromString($workbookCode)

    $ganttSheet = $workbook.Worksheets.Item("Gantt")
    $sheetModule = $components.Item($ganttSheet.CodeName)
    if ($sheetModule.CodeModule.CountOfLines -gt 0) {{
        $sheetModule.CodeModule.DeleteLines(1, $sheetModule.CodeModule.CountOfLines)
    }}
    $sheetModule.CodeModule.AddFromString($sheetCode)

    $incidentsSheet = $workbook.Worksheets.Item("Ausencias")
    $incidentsModule = $components.Item($incidentsSheet.CodeName)
    if ($incidentsModule.CodeModule.CountOfLines -gt 0) {{
        $incidentsModule.CodeModule.DeleteLines(1, $incidentsModule.CodeModule.CountOfLines)
    }}
    $incidentsModule.CodeModule.AddFromString($incidentsSheetCode)

    $workbook.Save()
    $workbook.Close($false)
}}
finally {{
    if ($null -ne $excel) {{
        $excel.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    }}
}}
"""

    with tempfile.TemporaryDirectory() as temp_dir:
        script_path = Path(temp_dir) / "update_xlsm_macros.ps1"
        script_path.write_text(ps_script, encoding="utf-8")
        result = subprocess.run(
            [
                "powershell",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(script_path),
                str(workbook_path),
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            raise RuntimeError(
                result.stderr.strip()
                or result.stdout.strip()
                or "No se pudo actualizar el codigo VBA del archivo XLSM."
            )


def convert_to_xlsm_with_macro(source_xlsx: Path, output_xlsm: Path) -> None:
    ps_script = f"""param(
    [string]$InputPath,
    [string]$OutputPath
)

$ErrorActionPreference = "Stop"

$moduleCode = @'
{macro_module_code()}
'@

$workbookCode = @'
{workbook_event_code()}
'@

$sheetCode = @'
{gantt_sheet_event_code()}
'@

$incidentsSheetCode = @'
{incidents_sheet_event_code()}
'@

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {{
    $workbook = $excel.Workbooks.Open($InputPath)
    $module = $workbook.VBProject.VBComponents.Add(1)
    $module.Name = "GanttAutomation"
    $module.CodeModule.AddFromString($moduleCode)

    $thisWorkbook = $workbook.VBProject.VBComponents.Item("ThisWorkbook")
    if ($thisWorkbook.CodeModule.CountOfLines -gt 0) {{
        $thisWorkbook.CodeModule.DeleteLines(1, $thisWorkbook.CodeModule.CountOfLines)
    }}
    $thisWorkbook.CodeModule.AddFromString($workbookCode)

    $ganttSheet = $workbook.Worksheets.Item("Gantt")
    $sheetModule = $workbook.VBProject.VBComponents.Item($ganttSheet.CodeName)
    if ($sheetModule.CodeModule.CountOfLines -gt 0) {{
        $sheetModule.CodeModule.DeleteLines(1, $sheetModule.CodeModule.CountOfLines)
    }}
    $sheetModule.CodeModule.AddFromString($sheetCode)

    $incidentsSheet = $workbook.Worksheets.Item("Ausencias")
    $incidentsModule = $workbook.VBProject.VBComponents.Item($incidentsSheet.CodeName)
    if ($incidentsModule.CodeModule.CountOfLines -gt 0) {{
        $incidentsModule.CodeModule.DeleteLines(1, $incidentsModule.CodeModule.CountOfLines)
    }}
    $incidentsModule.CodeModule.AddFromString($incidentsSheetCode)

    $workbook.SaveAs($OutputPath, 52)
    $workbook.Close($false)
}}
finally {{
    if ($null -ne $excel) {{
        $excel.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    }}
}}
"""

    with tempfile.TemporaryDirectory() as temp_dir:
        script_path = Path(temp_dir) / "inject_macro.ps1"
        script_path.write_text(ps_script, encoding="utf-8")
        result = subprocess.run(
            [
                "powershell",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(script_path),
                str(source_xlsx),
                str(output_xlsm),
            ],
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or result.stdout.strip() or "No se pudo generar el archivo XLSM.")
        if not output_xlsm.exists():
            raise RuntimeError(
                "Excel devolvio una generacion correcta, pero el archivo XLSM no se ha creado en disco."
            )


def main() -> None:
    args = parse_args()
    project_start = parse_iso_date(args.fecha_inicio)

    tasks = normalize_tasks(DEFAULT_TASKS)
    resources = DEFAULT_RESOURCES
    incidents = DEFAULT_INCIDENTS
    output_path = build_output_path(args.salida)
    if not output_path.parent.exists():
        output_path.parent.mkdir(parents=True, exist_ok=True)

    if output_path.suffix.lower() == ".xlsm":
        create_xlsm_from_template(output_path, project_start, args.semanas, tasks, resources, incidents)
    else:
        workbook = create_workbook(project_start, args.semanas, tasks, resources)
        workbook.save(output_path)
    if not output_path.exists():
        raise RuntimeError(f"El fichero de salida no existe en disco: {output_path}")
    print(f"Archivo generado en: {output_path}")


if __name__ == "__main__":
    main()
