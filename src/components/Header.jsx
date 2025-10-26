import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";
import UserMenu from "./UserMenu";
import "./Header.css";

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo" onClick={() => navigate("/")}>
            🎓 EduSystem
          </h1>
          {isAuthenticated && (
            <nav className="header-nav">
              <button onClick={() => navigate("/")} className="nav-link">
                Khóa học
              </button>
              {user?.role === "student" && (
                <button
                  onClick={() => navigate("/my-courses")}
                  className="nav-link"
                >
                  Khóa học của tôi
                </button>
              )}
            </nav>
          )}
        </div>

        <div className="header-right">
          {isAuthenticated ? (
            <div className="user-actions">
              <NotificationDropdown />
              <UserMenu />
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
