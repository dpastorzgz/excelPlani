---
name: sf-theoretical-coverage
description: >-
  Estimate Salesforce Apex test coverage from static and AI-assisted analysis
  without running tests, deployments, validations, or dry-runs. Useful before a
  Pull Request or CI/CD validation to spot test gaps, uncovered branches, and
  coverage risk. Not an official Salesforce coverage metric.
argument-hint: "Optional: --mode full | differential | combined"
disable-model-invocation: true
---

# Salesforce Theoretical Coverage Skill

## Name
sf-theoretical-coverage

## Version
1.0.0

## Purpose

Analyze Salesforce Apex changes and estimate **theoretical test coverage** without executing Apex tests, deployments, validations, or dry-runs.

This skill performs static and AI-assisted analysis over Apex production code, test classes, Git diffs, call relationships, branches, exception paths, and existing test scenarios.

The result is an **estimated coverage assessment and risk report**, not Salesforce official code coverage.

---

## Important Constraint

This skill MUST NOT present its result as actual Salesforce Apex Code Coverage.

Use these terms:

- Theoretical Coverage
- Estimated Test Coverage
- Static Coverage Assessment
- Differential Coverage Estimate
- Coverage Risk

Never state that the result is the official Salesforce coverage percentage unless coverage data has been obtained from Salesforce after a real test execution.

Official Salesforce coverage can only be confirmed through Salesforce test execution.

---

## When to Use

Use this skill when the user asks to:

- Estimate Apex test coverage without running tests.
- Review whether new Apex code appears sufficiently tested.
- Analyze coverage risk before a Pull Request.
- Detect missing Apex tests.
- Detect uncovered methods or branches.
- Review a Git diff for test gaps.
- Estimate differential coverage of changed code.
- Identify which tests should be added.
- Review Salesforce code before CI/CD validation.
- Reduce unnecessary test executions during local development.
- Perform a pre-flight test coverage review.

Typical triggers:

- "check theoretical coverage"
- "coverage review"
- "estimate coverage"
- "review tests"
- "check whether this Apex is tested"
- "analyze test gaps"
- "coverage without running tests"
- "static coverage"
- "differential coverage"

---

# Analysis Modes

The skill MUST support two primary analysis modes.

## FULL mode

Analyze the complete Apex codebase and estimate theoretical coverage for the entire project.

Use this mode when the user asks for:

- total project coverage;
- overall theoretical coverage;
- repository-wide coverage review;
- global Apex test assessment;
- baseline coverage before a migration or release;
- a full inventory of untested Apex.

Primary output:

```text
Total Theoretical Coverage
```

The denominator includes all executable production Apex in scope, excluding test classes.

## DIFFERENTIAL mode

Analyze only code changed relative to a target branch or supplied Git diff.

Use this mode when the user asks for:

- PR coverage;
- branch coverage;
- changed-code coverage;
- delta coverage;
- pre-merge coverage review.

Primary output:

```text
Differential Theoretical Coverage
```

## AUTO mode

If the user does not explicitly choose a mode:

- use `DIFFERENTIAL` when a Git diff / PR / target branch is clearly available and the request is about changes;
- use `FULL` when the request is about the project, repository, solution, package, or total coverage;
- if both are useful, calculate and report BOTH.

When both are reported, show:

```text
Total Theoretical Coverage
Differential Theoretical Coverage
```

Do not substitute one for the other.

---

# Inputs

Accept one or more of the following inputs:

## Preferred Inputs

1. Git repository containing Salesforce metadata.
2. Git diff between the current branch and the target branch.
3. Apex production classes.
4. Apex trigger files.
5. Apex test classes.

## Optional Inputs

- Existing Salesforce coverage information.
- Test execution reports from previous runs.
- `ApexCodeCoverage` export.
- `ApexCodeCoverageAggregate` export.
- Existing CI/CD logs.
- Pull Request / Merge Request diff.
- Changed-file list.
- Architecture or functional specification.

If Git is available, prefer differential analysis against the target branch.

Default target branch priority:

1. Explicitly provided target branch.
2. `origin/main`
3. `origin/master`
4. `main`
5. `master`

---

# Supported Salesforce Assets

Analyze:

- `.cls`
- `.trigger`

Consider relationships with:

- Apex classes
- Apex triggers
- Apex interfaces
- Apex abstract classes
- Apex test classes
- Queueable Apex
- Batch Apex
- Schedulable Apex
- Future methods
- Invocable methods
- REST resources
- SOAP services
- Platform Event handlers
- Trigger handlers
- Domain/service/repository patterns
- Selectors
- Controllers
- Lightning/Aura/LWC Apex controllers

Do not calculate theoretical Apex coverage for:

- LWC JavaScript
- Aura JavaScript
- Flow
- Validation Rules
- Formula fields

These may be analyzed separately for testing risk, but they MUST NOT be included in the Apex theoretical coverage percentage.

---

# Analysis Workflow

Perform the analysis in the following order.

## Step 1 — Detect Repository Structure

Locate Salesforce source roots.

Typical paths:

```text
force-app/main/default/classes
force-app/main/default/triggers
src/classes
src/triggers
```

Also inspect `sfdx-project.json` when available.

Identify package directories dynamically instead of assuming only `force-app`.

---

## Step 2 — Identify Production Apex and Tests

Classify Apex files.

A class is considered a test class when one of the following is detected:

```apex
@isTest
@IsTest
testMethod
```

Separate:

```text
Production Apex
Test Apex
Triggers
```

Exclude test classes from production-code denominator.

---

## Step 3 — Determine Change Scope

When Git is available, obtain the changed Apex files.

Preferred comparison:

```bash
git diff --name-only <target>...HEAD
```

Also inspect changed lines:

```bash
git diff --unified=0 <target>...HEAD
```

Classify changes as:

- New class
- Modified class
- Deleted class
- New trigger
- Modified trigger
- New method
- Modified method
- New branch
- Modified branch
- New exception path

Focus the main assessment on changed production code.

---

# Static Code Model

Build an approximate structural model of every changed production component.

Detect:

## Methods

- public
- private
- protected
- global
- static
- instance
- constructors

## Branches

Detect at minimum:

```text
if
else if
else
switch
when
ternary expressions
```

## Loops

Detect:

```text
for
for-each
while
do-while
```

## Exception Paths

Detect:

```text
try
catch
finally
throw
AuraHandledException
custom exceptions
```

## Salesforce Operations

Detect:

```text
insert
update
delete
undelete
upsert
merge
Database.*
SOQL
SOSL
HTTP callouts
Messaging
EventBus
System.enqueueJob
Database.executeBatch
System.schedule
```

## Entry Points

Detect:

```text
@AuraEnabled
@InvocableMethod
@RestResource
@HttpGet
@HttpPost
@HttpPut
@HttpPatch
@HttpDelete
webservice
trigger entry points
Queueable.execute
Batchable.start
Batchable.execute
Batchable.finish
Schedulable.execute
```

---

# Test-to-Code Mapping

Analyze test classes and determine which production components they appear to exercise.

Use several signals.

## Strong Signals

- Direct method invocation.
- Direct constructor invocation.
- Direct class reference.
- Trigger execution through DML on its SObject.
- Queueable execution.
- Batch execution.
- REST invocation.
- Invocable invocation.

## Medium Signals

- Test setup data causes the production component to execute indirectly.
- Test calls a façade/controller that calls the component.
- Test invokes a service that depends on the component.

## Weak Signals

- Class name appears only in comments.
- Shared object creation could potentially execute a trigger.
- Generic TestDataFactory usage without clear execution path.

Do not count weak signals as proven coverage.

---

# Call Graph

Build an approximate call graph when possible.

Example:

```text
AccountController
    -> AccountService
        -> AccountSelector
        -> AccountDomain
```

If a test invokes `AccountController`, downstream code MAY be considered potentially exercised.

However:

- Reduce confidence for each indirect hop.
- Do not assume every method of a referenced class executes.
- Do not mark all branches as covered just because the class is reachable.

---

# Scenario Analysis

For each changed method, identify relevant scenarios.

At minimum inspect:

## Happy Path

Normal execution with valid data.

## Boundary Conditions

Examples:

```text
null
empty list
zero
negative values
maximum values
date boundaries
string length
record count boundaries
```

## Conditional Branches

For:

```apex
if (account.Type == 'Partner')
```

look for tests creating both:

```text
Type = Partner
Type != Partner
```

when both branches are relevant.

## Exception Paths

For each catch/throw path, identify whether a test appears to force the exception.

## CRUD / DML Paths

Detect successful and failing operations where applicable.

## Bulk Scenarios

For trigger and bulk-processing code, check for tests with:

```text
1 record
multiple records
large collections when relevant
```

Do not require arbitrary 200-record tests unless the code or context makes the bulk boundary relevant.

## Security Scenarios

When code explicitly depends on:

```text
with sharing
without sharing
inherited sharing
USER_MODE
Security.stripInaccessible
CRUD/FLS checks
```

identify whether tests appear to cover the relevant security behavior.

Do not invent a security gap purely because the production class contains `with sharing`.

---

# Theoretical Coverage Calculation

Calculate a theoretical coverage estimate using weighted static evidence.

The skill MUST be capable of calculating BOTH:

```text
Total Theoretical Coverage
Differential Theoretical Coverage
```

depending on the selected analysis mode.

The calculation is intentionally conservative.

## Unit of Analysis

Use executable production statements and branches where they can be reasonably identified.

Approximate each production method using:

```text
Executable statements
Conditional branches
Exception paths
Entry-point execution
```

---

## Coverage Evidence Score

Assign each executable area one of these states:

### HIGH confidence covered

Weight:

```text
1.00
```

Examples:

- Test directly invokes the method.
- Test clearly executes the branch condition.
- Trigger test performs DML that demonstrably enters the trigger path.

### MEDIUM confidence covered

Weight:

```text
0.70
```

Examples:

- Test invokes the method through one known call layer.
- Test setup clearly appears to exercise the path but invocation is indirect.

### LOW confidence covered

Weight:

```text
0.30
```

Examples:

- Path is potentially executed indirectly but cannot be demonstrated statically.

### NOT covered

Weight:

```text
0.00
```

No relevant scenario or execution path found.

---

# Branch Weighting

Branches carry additional risk because high line coverage can still hide untested logic.

Use this conceptual weighting:

```text
Executable statements: 70%
Branch/scenario coverage: 30%
```

Suggested formula:

```text
Theoretical Coverage =
    (Statement Evidence × 0.70)
  + (Branch Evidence × 0.30)
```

If reliable branch extraction is not possible, report:

```text
Statement Coverage Estimate
Branch Coverage Assessment
```

separately instead of manufacturing a precise combined number.

---

# Total Project Coverage

When `FULL` mode is selected, calculate:

```text
Total Theoretical Coverage
```

The denominator MUST include all executable production Apex in the selected project/package scope, excluding test classes.

Analyze all:

- Apex classes
- Apex triggers
- handlers
- services
- selectors
- domains
- controllers
- async Apex
- invocable Apex
- REST/SOAP endpoints

For the full-project result, report at minimum:

```text
Production Apex files analyzed
Test classes analyzed
Executable methods
Estimated covered methods
Branches detected
Estimated covered branches
Total Theoretical Coverage
Confidence
Coverage Risk distribution
```

Example:

```text
TOTAL THEORETICAL COVERAGE

Production Apex files:          146
Test classes:                    83
Executable methods:             912
Estimated covered methods:      801
Branches detected:              624
Estimated covered branches:     493

Total theoretical coverage:     ~84%
Confidence:                     MEDIUM
```

Where useful, break down the total by:

- package directory;
- functional domain;
- Apex type;
- namespace;
- folder/module;
- risk level.

Example:

| Area | Apex Files | Theoretical Coverage | Confidence | Risk |
|---|---:|---:|---|---|
| Sales | 42 | ~91% | High | Low |
| Pricing | 31 | ~74% | Medium | High |
| Integrations | 28 | ~82% | Medium | Medium |
| Common | 45 | ~86% | High | Low |

Do not average component percentages naively.

The total percentage MUST be computed from the weighted executable units in the global denominator.

---

# Differential Coverage

When a Git diff is available and `DIFFERENTIAL` mode is selected, calculate:

```text
Differential Theoretical Coverage
```

Only changed/new executable code belongs in this denominator.

This should be the primary metric for Pull Request analysis.

Example:

```text
Changed executable statements: 48
Estimated covered statements: 41
Changed branches: 10
Estimated covered branches: 7

Theoretical differential coverage: ~81%
```

Always prefix percentages with:

```text
~
estimated
theoretical
```

Never display an estimated value as an exact Salesforce metric.

---

# Confidence Score

Every theoretical coverage percentage MUST include confidence.

Use:

```text
HIGH
MEDIUM
LOW
```

## HIGH

Use when:

- Test-to-code mapping is explicit.
- Most changed methods are directly invoked.
- Branch scenarios can be inferred clearly.
- Repository structure is complete.

## MEDIUM

Use when:

- Significant indirect calls exist.
- Some branches cannot be statically resolved.
- Factories or framework abstractions obscure execution.

## LOW

Use when:

- Dynamic Apex is heavily used.
- Reflection-like behavior exists.
- Complex trigger frameworks obscure routing.
- Key dependencies are missing.
- Test files are unavailable.
- Only partial source code is available.

---

# Coverage Risk Score

Assign one risk level to each changed component.

```text
LOW
MEDIUM
HIGH
CRITICAL
```

## LOW

- Relevant tests exist.
- Main methods appear exercised.
- Major branches appear represented.
- Exception handling has reasonable coverage.

## MEDIUM

- Tests exist but scenarios are incomplete.
- Some new branches lack explicit tests.
- Indirect coverage dominates.

## HIGH

- Changed methods have no clear test execution.
- Important branches are untested.
- Significant new logic has no associated tests.

## CRITICAL

Examples:

- New trigger with no apparent test.
- New production class with no test references.
- High-impact business logic with no test scenario.
- Deployment-critical path appears entirely untested.

Do not use risk levels as proof of actual Salesforce coverage failure.

---

# Special Salesforce Rules

## Triggers

For each trigger determine:

```text
SObject
events
handler
routing logic
```

Example:

```apex
trigger AccountTrigger on Account (
    before insert,
    before update
)
```

Check test evidence for both events when the code differs between them.

---

## Trigger Frameworks

Recognize common patterns:

```text
Trigger
 -> TriggerHandler
 -> Domain
 -> Service
```

Follow handler relationships where statically visible.

Avoid marking handler methods covered merely because the trigger exists.

---

## Async Apex

For:

```text
Queueable
Batchable
Schedulable
@future
```

look for:

```apex
Test.startTest();
...
Test.stopTest();
```

and explicit invocation of the asynchronous execution.

Flag asynchronous logic as a gap when tests only instantiate the class without executing the async entry point.

---

## Callouts

Look for:

```text
HttpCalloutMock
Test.setMock
WebServiceMock
```

Flag callout paths lacking a mock where execution would require one.

---

## Batch Apex

Review separately:

```text
start
execute
finish
```

A test executing the batch does not automatically prove every conditional branch inside all three phases.

---

## Sharing / User Context

Detect use of:

```apex
System.runAs
```

when logic depends on profiles, permissions, ownership, or sharing.

Only flag missing `runAs` scenarios when security/user-context behavior is actually relevant to the changed code.

---

# AI Review

After static mapping, perform semantic analysis.

The AI reviewer should answer:

1. What business scenarios does this code implement?
2. Which scenarios are represented in tests?
3. Which scenarios appear missing?
4. Which branches are especially risky?
5. Which exception paths are untested?
6. Are tests asserting behavior or merely executing code?
7. Are there weak assertions?
8. Are there tests that may pass without validating the intended behavior?
9. Are new production methods missing corresponding test scenarios?
10. Are changed lines more risky than the aggregate percentage suggests?

---

# Assertion Quality

Coverage alone is insufficient.

Evaluate assertions.

Strong assertions:

```apex
System.assertEquals(...)
System.assertNotEquals(...)
System.assert(...)
Assert.areEqual(...)
Assert.isTrue(...)
```

Identify tests with:

- No assertions.
- Assertions unrelated to changed behavior.
- Only `System.assert(true)`.
- Assertions that merely verify record existence when business calculations changed.

Report this separately as:

```text
Test Quality Risk
```

Do not reduce theoretical line coverage solely because assertion quality is weak.

Instead report:

```text
Coverage estimate: HIGH
Test quality: MEDIUM/HIGH RISK
```

---

# False Positive Prevention

Do not infer test coverage only from:

- Similar class names.
- A `TestDataFactory`.
- A reference in comments.
- Test setup records.
- Imports or type declarations.
- Mock classes that are never used.
- Test classes located near the production class.

Require an execution relationship.

---

# Historical Salesforce Coverage

If historical Salesforce coverage data is provided, use it as supporting evidence.

Label it clearly:

```text
Historical Salesforce Coverage
```

Example:

```text
Historical Salesforce Coverage: 82%
Theoretical Differential Coverage: ~76%
Historical data age: 14 days
```

Never assume historical coverage remains valid after code changes.

If source code has changed since the last real execution, reduce confidence.

---

# Recommended Output

Produce a concise executive summary followed by detailed findings.

Use this structure.

---

## 1. Coverage Summary

Adapt the summary to the selected analysis mode.

### FULL mode

```text
THEORETICAL APEX COVERAGE REVIEW

Mode: FULL

Scope
----------------------------------
Production Apex analyzed:      146
Test classes analyzed:          83
Executable methods:            912
Branches detected:             624

Coverage
----------------------------------
Total theoretical coverage:    ~84%
Confidence: MEDIUM

Risk
----------------------------------
LOW:       91 components
MEDIUM:    34 components
HIGH:      17 components
CRITICAL:   4 components
```

### DIFFERENTIAL mode

```text
THEORETICAL APEX COVERAGE REVIEW

Mode: DIFFERENTIAL

Scope
----------------------------------
Production Apex changed:         8
Test classes analyzed:          14
Changed methods:                23
Changed branches:               11

Coverage
----------------------------------
Differential theoretical coverage: ~84%
Confidence: HIGH

Risk
----------------------------------
LOW:        4 components
MEDIUM:     2 components
HIGH:       2 components
CRITICAL:   0 components
```

### Combined mode

When both are useful, show both:

```text
Coverage
----------------------------------
Total theoretical coverage:        ~82%
Differential theoretical coverage: ~91%
Confidence: HIGH
```

---

## 2. Component Assessment

Use a table:

| Component | Change | Tests Found | Theoretical Coverage | Confidence | Risk |
|---|---|---:|---:|---|---|
| AccountService | Modified | 3 | ~91% | High | Low |
| PricingEngine | Modified | 1 | ~64% | High | High |
| OrderTrigger | New | 0 | ~20% | Medium | Critical |

---

## 3. Missing Test Scenarios

Example:

```text
PricingEngine.calculateDiscount()

Missing scenario:
Account.Type == 'Partner'
AND Discount__c > MAX_DISCOUNT

Reason:
A new conditional branch was introduced but no test data
appears to exercise the true branch.

Suggested test:
calculateDiscount_partnerMaximumDiscount()
```

---

## 4. Changed-Code Findings

Prioritize changed code.

Example:

```text
HIGH — PricingEngine.cls

New branch:
if (customer.Type == 'Partner' && discount > MAX_DISCOUNT)

Tests found:
✓ standard customer
✓ partner standard discount
✗ partner exceeding maximum discount

Recommended action:
Add a test for the maximum discount branch.
```

---

## 5. Test Quality

Example:

```text
OrderServiceTest

Coverage evidence:
HIGH

Assertion quality:
MEDIUM RISK

Reason:
The test invokes OrderService.createOrder(), but only checks
that an Order record exists. It does not verify TotalAmount,
Status, or applied pricing rules.
```

---

## 6. Suggested Tests

Provide test suggestions, not full code unless requested.

Example:

```text
Recommended Apex tests

1. PricingEngineTest.calculateDiscount_partnerMaximumDiscount
2. OrderServiceTest.createOrder_invalidPrice
3. AccountTriggerTest.beforeUpdate_partnerConversion
```

For each suggested test specify:

```text
Setup
Execution
Expected result
Business scenario
```

---

# Pull Request Mode

When analyzing a Pull Request or Git branch, prioritize:

```text
CHANGED CODE
```

over aggregate repository coverage.

However, if the user requests the total project view as well, calculate BOTH:

```text
Total Theoretical Coverage
Differential Theoretical Coverage
```

The delta metric must not replace the global metric.

Return:

```text
Differential Theoretical Coverage
Changed Methods Coverage
New Branch Coverage
Coverage Risk
Suggested Tests
```

Avoid spending excessive analysis on unchanged legacy code unless it directly affects changed execution paths.

---

# Optional Quality Gate

If requested by the user, apply a theoretical quality gate.

Suggested default:

```text
Estimated differential coverage >= 80%
No CRITICAL coverage gaps
No HIGH-risk new Apex component without tests
Every new public/global method has at least one identified test scenario
Every materially new branch has a corresponding test scenario or documented justification
```

Important:

This is an engineering quality gate, NOT a Salesforce deployment gate.

Do not claim passing this gate guarantees deployment success.

---

# Recommended CI Result

Example:

```text
Salesforce Theoretical Coverage Review
---------------------------------------

Status: WARNING

Differential theoretical coverage: ~78%
Confidence: HIGH

2 high-risk gaps detected.

HIGH
PricingEngine.calculateDiscount
Missing maximum-discount branch test.

HIGH
OrderService.createOrder
Exception scenario has no test.

Recommendation:
Add the identified scenarios before Salesforce validation.
```

---

# Machine-Readable Output

When automation or CI/CD integration is requested, optionally emit a mode-aware structure.

Example with both total and differential analysis:

```json
{
  "type": "salesforce-theoretical-coverage",
  "mode": "combined",
  "coverage": {
    "total": {
      "estimatedCoverage": 82,
      "confidence": "MEDIUM"
    },
    "differential": {
      "estimatedCoverage": 91,
      "confidence": "HIGH"
    }
  },
  "components": [
    {
      "name": "PricingEngine",
      "type": "ApexClass",
      "estimatedCoverage": 64,
      "confidence": "HIGH",
      "risk": "HIGH",
      "missingScenarios": [
        "Partner customer exceeding maximum discount"
      ]
    }
  ],
  "summary": {
    "productionFilesAnalyzed": 146,
    "productionFilesChanged": 8,
    "testClassesAnalyzed": 83,
    "changedMethods": 23,
    "changedBranches": 11,
    "highRiskGaps": 2,
    "criticalRiskGaps": 0
  }
}
```

---

# Invocation Examples

Examples of intended usage:

```text
/coverage-review
```

Default to AUTO mode.

```text
/coverage-review --mode full
```

Calculate total theoretical coverage for the complete Apex project.

```text
/coverage-review --mode differential
```

Calculate theoretical coverage only for changed Apex.

```text
/coverage-review --mode combined
```

Calculate both total and differential theoretical coverage.

Equivalent natural-language requests must also be supported.

---

# Suggested Commands

If local shell access is available, useful commands include:

```bash
git status --short
git branch --show-current
git diff --name-only origin/main...HEAD
git diff --unified=0 origin/main...HEAD
find . -name "*.cls" -o -name "*.trigger"
```

Do not execute Salesforce tests unless explicitly requested.

Do not execute:

```bash
sf apex run test
sf project deploy validate
sf project deploy start --dry-run
sfdx force:apex:test:run
```

as part of theoretical coverage analysis.

---

# Optional Salesforce Historical Coverage Retrieval

If the environment permits Salesforce API access and the user explicitly wants historical coverage, coverage information may be retrieved without starting a new test execution.

Possible Tooling API objects:

```text
ApexCodeCoverage
ApexCodeCoverageAggregate
```

Treat these values as historical Salesforce results, not fresh coverage.

Show the timestamp/age when possible.

---

# Reasoning Principles

Always follow these principles:

1. Be conservative.
2. Prefer a false warning over false confidence.
3. Never fabricate exact runtime behavior.
4. Explain why a path appears covered.
5. Explain why a path appears uncovered.
6. Focus on changed code.
7. Separate coverage from test quality.
8. Separate historical Salesforce coverage from theoretical coverage.
9. Clearly state uncertainty.
10. Recommend concrete tests for each meaningful gap.

---

# Final Disclaimer

Every report MUST contain a short note equivalent to:

> Theoretical coverage is based on static and AI-assisted analysis. It does not represent official Salesforce Apex code coverage and does not replace Apex test execution or deployment validation.

Keep this note concise and do not repeat it throughout the report.

---

# Success Criteria

The skill is successful when it helps a developer determine, before executing Salesforce tests:

- whether changed Apex appears adequately tested;
- where test gaps probably exist;
- which branches need additional scenarios;
- which production components have the highest coverage risk;
- which tests should be created or extended;
- whether the code is ready to proceed to real Salesforce validation.
