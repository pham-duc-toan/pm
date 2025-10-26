import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { DEFAULT_AVATAR } from "../utils/constants";
import "./Profile.css";

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
    language: user?.language || "vi",
    twoFactorEnabled: user?.twoFactorEnabled || false,
  });

  const [previewAvatar, setPreviewAvatar] = useState(
    user?.avatar || DEFAULT_AVATAR
  );
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAvatarChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, avatar: url });
    setPreviewAvatar(url || DEFAULT_AVATAR);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Update user in Redux store
    const updatedUser = {
      ...user,
      ...formData,
    };

    dispatch(loginSuccess(updatedUser));
    setIsEditing(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
      language: user?.language || "vi",
      twoFactorEnabled: user?.twoFactorEnabled || false,
    });
    setPreviewAvatar(user?.avatar || DEFAULT_AVATAR);
    setIsEditing(false);
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
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Trang cá nhân</h1>
          <p>Quản lý thông tin tài khoản của bạn</p>
        </div>

        {showSuccess && (
          <div className="success-message">
            ✅ Cập nhật thông tin thành công!
          </div>
        )}

        <div className="profile-content">
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <img
                src={previewAvatar}
                alt={formData.fullName}
                className="profile-avatar-large"
                onError={(e) => {
                  e.target.src = DEFAULT_AVATAR;
                }}
              />
              <h2>{formData.fullName}</h2>
              <span className="profile-role">{getRoleName(user?.role)}</span>
            </div>

            <div className="profile-stats">
              {user?.role === "student" && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">Mã học viên</span>
                    <span className="stat-value">{user?.studentId}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Lớp</span>
                    <span className="stat-value">{user?.class}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Khóa học đã đăng ký</span>
                    <span className="stat-value">
                      {user?.enrolledCourses?.length || 0}
                    </span>
                  </div>
                </>
              )}
              {user?.role === "teacher" && (
                <>
                  <div className="stat-item">
                    <span className="stat-label">Khoa</span>
                    <span className="stat-value">{user?.department}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Số môn giảng dạy</span>
                    <span className="stat-value">
                      {user?.subjects?.length || 0}
                    </span>
                  </div>
                </>
              )}
              <div className="stat-item">
                <span className="stat-label">Ngày tham gia</span>
                <span className="stat-value">
                  {new Date(user?.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-card">
              <div className="card-header">
                <h3>Thông tin cá nhân</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-btn"
                  >
                    ✏️ Chỉnh sửa
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button onClick={handleCancel} className="cancel-btn">
                      Hủy
                    </button>
                    <button onClick={handleSubmit} className="save-btn">
                      💾 Lưu
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="avatar">URL ảnh đại diện</label>
                  <input
                    type="url"
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleAvatarChange}
                    disabled={!isEditing}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="language">Ngôn ngữ giao diện</label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="profile-card">
              <div className="card-header">
                <h3>Bảo mật</h3>
              </div>

              <div className="security-section">
                <div className="security-item">
                  <div className="security-info">
                    <h4>Xác thực hai yếu tố (2FA)</h4>
                    <p>Tăng cường bảo mật tài khoản với xác thực hai bước</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      name="twoFactorEnabled"
                      checked={formData.twoFactorEnabled}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="security-item">
                  <div className="security-info">
                    <h4>Đổi mật khẩu</h4>
                    <p>Cập nhật mật khẩu để bảo vệ tài khoản</p>
                  </div>
                  <button className="change-password-btn">Đổi mật khẩu</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
