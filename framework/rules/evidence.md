# Evidence — Conventions

This document standardizes what counts as “evidence” across phases and where it should be stored.

---

## 1. Goals

- Ensure every phase outcome is verifiable and auditable
- Standardize where logs, screenshots, and command outputs are stored
- Reduce ambiguity when applying quality gates

---

## 2. Evidence storage

Default location (recommended):

```
work-item/[project-slug]/_evidence/
  phase-01/
  phase-02/
  phase-03/
  phase-04/
  phase-05/
  phase-06/
  phase-07/
  phase-08/
  phase-09/
  phase-10/
```

Evidence may include:

- terminal output (copy/paste or files)
- CI job links
- screenshots
- short screen recordings (links)
- exported reports (JSON/text) when available

---

## 3. Evidence linking rules

- Every task (Phase 4) must describe how it will be verified and where evidence will live.
- Phase artifacts (build-log, verification-report, test-report, release-notes) must link to evidence locations.
- If evidence cannot be stored (security restrictions), document:
  - why
  - where it can be reviewed
  - who reviewed it
- If evidence is provided manually by the user or operator (for example, a deployment confirmation or smoke-test result), record it as a structured attestation with the statement, environment/system, date/time, source, artifact location, and supported gate IDs.

---

## 4. Minimum evidence per phase

- Phase 5 (Build): commands executed + deploy/build outcome + links to logs
- Phase 6 (Verification): mapping of components/tasks to implementation evidence
- Phase 7 (Testing): commands executed + pass/fail summary + coverage summary + link to full logs
- Phase 9 (Release): deployment logs + post-deploy verification evidence

---

## 5. Manual attestation format

Use this format when the evidence source is a user/operator confirmation rather than an attached log:

```markdown
### Manual attestation

- Statement:
- Provided by:
- Date/time:
- Environment:
- Related gate IDs:
- Recorded in:
```
