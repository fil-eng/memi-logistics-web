import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShipment } from "../../../state/shipments/useShipment";
import { createShipmentRecord } from "../../../utils/shipmentStorage";
import styles from "./CreateShipment.module.css";

const initialForm = {
  shipperName: "",
  shipmentType: "",
  amount: "",
  unit: "kg",
  pickupPoint: "",
  destination: "",
  date: "",
  safetyOption: "safe",
};

const validate = (values) => {
  const errors = {};

  if (!values.shipperName.trim())
    errors.shipperName = "Shipper name is required.";
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
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const { addShipment } = useShipment();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const timeoutRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const validation = validate(form);
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    const record = createShipmentRecord({
      shipperName: form.shipperName.trim(),
      shipmentType: form.shipmentType.trim(),
      amount: Number(form.amount),
      unit: form.unit,
      pickupPoint: form.pickupPoint.trim(),
      destination: form.destination.trim(),
      date: form.date,
      safetyOption: form.safetyOption,
      status: "pending",
    });

    addShipment(record);
    setSuccess("Shipment posted successfully.");
    setForm(initialForm);
    setErrors({});
  };

  useEffect(() => {
    if (!success) return;

    timeoutRef.current = window.setTimeout(() => {
      navigate("/shipper/dashboard/active-shipments", { replace: true });
    }, 800);

    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, [success, navigate]);

  return (
    <div className={styles.createPage}>
      <div className={styles.headerRow}>
        <div>
          {/* <p className={styles.badge}>Create shipment</p> */}
          <h1 className={styles.title}>CREATE SHIPMENT</h1>
        </div>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Shipper name</span>
              <input
                name="shipperName"
                value={form.shipperName}
                onChange={handleChange}
                placeholder="Your company or name"
              />
              {errors.shipperName && <small>{errors.shipperName}</small>}
            </label>

            <label className={styles.field}>
              <span>Shipment type</span>
              <input
                name="shipmentType"
                value={form.shipmentType}
                onChange={handleChange}
                placeholder="Dry goods, electronics, fuel, etc."
              />
              {errors.shipmentType && <small>{errors.shipmentType}</small>}
            </label>

            <label className={styles.field}>
              <span>Amount</span>
              <div className={styles.inlineInput}>
                <input
                  name="amount"
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Amount"
                />
                <select name="unit" value={form.unit} onChange={handleChange}>
                  <option value="kg">Kg</option>
                  <option value="liter">Litter</option>
                  <option value="ton">Ton</option>
                </select>
              </div>
              {errors.amount && <small>{errors.amount}</small>}
            </label>

            <label className={styles.field}>
              <span>Pickup point</span>
              <input
                name="pickupPoint"
                value={form.pickupPoint}
                onChange={handleChange}
                placeholder="City, port, or address"
              />
              {errors.pickupPoint && <small>{errors.pickupPoint}</small>}
            </label>

            <label className={styles.field}>
              <span>Destination</span>
              <input
                name="destination"
                value={form.destination}
                onChange={handleChange}
                placeholder="City, port, or address"
              />
              {errors.destination && <small>{errors.destination}</small>}
            </label>

            <label className={styles.field}>
              <span>Pickup date</span>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />
              {errors.date && <small>{errors.date}</small>}
            </label>

            <div className={styles.field}>
              <span className={styles.safe_option}>Safety option</span>
              <div className={styles.optionRow}>
                <label
                  className={`${styles.optionButton} ${
                    form.safetyOption === "fragile" ? styles.optionSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="safetyOption"
                    value="fragile"
                    checked={form.safetyOption === "fragile"}
                    onChange={handleChange}
                  />
                  Normal
                </label>
                <label
                  className={`${styles.optionButton} ${
                    form.safetyOption === "safe" ? styles.optionSelected_Fragile : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="safetyOption"
                    value="safe"
                    checked={form.safetyOption === "safe"}
                    onChange={handleChange} 
                  />
                 Fragile
                </label>
              </div>
            </div>
          </div>

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
