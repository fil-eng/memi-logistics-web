/**
 * Sequential Validation Utility
 *
 * This utility enforces progressive field validation where only the first
 * invalid required field shows its error. Once that field is fixed, the next
 * invalid field may show its error.
 */

/**
 * Filters validation errors to show only the first invalid field
 * based on the defined field order.
 *
 * @param {Object} allErrors - All validation errors returned from validator
 * @param {string[]} fieldOrder - Ordered array of field names to check
 * @returns {Object} Filtered errors containing only the first invalid field
 */
export const getSequentialErrors = (allErrors, fieldOrder) => {
  if (!fieldOrder || fieldOrder.length === 0) {
    return allErrors;
  }

  // Find the first field in the order that has an error
  for (const fieldName of fieldOrder) {
    if (allErrors[fieldName]) {
      // Return only this field's error
      return { [fieldName]: allErrors[fieldName] };
    }
  }

  // No errors in the sequential order
  return {};
};

/**
 * Creates a validation wrapper that enforces sequential field validation.
 * Only the first invalid field (in order) will have its error shown.
 *
 * @param {Function} validationFunction - The actual validation function
 * @param {string[]} fieldOrder - Ordered array of field names
 * @returns {Function} Wrapped validation function
 */
export const createSequentialValidator = (validationFunction, fieldOrder) => {
  return (values) => {
    const allErrors = validationFunction(values);
    return getSequentialErrors(allErrors, fieldOrder);
  };
};

/**
 * Determines if a field should show an error in sequential validation.
 * A field shows an error if:
 * 1. It has an error in the current validation state AND
 * 2. Either the field is touched, form is submitted, OR all previous fields are valid
 *
 * @param {Object} errors - Current errors object
 * @param {Object} touched - Touched fields object
 * @param {boolean} isSubmitted - Whether form has been submitted
 * @param {string} fieldName - The field to check
 * @param {string[]} fieldOrder - Ordered array of field names
 * @returns {boolean} Whether to show error for this field
 */
export const shouldShowSequentialError = (
  errors,
  touched,
  isSubmitted,
  fieldName,
  fieldOrder,
) => {
  // Field must have an error to show it
  if (!errors[fieldName]) {
    return false;
  }

  // Always show error if field is touched or form is submitted
  if (touched[fieldName] || isSubmitted) {
    return true;
  }

  return false;
};

/**
 * Gets all validation errors without sequential filtering.
 * Useful for checking if form has any errors on submit.
 *
 * @param {Function} validationFunction - The actual validation function
 * @param {Object} values - Form values
 * @returns {Object} All validation errors
 */
export const getAllValidationErrors = (validationFunction, values) => {
  return validationFunction(values);
};
