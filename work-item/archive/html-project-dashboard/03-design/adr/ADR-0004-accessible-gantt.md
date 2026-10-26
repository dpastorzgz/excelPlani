# ADR-0004 — Gantt accesible con HTML semántico y SVG

- **Status**: Accepted
- **Date**: 2026-10-25
- **Deciders**: User, Agent
- **Context**: Cuadro de mando HTML para planificación de proyectos

## 1. Problem

El Gantt debe manejar hasta 1.000 tareas, permitir navegación y escalas, ser accesible por teclado y producir una presentación clara sin depender de una librería online.

## 2. Decision drivers

- WCAG 2.2 AA aplicable.
- Alineación exacta entre lista y línea temporal.
- Control de rendimiento, estilo y exportación.
- Offline y ausencia de dependencias de charts adicionales.

## 3. Considered options

1. Librería Gantt externa completa.
2. Canvas único para todo el Gantt.
3. Lista/tabla HTML semántica sincronizada con SVG.

## 4. Decision

Usar controles y filas HTML semánticas para lectura/foco y una única superficie SVG horizontal para cabecera, cuadrícula, barras, hitos y línea de control. Cada fila ofrece un botón de detalle accesible; el gráfico equivalente no duplica el foco. Lista y SVG comparten filas de 48 px, sin scroll vertical independiente, y el `hover` o foco resaltan la fila completa.

La cabecera tendrá una banda superior anual gris oscuro y celdas de periodo gris claro. Día y semana usarán `DD/MM`, mes usará nombres castellanos y día reservará al menos 52 px. La fecha de control será una línea vertical roja discontinua a través de cabecera y tareas. Carga, filtrado y cambio de escala posicionarán la vista en la primera tarea sin botón «Ajustar a tareas».

## 5. Consequences

### Positive

- Semántica, foco y textos quedan bajo control del proyecto.
- SVG facilita escalas nítidas y reutilización en exportación.
- Menor peso y superficie de dependencia.

### Negative

- El proyecto debe implementar layout, desplazamiento horizontal y navegación coherentes en una única superficie temporal.
- La accesibilidad requiere pruebas manuales además de axe-core.

## 6. Links / Evidence

- Design: §§3 CMP-05, 6 FL-03, 7.
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
