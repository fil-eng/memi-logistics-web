import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShipment } from "../../../state/shipments/useShipment";
import useForm from "../../../hooks/useForm";
import styles from "./CreateShipment.module.css";

const initialForm = {
  shipmentType: "",
  amount: "",
  unit: "kg",
  pickupPoint: "",
  destination: "",
  date: "",
  fragile: "false",
};

const validate = (values) => {
  const errors = {};

  if (!values.shipmentType.trim())
    errors.shipmentType = "Shipment type is required.";
  if (!values.amount.trim() || Number(values.amount) <= 0)
    errors.amount = "Please enter a valid amount.";
  if (!values.pickupPoint.trim())
    errors.pickupPoint = "Pickup point is required.";
  if (!values.destination.trim())
    errors.destination = "Destination is required.";
  if (!values.date.trim()) errors.date = "Select a pickup date.";

  return errors;
};

const CreateShipment = () => {
  const { createShipmentRequest } = useShipment();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Define field validation order for sequential validation
  const fieldOrder = [
    "shipmentType",
    "amount",
    "pickupPoint",
    "destination",
    "date",
  ];

  const parseWeightKg = (value, unit) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric < 0) return 0;
    if (unit === "ton") return numeric * 1000;
    return numeric;
  };

  const {
    values,
    errors,
    touched,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm({
    initialValues: initialForm,
    validate,
    fieldOrder,
    onSubmit: async (formValues) => {
      setError("");
      try {
        await createShipmentRequest({
          shipmentItem: formValues.shipmentType.trim(),
          origin: formValues.pickupPoint.trim(),
          destination: formValues.destination.trim(),
          weightKg: parseWeightKg(formValues.amount, formValues.unit),
          deliveryDate: formValues.date,
          fragile: formValues.fragile === "true",
        });
        setSuccess("Shipment posted successfully.");
        resetForm();
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to create shipment.",
        );
      }
    },
  });

  useEffect(() => {
    if (!success) return;

    timeoutRef.current = window.setTimeout(() => {
      navigate("/shipper/active-shipments", { replace: true });
    }, 1000);

    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, [success, navigate]);

  const shouldShowError = (fieldName) =>
    (touched[fieldName] || isSubmitted) && errors[fieldName];

  return (
    <div className={styles.createPage}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>CREATE SHIPMENT</h1>
        </div>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Shipment type</span>
              <input
                name="shipmentType"
                value={values.shipmentType}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Dry goods, electronics, fuel, etc."
              />
              {shouldShowError("shipmentType") && (
                <small>{errors.shipmentType}</small>
              )}
            </label>

            <label className={styles.field}>
              <span>Amount</span>
              <div className={styles.inlineInput}>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  value={values.amount}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Amount"
                />
                <select
                  name="unit"
                  value={values.unit}
                  onChange={handleChange}
                  className={styles.selectOption}
                >
                  <option value="kg">Kg</option>
                  <option value="liter">Litter</option>
                  <option value="ton">Ton</option>
                </select>
              </div>
              {shouldShowError("amount") && <small>{errors.amount}</small>}
            </label>

            <label className={styles.field}>
              <span>Pickup point</span>
              <input
                name="pickupPoint"
                value={values.pickupPoint}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="City, port, or address"
              />
              {shouldShowError("pickupPoint") && (
                <small>{errors.pickupPoint}</small>
              )}
            </label>

            <label className={styles.field}>
              <span>Destination</span>
              <input
                name="destination"
                value={values.destination}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="City, port, or address"
              />
              {shouldShowError("destination") && (
                <small>{errors.destination}</small>
              )}
            </label>

            <label className={styles.field}>
              <span>Pickup date</span>
              <input
                name="date"
                type="date"
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {shouldShowError("date") && <small>{errors.date}</small>}
            </label>

            <div className={styles.field}>
              <span className={styles.safe_option}>Fragile</span>
              <div className={styles.optionRow}>
                <label
                  className={`${styles.optionButton} ${
                    values.fragile === "false" ? styles.optionSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="fragile"
                    value="false"
                    checked={values.fragile === "false"}
                    onChange={handleChange}
                  />
                  Normal
                </label>
                <label
                  className={`${styles.optionButton} ${
                    values.fragile === "true"
                      ? styles.optionSelected_Fragile
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="fragile"
                    value="true"
                    checked={values.fragile === "true"}
                    onChange={handleChange}
                  />
                  Fragile
                </label>
              </div>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button className={styles.submitButton} type="submit">
            Post shipment
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;
