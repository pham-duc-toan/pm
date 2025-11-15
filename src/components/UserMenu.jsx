import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";
import { DEFAULT_AVATAR } from "../utils/constants";
import "./UserMenu.css";

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    window.location.href = "/profile";
    setIsOpen(false);
  };

  const getUserAvatar = () => {
    return user?.avatar || DEFAULT_AVATAR;
  };

  const getRoleName = (role) => {
    const roleNames = {
      admin: "Quản trị viên",
      moderator: "Người kiểm duyệt",
      support: "Nhân viên hỗ trợ",
      teacher: "Giảng viên",
      student: "Học viên",
    };
    return roleNames[role] || role;
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu người dùng"
      >
        <img
          src={getUserAvatar()}
          alt={user?.fullName}
          className="user-avatar-img"
          onError={(e) => {
            e.target.src = DEFAULT_AVATAR;
          }}
        />
      </button>

      {isOpen && (
        <div className="user-menu-dropdown">
          <div className="user-menu-header">
            <img
              src={getUserAvatar()}
              alt={user?.fullName}
              className="user-menu-avatar"
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <div className="user-menu-info">
              <h4>{user?.fullName}</h4>
              <p>{user?.email}</p>
              <span className="user-menu-role">{getRoleName(user?.role)}</span>
            </div>
          </div>

          <div className="user-menu-divider"></div>

          <div className="user-menu-items">
            <button className="user-menu-item" onClick={handleProfileClick}>
              <span className="menu-icon">👤</span>
              <span>Trang cá nhân</span>
            </button>

            {user?.role === "student" && (
              <>
                <button
                  className="user-menu-item"
                  onClick={() => (window.location.href = "/my-courses")}
                >
                  <span className="menu-icon">📚</span>
                  <span>Khóa học của tôi</span>
                </button>
                <button
                  className="user-menu-item"
                  onClick={() => navigate("/certificates")}
                >
                  <span className="menu-icon">🎓</span>
                  <span>Chứng chỉ</span>
                </button>
              </>
            )}

            {user?.role === "teacher" && (
              <>
                <button
                  className="user-menu-item"
                  onClick={() => (window.location.href = "/teacher/courses")}
                >
                  <span className="menu-icon">📚</span>
                  <span>Khóa học của tôi</span>
                </button>
                <button
                  className="user-menu-item"
                  onClick={() => navigate("/teacher/students")}
                >
                  <span className="menu-icon">👥</span>
                  <span>Học viên</span>
                </button>
              </>
            )}

            <button
              className="user-menu-item"
              onClick={() => navigate("/settings")}
            >
              <span className="menu-icon">⚙️</span>
              <span>Cài đặt</span>
            </button>
          </div>

          <div className="user-menu-divider"></div>

          <div className="user-menu-items">
            <button className="user-menu-item logout" onClick={handleLogout}>
              <span className="menu-icon">🚪</span>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
