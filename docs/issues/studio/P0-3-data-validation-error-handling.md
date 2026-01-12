# [Studio] Implement Data Validation & Error Handling

**Priority:** P0 (Critical)  
**Effort:** Medium (2 weeks)  
**Labels:** `enhancement`, `studio`, `p0-critical`, `quality`, `validation`  
**Milestone:** Studio v2.0 - MVP

## 📋 Summary

Implement comprehensive client-side and server-side validation with clear error messaging to prevent data corruption and improve user experience.

## 🎯 Problem Statement

Without proper validation:
- Users can submit invalid data
- Database integrity is at risk
- No feedback on what went wrong
- Poor user experience with cryptic error messages
- Wasted API calls with invalid data

This is critical for data quality and user trust in the system.

## ✅ Acceptance Criteria

### Client-Side Validation
- [ ] Validate required fields before submission
- [ ] Validate field types (email, URL, phone, etc.)
- [ ] Validate min/max length for text fields
- [ ] Validate min/max values for number fields
- [ ] Validate date ranges
- [ ] Validate regex patterns
- [ ] Validate against enum/select options
- [ ] Validate file size and type for uploads
- [ ] Cross-field validation (end_date > start_date, etc.)
- [ ] Custom validation rules from object metadata
- [ ] Real-time validation on blur
- [ ] Debounced validation on change (async)

### Validation UI/UX
- [ ] Required fields marked with asterisk (*)
- [ ] Validation errors show inline below field
- [ ] Error icon next to invalid fields
- [ ] Error message is clear and actionable
- [ ] Multiple errors displayed if multiple issues
- [ ] Success indicators (green checkmark) for valid fields
- [ ] Form submit button disabled if form is invalid
- [ ] Error summary at top of form (optional)
- [ ] Scroll to first error on submit attempt
- [ ] Error state persists until field is fixed

### Server-Side Validation
- [ ] Handle 400 Bad Request errors from API
- [ ] Parse validation error response from server
- [ ] Map server errors to specific fields
- [ ] Display server errors inline with fields
- [ ] Generic error message for unmapped errors
- [ ] Retry mechanism for transient errors
- [ ] Error code mapping to user-friendly messages

### Error Types to Handle
- [ ] Network errors (offline, timeout)
- [ ] Authentication errors (401, 403)
- [ ] Validation errors (400)
- [ ] Not found errors (404)
- [ ] Conflict errors (409) - concurrent edit
- [ ] Server errors (500, 502, 503)
- [ ] Rate limiting (429)
- [ ] Payload too large (413)

### Error Messages
- [ ] Clear, actionable error messages
- [ ] Avoid technical jargon
- [ ] Suggest how to fix the problem
- [ ] Include error codes for debugging
- [ ] Support internationalization (i18n)
- [ ] Consistent tone and language

### Error Recovery
- [ ] Retry button for failed requests
- [ ] Auto-retry with exponential backoff for transient errors
- [ ] Save draft data on error (localStorage)
- [ ] Restore form data after page refresh
- [ ] Conflict resolution UI for concurrent edits

## 🎨 UI/UX Design

### Inline Validation
```
┌─────────────────────────────────────┐
│  Create New Task                    │
├─────────────────────────────────────┤
│                                     │
│  Name *                             │
│  [                               ]  │
│  ❌ Name is required                │
│                                     │
│  Email *                            │
│  [john@example                   ]  │
│  ❌ Please enter a valid email       │
│                                     │
│  Start Date                         │
│  [2024-03-01                   📅]  │
│  ✅ Valid                            │
│                                     │
│  End Date                           │
│  [2024-02-01                   📅]  │
│  ❌ End date must be after start date│
│                                     │
├─────────────────────────────────────┤
│         [Cancel]  [Save] (disabled) │
└─────────────────────────────────────┘
```

### Error Summary (Top of Form)
```
┌─────────────────────────────────────┐
│  ⚠️ Please fix the following errors:│
│                                     │
│  • Name is required                 │
│  • Email format is invalid          │
│  • End date must be after start date│
│                                     │
│  [Dismiss]                          │
└─────────────────────────────────────┘
```

### Network Error Toast
```
┌─────────────────────────────────────┐
│  ❌ Failed to save record            │
│                                     │
│  Network error. Please check your  │
│  connection and try again.          │
│                                     │
│  [Retry]  [Dismiss]                 │
└─────────────────────────────────────┘
```

### Server Validation Error
```
┌─────────────────────────────────────┐
│  ⚠️ Validation Failed                │
│                                     │
│  The server rejected your changes:  │
│                                     │
│  • Project name already exists      │
│  • Budget exceeds maximum allowed   │
│                                     │
│  Error Code: VALIDATION_ERROR       │
│                                     │
│  [OK]                               │
└─────────────────────────────────────┘
```

### Conflict Resolution
```
┌─────────────────────────────────────┐
│  ⚠️ Concurrent Edit Detected         │
│                                     │
│  This record was modified by        │
│  Jane Doe at 2:34 PM                │
│                                     │
│  Your changes:                      │
│  • Status: Active → Completed       │
│                                     │
│  Their changes:                     │
│  • Status: Active → On Hold         │
│  • Priority: Medium → High          │
│                                     │
│  [Overwrite]  [Merge]  [Cancel]     │
└─────────────────────────────────────┘
```

## 🔧 Technical Implementation

### Validation Schema (Zod)
```typescript
import { z } from 'zod';
import { FieldConfig } from '@objectql/types';

// Generate Zod schema from ObjectQL field metadata
function generateValidationSchema(fields: Record<string, FieldConfig>) {
  const schemaObj: any = {};
  
  for (const [key, field] of Object.entries(fields)) {
    let fieldSchema: any;
    
    // Base type validation
    switch (field.type) {
      case 'text':
      case 'textarea':
        fieldSchema = z.string();
        if (field.validation?.min_length) {
          fieldSchema = fieldSchema.min(field.validation.min_length);
        }
        if (field.validation?.max_length) {
          fieldSchema = fieldSchema.max(field.validation.max_length);
        }
        if (field.validation?.pattern) {
          fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern));
        }
        break;
        
      case 'email':
        fieldSchema = z.string().email();
        break;
        
      case 'url':
        fieldSchema = z.string().url();
        break;
        
      case 'number':
      case 'currency':
        fieldSchema = z.number();
        if (field.validation?.min !== undefined) {
          fieldSchema = fieldSchema.min(field.validation.min);
        }
        if (field.validation?.max !== undefined) {
          fieldSchema = fieldSchema.max(field.validation.max);
        }
        break;
        
      case 'date':
      case 'datetime':
        fieldSchema = z.date();
        break;
        
      case 'boolean':
        fieldSchema = z.boolean();
        break;
        
      default:
        fieldSchema = z.any();
    }
    
    // Required validation
    if (field.required) {
      schemaObj[key] = fieldSchema;
    } else {
      schemaObj[key] = fieldSchema.optional();
    }
  }
  
  return z.object(schemaObj);
}
```

### React Hook Form Integration
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function RecordForm({ objectName, object, initialData, onSubmit }) {
  // Generate validation schema from metadata
  const schema = useMemo(
    () => generateValidationSchema(object.fields),
    [object]
  );
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setError
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData,
    mode: 'onBlur' // Validate on blur
  });
  
  const onSubmitForm = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Handle server validation errors
      if (error.response?.status === 400) {
        const serverErrors = error.response.data.errors;
        for (const [field, message] of Object.entries(serverErrors)) {
          setError(field, { message });
        }
      } else {
        // Show generic error toast
        toast.error('Failed to save record');
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      {/* Fields with error display */}
      <FormField
        label="Name"
        required
        error={errors.name?.message}
      >
        <input {...register('name')} />
      </FormField>
      
      <button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

### Error Handler Hook
```typescript
function useErrorHandler() {
  const handleError = useCallback((error: any) => {
    // Network errors
    if (!navigator.onLine) {
      toast.error('You are offline. Please check your connection.');
      return;
    }
    
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      toast.error('Request timeout. Please try again.');
      return;
    }
    
    // HTTP errors
    const status = error.response?.status;
    
    switch (status) {
      case 400:
        // Validation error - handled inline
        break;
      case 401:
        toast.error('Session expired. Please log in again.');
        // Redirect to login
        break;
      case 403:
        toast.error('You do not have permission to perform this action.');
        break;
      case 404:
        toast.error('Record not found. It may have been deleted.');
        break;
      case 409:
        // Conflict - show conflict resolution UI
        showConflictDialog(error.response.data);
        break;
      case 429:
        toast.error('Too many requests. Please wait a moment.');
        break;
      case 500:
      case 502:
      case 503:
        toast.error('Server error. Please try again later.');
        // Log to error tracking service
        break;
      default:
        toast.error('An unexpected error occurred.');
    }
  }, []);
  
  return { handleError };
}
```

### Cross-Field Validation
```typescript
// Custom cross-field validation
const schema = z.object({
  start_date: z.date(),
  end_date: z.date()
}).refine((data) => data.end_date >= data.start_date, {
  message: 'End date must be on or after start date',
  path: ['end_date'] // Error will show on end_date field
});
```

## 📦 Dependencies

### New Dependencies
```json
{
  "zod": "^3.22.4",                      // Schema validation
  "@hookform/resolvers": "^3.3.4",       // RHF + Zod integration
  "react-hot-toast": "^2.4.1"            // Toast notifications
}
```

## 🧪 Testing Requirements

- [ ] Unit tests for validation schema generation
- [ ] Unit tests for each validation rule type
- [ ] Integration tests for form submission
- [ ] Test all error scenarios (400, 401, 404, 500, etc.)
- [ ] Test network error handling
- [ ] Test cross-field validation
- [ ] Test async validation (e.g., unique field check)
- [ ] Test error message i18n
- [ ] E2E tests for complete validation flows

## 📚 Documentation Needed

- [ ] User guide: Understanding validation messages
- [ ] User guide: Fixing common validation errors
- [ ] Developer guide: Adding custom validation rules
- [ ] Developer guide: Error handling best practices
- [ ] API documentation: Error response format

## 🔗 Related Issues

- Blocks: #TBD Full CRUD Operations
- Related to: #TBD Form Builder
- Related to: #TBD Internationalization

## 💡 Future Enhancements (Out of Scope)

- Async validation (check uniqueness, etc.)
- Custom validation rule builder in Studio
- Validation rule testing UI
- Validation analytics (most common errors)
- Smart suggestions for fixing errors
- Bulk validation for imports

## 🎯 Success Metrics

- 90%+ of validation errors caught client-side
- < 5% of submissions result in server validation errors
- Users can understand and fix 95%+ of errors
- Average time to fix validation error < 30 seconds
- Zero data corruption from invalid submissions

## 📱 Accessibility Requirements

- [ ] Error messages announced to screen readers
- [ ] Error fields focused programmatically
- [ ] ARIA invalid and describedby attributes
- [ ] Color not sole indicator of error (use icons)
- [ ] Error summary has proper role="alert"

## 👥 Assignee Suggestions

Good for:
- Frontend developers with form experience
- QA engineers (testing focus)
- Those familiar with validation libraries

## 📝 Implementation Checklist

### Week 1: Core Validation
- [ ] Set up Zod integration with React Hook Form
- [ ] Implement validation schema generation from metadata
- [ ] Add inline error display to all field components
- [ ] Implement required field validation
- [ ] Implement type validation (email, URL, etc.)
- [ ] Add error states to form UI

### Week 2: Advanced & Server-Side
- [ ] Implement cross-field validation
- [ ] Add server error handling
- [ ] Implement error toast notifications
- [ ] Add conflict resolution UI
- [ ] Implement retry mechanism
- [ ] Add tests and documentation

---

**Estimated Timeline:** 2 weeks
**Risk Level:** Low (well-established patterns)
**Dependencies:** Full CRUD Operations feature should be in progress
