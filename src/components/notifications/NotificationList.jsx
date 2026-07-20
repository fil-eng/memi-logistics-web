import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "../../utils/time";
import styles from "./NotificationList.module.css";

const NotificationList = ({
  notifications,
  onToggleRead,
  onDelete,
  onClearAll,
  pageLabel = "Notifications",
  subtitle = "Persistent shipment notifications for your account.",
}) => {
  const navigate = useNavigate();
  const unreadCount = notifications.filter((note) => !note.read).length;

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          {/* <p className={styles.badge}>{pageLabel}</p> */}
          <h1 className={styles.title}>Recent shipment updates</h1>
          {/* <p className={styles.subtitle}>{subtitle}</p> */}
        </div>
        {notifications.length > 0 ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={onClearAll}
          >
            Clear all
          </button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.empty}>No notifications yet.</div>
      ) : (
        <>
          {/* <div className={styles.summary}>
            <span className={styles.summaryText}>
              {notifications.length} notification
              {notifications.length === 1 ? "" : "s"}
            </span>
            <span className={styles.summaryText}>{unreadCount} unread</span>
          </div> */}
          <div className={styles.list}>
            {notifications.map((note) => (
              <article
                key={note.id}
                className={`${styles.card} ${note.read ? styles.read : styles.unread}`}
              >
                <button
                  type="button"
                  className={styles.noteLink}
                  onClick={() => note.routeTarget && navigate(note.routeTarget)}
                >
                  <div className={styles.noteTop}>
                    <div>
                      <h2 className={styles.noteTitle}>{note.title}</h2>
                      <p className={styles.noteMessage}>{note.message}</p>
                    </div>
                    {note.routeTarget ? (
                      <span className={styles.routeHint}>View shipment</span>
                    ) : null}
                  </div>
                </button>

                <div className={styles.metaGrid}>
                  {/* <span className={styles.metaItem}>
                    Shipment <strong>{note.shipmentId || "—"}</strong>
                  </span> */}
                  {note.trackingNumber ? (
                    <span className={styles.metaItem}>
                      <strong>Tracking :</strong> {note.trackingNumber}
                    </span>
                  ) : null}
                  {note.status ? (
                    <span className={styles.metaItem}>
                     <strong> Status :</strong> {note.status}
                    </span>
                  ) : null}
                  {/* {note.counterpartyName ? (
                    <span className={styles.metaItem}>
                      With: {note.counterpartyName}
                    </span>
                  ) : null} */}
                  {/* {note.companyName ? (
                    <span className={styles.metaItem}>
                      Company: {note.companyName}
                    </span>
                  ) : null} */}
                </div>

                <div className={styles.footerRow}>
                  <time className={styles.time}>
                    {formatRelativeTime(note.createdAt)}
                  </time>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => onToggleRead(note.id, note.read)}
                    >
                      {note.read ? "Mark unread" : "Mark read"}
                    </button>
                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => onDelete(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationList;
