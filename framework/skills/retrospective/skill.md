# Skill: Retrospective

**Phase**: 10 — Archive
**Input**: all project artifacts, user feedback
**Output**: `10-archive/retrospective.md`

---

## Process

1. Review all artifacts generated in the project (phases 1-9)
2. Compare the initial plan (specs, design) with the final implementation
3. Identify what went well, what went wrong, and what can be improved
4. Document technical and process learnings
5. Propose concrete actions for future projects
6. Archive the project marking it as COMPLETED

---

## Retrospective Structure

### 1. Project Summary

- **Name**: [project name]
- **Slug**: [project-slug]
- **Duration**: [start date → end date]
- **Completed phases**: [list of phases]
- **Result**: ✅ Completed / ⚠️ Completed with deviations / ❌ Cancelled

---

### 2. What Went Well ✅

List of positive aspects of the project:

- Processes that worked correctly
- Sound technical decisions
- Tools or patterns that added value
- Effective collaboration or communication

---

### 3. What Went Wrong ❌

List of problems or friction experienced:

- Incorrect estimates
- Technical decisions that generated rework
- Requirements that changed late in the process
- Tools or patterns that did not work

---

### 4. What Can Be Improved 🔄

Concrete actions for the next project:

- Changes to the work process
- New rules or templates to create
- Tools to adopt or abandon
- Skills to deepen

---

### 5. Plan Deviations

| Artifact      | Original Plan          | Actual Implementation  | Reason for Deviation |
| ------------- | ---------------------- | ---------------------- | -------------------- |
| [component X] | [original description] | [what was implemented] | [why it changed]     |

---

### 6. Project Metrics

- **Tasks completed**: X / Y (total)
- **Issues found in verification**: X
- **Issues found in testing**: X
- **Final test coverage**: X%
- **PRs merged**: X

---

### 7. Technical Learnings

New or consolidated technical knowledge acquired during the project that should be incorporated into the framework:

- [Learning 1] → action: create/update `technology-rules/[tech]/...`
- [Learning 2] → action: update `framework/rules/...`

---

### 8. Final Project Status

- [ ] All artifacts saved in `work-item/[project-slug]/`
- [ ] Project README updated with ARCHIVED status
- [ ] Learnings incorporated into the framework (if applicable)
- [ ] Retrospective reviewed and approved by the user

---

## Complete Archive Checklist

- [ ] `retrospective.md` generated and approved
- [ ] All artifacts in their corresponding folders
- [ ] Project README marked as `STATUS: ARCHIVED`
- [ ] The project has no pending tasks without documentation

## Aggregated epic retrospective (only type: epic)

- Aggregate all archived children retrospectives + Epic-FR coverage table (100% required by QG10.4).
