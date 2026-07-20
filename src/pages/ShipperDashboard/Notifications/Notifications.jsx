import { useCallback } from "react";
import { useShipment } from "../../../state/shipments/useShipment";
import { useAuth } from "../../../state/auth/useAuth";
import NotificationList from "../../../components/notifications/NotificationList";

const Notifications = () => {
  const {
    state,
    markNotificationRead,
    markNotificationUnread,
    deleteNotification,
    clearNotifications,
  } = useShipment();
  const auth = useAuth();
  const userId = auth.user?.id || auth.user?.shipperId;

  const notifications = (state.notifications || [])
    .filter((note) => !note.userId || String(note.userId) === String(userId))
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleToggleRead = useCallback(
    (id, isRead) => {
      if (isRead) {
        markNotificationUnread(id);
      } else {
        markNotificationRead(id);
      }
    },
    [markNotificationRead, markNotificationUnread],
  );

  return (
    <NotificationList
      notifications={notifications}
      onToggleRead={handleToggleRead}
      onDelete={deleteNotification}
      onClearAll={clearNotifications}
      pageLabel="Notifications"
      subtitle="Persistent shipment notifications for your shipper account."
    />
  );
};

export default Notifications;
