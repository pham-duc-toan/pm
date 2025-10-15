import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { useNavigate } from "react-router-dom";
import { DEFAULT_AVATAR, ROLE_NAMES, ROLE_COLORS } from "../utils/constants";
import "./Header.css";

const Header = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getRoleDisplayName = (role) => {
    return ROLE_NAMES[role] || role;
  };

  const getRoleColor = (role) => {
    return ROLE_COLORS[role] || "#666";
  };

  const getUserAvatar = (user) => {
    return user?.avatar || DEFAULT_AVATAR;
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo" onClick={() => navigate("/")}>
            🎓 EduSystem
          </h1>
        </div>

        <div className="header-right">
          {isAuthenticated && user ? (
            <div className="user-info">
              <div className="user-avatar">
                <img
                  src={getUserAvatar(user)}
                  alt={user.fullName}
                  onError={(e) => {
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
              </div>
              <div className="user-details">
                <span className="user-name">{user.fullName}</span>
                <span
                  className="user-role"
                  style={{ color: getRoleColor(user.role) }}
                >
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button onClick={() => navigate("/login")} className="login-btn">
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="register-btn"
              >
                Đăng ký
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
