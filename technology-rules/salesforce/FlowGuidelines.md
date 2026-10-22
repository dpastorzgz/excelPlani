# Salesforce Flow Guidelines

## Flow Types & Use Cases

### Record-Triggered Flows
- **Before-Save**: Field updates on the same record (fastest execution)
- **After-Save**: Cross-object updates, external callouts, email notifications
- Use entry conditions to prevent unnecessary executions

```
Entry Condition Example:
IF({!$Record.Status__c} != {!$Record__Prior.Status__c} AND {!$Record.Status__c} = "Closed")
```

### Screen Flows
- For user-guided processes and data collection
- Use dynamic choices for better user experience
- Implement proper validation and error handling

### Scheduled Flows
- For batch processing and maintenance operations
- Consider governor limits (2000 records per transaction)
- Use fault connectors for error handling

## Performance Best Practices

### Bulkification
```
❌ BAD: Loop with Get Records inside
FOR EACH record IN recordCollection
    Get Records: WHERE Id = record.Id
    // Process individual record
END FOR

✅ GOOD: Bulk Get Records before loop
Get Records: WHERE Id IN recordCollection.Id
FOR EACH record IN recordCollection
    // Use collection from bulk query
END FOR
```

### Entry Conditions
- Always use entry conditions to prevent unnecessary executions
- Be specific to avoid processing irrelevant records

```
Example Entry Conditions:
- Status change: {!$Record.Status__c} != {!$Record__Prior.Status__c}
- New records only: {!$GlobalConstant.True} (for Before-Save) or ISNEW() (for After-Save)
- Field population: NOT(ISBLANK({!$Record.Email}))
```

### Collection Processing
```
✅ Best Practice for Collections:
1. Get Records (bulk query)
2. Loop through collection
3. Assignment (add to collection variable)
4. Create/Update Records (single DML for entire collection)
```

## Error Handling & Fault Paths

### DML Operations
Always configure fault paths for DML operations:

```
Create Records Element:
├── Success Path → Continue flow
└── Fault Path → 
    ├── Send Email Alert (Admin notification)
    ├── Create Log Record
    └── Screen (if user-facing flow)
```

### Fault Path Best Practices
```apex
// Log error details in fault path
Assignment Element:
- Error_Message__c = {!$Flow.FaultMessage}
- Error_Type__c = "Flow Error"
- Record_Id__c = {!$Record.Id}
- Flow_Name__c = "Account_Validation_Process"
```

## Configuration Management

### Avoid Hardcoding
```
❌ BAD: Hardcoded values
RecordType Id = "012000000000000AAA"
User Id = "005000000000000AAA"

✅ GOOD: Use Custom Metadata or Constants
RecordType Developer Name = "Premium_Account"
Queue Developer Name = "Sales_Queue"
```

### Dynamic Choices
```
Dynamic Choice Configuration:
- Object: Account
- Display Field: Name
- Value Field: Id
- Condition: Type = "Customer"
- Sort Order: Name (Ascending)
```

## Decision Logic Patterns

### Complex Conditions
```
Use Decision Elements for:
- Multiple outcome paths
- Complex business logic
- Status-based routing

Decision Outcomes:
├── High Priority (Amount > 100000 AND Status = "New")
├── Medium Priority (Amount > 50000 AND Status = "New")
├── Low Priority (Amount > 0 AND Status = "New")
└── Default Outcome (All other cases)
```

### Formula Fields in Decisions
```
Examples:
- Date calculations: TODAY() - {!$Record.CreatedDate} > 30
- Text operations: UPPER({!$Record.Type}) = "CUSTOMER"
- Null checks: NOT(ISBLANK({!$Record.Email}))
```

## Integration Patterns

### Apex Actions
When to use custom Apex actions in flows:
- Complex calculations not possible in Flow
- External API integrations
- Complex SOQL queries with dynamic WHERE clauses

```apex
// Example: Custom Apex Action for Flow
@InvocableMethod(label='Calculate Discount' description='Returns discount based on account tier')
public static List<DiscountResult> calculateDiscount(List<DiscountRequest> requests) {
    // Implementation
}
```

### Platform Events
```
Use Platform Events for:
- Asynchronous processing
- Cross-org communication
- External system notifications

Flow Action: Publish Platform Event
- Event: Account_Updated__e
- Fields: Account_Id__c, Status__c, Updated_By__c
```

## Testing & Debugging

### Debug Mode
```
Enable Debug Mode:
1. Setup → Process Automation Settings
2. Check "Enable Flow Debug Mode"
3. Run flow and review debug details
```

### Test Scenarios
```
Required Test Cases:
✅ Happy path (successful execution)
✅ Error scenarios (fault paths)
✅ Bulk scenarios (200+ records)
✅ Permission scenarios (different user profiles)
✅ Edge cases (null values, empty collections)
```

### Flow Test Data
```
Test Data Considerations:
- Create test records with all required fields
- Test with different record types
- Include boundary values (min/max amounts, dates)
- Test with different user permissions
```

## Flow Types Decision Matrix

| Requirement | Before-Save | After-Save | Screen Flow | Scheduled |
|-------------|-------------|------------|-------------|-----------|
| Same-record updates | ✅ Best | ❌ | ❌ | ❌ |
| Cross-object updates | ❌ | ✅ | ✅ | ✅ |
| User interaction | ❌ | ❌ | ✅ | ❌ |
| External callouts | ❌ | ✅ | ✅ | ✅ |
| Email notifications | ❌ | ✅ | ✅ | ✅ |
| Batch processing | ❌ | Limited | ❌ | ✅ |

## Governor Limits Considerations

### Flow Limits
```
Per-Transaction Limits:
- DML statements: 150
- SOQL queries: 100  
- Records processed: 2000 (scheduled flows)
- Flow interviews: 2000

Per-Flow Limits:
- Elements: No hard limit (performance degrades)
- Variables: No hard limit
- Screens: Recommended < 10
```

### Optimization Tips
```
1. Minimize Get Records elements
2. Use collection variables efficiently
3. Leverage Before-Save when possible
4. Consider Apex for complex logic
5. Use subflows for reusability
```

## Flow Checklist
- ✅ Entry conditions configured appropriately
- ✅ Fault paths implemented for DML operations
- ✅ No hardcoded IDs (use Developer Names/Custom Metadata)
- ✅ Collections used for bulk processing
- ✅ Error logging implemented
- ✅ Tested with bulk data (200+ records)
- ✅ User permissions tested
- ✅ Documentation updated
