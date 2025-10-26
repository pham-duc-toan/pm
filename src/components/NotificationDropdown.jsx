import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from "../store/notificationsSlice";
import "./NotificationDropdown.css";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Filter notifications for current user
  const userNotifications = notifications.filter(
    (notif) => !notif.userId || notif.userId === user?.id
  );

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "info":
      default:
        return "ℹ️";
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        className="notification-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Thông báo</h3>
            {userNotifications.length > 0 && (
              <div className="notification-actions">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="mark-all-read-btn"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="notification-list">
            {userNotifications.length === 0 ? (
              <div className="no-notifications">
                <span className="no-notif-icon">🔕</span>
                <p>Không có thông báo mới</p>
              </div>
            ) : (
              <>
                {userNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${
                      notification.isRead ? "read" : "unread"
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))}
                {userNotifications.length > 0 && (
                  <button onClick={handleClearAll} className="clear-all-btn">
                    Xóa tất cả thông báo
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
