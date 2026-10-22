# Apex Test Class Guidelines

## Data Management
- Do not use `SeeAllData=true`.
- Use `@TestSetup` methods to create common data for all test methods in a class.
- Use a **Data Factory** pattern for reusable record creation.

```apex
// Good: Test setup with data factory
@TestSetup
static void setupData() {
    List<Account> accounts = TestDataFactory.createAccounts(5);
    List<Contact> contacts = TestDataFactory.createContacts(accounts, 10);
}
```

## Data Factory Pattern
Create reusable factory methods for consistent test data:

```apex
@TestVisible
public class TestDataFactory {
    public static List<Account> createAccounts(Integer count) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(new Account(
                Name = 'Test Account ' + i,
                Type = 'Customer'
            ));
        }
        insert accounts;
        return accounts;
    }
    
    public static List<Contact> createContacts(List<Account> accounts, Integer count) {
        List<Contact> contacts = new List<Contact>();
        for (Integer i = 0; i < count; i++) {
            contacts.add(new Contact(
                FirstName = 'Test',
                LastName = 'Contact ' + i,
                AccountId = accounts[Math.mod(i, accounts.size())].Id
            ));
        }
        insert contacts;
        return contacts;
    }
}
```

## Test Execution Patterns
- Use `Test.startTest()` and `Test.stopTest()` to reset governor limits and test asynchronous code.
- Always test bulk operations with 200+ records.

```apex
@isTest
static void testBulkAccountUpdate() {
    // Setup
    List<Account> accounts = TestDataFactory.createAccounts(200);
    
    // Execute
    Test.startTest();
    AccountService.updateAccountTypes(accounts);
    Test.stopTest();
    
    // Verify
    List<Account> updatedAccounts = [SELECT Id, Type FROM Account];
    Assert.areEqual(200, updatedAccounts.size(), 'All accounts should be updated');
}
```

## Assertions & Quality
- **Mandatory Assertions**: Every test must have at least one `Assert.areEqual()`, `Assert.isTrue()`, or `Assert.isNull()`.
- Target 100% coverage, but prioritize **behavioral testing** over line coverage.

```apex
// Good: Specific assertions with meaningful messages
Assert.areEqual('Customer', account.Type, 'Account type should be set to Customer');
Assert.isTrue(contacts.size() > 0, 'Contacts should be created');
Assert.isNull(account.ParentId, 'Parent should not be set for new accounts');
```

## Test Scenarios (Required)
Test these scenarios for every method:

**1. Positive Scenarios (Happy Path)**
```apex
@isTest
static void testCreateAccount_ValidData_Success() {
    // Test with valid inputs
}
```

**2. Negative Scenarios (Error Handling)**
```apex
@isTest
static void testCreateAccount_InvalidData_ThrowsException() {
    // Test with invalid inputs, expect exceptions
    try {
        AccountService.createAccount(null);
        Assert.fail('Exception should have been thrown');
    } catch (IllegalArgumentException e) {
        Assert.isTrue(e.getMessage().contains('Account cannot be null'));
    }
}
```

**3. Bulk Scenarios (200+ records)**
```apex
@isTest
static void testProcessAccounts_BulkOperation_Success() {
    List<Account> accounts = TestDataFactory.createAccounts(200);
    // Test bulk processing
}
```

## Testing Async Operations
```apex
@isTest
static void testQueueableExecution() {
    // Setup
    List<Account> accounts = TestDataFactory.createAccounts(5);
    
    Test.startTest();
    System.enqueueJob(new AccountUpdateQueueable(accounts));
    Test.stopTest(); // Forces async execution to complete
    
    // Verify results after async completion
    List<Account> updatedAccounts = [SELECT Id, LastModifiedDate FROM Account];
    Assert.areEqual(5, updatedAccounts.size());
}
```

## Security Testing
Always test CRUD/FLS scenarios:

```apex
@isTest
static void testCreateAccount_InsufficientPermissions_Handled() {
    // Create user with limited permissions
    User testUser = TestDataFactory.createUserWithProfile('Standard User');
    
    System.runAs(testUser) {
        try {
            AccountService.createAccount(new Account(Name = 'Test'));
            // Verify it handles permissions gracefully
        } catch (SecurityException e) {
            Assert.isTrue(e.getMessage().contains('Insufficient permissions'));
        }
    }
}
```

## Quick Test Checklist
- ✅ @TestSetup method with factory data
- ✅ Test.startTest() / Test.stopTest() usage
- ✅ Meaningful assertion messages
- ✅ Positive, negative, and bulk scenarios
- ✅ Exception testing with try-catch
- ✅ Security/permissions testing
- ✅ Async operations testing (if applicable)
