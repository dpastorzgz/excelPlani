# Agent Compatibility Guide

This framework is tool-agnostic. Codex, OpenCode, Cline, GitHub Copilot, and similar agents must follow the same phase contract even when their tools differ.

## Required Operating Checkpoint

Before creating or modifying a phase artifact, state:

- Work item slug
- Track
- Current phase
- Phase status
- Allowed persisted artifact(s)
- Next gate or blocker

If an item has a mandatory fallback in `AGENTS.md`, use that fallback and state it. If no fallback applies or multiple valid choices remain, ask before writing artifacts.

## Structured Questions

Use the best available mechanism:

- OpenCode: use the question tool when available.
- Cline: ask a numbered multiple-choice question in chat and wait for the answer.
- Codex: ask a numbered multiple-choice question in chat and wait for the answer.
- GitHub Copilot: ask a numbered multiple-choice question in chat or PR comments and wait for confirmation.

Question format:

    Question: Which phase should this work item resume from?
    Recommended: 1
    1. Phase 4 — the task list is the last approved artifact
    2. Phase 5 — construction already started and build evidence exists
    3. Pause — wait for more information

## Phase Artifact Discipline

- Persist only the artifact(s) owned by the active phase.
- Do not create next-phase artifacts early.
- Future-phase content may be shown only as `Preview — not a phase artifact`.
- Update `active.yml.current_phase` only after gates pass and required approval is recorded.

## Open Questions

Question statuses are:

- `open`: unresolved; blocks phase closeout.
- `answered`: resolved in the current phase.
- `deferred`: allowed only with explicit user approval and a target phase.
- `cancelled`: no longer relevant, with reason recorded.

## Limited Tool Environments

- No file read access: ask the user for `active.yml`, project README, and the current phase artifact.
- No write access: present the intended patch and stop.
- No shell access: use file inspection and ask the user to run verification commands.
- Short context window: load `AGENTS.md`, `framework/rules/core.md`, `framework/config/phase-approval.yml`, `framework/config/context-routing.yml`, and only the current phase workflow.
- Project rules overlay: when `project-rules/project-config.yml` exists, load it and apply the effective-context resolution (`replaces`/`extends`, fail-closed) described in `framework/rules/core.md` §6.2. It is absent in most repos — no-op when missing.

## Closeout Prompt

Every phase closeout should end with:

    [PHASE number: phase name] closeout
    Produced: current phase artifact path
    Open questions: none
    Quality gates: Passed: current phase passed QG IDs, Pending: current phase pending QG IDs
    Next options:
    1. Approve and proceed
    2. Request changes
    3. Resolve open questions
    4. Pause here

## v1.5 notes

- Multi-work-item: ask a structured question listing candidates — see `AGENTS.md`.
- `closed` status + relaxed `wave_policy` need no per-agent special handling (same contract).
