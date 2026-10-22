# Deployment & Source Control Guidelines

> Canonical command reference: `technology-rules/salesforce/deploy-protocol.md`.
> On conflict, the deploy protocol governs. This file adds project structure,
> environment, static-analysis, and CI guidance around it.

## Project Structure

- Use the **Salesforce DX** source format for all metadata.
- Maintain a clear separation of concerns in the `force-app/main/default` directory.

## Essential Salesforce CLI Commands (canonical dialect)

```bash
# Deploy one artifact (Phase 5 compile check, inside validated group scope)
sf project deploy start -d force-app/main/default/<exact-path> --test-level NoTestRun

# Group official record (Phase 5)
sf project deploy start --manifest work-item/[project-slug]/05-build/group-N-package.xml --test-level NoTestRun

# Dry run / pre-validation (Phase 3 gate, Phase 9)
sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml --test-level RunLocalTests

# Dry run / pre-validation with specified tests (Phase 9 interactive option)
sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml --test-level RunSpecifiedTests --tests A,B,C

# Reproduce any deploy
sf project deploy report -i <jobId>

# Quick deploy a validated deployment (production, within window)
sf project deploy quick --job-id YOUR_VALIDATION_ID

# Retrieve metadata from org
sf project retrieve start --manifest work-item/[project-slug]/05-build/package.xml
```

> Do NOT use `--dry-run` (replaced by `deploy validate`), `--use-manifest` (use `--manifest`),
> broad `-d <type>/` directories for group deploys, or `--source-dir force-app` for releases
> (deprecated — release the Phase 5 manifest; exception only with written sign-off).

## Environment & Configuration Management

- **No Hardcoding**: Never hardcode Environment-specific IDs (e.g., RecordType IDs, Profile IDs).
- Use **Custom Metadata Types** for environment-specific configurations.
- Use **Named Credentials** for external system integrations.

```apex
// Good: Using Custom Metadata for configuration
Configuration__mdt config = Configuration__mdt.getInstance('Default');
String apiEndpoint = config.API_Endpoint__c;

// Bad: Hardcoded values
String apiEndpoint = 'https://api.production.com/v1/';
```

## Quality Gates & Static Analysis

### PMD Configuration

The canonical ruleset is `.pmd/ruleset.xml` (single source of truth). Severity
policy: rules declared **P1/P2 block** the gate; **P3/P4/P5 are reported and
triaged**, not blocking. Do not create a second ruleset elsewhere.

The gate evaluates only the P1/P2 subset:

```bash
pmd check -R .pmd/ruleset.xml -d force-app/main/default --minimum-priority 2 --format text
```

### Analysis Commands

```bash
# Blocking gate: only P1/P2 rules run (exit code 4 = blocker)
pmd check -R .pmd/ruleset.xml -d force-app/main/default --minimum-priority 2 --format text

# Full report for evidence and P3+ triage (PMD + ESLint, normalized severities)
sf scanner run --target "force-app/main/default" --engine pmd,eslint --normalize-severity

# Check for security vulnerabilities
sf scanner run --target "force-app/main/default" --category Security
```

## CI/CD Pipeline Example

### Basic Validation Pipeline

```bash
#!/bin/bash
# Authenticate to org
sf org login jwt --username $SF_USERNAME --jwt-key-file $JWT_KEY_FILE --client-id $CLIENT_ID

# Run static analysis
sf scanner run --target "force-app/main/default" --format csv

# If validation passes, deploy the validated manifest (not force-app)
if [ $? -eq 0 ]; then
    sf project deploy validate --manifest work-item/[project-slug]/05-build/package.xml --test-level RunLocalTests
    sf project deploy start --manifest work-item/[project-slug]/05-build/package.xml --test-level RunLocalTests
fi
```

## Phase 5 — Per-Task Build & Deploy Protocol (primary loop)

This is the **mandatory per-task execution loop during Phase 5 (Construction)**. For every individual task listed in `04-tasks/task-list.md`, complete the following **5-step cycle in full** before starting the next task. No task may be marked as done until all five steps succeed with 0 errors.

> ⚠️ **No tests are executed in Phase 5.** Use `--test-level NoTestRun` on every deploy command.

### Step A — Build the task metadata

Construct all metadata artifacts required by the task. Apply the following construction rules by type:

| Metadata type                       | Construction rule                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Custom Object (`*.object-meta.xml`) | Create the **complete XML** file — `Label`, `PluralLabel`, `NameField`, `DeploymentStatus`, `SharingModel`, and all required elements |
| Custom Field (`*.field-meta.xml`)   | Create the **complete XML** file — `fullName`, `label`, `type`, and all type-specific required elements                               |
| Apex Class (`*.cls`)                | Create the class file **AND** its `*.cls-meta.xml` (correct `apiVersion`, `status: Active`)                                           |
| Apex Trigger (`*.trigger`)          | Create the trigger file **AND** its `*.trigger-meta.xml` (correct `apiVersion`, `status: Active`)                                     |

> ❌ Never create a `.cls` or `.trigger` without its `-meta.xml` counterpart — the CLI requires both files to deploy.

```xml
<!-- Example: minimal *.cls-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<ApexClass xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>62.0</apiVersion>
    <status>Active</status>
</ApexClass>
```

```xml
<!-- Example: minimal *.field-meta.xml (Text field) -->
<?xml version="1.0" encoding="UTF-8"?>
<CustomField xmlns="http://soap.sforce.com/2006/04/metadata">
    <fullName>MyField__c</fullName>
    <label>My Field</label>
    <length>255</length>
    <required>false</required>
    <type>Text</type>
</CustomField>
```

### Step B — Deploy the task metadata (no tests)

Deploy **only the minimum set of files** required for this task (one artifact or one logical unit such as an object folder):

```bash
# Custom Object (deploy the whole object folder — includes fields)
sf project deploy start -d force-app/main/default/objects/MyObject__c --test-level NoTestRun

# Standalone Custom Field
sf project deploy start -d force-app/main/default/objects/MyObject__c/fields/MyField__c.field-meta.xml --test-level NoTestRun

# Apex Class (both .cls and .cls-meta.xml are picked up automatically from the path)
sf project deploy start -d force-app/main/default/classes/MyService.cls --test-level NoTestRun
```

If the deployment fails, treat as **[BLOCKER]**: fix the source and re-run before proceeding to Step C.

### Step C — Update package.xml

Add the task's metadata members to `work-item/[project-slug]/05-build/package.xml`:

- Locate or create the `<types>` block for each metadata type.
- Add one `<members>` entry per artifact using its **exact Salesforce API name**.
- The file is **append-only** — never remove existing entries.
- `<members>*</members>` is strictly forbidden — every member must be named explicitly.

```xml
<!-- Example: after adding a custom field and an Apex class -->
<types>
    <members>MyObject__c.MyField__c</members>
    <name>CustomField</name>
</types>
<types>
    <members>MyService</members>
    <name>ApexClass</name>
</types>
```

> 📖 Full format reference and member naming rules: [`PackageXMLGuidelines.md`](../technology-rules/salesforce/PackageXMLGuidelines.md).

### Step D — Deploy package.xml (no tests)

```bash
sf project deploy start \
  --manifest work-item/[project-slug]/05-build/package.xml \
  --test-level NoTestRun
```

This confirms the cumulative manifest remains accurate and deployable after adding the new task's members. If it fails, check for incorrect API names or missing `<types>` blocks — fix the manifest and re-run Step D without restarting Step B.

### Step E — Mark the task as done

In `04-tasks/task-list.md`, change `- [ ]` to `- [x]` for the completed task.

> ❌ Do **not** mark a task as done until Steps A–D have all completed successfully with 0 errors.

---

## Phase 5 — Incremental Deployment by Dependency (Fail-Fast Protocol)

This is the **mandatory deployment protocol during Phase 5 (Construction)**. The goal is to detect compilation and metadata errors as early as possible, one artifact at a time, before they compound.

> ⚠️ **No tests are executed in Phase 5 deployments.** Use `--test-level NoTestRun` on every command. Apex test execution is reserved for Phase 7.  
> ⚠️ **Never target a full metadata type directory.** Always deploy the specific file or folder of the artifact created in the feature.

### Step 0 — Identify the target org

Before executing any deployment command, the agent **must** determine the target org.

```bash
# Check for a default org
sf org list --json
```

- Inspect the JSON output for an entry where `"isDefaultUsername": true`.
- **Default org found** → use it automatically. Record its alias and username in `build-log.md` under **Target Org**. Omit `--target-org` from all commands (the CLI resolves the default automatically).
- **No default org** → present the full list (alias + username) to the user and ask: _"No default org is configured. Which org alias should I use as the deployment target for this phase?"_ Record the confirmed alias in `build-log.md` and append `--target-org <alias>` to every subsequent `sf project deploy start` command.

> ❌ Do **not** skip this step. Deploying to the wrong org is a critical, potentially irreversible error.

### Step 0b — Deploy after each completed group

A _deployment group_ is all artifacts belonging to the **same dependency layer** (Schema, Apex, UI, Automation, Configuration) that have been fully implemented in the current construction cycle.

**Rule**: as soon as all artifacts in a group are coded and self-reviewed, execute the full incremental deployment sequence for that group **before** starting implementation of the next group.

```
[Group: Schema]  → implement all → deploy individually (fail-fast)
                 → update package.xml → deploy with --manifest → ✅ proceed to [Group: Apex]

[Group: Apex]    → implement all → deploy individually (fail-fast)
                 → update package.xml → deploy with --manifest → ✅ proceed to [Group: UI]
...
```

- Record each group deployment in `build-log.md`: group name, artifacts, commands, job IDs, result.
- If any artifact in a group fails to deploy → **STOP**. Fix and re-deploy before proceeding.
- After every successful group: update `work-item/[project-slug]/05-build/package.xml` with the group's metadata members and execute the manifest deployment (see Step 3b).

### Step 1 — Inventory the feature metadata

Before executing any deployment, produce a complete list of every metadata artifact **created or modified** in the current feature, with its exact path. Read `04-tasks/task-list.md` to identify all completed tasks and map them to their paths.

```
# Example inventory
force-app/main/default/objects/Panel360__c/
force-app/main/default/objects/Panel360__c/fields/Cliente__c.field-meta.xml
force-app/main/default/classes/Panel360Service.cls
force-app/main/default/classes/Panel360Controller.cls
force-app/main/default/lwc/panel360ResumenCliente/
force-app/main/default/permissionsets/Panel360_User.permissionset-meta.xml
```

### Step 2 — Build the dependency-ordered deployment plan

Analyze the dependencies among the inventoried artifacts. Use the following reference order (lower layer = fewer dependencies = deploy first):

| Layer                 | Metadata types                                                                                           | Rationale                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **1 — Schema**        | `objects/`, `customMetadata/`, `globalValueSets/`, `customPermissions/`, `standardValueSets/`            | Foundation — no Apex or UI dependencies                                                           |
| **2 — Apex**          | `classes/`, `triggers/`                                                                                  | References schema; deploy utility/helper classes before service/controller classes; triggers last |
| **3 — UI**            | `lwc/`, `aura/`, `pages/`                                                                                | References Apex controllers and schema                                                            |
| **4 — Automation**    | `flows/`, `workflows/`, `approvalProcesses/`                                                             | References objects, Apex, and LWC                                                                 |
| **5 — Configuration** | `permissionsets/`, `profiles/` (profile-only settings only), `layouts/`, `tabs/`, `applications/`, `labels/`, `staticresources/`, `contentassets/` | Typically no compilation dependencies; Profile only for justified profile-only settings (`SFG3.7`) |

> Within the same layer, if artifact A depends on artifact B, deploy B first.

Write the full ordered deployment plan to `build-log.md` **before** executing any command.

### Step 3 — Execute one artifact at a time (fail-fast)

```bash
# ✅ CORRECT — deploy a specific artifact
sf project deploy start -d force-app/main/default/objects/Panel360__c --test-level NoTestRun
sf project deploy start -d force-app/main/default/classes/Panel360Service.cls --test-level NoTestRun
sf project deploy start -d force-app/main/default/classes/Panel360Controller.cls --test-level NoTestRun
sf project deploy start -d force-app/main/default/lwc/panel360ResumenCliente --test-level NoTestRun
sf project deploy start -d force-app/main/default/permissionsets/Panel360_User.permissionset-meta.xml --test-level NoTestRun

# ❌ WRONG — never deploy an entire type directory
sf project deploy start -d force-app/main/default/classes --test-level NoTestRun
```

### Step 3b — Update package.xml and deploy with manifest

Once **all artifacts in the current group** have deployed successfully one by one (Step 3), execute the following sequence:

**3b.1 — Update `work-item/[project-slug]/05-build/package.xml`**

Add every artifact from the completed group to the cumulative `package.xml`:

- Locate the `<types>` block for each metadata type used in the group (create the block if the type is new).
- Add one `<members>` entry per artifact, using its exact Salesforce API name.
- **Never remove existing entries** — the file is append-only during Phase 5.
- `<members>*</members>` is strictly forbidden — every member must be named explicitly.

> 📖 For the complete format reference, member naming rules, and worked examples, see  
> [`technology-rules/salesforce/PackageXMLGuidelines.md`](../technology-rules/salesforce/PackageXMLGuidelines.md).

**3b.2 — Deploy the group using the updated manifest**

```bash
sf project deploy start \
  --manifest work-item/[project-slug]/05-build/package.xml \
  --test-level NoTestRun
```

This manifest deployment:

- Confirms that the `package.xml` is accurate and parseable by the Salesforce CLI.
- Serves as the **official deployment record** for the group (the individual artifact commands in Step 3 are the fail-fast diagnostic pass).
- Ensures only the explicitly listed metadata is deployed — no unintended side effects.

**3b.3 — Record in build-log.md**

In `work-item/[project-slug]/05-build/build-log.md`, record for this group:

- The full list of members added to `package.xml`.
- The manifest deploy command and the resulting job ID.
- The deployment result (SUCCESS / FAILED).

> ⚠️ If the manifest deployment fails after all individual artifact deployments succeeded, the most likely cause is an incorrect API name or a missing `<types>` block in `package.xml`. Fix the manifest and re-run Step 3b.2 — do **not** restart Step 3.

### Step 4 — Fail-fast rule

| Result     | Action                                                                                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ Success | Record the job ID and command in `build-log.md`. Continue to the next artifact.                                                                                             |
| ❌ Failure | **STOP immediately.** Fix the source file(s) that caused the error. Re-run the same command. Do **not** proceed to the next artifact until this one succeeds with 0 errors. |

All inventoried artifacts must deploy successfully before Phase 5 is complete.

### Step 5 — Final manifest deploy + relevant tests (mandatory end-of-phase validation)

Once every artifact in the inventory has deployed with 0 errors, execute the **final validation** using the Phase 05 cumulative manifest:

```bash
# Step 5a — final manifest deploy (NoTestRun)
sf project deploy start \
  --manifest work-item/[project-slug]/05-build/package.xml \
  --test-level NoTestRun

# Step 5b — final manifest deploy + RunRelevantTests (required)
sf project deploy start \
  --manifest work-item/[project-slug]/05-build/package.xml \
  --test-level RunRelevantTests
```

> ✅ This guarantees the manifest is complete and that the full metadata set deploys together.
>
> ⚠️ If Step 5b fails, treat it as **[BLOCKER]**: fix code/tests/manifest, then re-run Step 5b until 0 failures.

Record for both steps in `build-log.md`:

- exact command(s)
- Deploy ID / job ID
- status
- test summary (for Step 5b)

---

## Deployment Strategies

### 1. Phase 5 Incremental Deployment (Fail-Fast + Manifest)

- Deploy only the concrete artifacts created/modified in the current feature
- **Step 3**: One artifact per command, ordered by dependency layer — fail-fast error detection
- **Step 3b**: After each group succeeds → update `work-item/[project-slug]/05-build/package.xml` → deploy with `--manifest` (official group record)
- `--test-level NoTestRun` — no tests during construction phase
- Stop at first error in any step, fix, and re-run
- After all groups deploy with 0 errors → run `--test-level RunRelevantTests` as final validation
- `package.xml` is cumulative: it contains every metadata member deployed across all groups by the end of Phase 5
- See [`PackageXMLGuidelines.md`](../technology-rules/salesforce/PackageXMLGuidelines.md) for format rules

### 2. Production Release (Phase 9 — manifest-first)

- Release the Phase 5 manifest, **not** `force-app`:
  `sf project deploy start --manifest work-item/[project-slug]/05-build/package.xml --test-level RunLocalTests`
- `--source-dir force-app` is deprecated — exception only with written sign-off (SFG5.14)
- Always `validate` before `start`
- When the hop sets `validate_interactive: true` in `release-pipeline.yml`, follow the
  interactive protocol (ask test level → validate → ask deploy) in
  [`deploy-protocol.md`](./deploy-protocol.md) §5.1. This is configurable per hop.

### 3. Quick Deploy

- Use validated deployments for production
- Reduces deployment time by skipping re-validation
- Ideal for time-sensitive releases: `sf project deploy quick --job-id <validation-job-id>`

## Version Control Best Practices

### .gitignore Template

```gitignore
# Salesforce DX
.sfdx/
.localdevserver/

# IDE files
.vscode/settings.json
.idea/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
```

### Branch Strategy

- **main/master**: Production-ready code
- **develop**: Integration branch
- **feature/\***: Individual features
- **hotfix/\***: Critical production fixes

## Environment Management Checklist

- ✅ No hardcoded IDs or URLs
- ✅ Custom Metadata for configurations
- ✅ Named Credentials for external systems
- ✅ Environment-specific Custom Settings
- ✅ Separate permission sets per environment
- ✅ Profiles only for profile-only settings with recorded justification (`SFG3.7`)
- ✅ Data seeding scripts for sandboxes

## Deployment Troubleshooting

- Check deployment status: `sf project deploy report`
- View detailed errors: `sf project deploy report --verbose`
- Cancel deployment: `sf project deploy cancel`
- Check test results: `sf apex test report --test-run-id YOUR_TEST_ID`
