# ADR-0003 — Modelo de dominio date-only independiente del workbook

- **Status**: Accepted
- **Date**: 2026-10-23
- **Deciders**: User, Agent
- **Context**: Cuadro de mando HTML para planificación de proyectos

## 1. Problem

Las reglas históricas deben ser reproducibles y no pueden depender de zonas horarias, celdas Excel, DOM o valores actuales usados como sustituto de fechas pasadas.

## 2. Decision drivers

- Exactitud de “completada a fecha” y “retrasada a fecha”.
- Pruebas unitarias deterministas.
- Un único conjunto filtrado para KPIs, Gantt y exportación.
- Ausencia de snapshots y persistencia.

## 3. Considered options

1. Calcular directamente desde celdas en cada vista.
2. Mantener objetos `Date` con horas/UTC.
3. Normalizar a entidades date-only y funciones puras.

## 4. Decision

Usar cadenas canónicas `YYYY-MM-DD` validadas para fechas de negocio. CMP-03 contiene funciones puras y CMP-04 conserva un store in-memory unidireccional. La fecha objetivo es `baselineEnd ?? plannedEnd`; la completitud histórica exige `actualClose`.

## 5. Consequences

### Positive

- Sin desplazamientos de día por zona horaria.
- Reglas trazables, testeables y compartidas por todas las salidas.
- Errores de datos no se convierten silenciosamente en ceros.

### Negative

- Se necesita una capa explícita de conversión de seriales Excel.
- No se representan horas, que quedan fuera del alcance del plan diario.

## 6. Links / Evidence

- Design: §§3 CMP-03/04, 4, 6 FL-02.
- Specs: Definitions and business rules §1.1.
