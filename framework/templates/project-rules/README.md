# Project Rules Overlay — Template

This directory is the scaffold for the optional `project-rules/` overlay that a
consuming repo/product can add at its repository root.

## When to use it

Use the overlay when the repository has conventions that go beyond the technology
rules: project naming, extra review/quality gates, deployment specifics, etc.
Project rules may only **add or tighten**; they never relax technology or
framework rules.

If you do not add `project-rules/`, nothing changes: the framework loads only the
technology + framework rules for each phase.

## How to adopt it

1. Copy this directory to the repository root:

   ```
   cp -r framework/templates/project-rules/ project-rules/
   ```

2. Edit `project-rules/project-config.yml`:
   - set `project` and `display_name`;
   - list your project guideline files under `guidelines[]` with the phases in
     which each one loads (inline list, e.g. `phases: [03, 04, 05]`);
   - optionally set `replaces: <base path>` to supersede a technology **prose**
     guideline (the base file will not be loaded), or `extends: true` to add on
     top of it.

3. Put your project rules in `rules.md`, your extra gates in `quality-gates.md`
   (using `PRG<phase>.<n>` IDs), and any additional guideline files you declare.

4. Validate:

   ```
   bash framework/scripts/validate-project-rules.sh
   bash framework/scripts/validate-project-rules.sh --phase 5
   bash framework/scripts/validate-project-rules.sh --phase 5 --manifest /tmp/context-phase-5.md
   ```

## Rules and guarantees

- `guidelines[]` is the single source of truth for what loads per phase.
- `replaces` excludes the base file from the effective context (no duplication).
- `quality-gates.md` is never replaceable: base gates always load and your `PRG*`
  gates are added.
- Fail-closed: every reference must point to an existing file, with valid phases.
- Validators use only bash + grep/awk/sed (zero new dependencies).

## Worked example — overriding a technology rule

To replace a technology guideline with a stricter project one, declare `replaces`
in `project-config.yml` and provide the project file:

```yaml
guidelines:
  - file: "NamingConventions.md"
    description: "Project naming — supersedes the technology naming file."
    phases: [03, 04, 05, 06]
    replaces: "technology-rules/salesforce/NamingConventions.md"   # base NOT loaded
```

`project-rules/NamingConventions.md` then becomes the single naming source for
those phases; it must be **at least as strict** and should restate any base rules
it still wants to keep. Confirm with:

```bash
bash framework/scripts/validate-project-rules.sh --phase 5
# PROJECT-RULES ACTIVE-PHASE-5 project-rules/NamingConventions.md
# PROJECT-RULES REPLACES-PHASE-5 technology-rules/salesforce/NamingConventions.md
```

To **add** to the technology layer instead of replacing it, drop `replaces` (or set
`extends: true`) and both files load. See `docs/FRAMEWORK-REFERENCE.md` for the
full walkthrough.

## See also

- `framework/rules/core.md` — resolution and precedence (§6.2, §9)
- `framework/config/context-routing.yml` — `effective_context` block
- `technology-rules/_template/` — how a new technology is added
