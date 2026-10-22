# Naming Conventions

## General Rules

- Use English names for all source-controlled artifacts.
- Use clear business terminology; avoid abbreviations unless they are standard in the domain.
- Prefix custom Dataverse schema names with the approved publisher prefix.
- Keep display names user-friendly and schema names stable.
- Do not include environment names, developer initials, sprint numbers, or temporary labels in production artifact names.

## Solutions and Publishers

| Artifact | Pattern | Example |
| -------- | ------- | ------- |
| Publisher prefix | 2-8 lowercase letters | `axet` |
| Solution unique name | `PublisherPrefix_FunctionalArea` | `axet_CustomerService` |
| Managed artifact | `[SolutionUniqueName]_[version]_managed.zip` | `axet_CustomerService_1_4_0_0_managed.zip` |
| Unmanaged export | `[SolutionUniqueName]_[version].zip` | `axet_CustomerService_1_4_0_0.zip` |

## Dataverse

| Artifact | Pattern | Example |
| -------- | ------- | ------- |
| Table schema name | `prefix_singularnoun` | `axet_contract` |
| Column schema name | `prefix_descriptive_name` | `axet_renewaldate` |
| Choice schema name | `prefix_subject_status` | `axet_contract_status` |
| Relationship schema name | `prefix_table_relatedtable_purpose` | `axet_account_contract_customer` |
| Custom API | `prefix_BusinessVerbNoun` | `axet_CalculateRenewalRisk` |

## Apps, Forms, Views, and Commands

| Artifact | Pattern | Example |
| -------- | ------- | ------- |
| Model-driven app | `[Domain] - [Audience]` | `Customer Service - Agent Workspace` |
| Main form | `[Table] - Main` | `Contract - Main` |
| Quick create form | `[Table] - Quick Create` | `Contract - Quick Create` |
| View | `[Audience] - [Purpose]` | `Agents - Active Renewals` |
| Command | `[Verb] [Object]` | `Approve Renewal` |

## Power Automate

| Artifact | Pattern | Example |
| -------- | ------- | ------- |
| Cloud flow | `[Trigger] - [Outcome]` | `Contract Updated - Notify Owner` |
| Child flow | `Child - [Capability]` | `Child - Send Renewal Notification` |
| Environment variable | `EV_[DOMAIN]_[NAME]` | `EV_CONTRACT_RENEWAL_QUEUE` |
| Connection reference | `CR_[CONNECTOR]_[PURPOSE]` | `CR_DATAVERSE_OPERATIONS` |

## Plugins, Custom APIs, and PCF

| Artifact | Pattern | Example |
| -------- | ------- | ------- |
| Plugin assembly | `[Company].[Domain].Plugins` | `Axet.Contracts.Plugins` |
| Plugin class | `[Message][Table][Purpose]Plugin` | `UpdateContractRiskPlugin` |
| Plugin step name | `[Message] [Table] - [Purpose]` | `Update Contract - Recalculate Risk` |
| PCF control | `[Domain][Purpose]Control` | `ContractTimelineControl` |

## Source Folders

```text
solutions/[SolutionUniqueName]/src/
plugins/[Company].[Domain].Plugins/
pcf/[ControlName]/
```
