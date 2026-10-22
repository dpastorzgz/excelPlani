# Workflow — Phase 9: Release

**Input**: Approved PR + release/deployment rules  
**Output**: `work-item/[project-slug]/09-release/release-notes.md` + deployment execution record  
**Skill**: `framework/skills/git-operations/skill.md`

---

## TL;DR (min context)

- Confirm PR is reviewed + merged (no direct merges).
- Load deployment/release rules from technology rules and follow them.
- Generate `release-notes.md`, validate, deploy (on confirmation), verify post-deploy, and tag/version.
- When the technology/hop enables interactive validation, ask the test level before validating and ask before deploying.
- Do not move to Phase 10 without approval per `framework/config/phase-approval.yml`.

## Phase Checkpoint

- Current phase: Phase 9 — Release
- Read before acting: approved/merged PR, release policy, and applicable technology deployment rules
- Allowed persisted outputs: `09-release/release-notes.md` and deployment evidence
- Forbidden persisted outputs: Phase 10 archive artifacts
- Before proceeding: state current phase, release target, deployment rules loaded, open questions status, and approval gate
- Exit gate: release notes complete, deployment verified, transition approved per `phase-approval.yml`

---

## Steps (details)

1. Confirm PR is approved and merged according to team policy (no direct merges without review).
2. Load deployment/release rules from technology rules.
3. Generate `release-notes.md` using `framework/templates/release-notes.md`.
4. Validate in the target environment before any deploy. When the hop enables interactive
   validation (`validate_interactive: true`), first ask the test strategy (specific tests or
   local tests), run `validate`, and on success ask whether to deploy (`deploy_now` /
   `skip_deploy`). On validate failure, stop and do not ask the deploy question. Follow the
   technology release protocol (Salesforce: `deploy-protocol.md` §5.1).
5. If the deploy decision is `deploy_now`, execute the deployment in the target environment.
6. Perform post-deploy verification checks (when deployed).
7. If deployment or smoke evidence is provided manually by the user/operator, record it as structured attestation in `work-item/[project-slug]/09-release/release-notes.md` with environment, statement, date/time, source, and related gate IDs.
8. Tag/version the release in git per policy, or document the explicit project policy when QG9.4 is `N/A`.
9. Present release summary to the user for approval using the structured closeout prompt from `framework/rules/phase-transitions.md`, including the full repo-relative artifact path `work-item/[project-slug]/09-release/release-notes.md` and explicit next-step options.

---

## Exit Criteria

- Approval recorded per `framework/config/phase-approval.yml`.
- Quality gates: reference `QG9.*` (do not paste the full checklist).
