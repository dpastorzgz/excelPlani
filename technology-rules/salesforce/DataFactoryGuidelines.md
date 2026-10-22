# Data Factory Guidelines

## Purpose
Centralize and standardize test data creation across all test classes to ensure consistency, maintainability, and reusability.

## Core Data Factory Structure

```apex
@TestVisible
public class TestDataFactory {
    
    // Account Creation Methods
    public static List<Account> createAccounts(Integer count) {
        return createAccounts(count, 'Customer');
    }
    
    public static List<Account> createAccounts(Integer count, String accountType) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(new Account(
                Name = 'Test Account ' + i,
                Type = accountType,
                Industry = 'Technology',
                BillingCountry = 'United States'
            ));
        }
        insert accounts;
        return accounts;
    }
    
    // Contact Creation Methods
    public static List<Contact> createContacts(List<Account> accounts, Integer contactsPerAccount) {
        List<Contact> contacts = new List<Contact>();
        Integer contactIndex = 0;
        
        for (Account acc : accounts) {
            for (Integer i = 0; i < contactsPerAccount; i++) {
                contacts.add(new Contact(
                    FirstName = 'Test',
                    LastName = 'Contact ' + contactIndex,
                    Email = 'test.contact' + contactIndex + '@example.com',
                    AccountId = acc.Id
                ));
                contactIndex++;
            }
        }
        insert contacts;
        return contacts;
    }
    
    // User Creation Methods
    public static User createUserWithProfile(String profileName) {
        Profile profile = [SELECT Id FROM Profile WHERE Name = :profileName LIMIT 1];
        String uniqueUserName = 'testuser' + DateTime.now().getTime() + '@example.com';
        
        User testUser = new User(
            Alias = 'testuser',
            Email = uniqueUserName,
            EmailEncodingKey = 'UTF-8',
            LastName = 'Testing',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            ProfileId = profile.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            UserName = uniqueUserName
        );
        insert testUser;
        return testUser;
    }
}
```

## Advanced Patterns

### Relationship Management
```apex
// Creating related records efficiently
public static Map<Id, List<Contact>> createAccountsWithContacts(Integer accountCount, Integer contactsPerAccount) {
    List<Account> accounts = createAccounts(accountCount);
    List<Contact> contacts = createContacts(accounts, contactsPerAccount);
    
    Map<Id, List<Contact>> accountContactMap = new Map<Id, List<Contact>>();
    for (Contact con : contacts) {
        if (!accountContactMap.containsKey(con.AccountId)) {
            accountContactMap.put(con.AccountId, new List<Contact>());
        }
        accountContactMap.get(con.AccountId).add(con);
    }
    return accountContactMap;
}
```

### Custom Object Support
```apex
// Template for custom objects
public static List<Custom_Object__c> createCustomObjects(Integer count) {
    List<Custom_Object__c> customObjects = new List<Custom_Object__c>();
    for (Integer i = 0; i < count; i++) {
        customObjects.add(new Custom_Object__c(
            Name = 'Test Custom Object ' + i,
            Custom_Field__c = 'Test Value ' + i,
            Status__c = 'Active'
        ));
    }
    insert customObjects;
    return customObjects;
}
```

## Best Practices

### 1. Use Overloaded Methods
```apex
// Basic method
public static List<Account> createAccounts(Integer count) {
    return createAccounts(count, 'Customer', true);
}

// Extended method with parameters
public static List<Account> createAccounts(Integer count, String type, Boolean doInsert) {
    List<Account> accounts = new List<Account>();
    // Implementation
    
    if (doInsert) {
        insert accounts;
    }
    return accounts;
}
```

### 2. Bulk Data Creation
```apex
// Efficient bulk creation for governor limit testing
public static List<Account> createBulkAccounts(Integer count) {
    List<Account> accounts = new List<Account>();
    
    // Create in chunks to avoid heap size limits
    Integer batchSize = 200;
    for (Integer i = 0; i < count; i += batchSize) {
        Integer endIndex = Math.min(i + batchSize, count);
        List<Account> batch = new List<Account>();
        
        for (Integer j = i; j < endIndex; j++) {
            batch.add(new Account(Name = 'Bulk Test Account ' + j));
        }
        insert batch;
        accounts.addAll(batch);
    }
    return accounts;
}
```

### 3. Shared Test Setup
```apex
// Reusable test setup for common scenarios
public static TestData setupAccountHierarchy() {
    Account parentAccount = createAccounts(1, 'Customer')[0];
    List<Account> childAccounts = createAccounts(3, 'Customer');
    
    for (Account child : childAccounts) {
        child.ParentId = parentAccount.Id;
    }
    update childAccounts;
    
    List<Contact> contacts = createContacts(childAccounts, 2);
    
    return new TestData(parentAccount, childAccounts, contacts);
}

// Test data container class
public class TestData {
    public Account parentAccount;
    public List<Account> childAccounts;
    public List<Contact> contacts;
    
    public TestData(Account parent, List<Account> children, List<Contact> cons) {
        this.parentAccount = parent;
        this.childAccounts = children;
        this.contacts = cons;
    }
}
```

## Usage in Test Classes

```apex
@isTest
public class AccountServiceTest {
    
    @TestSetup
    static void setupData() {
        // Use factory for consistent test data
        TestDataFactory.TestData data = TestDataFactory.setupAccountHierarchy();
    }
    
    @isTest
    static void testBulkProcessing() {
        // Test with large datasets
        List<Account> accounts = TestDataFactory.createBulkAccounts(200);
        
        Test.startTest();
        AccountService.processAccounts(accounts);
        Test.stopTest();
        
        // Assertions
        Assert.areEqual(200, [SELECT COUNT() FROM Account]);
    }
    
    @isTest
    static void testUserPermissions() {
        User testUser = TestDataFactory.createUserWithProfile('Standard User');
        
        System.runAs(testUser) {
            // Test with specific user context
            List<Account> accounts = TestDataFactory.createAccounts(5);
            // Test logic here
        }
    }
}
```

## Guidelines Checklist

### ✅ Structure Requirements
- One central TestDataFactory class per project
- Consistent method naming (create, setup patterns)
- Overloaded methods for flexibility
- Bulk creation methods for governor limit testing

### ✅ Data Quality
- Use realistic test data values
- Include required fields
- Set up proper relationships
- Handle unique constraints

### ✅ Performance
- Bulk insert/update operations
- Minimize SOQL queries in factory methods
- Use efficient collection patterns
- Consider heap size limits for large datasets

### ✅ Maintainability
- Document complex data setups
- Use descriptive method names
- Include cleanup methods if needed
- Version control factory updates with code changes
