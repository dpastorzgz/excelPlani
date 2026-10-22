# Framework Assessment v1.5 — Consistencia documental, validación mecánica y modelo Epic real

**Date**: 2026-09-10
**Author**: Axet Agent (revisión a petición del operador)
**Previous version**: `framework/improvements/framework-assessment-v1.4-epic-split.md`
**Status**: Draft — pendiente de revisión del operador
**Scope**: Assessment únicamente. No se aplica ningún cambio normativo en este documento; los cambios propuestos se ejecutarán como change-requests posteriores con `technology: framework`.

---

## 1. Executive Summary

El framework es maduro sobre el papel: v1.1–v1.4 resolvieron el 90% de los hallazgos históricos y el ciclo v1.4 añadió sizing gates, epic ligero y waves. Sin embargo, esta revisión combina por primera vez dos fuentes de evidencia:

1. **Revisión estática** de los ~120 ficheros del framework (reglas, workflows, skills, templates, configs, docs, overlays tecnológicos).
2. **Evidencia de ejecución real**: los 5 work-items activos en el repositorio padre (`work-item/cpq-embedded-crm-epic` + 4 hijos), el primer epic real ejecutado con v1.4.

El resultado es una tesis clara: **la navegación documental está rota y las reglas que solo existen como prosa no se cumplen en runtime**.

- Un agente que siga literalmente `context-routing.yml` intenta cargar `AGENT.md`, que **no existe** (el fichero real es `AGENTS.md`).
- Se referencian gates **no definidos** (`QG6.7`), esquemas de IDs **legacy** en el README (`QG-01`, `QG-SF-01`) y **tres vocabularios distintos** de `status` en `active.yml` — uno de ellos (`closed`, exigido por Phase 10) ni siquiera está permitido por la plantilla.
- En runtime, el epic real **violó la regla de entrada por waves** (los 5 work-items entraron en Build/Verification en paralelo, con la dependencia wave-0 sin alcanzar Fase 7), su `epic-map.yml` está **desincronizado** (hijos en `planned` cuando están en Fase 6) y el epic **ejecutó Fases 3/4/6 propias** pese a que v1.4 prescribe delegación 3–9.

Ninguno de estos fallos es conceptual: el diseño de v1.4 es sólido. El problema es que **no existe ningún mecanismo mecánico de verificación** (solo `validate-new-tech.sh`) y que varios documentos autoritativos derivaron sin que nada lo detectara.

**Propuesta v1.5 (4 paquetes):**

- **P1 — Choque de consistencia (XS–S)**: reparar todas las referencias rotas, IDs legacy y vocabularios (hallazgos A1–A7).
- **P2 — Validadores mecánicos (M)**: suite de scripts `framework/scripts/` (referencias, gate IDs, work-items/epic-map/waves) enchufable a pre-commit/CI; fusión de los ficheros de gates duplicados (C1, C2, C9).
- **P3 — Epic model v1.5 (M)**: formalizar el **diseño compartido de epic opcional (contract-first)** —decisión del operador 2026-09-10—, gate de cierre de epic, closeout-por-wave legible por máquina, frescura de epic-map y override explícito de waves (B1–B4).
- **P4 — Higiene de contexto y docs (S)**: carga perezosa del skill de epic, aclaración tech en Fase 2, fuente única para la tabla de tracks, versionado del framework, resolución de proyecto multi-work-item y clarificación del intake hotfix (C3–C8).

Lo que **no** incluye esta propuesta: cambios en los overlays `technology-rules/salesforce/` y `dynamics365-powerplatform/` más allá de lo derivado de P1/P2, ni reescritura del ciclo de 10 fases.

---

## 2. Metodología y evidencia

| Fuente | Qué se revisó |
| ------ | ------------- |
| Estática | `AGENTS.md`, `README.md`, `framework/rules/*`, `framework/config/*`, `framework/workflows/*` (10), `framework/skills/*` (13), `framework/templates/*` (18), `docs/*`, `.axetrules/*`, `technology-rules/` (salesforce, dynamics365, _template), `work-item/README.md`, `CHANGELOG.md`, improvements v1–v1.4 |
| Runtime | Repo padre `CPQ-Custom-Embedded/work-item/`: epic `cpq-embedded-crm-epic` (epic-map.yml, active.yml, carpetas 01/02/03/04/06) e hijos `cpq-schema-foundation` (wave 0), `cpq-alta-offer-intake` (wave 1), `cpq-quote-bundle-persist` (wave 1), `cpq-won-amend-flow` (wave 2) — estado a 2026-09-10 |
| Histórica | Git log del repo `framework-ai` (rama `feature/SubWorkItemImprovements`), CHANGELOG `[Unreleased]`, assessments v1.1–v1.4 |

Convención de citas: `fichero:línea` relativo a la raíz del repo `framework-ai/` salvo que se indique `CPQ-Custom-Embedded/` (repo padre).

---

## 3. Hallazgos A — Referencias rotas y deriva documental

### A1 — `AGENT.md` no existe (el fichero real es `AGENTS.md`) 🔴

El commit `b7c7804` ("Chore(repo) fix agents naming") renombró el entrypoint a `AGENTS.md` pero **no actualizó las referencias**. Ficheros autoritativos que apuntan al nombre fantasma:

| Fichero | Línea(s) | Impacto |
| ------- | -------- | ------- |
| `framework/config/context-routing.yml` | 8 | **`always_required` incluye un fichero inexistente** — todo agente que siga el routing falla en el paso 1 |
| `framework/rules/core.md` | 28, 58 | Fallbacks de checkpoint y resolución de track apuntan a `AGENT.md` |
| `.axetrules/rules.md` | 3 | El pointer de compatibilidad apunta al fichero equivocado |
| `framework/rules/general.md` | 6 | Ídem |
| `framework/rules/phase-transitions.md` | 15 | Ídem |
| `framework/workflows/phase-01-proposal.md` | 36 | Ídem |
| `docs/OPERATOR-GUIDE.md` | 6 | Ídem |
| `docs/FRAMEWORK-REFERENCE.md` | 8 | Ídem |
| `docs/AGENT-COMPATIBILITY.md` | 16, 56 | Ídem |
| `docs/EXECUTION-PLAN.md` | 54, 79 | Ídem |
| `README.md` | 178 | El árbol documentado lista `AGENT.md` |
| `technology-rules/_template/README.md` | 37 | El scaffold propaga el error a nuevas tecnologías |

### A2 — `QG6.7` referenciado pero no definido 🔴

- `framework/workflows/phase-06-verification.md:43` exige "record gate applicability for QG6.6 and QG6.7".
- `framework/rules/quality-gates.md:97-102` define solo `QG6.1`–`QG6.6`.
- `improvements/framework-assessment-v1.3.md:43,113` afirma que la aplicabilidad de `QG6.7` quedó formalizada — hoy no existe.
- Causa raíz: **OBS-006 de v1.1** (sin mecanismo de sync entre `quality-gates.md` y `quality-gates-extended.md`, y el extended no usa IDs) sigue abierto y ya produjo drift real.

### A3 — `README.md` usa un esquema de QGs legacy y un `active.yml` obsoleto 🟡

- `README.md:359,363-371,373-382`: documenta `QG-01..QG-07` y `QG-SF-01..QG-SF-06`. Los IDs reales son `QG1.1..QG10.3` (compact) y `SFG*` / `DPPG*` (overlays). El contenido de la tabla `QG-SF-*` no se corresponde con los gates reales de `technology-rules/salesforce/quality-gates.md`.
- `README.md:161-169`: ejemplo de `active.yml` con `project:` (la plantilla usa `project_slug:`, `templates/active.yml:6`), `status: in-progress|blocked|complete` (la plantilla usa `active|blocked|on-hold|archived`, `templates/active.yml:21-22`), `phases_skipped` (no existe en la plantilla, ver A7) y sin los campos epic v1.4 (`type`, `parent_epic`, `depends_on`, `wave`, `templates/active.yml:49-52`) ni `phase_status`/`phases_completed`/`blockers`.

### A4 — Tres vocabularios de `status` en `active.yml`, uno de ellos inválido 🔴

| Fuente | Vocabulario |
| ------ | ----------- |
| `framework/templates/active.yml:21` y `framework/rules/core.md:23` | `active \| blocked \| on-hold \| archived` |
| `framework/workflows/phase-10-archive.md:53,84,115` y `framework/rules/core.md:158` | exigen `closed` — **valor no permitido por la plantilla** |
| `README.md:166` | `in-progress \| blocked \| complete` |
| `work-item/README.md:8-15` (registry) | icons 🔵🟡🟠✅❌📦 (4º vocabulario visual, sin mapping explícito) |

Phase 10 es un hard gate: un agente literal no puede cerrarlo sin violar el vocabulario canónico.

### A5 — Cross-references rotas y tres algoritmos de resolución de fase 🟡

1. `phase-10-archive.md:11` cita "core.md → Section 8 (Prohibitions)"; las prohibitions son la **Section 10** (`core.md:141`); la 8 es "Framework Skill Resolution".
2. `AGENTS.md:95-96` (Phase resolution, paso 1) referencia un marcador `phase.txt` que **ningún workflow ni template define**, y la lista de resolución **omite `active.yml.current_phase`**, que es el marcador canónico en `core.md:42` y `templates/active.yml:24-25`.
3. `.axetrules/workflows/workflow-frameworkIA.md:56-62` define un tercer orden de verdad (project README → registry → filesystem) que **ignora `active.yml`** y contradice a `AGENTS.md:93-101`.

### A6 — Ubicación de `bug-report.md` contradictoria 🟡

| Fuente | Ubicación |
| ------ | --------- |
| `AGENTS.md:119`, `phase-skips.yml:64,69,74`, `phase-01-proposal.md:21,34,97-98`, `core.md:143-145` | `01-intake/bug-report.md` |
| `README.md:148` (tabla tracks: "Phase 1 artifact") y `README.md:315` (tabla de fases: artefacto de **Phase 4**) | ambiguo / `04-tasks/` |
| `work-item/README.md:43-65` (árbol por proyecto) | **no lista `01-intake/`** |

### A7 — `phases_skipped` prometido pero inexistente 🟢

`improvements/framework-assessment-v1.4-epic-split.md:156` y `README.md:167` registran skips en `active.yml:phases_skipped`; `framework/templates/active.yml` no define el campo y el epic real no lo tiene. Los skips de epic (Fases 3–9 delegadas) no quedan registrados en ningún sitio del estado del work-item.

---

## 4. Hallazgos B — Modelo epic vs. práctica real (evidencia runtime)

Estado observado el 2026-09-10 en `CPQ-Custom-Embedded/work-item/` (primer epic real del framework):

```
cpq-embedded-crm-epic   type: epic     wave 0   current_phase: 6   carpetas: 01,02,03,04,06 + epic-map.yml
cpq-schema-foundation   type: feature  wave 0   current_phase: 6   depends_on: []
cpq-alta-offer-intake   type: feature  wave 1   current_phase: 6   depends_on: [cpq-schema-foundation]
cpq-quote-bundle-persist type: feature wave 1   current_phase: 6   depends_on: [cpq-schema-foundation]
cpq-won-amend-flow      type: feature  wave 2   current_phase: 6   depends_on: [los 3 anteriores]
```

### B1 — Regla de entrada por waves violada en runtime 🔴

La regla (`framework/skills/epic-decomposition/skill.md:40`, `technology-rules/salesforce/rules.md:494`, v1.4 §4.1) prohíbe que un hijo wave N entre en **Fase 5** si alguna dependencia no está en **≥ Fase 7 con gates Passed**. Los hijos wave-1 y wave-2 tienen carpeta `05-build/` y están en Fase 6 mientras `cpq-schema-foundation` (wave 0) **no ha alcanzado Fase 7**. Los 5 `phases_completed` fechados el mismo día (2026-09-08) sugieren ejecución deliberada en paralelo por el operador — pero el framework **no tiene ningún constructo de "relajación autorizada de waves"**: la regla se incumplió en silencio, que es exactamente el fallo que la regla quería prevenir. La prosa no se ejecuta; los validadores sí.

### B2 — `epic-map.yml` desincronizado 🔴

Todos los hijos figuran con `status: planned` cuando están activos en Fase 6. La propia plantilla (`framework/templates/epic-map.yml:3-5`) dice "on conflict, the child's active.yml wins and this file must be updated to match" — no se cumplió. Viola el principio cross-cutting **Single source of truth** (`framework/rules/quality-gates.md:24`).

### B3 — El epic ejecutó Fases 3/4/6 propias fuera de spec 🟡

v1.4 §5.1 prescribe: epic solo Fases 1–2; Fases 3–9 `Skipped — delegated to children` (`phase-skips.yml:80-118`). En la práctica el epic generó `03-design/design.md` + ADRs, `04-tasks/task-list.md` y `06-verification/verification-report.md`, y su `active.yml.phases_completed` registra la Fase 3 aprobada por el usuario. La práctica tiene valor real: un **diseño compartido** (arquitectura global, modelo de datos, contratos entre hijos) que los hijos consumen. El spec, sin embargo, no lo contempla → el agente improvisó fuera de spec y el `04-tasks/task-list.md` del epic duplica la planificación que pertenece a los hijos. **Decisión del operador (2026-09-10): formalizar el diseño compartido opcional** (ver P3.1).

### B4 — Cierre de epic y closeout-por-wave sin definición ejecutable 🟡

- "El epic cierra cuando todos los hijos están en `work-item/archive/`" (v1.4 §5.1) **no tiene** QG, ni paso en `phase-10-archive.md`, ni regla en `core.md`. No existe retrospectiva agregada prescrita.
- El closeout agregado por wave y el scaffolding en automático viven solo como **comentarios YAML** (`phase-approval.yml:142-148`): no son legibles por máquina ni auditables como configuración.

---

## 5. Hallazgos C — Estructurales

### C1 — Cero validación mecánica 🔴

El único script del framework es `technology-rules/_template/scripts/validate-new-tech.sh`. Todo lo demás (referencias, IDs, esquemas, DAG, waves, registry) depende de que el agente de turno lea y cumpla prosa. A1–A7 pasaron desapercibidos durante ciclos enteros; B1–B2 ocurrieron en la primera ejecución real. Es el hallazgo estructural más importante: **el framework necesita un `make check` propio**.

### C2 — Doble mantenimiento de ficheros de gates 🟡

`framework/rules/quality-gates.md` (con IDs) y `framework/rules/quality-gates-extended.md` (sin IDs, formato checklist) duplican el mismo contenido; los overlays repiten el patrón (`salesforce/quality-gates.md` + `quality-gates-extended.md`, ídem dynamics365). El drift ya está demostrado (A2). OBS-006 de v1.1 sigue abierto.

### C3 — Context routing inflado en Fases 1–2 🟡

`context-routing.yml:33-34` hace **required** `epic-decomposition/skill.md` + `templates/epic-map.yml` para *todo* work-item en Fase 1, y `:45` repite el skill en Fase 2. El propio skill dice "Load this skill in Phase 1 or 2 **when any sizing gate fires**" (`epic-decomposition/skill.md:15`). Para un `change-request` pequeño es contexto muerto, contradiciendo el goal de context efficiency (v1.1 §3.3).

### C4 — Ambigüedad tecnológica en Fase 2 🟡

`context-routing.yml:13` declara `technology_required_phases: [3,4,5,6,7,9]` y `README.md` §8 dice "Phases 1–2: No tech rules". Pero Salesforce tiene gates de Fase 2 (`SFG2.1–2.3`, `salesforce/quality-gates.md:15-17`), su `tech-config.yml:151-153` carga `quality-gates.md` en fase `[02,...]`, y `context-routing.yml:48-49` lista las tech rules como *optional* en Fase 2. Tres documentos, tres comportamientos.

### C5 — Tabla de tracks duplicada en 6 sitios 🟡

`README.md:144-148`, `core.md:52-56`, `AGENTS.md:110-114`, `phase-transitions.md:9-13`, `phase-01-proposal.md:30-34`, `phase-skips.yml:43-74`. La deriva ya ocurrió (A6). Viola el objetivo declarado de `docs/EXECUTION-PLAN.md` ("Keep source of truth single").

### C6 — Sin versionado ni releases del framework 🟡

- `git tag` → vacío; la última release del CHANGELOG es `[1.1.0] 2026-05-12`.
- `[Unreleased]` acumula ~50 entradas de los ciclos v1.2, v1.3 y v1.4 (`CHANGELOG.md:9-65`).
- Metadatos contradictorios: templates con "Framework version: 1.4" (`epic-decomposition/skill.md:3`), `salesforce/tech-config.yml:8` con `version: "1.1.0"`.
- IMP-020 de review-v1 (version tracking) se implementó a medias: hay CHANGELOG pero no `version.yml` ni tags, y los work-items no registran bajo qué versión del framework se ejecutaron.

### C7 — Resolución de proyecto peligrosa con múltiples work-items activos 🟡

`AGENTS.md:82-84`: con varios proyectos, "choose the one with the most recently modified file". Hoy hay **5 work-items activos** en el repo padre: la regla puede silently seleccionar el proyecto equivocado y contaminar artefactos entre work-items. No hay obligación de preguntar.

### C8 — Intake de hotfix ambiguo 🟢

El track hotfix "skip Phases 1–3" y `entry_phase: 4` (`phase-skips.yml:57-74`), pero los pasos de intake viven en `phase-01-proposal.md:84-102` y `README.md:148` llama a bug-report "Phase 1 artifact" mientras `README.md:315` lo lista como artefacto de Phase 4. Ningún documento prescribe qué workflow cargar para el intake hotfix.

### C9 — `docs/axet_framework_landing_page.jsx` es una carga de mantenimiento 🟢

Página JSX con datos de gates copiados que ya requirió resync manual (`CHANGELOG.md:48`). Duplica información de `quality-gates.md` y del README (que además está legacy, A3). Sin generador ni verificación.

---

## 6. Propuesta normativa (paquetes P1–P4)

### P1 — Choque de consistencia (esfuerzo XS–S, riesgo bajo)

| # | Cambio | Ficheros |
| - | ------ | -------- |
| P1.1 | Renombrar todas las referencias `AGENT.md` → `AGENTS.md` (nombre canónico único; estándar del ecosistema de agentes). No crear fichero pointer `AGENT.md` | los 12 ficheros de A1 |
| P1.2 | Definir `QG6.7` en `quality-gates.md` Phase 6 — contenido propuesto: *"Technology verification overlay checks per `technology-rules/[technology]/verification-overlay.md` executed and recorded, or `N/A` with reason when the technology has no overlay"* (ambos overlays ya existen: salesforce y dynamics365). Alternativa: eliminar la referencia del workflow (decisión abierta §9) | `framework/rules/quality-gates.md`, `framework/workflows/phase-06-verification.md` |
| P1.3 | Reescribir `README.md` §6: sustituir las tablas legacy por los rangos reales (`QG1.1–QG10.3`, `SFG*`, `DPPG*`) con pointer a los ficheros canónicos; reemplazar el ejemplo de §3 `active.yml` por el contenido vigente de la plantilla (incl. campos epic) | `README.md` |
| P1.4 | Vocabulario canónico único de status: `active \| blocked \| on-hold \| closed \| archived`. Añadir `closed` a la plantilla (fase terminal lógica previa al move físico) y documentar el mapping a iconos del registry | `templates/active.yml`, `core.md:23`, `README.md`, `work-item/README.md` |
| P1.5 | Corregir cross-refs: phase-10 `Section 8` → `Section 10`; reescribir Phase resolution en `AGENTS.md` como (1) `active.yml.current_phase`, (2) inferencia por artefactos, (3) default phase-01 + structured question — eliminar `phase.txt`; alinear `.axetrules/workflows/workflow-frameworkIA.md` al mismo orden (o degradarlo a pointer como `.axetrules/rules.md`) | `phase-10-archive.md`, `AGENTS.md`, `.axetrules/workflows/workflow-frameworkIA.md` |
| P1.6 | Path canónico de bug-report: `01-intake/bug-report.md` (mayoría de uso). Corregir README §3/§5 y añadir `01-intake/` (hotfix-only) al árbol de `work-item/README.md` | `README.md`, `work-item/README.md` |
| P1.7 | Añadir `phases_skipped: []` a la plantilla `active.yml` con comentario (evidencia por skip según `phase-skips.yml`); el epic registra ahí sus Fases delegadas | `templates/active.yml` |

### P2 — Validadores mecánicos (esfuerzo M, riesgo bajo)

Crear `framework/scripts/` (bash o node, cero dependencias) + `make check` / `framework/scripts/check-all.sh`:

| Script | Qué valida | Hallazgos que previene |
| ------ | ---------- | ---------------------- |
| `check-refs.sh` | Toda referencia repo-relative `*.md`/`*.yml` citada en md/yml existe; toda sección citada (`§N`, "Section N") existe en el destino | A1, A5 |
| `check-gates.sh` | Todo ID `QG*/SFG*/DPPG*` referenciado en workflows/templates/skills/docs está definido en su fichero de gates; compact y extended cubren el mismo conjunto por fase; prefijos de overlay coherentes con su tecnología | A2, A3, C2 |
| `check-workitems.sh` | Por work-item: `active.yml` valida contra esquema/vocabulario; registry ↔ filesystem reconciliados; epic: DAG acíclico, slugs existentes, coherencia wave/depends_on, **frescura de epic-map vs active.yml de hijos**, **regla de entrada por waves** (hijo en ≥5 exige deps en ≥7, salvo override registrado — ver P3.6) | A4, B1, B2 |
| `validate-new-tech.sh` | Mover/copiar el existente desde `_template/scripts/` para simetría | — |

Acompañamiento:

- **P2.1** Integración: documentar el uso en el repo padre (hook `.husky/pre-commit` ya existe en `CPQ-Custom-Embedded`) y/o CI del repo `framework-ai`.
- **P2.2** Fusión de gates (C2): `quality-gates.md` se convierte en fuente única (ID + detalle + aplicabilidad); `quality-gates-extended.md` pasa a pointer deprecado (o se genera). Ídem overlays.
- **P2.3** `landing_page.jsx` (C9): eliminar, o mantener con nota "generated — no editar a mano" y datos derivados de `quality-gates.md` vía script. Las tablas de gates del README pasan a pointer (fuente única: `quality-gates.md`).

### P3 — Epic model v1.5 (esfuerzo M, riesgo medio) — incorpora la decisión del operador

**Decisión del operador (2026-09-10): diseño compartido opcional (contract-first).**

| # | Cambio | Ficheros |
| - | ------ | -------- |
| P3.1 | **Fase 3 de epic opcional "contract-first"**: el epic PUEDE ejecutar Fase 3 para producir `design.md` compartido (arquitectura global, modelo de datos, contratos entre hijos, ADRs globales). Los hijos cargan `work-item/[epic-slug]/03-design/design.md` **read-only** en sus Fases 2–5; el diseño del hijo refina localmente y no puede contradecir los contratos del epic (desviación → ADR del hijo + escalar al epic). Fases **4–9 siguen delegadas** a los hijos | `phase-skips.yml` (types.epic: fase 3 `allowed` pero no obligatoria, evidencia "epic-map.yml existe; diseño compartido opcional"), `epic-decomposition/skill.md`, `context-routing.yml` (epic fase 3 → `architecture-design`; hijos → design.md del epic), `core.md` §2 epic rule, README |
| P3.2 | Prohibir `04-tasks/task-list.md` en el epic (la planificación del epic vive en `epic-map.yml`); el task-list del epic actual se reclasifica o migra a los hijos | `phase-skips.yml`, `epic-decomposition/skill.md`; remediación en repo padre |
| P3.3 | **Gate de cierre de epic** `QG10.4` (aplica solo `type: epic`): todos los hijos en `work-item/archive/`, `epic-map.yml` con status `done` en el 100% de los hijos, retrospectiva agregada con cobertura 100% de Epic-FRs. Sección epic en `phase-10-archive.md` | `quality-gates.md`, `phase-10-archive.md`, `retrospective/skill.md`, `templates/retrospective.md` |
| P3.4 | **Closeout-por-wave legible por máquina**: entradas reales en `phase-approval.yml` (p. ej. `epic_scaffolding: automatic`, `epic_wave_closeout: aggregated \| per_child`, este último con `requires_operator_authorization: true`) sustituyendo los comentarios YAML actuales | `phase-approval.yml` |
| P3.5 | **Regla de frescura de epic-map**: cualquier cambio de fase/status en el `active.yml` de un hijo obliga a actualizar la fila correspondiente de `epic-map.yml` en la misma sesión; `check-workitems.sh` (P2) la valida | `epic-decomposition/skill.md`, `templates/epic-map.yml`, workflow phase-transitions |
| P3.6 | **Override explícito de waves**: cuando el operador autorice ejecución en paralelo fuera de la regla de entrada (caso B1 real), se registra en `epic-map.yml` (`wave_policy: strict \| relaxed` + justificación + fecha). Sin override registrado, la violación es `Failed` y bloquea | `templates/epic-map.yml`, `epic-decomposition/skill.md`, `check-workitems.sh` |

### P4 — Higiene de contexto y docs (esfuerzo S, riesgo bajo)

| # | Cambio | Ficheros |
| - | ------ | -------- |
| P4.1 | Epic skill + epic-map template pasan de `required` a carga condicional (solo si sizing gate dispara, `type: epic`, o petición explícita) | `context-routing.yml:33-34,45` |
| P4.2 | Fase 2 tech: modo `gates-only` explícito — la Fase 2 puede cargar `technology-rules/[tech]/quality-gates.md` (para `SFG2.*`) sin cargar guidelines de implementación; alinear `technology_required_phases`, README §8 y tech-configs | `context-routing.yml`, `README.md`, tech-configs |
| P4.3 | Fuente única de la tabla de tracks: `phase-skips.yml` (+ `AGENTS.md` como resumen operativo); README, core.md, phase-transitions.md y phase-01 enlazan en vez de duplicar | 5 ficheros (C5) |
| P4.4 | Versionado: crear `framework/config/version.yml` (`framework_version: 1.5.0`); campo opcional `framework_version` en `active.yml` de cada work-item; disciplina de git tags por release; cerrar el `[Unreleased]` del CHANGELOG como release `1.5.0` (los ciclos v1.2–v1.4 quedan documentados en improvements/) | `version.yml` (nuevo), `templates/active.yml`, `CHANGELOG.md`, docs |
| P4.5 | Con >1 work-item activo, la resolución de proyecto pasa a **structured question** (listar candidatos con fase/status) en vez de elegir por "most recently modified" | `AGENTS.md:82-84`, `core.md` §1.1 |
| P4.6 | Intake hotfix: prescribir explícitamente que se ejecuta `phase-01-proposal.md → Steps — hotfix` como intake de entrada a Fase 4 (el "skip Phases 1–3" se refiere a no producir proposal/specs/design, no a omitir el intake) | `AGENTS.md`, `phase-skips.yml` (comentario), `README.md`, `phase-01-proposal.md` |

---

## 7. Roadmap y orden de ejecución

| Orden | Paquete | Contenido | Esfuerzo | Riesgo | Dependencias |
| ----- | ------- | --------- | -------- | ------ | ------------ |
| 1 | P1 | A1–A7: referencias, IDs, vocabularios, paths | XS–S | Bajo | Ninguna |
| 2 | P2 | Validadores + fusión de gates + landing page | M | Bajo | P1 (los validadores deben pasar sobre el corpus ya corregido) |
| 3 | P3 | Epic model v1.5 (contract-first + cierre + waves) | M | Medio | P2 (los validadores hacen cumplir las nuevas reglas epic) |
| 4 | P4 | Contexto, tracks, versionado, resolución multi-proyecto | S | Bajo | P1 |

Cada paquete se ejecuta como change-request independiente con `technology: framework` (README §12). Cambios en `phase-approval.yml` / `phase-skips.yml` (P3.4, P3.1) requieren aprobación explícita del operador.

**Remediación inmediata en el repo padre** (independiente de los paquetes, recomendada ya): sincronizar `epic-map.yml` con el estado real de los hijos (B2) y registrar el override de waves si la ejecución en paralelo fue deliberada (B1/P3.6); re-clasificar el `04-tasks/task-list.md` del epic (P3.2).

---

## 8. Criterios de aceptación de este assessment

- [ ] El operador revisa los hallazgos A1–A7, B1–B4, C1–C9 y el desglose P1–P4.
- [ ] Decisión §9.1 (QG6.7: definir vs eliminar referencia) tomada.
- [ ] Decisión §9.2 (extended gates: deprecar y fusionar vs mantener con generador) tomada.
- [ ] Decisión §9.3 (release CHANGELOG: v1.5.0 único vs reconstrucción 1.2/1.3/1.4) tomada.
- [ ] Decisión §9.4 (wave_policy relaxed como constructo de governance) tomada.
- [ ] La decisión de diseño compartido de epic (P3.1) queda registrada como decisión del operador de 2026-09-10.

---

## 9. Decisiones abiertas para el operador

1. **QG6.7**: ¿definirlo con el contenido propuesto en P1.2 (verificación del overlay tecnológico) o eliminar la referencia del workflow phase-06?  *Recomendación: definirlo — los dos overlays ya existen y hoy nadie obliga a ejecutarlos.*
2. **Extended gates**: ¿deprecar `quality-gates-extended.md` fusionando el detalle en el compact, o mantenerlo generado por script?  *Recomendación: fusión (P2.2) — un solo fichero con IDs elimina la clase de bug A2.*
3. **CHANGELOG**: ¿cerrar `[Unreleased]` como una única release `1.5.0` que resume v1.2–v1.4 + v1.5, o reconstruir releases históricas 1.2.0/1.3.0/1.4.0?  *Recomendación: release única 1.5.0 — las históricas ya están documentadas en improvements/ y no hay tags que las respalden.*
4. **`wave_policy: relaxed`**: ¿aceptable como constructo de governance (override explícito y auditable del orden por waves)?  *Recomendación: sí — la alternativa (prohibir el paralelo) no refleja cómo se ejecutó el primer epic real.*

---

## 10. Alternativas descartadas (registro)

- **Delegación estricta de epic (sin diseño compartido)**: descartada por el operador el 2026-09-10. La práctica real del primer epic demuestra que un diseño compartido (contratos, modelo de datos global) aporta valor a los hijos; prohibirlo empujaría a los agentes a improvisar fuera de spec (como ocurrió en B3).
- **Track dedicado `epic`**: ya descartado en v1.4 §10 (blast radius en entrypoint/core/phase-skips); v1.5 mantiene `type: epic` dentro de `new-feature`.
- **Fichero pointer `AGENT.md` en vez de renombrar referencias**: descartado — perpetúa dos nombres convivientes y el ambiguity de canonicalidad; el ecosistema de agentes (Codex, OpenCode, Copilot) converge en `AGENTS.md`.
- **Corrección docs-only sin validadores (solo P1)**: descartado — B1/B2 demuestran que la prosa sin verificación mecánica falla en la primera ejecución real; P1 sin P2 se volvería a romper.
- **Re-escribir el extended como fuente y generar el compact**: descartado — los IDs y la aplicabilidad ya viven en el compact y es lo que citan workflows y artefactos; la dirección de fusión natural es extended → compact.

---

*Fin del assessment v1.5. La implementación se registrará en change-requests posteriores con `technology: framework` y sus commits correspondientes.*
