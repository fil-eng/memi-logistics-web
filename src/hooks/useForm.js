import { useCallback, useState } from "react";
import { getSequentialErrors } from "../utils/sequentialValidation";

const useForm = ({ initialValues, validate, onSubmit, fieldOrder }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get full validation errors (used for submit and full validation)
  const getFullValidationErrors = useCallback(
    (nextValues) => {
      return validate(nextValues);
    },
    [validate],
  );

  // Get filtered validation errors (sequential or full depending on fieldOrder)
  const getFilteredValidationErrors = useCallback(
    (allErrors) => {
      if (fieldOrder && fieldOrder.length > 0) {
        return getSequentialErrors(allErrors, fieldOrder);
      }
      return allErrors;
    },
    [fieldOrder],
  );

  const runValidation = useCallback(
    (nextValues, useFullValidation = false) => {
      const allErrors = getFullValidationErrors(nextValues);
      const filteredErrors = useFullValidation
        ? allErrors
        : getFilteredValidationErrors(allErrors);
      setErrors(filteredErrors);
      return { allErrors, filteredErrors };
    },
    [getFullValidationErrors, getFilteredValidationErrors],
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => {
      const nextValues = { ...currentValues, [name]: value };

      if (touched[name] || isSubmitted) {
        runValidation(nextValues, isSubmitted);
      } else if (errors[name]) {
        setErrors((currentErrors) => {
          const { [name]: _, ...rest } = currentErrors;
          return rest;
        });
      }

      return nextValues;
    });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((currentTouched) => ({ ...currentTouched, [name]: true }));

    const { allErrors, filteredErrors } = runValidation(values, false);
    if (filteredErrors[name]) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [name]: filteredErrors[name],
      }));
    } else {
      setErrors((currentErrors) => {
        const { [name]: _, ...rest } = currentErrors;
        return rest;
      });
    }
  };

  const handleSubmit = async (event) => {
    if (event?.preventDefault) {
      event.preventDefault();
    }

    setIsSubmitted(true);

    // On submit, get all validation errors (not just sequential)
    const { allErrors } = runValidation(values, true);
    if (Object.keys(allErrors).length > 0) {
      return;
    }

    if (onSubmit) {
      await onSubmit(values);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors,
  };
};

export default useForm;
