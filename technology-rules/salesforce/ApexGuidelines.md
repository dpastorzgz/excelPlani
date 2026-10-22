# Apex Development Guidelines

## Class Design
- Always declare classes as `with sharing` unless explicitly justified.
- Follow Single Responsibility Principle (SRP).
- Use Virtual/Abstract classes for extensible frameworks.

```apex
// Good: Service class with sharing
public with sharing class AccountService {
    public static void updateAccountType(List<Account> accounts) {
        // Service logic here
    }
}
```

## Trigger Framework
- **One Trigger per Object**: Manage all logic through a Trigger Handler pattern.
- **Logicless Triggers**: Triggers should only call Handler methods; no business logic inside the trigger itself.

```apex
// Good: Logicless trigger
trigger AccountTrigger on Account (before insert, before update, after insert, after update) {
    AccountTriggerHandler.execute();
}

// Handler pattern
public with sharing class AccountTriggerHandler {
    public static void execute() {
        if (Trigger.isBefore) {
            if (Trigger.isInsert) beforeInsert();
            if (Trigger.isUpdate) beforeUpdate();
        }
    }
}
```

## Security & DML
- Enforce CRUD/FLS using `Security.stripInaccessible` or Schema methods.
- Use `with user mode` in SOQL and DML where possible (Salesforce's latest best practice).
- Validate object and field accessibility before DML operations.

```apex
// Good: Strip inaccessible fields before DML
public static void createAccounts(List<Account> accounts) {
    SObjectAccessDecision decision = Security.stripInaccessible(
        AccessType.CREATABLE, accounts);
    insert decision.getRecords();
}

// Good: User mode SOQL (enforces sharing + FLS)
List<Account> accounts = [SELECT Id, Name FROM Account WITH USER_MODE];
```

## Bulkification & Limits
- **Strict Rule**: Zero SOQL or DML statements inside loops.
- Use Maps to link related records efficiently.
- Use `Limits` methods (e.g., `Limits.getQueries()`) for defensive coding in high-volume logic.

```apex
// Good: Bulkified pattern using Maps
public static void updateContactAccounts(List<Contact> contacts) {
    Set<Id> accountIds = new Set<Id>();
    for (Contact con : contacts) {
        if (con.AccountId != null) accountIds.add(con.AccountId);
    }
    
    Map<Id, Account> accountMap = new Map<Id, Account>(
        [SELECT Id, Type FROM Account WHERE Id IN :accountIds WITH USER_MODE]);
    
    for (Contact con : contacts) {
        Account relatedAccount = accountMap.get(con.AccountId);
        // Process logic here - NO SOQL inside loop
    }
}
```

## Error Handling & Logging
- Use try-catch blocks with specific exceptions (e.g., `DmlException`, `QueryException`).
- **Logging**: Implement a custom logging framework rather than just `System.debug`.
- Include governor limits monitoring in high-volume operations.

```apex
// Good: Specific exception handling with logging
public static void processRecords(List<SObject> records) {
    try {
        insert records;
        System.debug('Successfully processed ' + records.size() + ' records');
    } catch (DmlException e) {
        // Log specific DML errors
        for (Integer i = 0; i < e.getNumDml(); i++) {
            System.debug('DML Error: ' + e.getDmlMessage(i));
        }
        throw e;
    }
    
    // Monitor governor limits
    System.debug('SOQL Queries used: ' + Limits.getQueries() + '/' + Limits.getLimitQueries());
}
```

## Async Processing Patterns
- Use **Queueable** for complex async operations with chaining capability.
- Use **Batch** for processing large data volumes (>2000 records).
- Use **@future** only for simple, fire-and-forget operations.

```apex
// Good: Queueable for complex async processing
public class AccountUpdateQueueable implements Queueable {
    private List<Account> accountsToUpdate;
    
    public AccountUpdateQueueable(List<Account> accounts) {
        this.accountsToUpdate = accounts;
    }
    
    public void execute(QueueableContext context) {
        // Process accounts
        update Security.stripInaccessible(AccessType.UPDATABLE, accountsToUpdate).getRecords();
        
        // Chain another queueable if needed
        if (hasMoreWork()) {
            System.enqueueJob(new NextQueueableClass());
        }
    }
}
```

## Quick Decision Checklist
- **Simple field updates on same record**: Before-Save Flow
- **Cross-object updates or complex logic**: Apex Trigger Handler
- **Large data processing (>2000 records)**: Batch Apex
- **Complex async operations**: Queueable Apex
- **External system integration**: Platform Events + Queueable
