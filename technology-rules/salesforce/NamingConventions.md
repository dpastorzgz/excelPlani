# Naming Conventions

## Business Objects vs Project Objects

- **Business Objects**: Used across multiple applications, includes standard objects
- **Project Objects**: Used only in specific applications, must have unique prefix For example: `BYD_`
- **Framework Objects**: Structural components use prefix `FW_`

## General Naming Rules

- **Language**: All descriptions and comments must be written in English
- **Self-Documentation**: All description fields must be completed
- **Descriptive Names**: Avoid single letters except for loop iterators (i, j, k)
- **Camel Case**: Classes use CapitalizedCamelCase, methods use lowerCamelCase
- **Constants**: UPPER_CASE_WITH_UNDERSCORES
- **No Underscores**: Except for application prefixes and constants
- **Avoid Abbreviations**: Use full descriptive names

## Naming Convention Rules

| Component            | Pattern                                  | Example                                     |
| -------------------- | ---------------------------------------- | ------------------------------------------- |
| **Objects**          | `[ProjectName]_<ObjectName>__c`          | `[ProjectName]_TerritoryMember__c`          |
| **Junction Objects** | `[ProjectName]_<Object1><Object2>Jnc__c` | `[ProjectName]_AccountContactJnc__c`        |
| **Custom Fields**    | `[ProjectName]_<FieldName>__c`           | `[ProjectName]_CountryCode__c`              |
| **Boolean Fields**   | `[ProjectName]_Is<FieldName>__c`         | `[ProjectName]_IsVipMember__c`              |
| **Picklist Fields**  | `[ProjectName]_<FieldName>Sel__c`        | `[ProjectName]_CountrySel__c`               |
| **Multi-Picklist**   | `[ProjectName]_<FieldName>MSel__c`       | `[ProjectName]_CountryMSel__c`              |
| **Date Fields**      | `[ProjectName]_<FieldName>Date__c`       | `[ProjectName]_ValidationDate__c`           |
| **DateTime Fields**  | `[ProjectName]_<FieldName>DateTime__c`   | `[ProjectName]_TechnicalServiceDateTime__c` |
| **Lookup Fields**    | `[ProjectName]_<FieldName>Lookup__c`     | `[ProjectName]_MainContactLookup__c`        |
| **Master-Detail**    | `[ProjectName]_<FieldName>MDetail__c`    | `[ProjectName]_MainContactMDetail__c`       |
| **URL Fields**       | `[ProjectName]_<FieldName>Url__c`        | `[ProjectName]_WebsiteUrl__c`               |
| **Text Fields**      | `[ProjectName]_<FieldName>Txt__c`        | `[ProjectName]_IdentifierTxt__c`            |
| **Text Area**        | `[ProjectName]_<FieldName>TxtArea__c`    | `[ProjectName]_CommentTxtArea__c`           |
| **Number Fields**    | `[ProjectName]_<FieldName>Num__c`        | `[ProjectName]_AgeNum__c`                   |
| **Phone Fields**     | `[ProjectName]_<FieldName>Phone__c`      | `[ProjectName]_GSMNum__c`                   |
| **Email Fields**     | `[ProjectName]_<FieldName>Email__c`      | `[ProjectName]_contactEmail__c`             |
| **Currency Fields**  | `[ProjectName]_<FieldName>Currency__c`   | `[ProjectName]_amountCurrency__c`           |
| **Rollup Summary**   | `[ProjectName]_<FieldName>Rollup__c`     | `[ProjectName]_totalAmountRollup__c`        |

## Apex Components

| Component             | Pattern                                    | Example                                    |
| --------------------- | ------------------------------------------ | ------------------------------------------ |
| **Triggers**          | `[ProjectName]_<ObjectName>Trigger`        | `[ProjectName]_AccountTrigger`             |
| **Trigger Handlers**  | `[ProjectName]_<ObjectName>TriggerHandler` | `[ProjectName]_AccountTriggerHandler`      |
| **General Classes**   | `[ProjectName]_<ClassName><Suffix>`        | `[ProjectName]_QuotePDFGenerator`          |
| **Controllers**       | `[ProjectName]_<ClassName>Controller`      | `[ProjectName]_ExampleController`          |
| **Schedulers**        | `[ProjectName]_<ClassName>Schedule`        | `[ProjectName]_ExampleSchedule`            |
| **Batch Classes**     | `[ProjectName]_<ClassName>Batch`           | `[ProjectName]_ExampleBatch`               |
| **Test Classes**      | `[ProjectName]_<ClassName>Test`            | `[ProjectName]_ExampleTest`                |
| **Web Services**      | `[ProjectName]_<ClassName>WS`              | `[ProjectName]_GetAccountWS`               |
| **Invocable Classes** | `[ProjectName]_<ClassName>Invocable`       | `[ProjectName]_GetRecommendationInvocable` |
| **Queueable Classes** | `[ProjectName]_<ClassName>Queueable`       | `[ProjectName]_ExampleQueueable`           |

## Flow Components

| Component              | Pattern                                                       | Example                                              |
| ---------------------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| **Screen Flows**       | `[ProjectName]_SCR_<ShortDescription>`                        | `[ProjectName]_SCR_AccountCreateRelatedData`         |
| **Autolaunched Flows** | `[ProjectName]_<ObjectName>_<ShortDescription>`               | `[ProjectName]_LeadUpdateStatus`                     |
| **Triggered Flows**    | `[ProjectName]_<ObjectName><TriggerEvent>_<ShortDescription>` | `[ProjectName]_AccountBeforeInsert_ValidateDocument` |

## Lightning Components

| Component                                                          | Pattern                                 | Example                                                         |
| ------------------------------------------------------------------ | --------------------------------------- | --------------------------------------------------------------- |
| **Lightning Components**                                           | `[ProjectName]_<descriptiveName>`       | `[ProjectName]_AccountContractsList`                            |
| **Lightning Web Components**                                       | `[ProjectName]_<descriptiveName>`       | `[ProjectName]_alfrescoViewer`                                  |
| **Use Lightning Web Components in other LWC (Kebab Case keep \_)** | `[ProjectName]_<descriptiveName>`       | `[ProjectName]_AccountHierarchy` -> `c-b-y-d_account-hierarchy` |
| **Lightning Events**                                               | `[ProjectName]_<PastTenseVerb>`         | `[ProjectName]_AccountSelected`                                 |
| **Platform Events**                                                | `[ProjectName]_<PastTenseVerb>Event__e` | `[ProjectName]_CaseSelectedEvent__e`                            |
