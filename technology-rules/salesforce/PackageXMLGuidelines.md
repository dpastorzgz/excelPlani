# Package XML Guidelines — Salesforce Phase 5

**Applies to**: Phase 5 (Construction) — Salesforce projects  
**Location of generated file**: `work-item/[project-slug]/05-build/package.xml`

---

## Purpose

The `package.xml` serves two roles in Phase 5:

1. **Deployment manifest** — each group deployment uses `--manifest` pointing to this file, ensuring only the explicitly listed metadata is deployed.
2. **Traceability artifact** — by the end of Phase 5, the file contains the complete inventory of every metadata component created or modified in the feature.

---

## Core Rules

| Rule                                     | Description                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| ❌ No wildcards                          | `<members>*</members>` is **strictly forbidden**. Every member must be named explicitly. |
| ✅ Cumulative                            | The file grows group by group. Never delete existing members when adding a new group.    |
| ✅ One `<types>` block per metadata type | Group all members of the same type under a single `<types>` block.                       |
| ✅ API version                           | The `<version>` must match the `sourceApiVersion` in `sfdx-project.json`.                |
| ✅ Exact API names                       | Member names must match the Salesforce API name exactly (case-sensitive).                |

---

## File Structure

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>ExactMemberName1</members>
        <members>ExactMemberName2</members>
        <name>MetadataTypeName</name>
    </types>
    <!-- one <types> block per metadata type -->
    <version>62.0</version>
</Package>
```

> The `<name>` element must always be the **last child** inside its `<types>` block.

---

## Metadata Type → Member Name Mapping

Use this table to translate a file path under `force-app/main/default/` into the correct `<name>` and `<members>` format for `package.xml`.

| File / Folder path                                                   | `<name>` (metadata type)   | `<members>` format                                     | Example                                 |
| -------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------ | --------------------------------------- |
| `objects/MyObject__c/MyObject__c.object-meta.xml`                    | `CustomObject`             | `ObjectAPIName`                                        | `MyObject__c`                           |
| `objects/MyObject__c/fields/MyField__c.field-meta.xml`               | `CustomField`              | `ObjectAPIName.FieldAPIName`                           | `MyObject__c.MyField__c`                |
| `objects/MyObject__c/validationRules/MyRule.validationRule-meta.xml` | `ValidationRule`           | `ObjectAPIName.RuleName`                               | `MyObject__c.MyRule`                    |
| `objects/MyObject__c/recordTypes/MyRT.recordType-meta.xml`           | `RecordType`               | `ObjectAPIName.RecordTypeName`                         | `MyObject__c.MyRT`                      |
| `objects/MyObject__c/listViews/MyView.listView-meta.xml`             | `ListView`                 | `ObjectAPIName.ViewName`                               | `MyObject__c.MyView`                    |
| `objects/MyObject__c/compactLayouts/MyLayout.compactLayout-meta.xml` | `CompactLayout`            | `ObjectAPIName.LayoutName`                             | `MyObject__c.MyLayout`                  |
| `classes/MyClass.cls`                                                | `ApexClass`                | `ClassName`                                            | `MyClass`                               |
| `triggers/MyTrigger.trigger`                                         | `ApexTrigger`              | `TriggerName`                                          | `MyTrigger`                             |
| `lwc/myComponent/`                                                   | `LightningComponentBundle` | `componentName`                                        | `myComponent`                           |
| `aura/MyComponent/`                                                  | `AuraDefinitionBundle`     | `ComponentName`                                        | `MyComponent`                           |
| `flows/My_Flow.flow-meta.xml`                                        | `Flow`                     | `FlowAPIName` (without `.flow-meta.xml`)               | `My_Flow`                               |
| `permissionsets/My_PS.permissionset-meta.xml`                        | `PermissionSet`            | `PermissionSetName` (without extension)                | `My_PS`                                 |
| `profiles/Admin.profile-meta.xml`                                    | `Profile`                  | `ProfileName` (without extension)                      | `Admin`                                 |
| `layouts/Object__c-Layout.layout-meta.xml`                           | `Layout`                   | `Object__c-LayoutName` (without extension)             | `Account-Account Layout`                |
| `customMetadata/TypeName.RecordName.md-meta.xml`                     | `CustomMetadata`           | `TypeName.RecordName`                                  | `Panel360_Alert_Rule.No_Recent_Contact` |
| `globalValueSets/MyValueSet.globalValueSet-meta.xml`                 | `GlobalValueSet`           | `ValueSetName` (without extension)                     | `MyValueSet`                            |
| `standardValueSets/LeadStatus.standardValueSet-meta.xml`             | `StandardValueSet`         | `ValueSetName` (without extension)                     | `LeadStatus`                            |
| `customPermissions/My_Permission.customPermission-meta.xml`          | `CustomPermission`         | `PermissionName` (without extension)                   | `My_Permission`                         |
| `labels/CustomLabels.labels-meta.xml`                                | `CustomLabel`              | `LabelName` (individual label name, not the file name) | `My_Custom_Label`                       |
| `staticresources/MyResource.resource-meta.xml`                       | `StaticResource`           | `ResourceName` (without extension)                     | `MyResource`                            |
| `contentassets/MyAsset.asset-meta.xml`                               | `ContentAsset`             | `AssetName` (without extension)                        | `MyAsset`                               |
| `tabs/MyTab.tab-meta.xml`                                            | `CustomTab`                | `TabName` (without extension)                          | `MyTab`                                 |
| `applications/MyApp.app-meta.xml`                                    | `CustomApplication`        | `AppName` (without extension)                          | `MyApp`                                 |
| `queues/MyQueue.queue-meta.xml`                                      | `Queue`                    | `QueueName` (without extension)                        | `MyQueue`                               |
| `workflows/Object__c.workflow-meta.xml`                              | `Workflow`                 | `ObjectAPIName`                                        | `MyObject__c`                           |
| `approvalProcesses/Object__c.ProcessName.approvalProcess-meta.xml`   | `ApprovalProcess`          | `ObjectAPIName.ProcessName`                            | `MyObject__c.MyProcess`                 |
| `pages/MyPage.page-meta.xml`                                         | `ApexPage`                 | `PageName` (without extension)                         | `MyPage`                                |

> ⚠️ `Profile` is restricted: include a Profile member **only** for settings that exist exclusively on Profile metadata (login hours, login IP ranges / network access, default application, login flows, profile-level session settings). All access grants (object/field/system permissions, CRUD/FLS, tab/layout visibility) belong in `PermissionSet`. Every Profile member requires a recorded profile-only justification (`SFG3.7`).

---

## Incorrect vs Correct Examples

### ❌ Wildcard — FORBIDDEN

```xml
<types>
    <members>*</members>
    <name>ApexClass</name>
</types>
```

### ✅ Explicit members — REQUIRED

```xml
<types>
    <members>Panel360Controller</members>
    <members>Panel360AccountSelector</members>
    <members>Panel360AlertService</members>
    <members>Panel360PanelBuilder</members>
    <members>Panel360Dto</members>
    <name>ApexClass</name>
</types>
```

---

### ❌ Separate `<types>` blocks per member — INCORRECT

```xml
<types>
    <members>Panel360Controller</members>
    <name>ApexClass</name>
</types>
<types>
    <members>Panel360AccountSelector</members>
    <name>ApexClass</name>
</types>
```

### ✅ All members of the same type in one `<types>` block — CORRECT

```xml
<types>
    <members>Panel360Controller</members>
    <members>Panel360AccountSelector</members>
    <name>ApexClass</name>
</types>
```

---

## Cumulative Update Procedure (per group)

After completing each deployment group in Phase 5:

1. Open `work-item/[project-slug]/05-build/package.xml`.
2. Locate the `<types>` block matching the new metadata type, **or create a new one** if the type is not yet present.
3. Add a `<members>` entry for each new artifact in the group.
4. **Never remove existing entries** — the file is append-only during Phase 5.
5. Save the file.
6. Execute the deployment using the updated manifest (see [Deployment Command](#deployment-command)).

---

## Deployment Command

```bash
sf project deploy start \
  --manifest work-item/[project-slug]/05-build/package.xml \
  --test-level NoTestRun
```

Replace `[project-slug]` with the actual project folder name (e.g., `panel-360-cliente`).

> ⚠️ Do **not** use `--source-dir` or `-d` for group deployments in Phase 5. Always use `--manifest` pointing to the cumulative `package.xml`.

---

## Complete Example — package.xml After All Groups

The following example shows the final state of `package.xml` after all five deployment groups have been completed for a project with Schema, Apex, LWC, and PermissionSet metadata:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">

    <!-- ── GROUP 1: Schema ────────────────────────────────────────────── -->
    <types>
        <members>Panel360_Alert_Rule__mdt</members>
        <name>CustomObject</name>
    </types>
    <types>
        <members>Panel360_Alert_Rule__mdt.Message__c</members>
        <members>Panel360_Alert_Rule__mdt.Rule_Type__c</members>
        <members>Panel360_Alert_Rule__mdt.Is_Active__c</members>
        <members>Panel360_Alert_Rule__mdt.Threshold_Days__c</members>
        <members>Panel360_Alert_Rule__mdt.Field_API_Name__c</members>
        <members>Panel360_Alert_Rule__mdt.Field_Threshold_Value__c</members>
        <members>Panel360_Alert_Rule__mdt.Severity__c</members>
        <name>CustomField</name>
    </types>
    <types>
        <members>Panel360_Alert_Rule.No_Recent_Contact</members>
        <members>Panel360_Alert_Rule.Critical_Case_Open</members>
        <members>Panel360_Alert_Rule.Overdue_Task</members>
        <members>Panel360_Alert_Rule.Opportunity_Closing_Soon</members>
        <members>Panel360_Alert_Rule.Contract_Expiring</members>
        <members>Panel360_Alert_Rule.Inactive_Account</members>
        <name>CustomMetadata</name>
    </types>

    <!-- ── GROUP 2: Apex ──────────────────────────────────────────────── -->
    <types>
        <members>Panel360Dto</members>
        <members>Panel360AccountSelector</members>
        <members>Panel360AlertService</members>
        <members>Panel360PanelBuilder</members>
        <members>Panel360Controller</members>
        <name>ApexClass</name>
    </types>

    <!-- ── GROUP 3: UI (LWC) ──────────────────────────────────────────── -->
    <types>
        <members>panel360Cliente</members>
        <members>panel360ResumenCuenta</members>
        <members>panel360AlertasInteligentes</members>
        <members>panel360CasosAbiertos</members>
        <members>panel360OportunidadesAbiertas</members>
        <members>panel360ActividadReciente</members>
        <members>panel360Contratos</members>
        <name>LightningComponentBundle</name>
    </types>

    <!-- ── GROUP 5: Configuration ─────────────────────────────────────── -->
    <types>
        <members>Panel360_User</members>
        <name>PermissionSet</name>
    </types>

    <version>62.0</version>
</Package>
```

---

## API Version Reference

Check `sfdx-project.json` at the root of the repository:

```json
{
  "sourceApiVersion": "62.0"
}
```

Use the value of `sourceApiVersion` as the `<version>` in `package.xml`.

---

## Quick Reference — Most Common Types in Salesforce Projects

| What you developed                       | `<name>` to use            |
| ---------------------------------------- | -------------------------- |
| Custom object                            | `CustomObject`             |
| Custom field on any object               | `CustomField`              |
| Apex class (production or test)          | `ApexClass`                |
| Apex trigger                             | `ApexTrigger`              |
| LWC component                            | `LightningComponentBundle` |
| Aura component                           | `AuraDefinitionBundle`     |
| Flow                                     | `Flow`                     |
| Permission set                           | `PermissionSet`            |
| Profile (only for profile-only settings) | `Profile`                  |
| Custom Metadata record                   | `CustomMetadata`           |
| Custom Metadata type (object definition) | `CustomObject`             |
| Custom label                             | `CustomLabel`              |
| Static resource                          | `StaticResource`           |
| Validation rule                          | `ValidationRule`           |
| Record type                              | `RecordType`               |
| Page layout                              | `Layout`                   |
