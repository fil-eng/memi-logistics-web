# Sequential Form Validation Implementation

## Overview

This document describes the sequential validation system implemented across the MEMI frontend. The system ensures that form users only see errors for the first invalid required field in a defined sequence, providing a clear, guided experience rather than overwhelming them with all validation errors at once.

## How It Works

### Core Principle

**When editing a form:** Only show the error for the first field in the validation order that is invalid. Once that field is fixed, the next invalid field's error becomes visible.

**When submitting a form:** Check all fields against all validation rules, but the user experience still prioritizes the first invalid field (they can fix it and resubmit to see the next error).

### Example Flow

For a registration form with fields: `name` → `email` → `password` → `confirmPassword`

**User interaction:**

1. User leaves `name` empty and clicks outside → Only "name required" error shows
2. User leaves `email` empty and clicks outside → Still only "name required" error (name takes priority)
3. User fills in `name` and clicks outside → Now "email required" error shows
4. User fills in `email`, fills in `password`, leaves `confirmPassword` empty
5. User clicks submit → Validation checks all fields, but sequentially guides them to fix issues

## Architecture

### Files Involved

1. **`src/utils/sequentialValidation.js`** - Core validation utility
   - `getSequentialErrors()` - Filters errors to show only the first invalid field
   - `createSequentialValidator()` - Creates a wrapped validation function
   - `shouldShowSequentialError()` - Helper for error visibility logic

2. **`src/hooks/useForm.js`** - Enhanced form hook
   - Now accepts optional `fieldOrder` parameter
   - Uses sequential validation when `fieldOrder` is provided
   - Falls back to showing all errors if `fieldOrder` is not provided

3. **Form components** - Updated to define field order
   - `src/pages/Login/Login.jsx`
   - `src/pages/Register/RegistrationForm/RegistrationForm.jsx`
   - `src/pages/ShipperDashboard/CreateShipment/CreateShipment.jsx`

### Data Flow

```
User input
    ↓
handleChange/handleBlur
    ↓
runValidation()
    ↓
getFullValidationErrors() [calls original validate function]
    ↓
getFilteredValidationErrors() [applies sequential filtering]
    ↓
setErrors() [updates error state with filtered errors]
    ↓
Component renders with only first invalid field's error visible
```

## How to Use in Existing Forms

### Step 1: Define Field Order

In your form component, define the validation order as an array of field names:

```jsx
const fieldOrder = ["email", "password"];
```

**Important:** The order matters! It represents the logical flow users should follow.

### Step 2: Pass to useForm

When initializing useForm, pass the `fieldOrder` parameter:

```jsx
const {
  values,
  errors,
  touched,
  isSubmitted,
  handleChange,
  handleBlur,
  handleSubmit,
} = useForm({
  initialValues,
  validate: validateMyForm,
  fieldOrder, // Add this line
  onSubmit: async (formValues) => {
    // Handle submission
  },
});
```

### Step 3: No Changes Needed to Error Display

The existing `shouldShowError` logic works as-is:

```jsx
const shouldShowError = (fieldName) =>
  (touched[fieldName] || isSubmitted) && errors[fieldName];
```

This already handles the sequential display correctly because:

- `errors` object only contains the first invalid field (due to sequential validation)
- The error only shows if the field is touched or form is submitted
- Once earlier fields are fixed, the next field's error appears in the `errors` object

## Backward Compatibility

If you have a form that doesn't define `fieldOrder`:

```jsx
const {
  // ... other properties
} = useForm({
  initialValues,
  validate: validateForm,
  // No fieldOrder provided
  onSubmit: handleSubmit,
});
```

The form will automatically fall back to showing all validation errors (original behavior).

## How to Add Sequential Validation to New Forms

1. **Create validation function** (standard validation):

```jsx
const validateNewForm = (values) => {
  const errors = {};
  if (!values.field1.trim()) errors.field1 = "Field 1 is required.";
  if (!values.field2.trim()) errors.field2 = "Field 2 is required.";
  if (!values.field3.trim()) errors.field3 = "Field 3 is required.";
  return errors;
};
```

2. **Define field order** in your form component:

```jsx
const fieldOrder = ["field1", "field2", "field3"];
```

3. **Pass to useForm**:

```jsx
const {
  values,
  errors,
  touched,
  isSubmitted,
  handleChange,
  handleBlur,
  handleSubmit,
} = useForm({
  initialValues,
  validate: validateNewForm,
  fieldOrder,
  onSubmit: handleSubmit,
});
```

4. **Render with standard error checking**:

```jsx
<input
  name="field1"
  value={values.field1}
  onChange={handleChange}
  onBlur={handleBlur}
/>;
{
  (touched.field1 || isSubmitted) && errors.field1 && (
    <span className={styles.error}>{errors.field1}</span>
  );
}
```

That's it! Sequential validation is now active.

## Testing Sequential Validation

### Manual Testing Checklist

- [ ] Leave first field empty, blur → Only first field error shows
- [ ] Leave second field empty, blur → Still only first field error shows
- [ ] Fill first field, blur → Second field error appears
- [ ] Fill second field, blur → Third field error appears
- [ ] Continue for all fields...
- [ ] Submit with multiple empty fields → All errors checked, but flow remains guided
- [ ] Fix fields from first to last → Each field error disappears sequentially

### Form-Specific Tests

**Login Form:**

- [ ] Blur email empty → "Email is required" shows
- [ ] Blur password empty → Still only email error
- [ ] Fill email, blur password empty → "Password is required" shows
- [ ] Submit with both empty → Both validated, user guided to fix email first

**Registration Form:**

- [ ] Sequential: name → email → password → confirmPassword
- [ ] Each field's error appears only after previous fields are valid

**Create Shipment Form:**

- [ ] Sequential: shipperName → shipmentType → amount → pickupPoint → destination → date
- [ ] All required fields follow the same sequential pattern

## Advanced: Customizing Sequential Validation

### Change Error Visibility Behavior

If you need custom error visibility logic, you can override `shouldShowError`:

```jsx
const shouldShowError = (fieldName) => {
  // Custom logic: always show errors for validated fields
  if (isSubmitted) return !!errors[fieldName];
  // During editing: only show if touched
  return touched[fieldName] && !!errors[fieldName];
};
```

### Conditional Field Order

For dynamic forms where field order varies:

```jsx
const fieldOrder =
  userRole === "admin"
    ? ["name", "email", "adminFields", "password"]
    : ["name", "email", "password"];
```

### Skip Fields from Sequential Order

If you want a field to always show its error:

```jsx
// Don't include it in fieldOrder - just validate it normally
const fieldOrder = ["email", "password"];
// But still validate 'specialField' in your validator
```

## Performance Considerations

- Sequential validation adds minimal overhead (one array iteration per validation)
- No additional state tracking needed beyond existing implementation
- Memory usage unchanged
- Event handlers unchanged

## Browser and Device Support

Sequential validation works on:

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile, etc.)
- Works with keyboard navigation and screen readers
- No special dependencies required

## Troubleshooting

### Error not showing after field is fixed?

**Check:** Is `fieldOrder` defined? Is the field name spelled correctly in `fieldOrder`?

```jsx
// ✓ Correct
fieldOrder = ["email", "password"];

// ✗ Wrong - typo
fieldOrder = ["emai", "password"];
```

### Multiple errors showing at once?

**Check:** Is `fieldOrder` missing from useForm call?

```jsx
// ✓ With sequential validation
const { ... } = useForm({
  validate,
  fieldOrder, // Must be provided
  ...
});

// ✗ Without sequential validation (shows all errors)
const { ... } = useForm({
  validate,
  // fieldOrder missing
  ...
});
```

### Error disappears unexpectedly when typing?

**Check:** The error in `handleChange` might be getting cleared. This is expected behavior - as user types in the first field, no validation runs until they blur (unless field is already touched).

## Future Enhancements

Possible improvements to consider:

1. **Auto-focus** - Automatically focus the first invalid field on submit
2. **Scroll-to-error** - Scroll to the first invalid field when form is submitted
3. **Progressive validation** - Show warnings for upcoming fields
4. **Configurable behaviors** - Allow per-form customization of when errors appear
5. **Accessibility** - ARIA announcements for error visibility changes

## Related Files

- [useForm hook](../src/hooks/useForm.js)
- [Sequential validation utility](../src/utils/sequentialValidation.js)
- [Auth validators](../src/utils/authValidators.js)
- [Login form](../src/pages/Login/Login.jsx)
- [Registration form](../src/pages/Register/RegistrationForm/RegistrationForm.jsx)
- [Create shipment form](../src/pages/ShipperDashboard/CreateShipment/CreateShipment.jsx)
