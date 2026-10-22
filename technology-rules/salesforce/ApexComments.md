# Apex Comments Standards

## Class Header Template
Always include comprehensive class documentation:

```apex
/**
 * @description Service class for managing Account-related business logic
 * @author Your Name
 * @date 2024-01-15
 * @group Account Management
 * @since API Version 58.0
 * 
 * History:
 * - 2024-01-15: Initial implementation
 * - 2024-02-01: Added bulk processing support
 */
public with sharing class AccountService {
    // Class implementation
}
```

## Method Documentation Template
Use ApexDoc format for all public/global methods:

```apex
/**
 * @description Updates account types based on business rules
 * @param accounts List of Account records to update
 * @param newType The type to assign to accounts
 * @return List<Account> Updated account records
 * @throws DmlException When DML operation fails
 * @throws IllegalArgumentException When invalid parameters provided
 * 
 * @example
 * List<Account> accounts = [SELECT Id FROM Account LIMIT 10];
 * AccountService.updateAccountTypes(accounts, 'Customer');
 */
public static List<Account> updateAccountTypes(List<Account> accounts, String newType) {
    // Method implementation
}
```

## Inline Comments Best Practices
- Explain **why**, not **what** the code does
- Document complex business logic
- Clarify non-obvious decisions

```apex
// Calculate discount based on account tier (Business requirement BR-001)
Decimal discount = (account.Tier__c == 'Premium') ? 0.15 : 0.05;

// Use bulkified approach to avoid governor limits
Map<Id, Contact> contactMap = new Map<Id, Contact>(
    [SELECT Id, AccountId FROM Contact WHERE AccountId IN :accountIds WITH USER_MODE]
);
```

## Complex Logic Documentation
For intricate business rules, use detailed comments:

```apex
/**
 * Complex discount calculation logic:
 * 1. Base discount determined by account tier
 * 2. Additional 5% for accounts with >100 employees
 * 3. Maximum discount capped at 25% per company policy
 * 4. Special handling for non-profit organizations
 */
private static Decimal calculateDiscount(Account account) {
    // Implementation with detailed inline comments
}
```

## TODO and FIXME Standards
Use standardized tags for maintainability:

```apex
// TODO: Implement caching mechanism for better performance (Ticket: DEV-123)
// FIXME: Handle edge case for null account types (Bug: BUG-456)
// OPTIMIZE: Consider using Platform Events for better scalability
```

## Style Guidelines
- Use complete sentences ending with periods
- Write in present tense ("Calculates discount" not "Will calculate discount")
- Keep comments updated when code changes
- Remove obsolete comments during code reviews
