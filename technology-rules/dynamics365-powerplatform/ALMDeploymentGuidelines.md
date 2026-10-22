# ALM and Deployment Guidelines

## Baseline

- Use unmanaged solutions in development.
- Use managed solutions in test, UAT, and production.
- Store unpacked solution source in source control.
- Treat managed solution zip files as build artifacts.
- Use Power Platform CLI (`pac`) locally and Microsoft Power Platform Build Tools in Azure DevOps pipelines.

## Solution Workflow

1. Build changes in the development environment.
2. Add all changed components to the explicit unmanaged solution.
3. Export the unmanaged solution.
4. Unpack the solution into `solutions/[SolutionName]/src/`.
5. Run Solution Checker on the unmanaged solution.
6. Export or build the managed solution artifact.
7. Import the managed solution into downstream environments.
8. Record evidence in the work item build, verification, testing, and release artifacts.

## Required Local Commands

```bash
pac auth create --url [environment-url]
pac solution export --name [SolutionName] --path solutions/[SolutionName]/[SolutionName].zip --managed false
pac solution unpack --zipfile solutions/[SolutionName]/[SolutionName].zip --folder solutions/[SolutionName]/src --packagetype Unmanaged
pac solution checker --path solutions/[SolutionName]/[SolutionName].zip --outputDirectory work-item/[project-slug]/05-build/checker-results
pac solution export --name [SolutionName] --path solutions/[SolutionName]/[SolutionName]_managed.zip --managed true
pac solution import --path solutions/[SolutionName]/[SolutionName]_managed.zip
```

Project-specific authentication, solution names, and paths may override these
commands, but the build log must record the exact commands used.

## Azure DevOps

Use Microsoft Power Platform Build Tools version 2 tasks consistently in the
same pipeline. Do not mix Build Tools major versions.

Recommended pipeline stages (Build Tools v2 task names):

- Initiate: authenticate (`PowerPlatformAuthenticate` / service connection with workload identity federation) and validate environment access.
- Export: `PowerPlatformExportSolution` (unmanaged) from development.
- Build: `PowerPlatformUnpackSolution` → `PowerPlatformCheckSolution` (blocking on critical/high; publish SARIF) → `PowerPlatformPackSolution` (managed) → publish managed artifact.
- Release: `PowerPlatformImportSolution` with `deploymentsettings.json` (`PowerPlatformSetSolutionVersion` beforehand when bumping) → `PowerPlatformPublishCustomizations`.
- Verify: run smoke + persona checks and record evidence.

## Solution strategy (segmentation, publisher, versioning)

- Segment solutions (`core` vs `feature`); keep layering simple and documented; avoid unmanaged layers downstream.
- One publisher + prefix per product line; never customize in the default solution except inspection/emergency.
- Version every managed artifact (`major.minor.build.revision`); record upgrade type per release:
  `update` (safe additive) vs `upgrade` (breaking) vs `stage-and-upgrade` (hotfix/holding solution).
- Choose rollback before production: previous managed version re-import, upgrade rollback strategy,
  environment backup restore when import cannot reverse, disable app/command/flow as emergency mitigation.

## Environment Variables and Connection References

- Every environment-specific value must be represented by an environment variable, connection reference, secure configuration, or project-approved equivalent.
- Production values must be supplied by pipeline, deployment settings, or administrator-controlled configuration.
- Do not overwrite production connection references with developer-owned connections.
- Resolve per environment with `deploymentsettings.json` — see `templates/deploymentsettings.json.template`.
  Validate settings (connection IDs, types `string/number/boolean/json/secret`, Key Vault references) before import; import with unresolved settings is blocked by DPPG5.12.

## Solution Checker

- Run Solution Checker before deployment evidence is accepted.
- Critical and high findings block the phase unless an approved exception is recorded.
- Store checker output under `work-item/[project-slug]/05-build/checker-results/`.
- Reference checker output from `verification-report.md`.

## Environment Variables and Connection References

- Every environment-specific value must be represented by an environment variable, connection reference, secure configuration, or project-approved equivalent.
- Production values must be supplied by pipeline, deployment settings, or administrator-controlled configuration.
- Do not overwrite production connection references with developer-owned connections.

## Rollback

Rollback must be chosen before production deployment:

- Import previous managed solution version.
- Apply managed solution upgrade rollback strategy.
- Restore environment backup when solution import cannot safely reverse the change.
- Disable affected app, command, or flow as emergency mitigation.

## Checklist

- [ ] Explicit unmanaged development solution exists.
- [ ] Managed artifact is generated for downstream environments.
- [ ] Solution source is unpacked and committed.
- [ ] Solution Checker result is recorded.
- [ ] Environment variables and connection references are handled per environment.
- [ ] Import result/job evidence is recorded.
- [ ] Rollback approach is documented before production.
