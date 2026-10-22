# Lightning Web Components Guidelines

## Architecture
- Follow **Modular Design**: Break large components into smaller, reusable child components.
- Use **Lightning Message Service (LMS)** for cross-DOM communication.

## Best Practices
- Decorators: Use `@api` for public properties and `@track` only for objects/arrays requiring deep mutation tracking.
- **Performance**: Use `@wire` for data fetching where possible for automatic caching.
- **HTML**: Keep templates logic-less; move complex logic to JS getters.

```javascript
// Good: Using @wire for data fetching
import { wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';

export default class AccountList extends LightningElement {
    @wire(getAccounts) 
    accounts;
    
    // Use getter for computed properties
    get hasAccounts() {
        return this.accounts.data && this.accounts.data.length > 0;
    }
}
```

## Lightning Data Service Patterns
Use Lightning Data Service for CRUD operations when possible:

```javascript
// Good: Using Lightning Data Service
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import ID_FIELD from '@salesforce/schema/Account.Id';
import NAME_FIELD from '@salesforce/schema/Account.Name';

export default class AccountUpdater extends LightningElement {
    @api recordId;
    
    async handleSave() {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[NAME_FIELD.fieldApiName] = this.template.querySelector('lightning-input').value;
        
        try {
            await updateRecord({ fields });
            this.showSuccessToast();
        } catch (error) {
            this.showErrorToast(error.body.message);
        }
    }
}
```

## Error Handling Patterns
Always implement proper error handling:

```javascript
// Good: Comprehensive error handling
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MyComponent extends LightningElement {
    async handleAsyncOperation() {
        try {
            const result = await this.performAsyncOperation();
            this.processResult(result);
        } catch (error) {
            console.error('Error in async operation:', error);
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: error.body?.message || 'An unexpected error occurred',
                variant: 'error'
            }));
        }
    }
    
    // Handle @wire errors
    @wire(getRecords)
    wiredRecords(result) {
        if (result.data) {
            this.records = result.data;
        } else if (result.error) {
            console.error('Wire error:', result.error);
            this.showErrorToast('Failed to load records');
        }
    }
}
```

## Component Communication
Use proper patterns for parent-child communication:

```javascript
// Child Component - Dispatch custom events
handleSelection(event) {
    const selectedId = event.target.value;
    this.dispatchEvent(new CustomEvent('recordselect', {
        detail: { recordId: selectedId },
        bubbles: true
    }));
}

// Parent Component - Listen to events
<template>
    <c-child-component onrecordselect={handleRecordSelection}></c-child-component>
</template>

handleRecordSelection(event) {
    const recordId = event.detail.recordId;
    // Handle selection
}
```

## Modals and Dialogs
Always build dialogs on the base **`lightning/modal`** (`LightningModal`) component. Its
header and close (X) button inherit the org theme automatically and behave like the
standard record-edit modal (focus trap, ESC, accessibility).

**Do NOT hand-roll an `slds-modal`** with a custom close button. A hand-rolled
`slds-modal__close` using `slds-button_icon-inverse` renders the X white/invisible against
the backdrop and does **not** adapt to the org theme — it looks broken in themed orgs.

```javascript
// Good: a dialog component extending LightningModal
import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class ConfirmNameModal extends LightningModal {
    @api recordName = '';

    handleChange(event) { this.recordName = event.detail.value; }
    handleCancel() { this.close(null); }            // resolve with null on cancel
    handleConfirm() { this.close(this.recordName); } // resolve with a value on success
}
```

```html
<!-- Good: native themed chrome via modal slots -->
<template>
    <lightning-modal-header label="Confirm name"></lightning-modal-header>
    <lightning-modal-body>
        <lightning-input label="Name" value={recordName} onchange={handleChange}></lightning-input>
    </lightning-modal-body>
    <lightning-modal-footer>
        <lightning-button label="Cancel" onclick={handleCancel}></lightning-button>
        <lightning-button label="Confirm" variant="brand" onclick={handleConfirm}></lightning-button>
    </lightning-modal-footer>
</template>
```

```javascript
// Opener: await the result; the dialog component is not exposed (isExposed=false)
import MyModal from 'c/confirmNameModal';

async openDialog() {
    const result = await MyModal.open({ size: 'small', label: 'Confirm name', recordName: 'Draft' });
    if (result) { /* user confirmed */ }
}
```

Guidance:
- The modal's `*.js-meta.xml` sets `isExposed=false` (opened programmatically, not placed in App Builder).
- Keep validation/creation **server-side inside the modal** so blocking errors render in place; call `this.close(value)` only on success, and `this.close(null)` on cancel.
- Use `lightning-modal-header` `label` for the title; do not re-add a custom close button.

## Performance Optimization
- Use `renderedCallback()` sparingly and with guards
- Implement lazy loading for large datasets
- Use CSS for styling instead of JavaScript when possible

```javascript
// Good: Guarded renderedCallback
renderedCallback() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    // Initialization logic here
}

// Good: Lazy loading pattern
@track visibleRecords = [];
recordsToShow = 20;

loadMoreRecords() {
    const start = this.visibleRecords.length;
    const end = start + this.recordsToShow;
    this.visibleRecords = [
        ...this.visibleRecords, 
        ...this.allRecords.slice(start, end)
    ];
}
```

## Accessibility (WCAG 2.1)
Ensure components are accessible:

```html
<!-- Good: Proper ARIA labels and semantic HTML -->
<template>
    <div role="listbox" aria-label="Account Selection">
        <template for:each={accounts} for:item="account">
            <div key={account.Id} 
                 role="option" 
                 aria-selected={account.isSelected}
                 tabindex="0">
                {account.Name}
            </div>
        </template>
    </div>
    
    <lightning-input 
        label="Account Name" 
        value={accountName}
        required
        message-when-value-missing="Account name is required">
    </lightning-input>
</template>
```

## Testing with Jest
Always include comprehensive Jest tests:

```javascript
// accountList.test.js
import { createElement } from 'lwc';
import AccountList from 'c/accountList';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';

// Mock Apex method
jest.mock('@salesforce/apex/AccountController.getAccounts', () => ({
    default: jest.fn()
}), { virtual: true });

describe('c-account-list', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    test('displays accounts when data is loaded', async () => {
        const mockAccounts = [
            { Id: '001', Name: 'Test Account 1' },
            { Id: '002', Name: 'Test Account 2' }
        ];
        
        getAccounts.mockResolvedValue(mockAccounts);
        
        const element = createElement('c-account-list', {
            is: AccountList
        });
        document.body.appendChild(element);
        
        // Wait for promises to resolve
        await Promise.resolve();
        
        const accountElements = element.shadowRoot.querySelectorAll('.account-item');
        expect(accountElements.length).toBe(2);
    });
});
```

## Security Considerations
- Sanitize user inputs displayed in templates
- Use Lightning Data Service when possible (handles FLS automatically)
- Validate data on both client and server side

```javascript
// Good: Input sanitization
get sanitizedDescription() {
    return this.description ? 
        this.description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') : 
        '';
}
```

## Quick LWC Checklist
- ✅ Use @wire for data fetching
- ✅ Implement proper error handling
- ✅ Add ARIA labels for accessibility
- ✅ Write Jest tests for all functionality
- ✅ Use Lightning Data Service when possible
- ✅ Keep templates logic-less
- ✅ Sanitize user inputs
- ✅ Use semantic HTML elements
- ✅ Build dialogs on `lightning/modal` (themed header + close button) — never hand-roll `slds-modal`
