# Framework Proposal v1.4 — Epic Split & Sizing Gates

**Date**: 2026-09-08
**Author**: Axet Agent (revisión a petición del operador)
**Previous version**: `framework/improvements/framework-assessment-v1.3.md`
**Status**: Implemented on branch `feature/SubWorkItemImprovements` — decisiones §9 confirmadas por el operador y cambios aplicados en el framework.
**Scope**: Assessment y registro de decisiones de la implementación v1.4. Los cambios normativos se encuentran en los workflows, templates, gates, skills y configuraciones referenciados en este documento.

---

## 1. Executive Summary

El framework actual (v1.3) asume que todo `work-item/[slug]/` es una unidad monolítica que recorre las 10 fases de forma lineal. No existe:

1. ningún **gate de tamaño** que obligue al agente a evaluar si una feature es "muy grande";
2. ningún concepto de **epic padre + sub-work-items hijos**;
3. ninguna regla de **orden entre work-items** (ej. modelo de datos antes que LWC).

Consecuencia: si el usuario pasa una feature grande, el agente la acepta sin cuestionarla, genera un `specs.md` con 30 FRs, un `design.md` con 10 componentes y un `task-list.md` con 50 tasks, y el build se vuelve inabarcable, sin trazabilidad por entregas y sin posibilidad de paralelizar o priorizar por waves.

**Propuesta v1.4 (enfoque aprobado: epic ligero + sizing gates + waves tech):**

- Añadir **sizing gates** `QG1.8 / QG2.9 / QG3.9 / QG4.8` con umbrales cuantitativos. Regla "2 de 4 = split obligatorio salvo override explícito, 1 de 4 = recomendación".
- Introducir **epic ligero**: el epic solo recorre Fase 1–2 (proposal + specs con *domain slicing*); el detalle de diseño/build/testing vive en N hijos `new-feature` normales. El epic persiste un único fichero nuevo: `work-item/[epic-slug]/epic-map.yml` (hijos, dependencias, waves).
- Definir **orden tecnológico por waves** con regla de entrada a Build (ningún hijo Wave N entra en Fase 5 si sus dependencias no están en ≥ Fase 7), con tabla específica Salesforce (modelo → Apex/Flow → UI → permisos → release) y tabla genérica para otros stacks.
- Extensiones mínimas a `active.yml`, `work-item/README.md` (registry), `context-routing.yml` y `phase-approval.yml` para soportar jerarquía sin reescribir el ciclo.
- Nuevo skill `framework/skills/epic-decomposition/skill.md` + sección `Sizing & Split Decision` en los 4 templates de intake/diseño/tasks.
- Incluir 3 fixes menores detectados en la revisión (contradicción S/M/L, path `archive/`, `_evidence/` ausente en la estructura documentada).

Lo que **no** incluye esta propuesta: scaffolding automático por script, UI de visualización del DAG, ni cambios en `technology-rules/salesforce/` más allá de la tabla de waves.

---

## 2. Problem Statement & Evidence

### 2.1 Sin gate de tamaño

| Fase | Artefacto | Lo que hoy se mide | Lo que falta |
| ---- | --------- | ------------------ | ------------ |
| 1 | `01-proposal/proposal.md` (`framework/templates/proposal.md`) | QG1.1–QG1.7: título, stakeholder, valor, constraints, open questions, scope de artefactos, aprobación | Nº de capacidades in-scope, nº de dominios funcionales |
| 2 | `02-specs/specs.md` (`framework/templates/specs.md`) | QG2.1–QG2.8: FRs numerados, NFRs, UCs, integraciones, verificabilidad | Nº de FRs / P1 / UCs |
| 3 | `03-design/design.md` (`framework/templates/design.md`) | QG3.1–QG3.8: diagrama, componentes, modelo, integraciones, ADRs, alineación | Nº de `CMP-*`, nº de integraciones externas |
| 4 | `04-tasks/task-list.md` (`framework/templates/task-list.md`) | QG4.1–QG4.7: atomicidad, cobertura 100%, dependencias, estimación S/M/L | Nº total de tasks, esfuerzo acumulado, nº de L |

Referencia de gates: `framework/rules/quality-gates.md:29-76`. Ninguno bloquea por tamaño.

### 2.2 Sin jerarquía

- `framework/templates/active.yml:1-45` no tiene campos `type`, `parent_epic`, `depends_on`, `wave`.
- `work-item/README.md:22` es tabla plana sin columnas `Type/Parent/Wave`.
- `framework/rules/phase-transitions.md:147-156` solo define rollbacks intra-work-item.
- `docs/OPERATOR-GUIDE.md:157` menciona crear un work-item nuevo que referencie a un archivado, sin campo formal.

### 2.3 Sin orden tech

`framework/skills/architecture-design/skill.md:33-44` define capas genéricas (presentation/application/domain/infrastructure) pero no orden de construcción por stack. Nada impide que el agente construya el LWC antes que el objeto custom del que depende.

### 2.4 Fixes menores confirmados

1. **Contradicción S/M/L**: `framework/skills/task-decomposition/skill.md:20` (`S<30min/M30-90/L90-120`) vs `framework/templates/task-list.md:22` (`S<2h/M2-8h/L>8h`). Bloquea usar esfuerzo como umbral hasta unificar.
2. **Path archive**: `work-item/README.md:17-18` dice "moved to the top-level `archive/`" pero el resto del framework (`README.md`, `framework/rules/core.md §10`, `docs/OPERATOR-GUIDE.md:140`) usa `work-item/archive/[slug]/`.
3. **`_evidence/` fantasma**: `framework/rules/evidence.md:20` define `work-item/[slug]/_evidence/phase-01..10/` pero `work-item/README.md:37-63` y `docs/OPERATOR-GUIDE.md:27-40` no lo listan.

---

## 3. Sizing Gates (propuesta normativa)

### 3.1 Umbrales recomendados

| Gate nuevo | Dónde se evalúa | Umbral que dispara split | Severidad |
| ---------- | --------------- | ------------------------ | --------- |
| QG1.8 | Fase 1 closeout (`proposal.md` / `cr-intake.md`) | >5–6 capacidades in-scope **o** ≥3 dominios funcionales independientes | Recomendación |
| QG2.9 | Fase 2 closeout (`specs.md`) | >12–15 FRs **o** >5 P1 **o** >4 UCs | Recomendación → obligatoria si coincide con otro gate |
| QG3.9 | Fase 3 closeout (`design.md`) | >5–6 `CMP-*` **o** >2 integraciones externas | Recomendación → obligatoria si coincide con otro gate |
| QG4.8 | Fase 4 closeout (`task-list.md`) | >20 tasks **o** >40h estimadas **o** >5 tasks L (tras unificar S/M/L) | Bloqueante |

**Regla de decisión (a añadir en `framework/rules/quality-gates.md` y en cada workflow 01–04):**

- **0 gates de sizing disparados** → continuar como monolito.
- **1 gate disparado** → el agente presenta `Sizing & Split Decision` con recomendación de split (no bloquea; el usuario puede aceptar monolito con justificación registrada).
- **≥2 gates disparados** → split **obligatorio**: la fase no puede cerrar como monolito salvo override explícito del usuario con justificación escrita en el artefacto (aplica `No descope-to-green`: no vale recortar scope en silencio para pasar el gate).

### 3.2 Sección `Sizing & Split Decision` (nueva, en los 4 templates)

Añadir al final de `proposal.md`, `specs.md`, `design.md` y `task-list.md`, antes de `Approval`:

```markdown
## Sizing & Split Decision

- Métricas: FRs=__, P1=__, UCs=__, CMP=__, integraciones=__, tasks=__, esfuerzo_est=__h, dominios=__
- Gates de sizing disparados: QG__ / ninguno
- Decisión: monolito | epic-split
- Si epic-split → epic-slug propuesto + estrategia de corte (dominio | riesgo | capa-tech) + nº de hijos estimado:
- Justificación / override (si se continúa como monolito con gates disparados):
```

Esta sección es la evidencia auditable de QG1.8/QG2.9/QG3.9/QG4.8.

### 3.3 Estrategias de corte (orden de preferencia)

1. **Por dominio funcional** (preferida): cada hijo es un bounded context entregable (ej. `facturacion`, `aprobaciones`, `portal`).
2. **Por riesgo/valor**: núcleo primero (modelo + reglas críticas), periferia después.
3. **Por capa tech** (último recurso, solo si el dominio no se puede aislar): ver §4; genera dependencias fuertes entre hijos y obliga a waves estrictas.

---

## 4. Orden Lógico por Tecnología (requisito del operador)

### 4.1 Modelo: waves + regla de entrada

- Cada hijo declara `wave: N` y `depends_on: [slugs]` en `epic-map.yml` y en su `active.yml`.
- Hijos de la misma wave pueden correr en **paralelo**; entre waves, **secuencial**.
- **Regla de entrada a Build**: un hijo Wave N no puede entrar en Fase 5 si alguna dependencia no está en **≥ Fase 7 con QG7.x en `Passed`** (testeada). Para entrar en Fase 9 (release), las dependencias deben estar en **≥ Fase 9**.
- Para Fase 3 (diseño) del hijo basta con que la dependencia tenga diseño aprobado (≥ Fase 3), porque el contrato ya es estable.
- El agente debe validar el DAG al crear/actualizar `epic-map.yml`: sin ciclos, sin dependencias a slugs inexistentes, sin wave inferior que dependa de wave superior.

### 4.2 Tabla de waves Salesforce (normativa para `technology-rules/salesforce/`)

| Wave | Contenido | Depende de | Ejemplo |
| ---- | --------- | ---------- | ------- |
| 0 | Modelo: objetos, campos, External ID / índices, sharing base (OWD) | — | `epic-cpq-modelo` |
| 1 | Lógica servidor: Apex services, triggers/handlers, Flows backend | Wave 0 | `epic-cpq-pricing-srv` |
| 2 | Automatización cross-objeto / aprobaciones | Waves 0–1 | `epic-cpq-approvals` |
| 3 | UI: LWC, pantallas, navegación | Waves 0–1 | `epic-cpq-lwc-cart` |
| 4 | Seguridad e integraciones: permsets/profiles, sharing rules, API contracts | Waves 0–3 | `epic-cpq-permisos` |
| 5 | Datos, `package.xml`, release y smoke | Todo ≥ Fase 7 | `epic-cpq-release` |

Caso del operador: "work-item que crea modelo y otro que define un LWC que lo usa" → modelo Wave 0, LWC Wave 3, `depends_on: [modelo-slug]`; el LWC no entra en Build hasta que el modelo esté testeado.

### 4.3 Tabla genérica (para otros stacks vía `technology-rules/_template/`)

| Wave | Contenido |
| ---- | --------- |
| 0 | Esquema / migraciones / contratos de datos |
| 1 | Servicios backend / lógica de dominio |
| 2 | Workers / automatización / integraciones |
| 3 | Frontend / clientes |
| 4 | AuthZ / permisos / observabilidad |
| 5 | Seeds, empaquetado, release |

---

## 5. Modelo Epic Ligero (cambios propuestos, no aplicados)

### 5.1 Ciclo de vida

```
Epic (Fase 1 proposal + Fase 2 specs con domain slicing)
  │  produce epic-map.yml + specs por dominio
  ├─→ hijo-01 new-feature (10 fases completas, wave 0)
  ├─→ hijo-02 new-feature (10 fases completas, wave 1, depends_on: hijo-01)
  └─→ hijo-03 new-feature (10 fases completas, wave 3, depends_on: hijo-01)
Epic cierra (Fase 10 retrospectiva agregada) cuando todos los hijos están en work-item/archive/.
```

El epic **no** recorre Fases 3–9 propias (se registran como `Skipped — delegated to children` en su `active.yml:phases_skipped` con evidencia `epic-map.yml`). Esto evita la doble burocracia del enfoque B descartado.

### 5.2 Nuevo artefacto `epic-map.yml`

Ubicación: `work-item/[epic-slug]/epic-map.yml` (único fichero nuevo obligatorio del epic, además de proposal/specs). Ejemplo:

```yaml
# epic-map.yml — Single source of truth del epic (propuesta v1.4)
epic: epic-cpq-cart
strategy: dominio  # dominio | riesgo | capa-tech
children:
  - slug: epic-cpq-cart-modelo
    wave: 0
    depends_on: []
    scope: "Objetos, campos, External IDs, OWD base"
    status: active  # espejo operativo; la verdad canónica sigue en cada active.yml
  - slug: epic-cpq-cart-pricing
    wave: 1
    depends_on: [epic-cpq-cart-modelo]
    scope: "Servicios Apex de pricing"
    status: planned
  - slug: epic-cpq-cart-lwc
    wave: 3
    depends_on: [epic-cpq-cart-modelo]
    scope: "LWC del carrito sobre el modelo"
    status: planned
```

Validaciones del agente al escribirlo: DAG acíclico, slugs kebab-case existentes o `planned` con justificación, ninguna wave inferior dependiendo de wave superior.

### 5.3 Extensión `active.yml` (aditiva, compatible)

```yaml
# Añadir al final de framework/templates/active.yml (todo opcional salvo type):
type: epic  # epic | feature | change | hotfix-child (default: feature)
parent_epic: null  # slug del epic si type != epic
depends_on: []     # slugs de los que depende (solo hijos)
wave: 0            # entero >= 0 (solo hijos)
```

`track:` se mantiene (`new-feature` para hijos aunque tengan padre; el padre también `new-feature` con `type: epic`). No se crea un track nuevo para minimizar el cambio en `AGENT.md`, `core.md` y `phase-skips.yml`.

### 5.4 Registry `work-item/README.md`

Añadir columnas `Type | Parent | Wave`:

```markdown
| Slug | Name | Technology | Type | Parent | Wave | Current Phase | Status | Last Updated |
```

### 5.5 Trazabilidad a nivel epic

- El epic mantiene `02-specs/traceability-matrix.md` agregada: `Epic-FR → hijo(s) → CMP → tasks → tests` (los hijos mantienen la suya local; el epic solo mapea Epic-FR → hijo).
- Phase 6 del hijo referencia su fila; la retrospectiva del epic verifica cobertura 100% de Epic-FRs.

---

## 6. Cambios de Configuración y Skills (propuesta)

### 6.1 `framework/config/context-routing.yml`

- Epic Fases 1–2: cargar además `framework/skills/epic-decomposition/skill.md` (nuevo) y `framework/templates/epic-map.yml`.
- Hijo cualquier fase: cargar siempre `work-item/[parent-epic]/epic-map.yml` + los `design.md`/`specs.md` de sus `depends_on` (solo lectura, para contratos). Añadir regla: "un hijo nunca edita artefactos de otro work-item".

### 6.2 `framework/config/phase-approval.yml`

- Scaffolding de hijos (crear carpetas + `active.yml` + `README.md` desde el epic) en `automatic` con notice (evita N aprobaciones mecánicas).
- Resto de transiciones de hijos: `human`, pero **aprobación por wave** (un closeout agregado por wave en el epic) en lugar de fase×hijo cuando el operador lo autorice explícitamente. Sin autorización, se mantiene 1:1.

### 6.3 `framework/config/phase-skips.yml`

- Epic: `skip_overrides` 3–9 `allowed: true` con evidencia `epic-map.yml existe y delega a hijos` (requiere confirmación del usuario una vez, no por fase).
- Hijos: sin overrides nuevos (ciclo completo). `hotfix` nunca puede ser hijo de epic (los hotfixes siguen entrando en Fase 4 standalone).

### 6.4 Nuevo skill `framework/skills/epic-decomposition/skill.md`

Contenido mínimo: (a) cómo hacer *domain slicing* desde `specs.md` (heurística: agrupar FRs por entidad/actor/ciclo de vida común); (b) cómo asignar waves según §4.2/§4.3; (c) cómo generar hijos (slug, `active.yml`, `README.md`, `01-proposal/proposal.md` heredado del slice + link al epic); (d) checklist de cierre (DAG válido, 100% Epic-FRs cubiertos, ningún hijo supera a su vez los umbrales §3.1 — si lo hace, subdividir recursivamente con justificación).

### 6.5 Workflows 01–04

Añadir en cada uno un bloque `Sizing checkpoint` (3–5 líneas) que obligue a rellenar la sección §3.2 y a evaluar los QGs de sizing antes del closeout. Sin reescribir los pasos existentes.

---

## 7. Fixes Menores Incluidos en v1.4

| # | Fix | Ficheros | Cambio propuesto |
| - | --- | -------- | ---------------- |
| F-01 | Unificar S/M/L | `framework/skills/task-decomposition/skill.md:20` vs `framework/templates/task-list.md:22` | Adoptar una sola escala (recomendada: la del skill, ≤2h por task atómica, porque la del template —hasta 8h— rompe la atomicidad QG4.1) y actualizar el otro fichero + `QG4.5` |
| F-02 | Path archive | `work-item/README.md:17-18` | Cambiar "top-level `archive/`" → "`work-item/archive/`" |
| F-03 | `_evidence/` | `work-item/README.md:37-63`, `docs/OPERATOR-GUIDE.md:27-40` | Añadir `_evidence/phase-01..10/` al árbol documentado |

---

## 8. Roadmap y Esfuerzo Estimado (para el futuro change-request)

| Orden | Paquete | Contenido | Esfuerzo | Riesgo |
| ----- | ------- | --------- | -------- | ------ |
| 1 | Gates + sección sizing | §3 (QG1.8–QG4.8, sección en 4 templates, bloques en workflows 01–04) + F-01 | S | Bajo |
| 2 | Epic mínimo viable | §5.2–§5.4 (`epic-map.yml`, `active.yml`, registry, trazabilidad epic) + skill §6.4 | M | Medio (DAG) |
| 3 | Orden tech + routing/aprobaciones | §4 (waves SF + genérica), §6.1–§6.3 | M | Medio (fatiga de aprobaciones) |
| 4 | Fixes docs | §7 F-02, F-03 | XS | Bajo |

Ningún paquete requiere cambiar `technology-rules/salesforce/rules.md` salvo añadir la tabla §4.2 como referencia.

---

## 9. Criterios de Aceptación de Esta Propuesta

- [x] El operador aprueba el enfoque epic-ligero + regla "2 de 4" + waves §4 (confirmado: seguir recomendación).
- [x] Escala S/M/L definitiva: la del skill (`S<30min/M30-90min/L90-120min`, task atómica ≤2h). Actualizar template + QG4.5 (recomendación aceptada).
- [x] Aprobación por wave (§6.2) aceptada: scaffolding en `automatic` con notice, resto `human` con closeout agregado por wave (autorizado).
- [x] Roadmap en 4 paquetes aceptado para el `change-request` con `technology: framework`.

---

## 10. Alternativas Descartadas (registro)

- **Epic full-lifecycle (10 fases propias + 10×N)**: descartado por doble burocracia y fatiga de aprobaciones; documentado en §5.1.
- **Track nuevo `epic`**: descartado para minimizar el blast radius en `AGENT.md`, `core.md`, `phase-skips.yml`; se usa `type: epic` dentro de `new-feature`.
- **Split solo por esfuerzo/horas**: descartado como único criterio porque en Salesforce el driver real es el acoplamiento (dominios e integraciones), no solo las horas; el esfuerzo queda como uno de cuatro gates, no como único.

---

*Fin del assessment v1.4. La implementación queda registrada en la rama `feature/SubWorkItemImprovements` y su commit correspondiente.*
