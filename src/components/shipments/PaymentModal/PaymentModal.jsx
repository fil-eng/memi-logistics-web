import styles from "./PaymentModal.module.css";
import { useState } from "react";

const PAYMENT_METHODS = [
  "CASH",
  "BANK_TRANSFER",
  "CRYPTO_TRANSFER",
  "WALLET_TRANSFER",
];

const PaymentModal = ({ shipment, onClose, onSubmit }) => {
  const [currencyCode, setCurrencyCode] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!currencyCode || !paymentMethod || !amount) {
      setError("Currency code, amount, and payment method are required");
      return;
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setError("Amount must be a valid number greater than 0");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const payload = {
        currencyCode: currencyCode.toUpperCase(),
        amount: numAmount,
        paymentMethod,
        note: note || "",
      };

      if (typeof onSubmit === "function") {
        await onSubmit(payload);
      }
      setShowSuccess(true);
      setTimeout(() => {
        onClose && onClose();
      }, 1000);
    } catch (err) {
      setError(err?.message || "Failed to initiate payment");
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  };

  if (!shipment) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {showSuccess && (
          <div className={styles.successMessage}>
            ✓ Payment initiated successfully!
          </div>
        )}
        {error && <div className={styles.errorMessage}>{error}</div>}

        <div className={styles.row}>
          <div className={styles.label}>Summary</div>
          <div>
            {shipment.shipmentType} — {shipment.pickupPoint} →{" "}
            {shipment.destination}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div className={styles.label}>Amount</div>
          <input
            className={styles.input}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter payment amount"
            disabled={isSubmitting}
            min="0"
            step="0.01"
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <div className={styles.label}>Currency Code</div>
          <input
            className={styles.input}
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
            placeholder=" ETB, USDT"
            disabled={isSubmitting}
            maxLength="10"
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <div className={styles.label}>Payment Method</div>
          <select
            className={styles.select}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={isSubmitting}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 8 }}>
          <div className={styles.label}>Note (Optional)</div>
          <textarea
            className={styles.textarea}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any additional notes..."
            disabled={isSubmitting}
            rows="3"
          />
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.secondary}`}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.primary}`}
            onClick={submit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Initiate Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
