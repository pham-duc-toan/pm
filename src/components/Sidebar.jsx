import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const getMenuItems = () => {
    switch (user?.role) {
      case "admin":
        return [
          { icon: "🏠", label: "Trang chủ", path: "/" },
          {
            icon: "👥",
            label: "Quản lý tài khoản",
            path: "/admin/user-management",
          },
          {
            icon: "👔",
            label: "Quản lý nhân viên",
            path: "/admin/staff-management",
          },
          {
            icon: "📊",
            label: "Báo cáo hệ thống",
            path: "/admin/system-report",
          },
          { icon: "📚", label: "Quản lý khóa học", path: "/admin/courses" },
          { icon: "💬", label: "Quản lý bình luận", path: "/admin/comments" },
          { icon: "🎨", label: "Quản lý Banner", path: "/admin/banners" },
          {
            icon: "📧",
            label: "Email Templates",
            path: "/admin/email-templates",
          },
          { icon: "⚙️", label: "Cài đặt hệ thống", path: "/admin/settings" },
        ];
      case "moderator":
        return [
          { icon: "🏠", label: "Trang chủ", path: "/" },
          { icon: "📚", label: "Duyệt khóa học", path: "/moderator/courses" },
          {
            icon: "💬",
            label: "Kiểm duyệt bình luận",
            path: "/moderator/comments",
          },
          { icon: "🚨", label: "Báo cáo vi phạm", path: "/moderator/reports" },
          { icon: "📊", label: "Báo cáo", path: "/moderator/statistics" },
        ];
      case "supporter":
        return [
          { icon: "🏠", label: "Trang chủ", path: "/" },
          { icon: "💬", label: "Chat hỗ trợ", path: "/support/chat" },
          { icon: "📧", label: "Email hỗ trợ", path: "/support/email" },
          { icon: "📋", label: "Quản lý ticket", path: "/support/tickets" },
          { icon: "📚", label: "Thư viện hướng dẫn", path: "/support/guides" },
        ];
      case "teacher":
        return [
          { icon: "🏠", label: "Trang chủ", path: "/" },
          {
            icon: "📚",
            label: "Quản lý khóa học",
            path: "/instructor/courses",
          },
          {
            icon: "💻",
            label: "Quản lý bài tập",
            path: "/instructor/exercises",
          },
          { icon: "📊", label: "Thống kê", path: "/instructor/statistics" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  if (!user || user.role === "student") {
    return null;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Menu</h3>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div
            key={index}
            onClick={() => (window.location.href = item.path)}
            className={`sidebar-item ${
              location.pathname === item.path ? "active" : ""
            }`}
            style={{ cursor: "pointer" }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
