# Workflow — Phase 3: Design

**Input**: `02-specs/specs.md`  
**Output**: `work-item/[project-slug]/03-design/design.md`  
**Skill**: `framework/skills/architecture-design/skill.md`

---

## TL;DR (min context)

- Turn Specs into an implementable architecture + ADRs.
- **Technology-specific detailing is required in Phase 3**: the design must be grounded in the target technology's primitives (e.g., UI framework vs automation vs services, data-model choices, security model — see `technology-rules/[technology]/rules.md` Phase 03).
- Use `framework/skills/architecture-design/skill.md` (prefer its TL;DR) to define components, contracts, data model, integrations.
- Also apply the resolved technology baseline: `technology-rules/[technology]/rules.md` and any **Phase 3** mandatory technology files it requires.
- Generate `design.md` using `framework/templates/design.md` (+ ADRs if needed).
- Perform an **ADR gap scan** before closing Phase 3: if `design.md` contains closed technical decisions that materially affect architecture, validation ownership, traceability, security, metadata shape, import/export behavior, lifecycle behavior, or user interaction guardrails, either create ADRs for them or explicitly record them as deferred.
- Ensure explicit **traceability from Specs/DF requirements → design sections/components → ADRs** for any non-trivial technical decision.
- Iterate with the user until approved; do not move to Phase 4 without approval (see `framework/config/phase-approval.yml`).

## Phase Checkpoint

- Current phase: Phase 3 — Design
- Read before acting: approved `02-specs/specs.md` and applicable technology rules
- Allowed persisted outputs: `03-design/design.md`, ADR files, and ADR registry
- Forbidden persisted outputs: Phase 4 through Phase 10 artifacts
- Before proceeding: state current phase, design artifact path, technology rules loaded, open questions status, and approval gate
- Exit gate: design approved, no unresolved open questions unless explicitly deferred, transition approved per `phase-approval.yml`

---

## Steps (details)

1. Read `02-specs/specs.md`.
2. Apply `framework/skills/architecture-design/skill.md`.
3. Generate `design.md` using `framework/templates/design.md`.
4. Build explicit traceability from requirements in Specs/DF inputs to:
   - design sections
   - components / flows / data model decisions
   - ADRs where the decision is non-trivial
5. Run an **ADR gap scan**:
   - identify closed technical decisions already present in `design.md`
   - create ADRs for decisions that are architecturally significant
   - if a significant decision is intentionally not frozen in Phase 3, record it in the deferred decisions matrix with rationale
6. Present to the user for review.
7. Iterate until approved.
8. Save in `work-item/[project-slug]/03-design/design.md`.

---

## Exit Criteria

- Design is **technology-grounded** (not generic): explicitly names the technology primitives that will implement each major component (see `technology-rules/[technology]/rules.md`), and records ADRs for key technology choices.
- An **ADR gap scan** has been completed; significant closed technical decisions are either captured as ADRs or explicitly listed as deferred with rationale.
- Traceability from Specs/DF requirements to design sections/components and ADRs is explicit enough to explain why each major technical choice exists.
- The design contains a clear distinction between **closed decisions** and **deferred decisions**.
- Approval recorded per `framework/config/phase-approval.yml`.
- Quality gates: reference `QG3.*` (do not paste the full checklist).
- Sizing: QG3.9 evaluated (CMP-* + integrations counted, split decision recorded).
