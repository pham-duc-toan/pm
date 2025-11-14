import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./Settings.css";

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    courseUpdates: true,
    promotions: false,
    weeklyReport: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: false,
    showProgress: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacy((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveProfile = () => {
    // Lưu thông tin profile
    alert("Đã lưu thông tin cá nhân!");
  };

  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (formData.newPassword.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    alert("Đã thay đổi mật khẩu thành công!");
    setFormData((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("userNotifications", JSON.stringify(notifications));
    alert("Đã lưu cài đặt thông báo!");
  };

  const handleSavePrivacy = () => {
    localStorage.setItem("userPrivacy", JSON.stringify(privacy));
    alert("Đã lưu cài đặt quyền riêng tư!");
  };

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: "👤" },
    { id: "security", label: "Bảo mật", icon: "🔒" },
    { id: "notifications", label: "Thông báo", icon: "🔔" },
    { id: "privacy", label: "Quyền riêng tư", icon: "🛡️" },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Cài đặt</h1>
        <p className="subtitle">Quản lý thông tin và tùy chỉnh tài khoản</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === "profile" && (
            <div className="settings-section">
              <h2>Thông tin cá nhân</h2>
              <div className="avatar-section">
                <img
                  src={formData.avatar || "https://i.pravatar.cc/150"}
                  alt="Avatar"
                  className="avatar-preview"
                />
                <button className="btn-change-avatar">Thay đổi ảnh</button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Giới thiệu bản thân</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Viết vài dòng về bạn..."
                    rows="4"
                  />
                </div>
              </div>

              <button className="btn-primary" onClick={handleSaveProfile}>
                Lưu thay đổi
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-section">
              <h2>Bảo mật tài khoản</h2>

              <div className="form-group">
                <label>Mật khẩu hiện tại *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu mới *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>

              <button className="btn-primary" onClick={handleChangePassword}>
                Đổi mật khẩu
              </button>

              <div className="security-tips">
                <h3>💡 Gợi ý bảo mật</h3>
                <ul>
                  <li>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
                  <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                  <li>Không sử dụng thông tin cá nhân dễ đoán</li>
                  <li>Thay đổi mật khẩu định kỳ</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="settings-section">
              <h2>Cài đặt thông báo</h2>

              <div className="notification-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <strong>Email thông báo</strong>
                    <p>Nhận thông báo qua email về hoạt động tài khoản</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.emailNotifications}
                      onChange={() =>
                        handleNotificationChange("emailNotifications")
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <strong>Cập nhật khóa học</strong>
                    <p>
                      Thông báo khi có bài học mới trong khóa học đang theo dõi
                    </p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.courseUpdates}
                      onChange={() => handleNotificationChange("courseUpdates")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <strong>Khuyến mãi & Ưu đãi</strong>
                    <p>Nhận thông tin về các chương trình giảm giá và ưu đãi</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.promotions}
                      onChange={() => handleNotificationChange("promotions")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <strong>Báo cáo tuần</strong>
                    <p>Nhận báo cáo tiến độ học tập hàng tuần qua email</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notifications.weeklyReport}
                      onChange={() => handleNotificationChange("weeklyReport")}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>

              <button className="btn-primary" onClick={handleSaveNotifications}>
                Lưu cài đặt
              </button>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="settings-section">
              <h2>Quyền riêng tư</h2>

              <div className="form-group">
                <label>Hiển thị hồ sơ</label>
                <select
                  name="profileVisibility"
                  value={privacy.profileVisibility}
                  onChange={handlePrivacyChange}
                >
                  <option value="public">Công khai</option>
                  <option value="friends">Chỉ bạn bè</option>
                  <option value="private">Riêng tư</option>
                </select>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="showEmail"
                    checked={privacy.showEmail}
                    onChange={handlePrivacyChange}
                  />
                  <span>Hiển thị email công khai</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="showProgress"
                    checked={privacy.showProgress}
                    onChange={handlePrivacyChange}
                  />
                  <span>Hiển thị tiến độ học tập</span>
                </label>
              </div>

              <button className="btn-primary" onClick={handleSavePrivacy}>
                Lưu cài đặt
              </button>

              <div className="privacy-info">
                <h3>📋 Thông tin về quyền riêng tư</h3>
                <p>
                  Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Dữ liệu
                  của bạn được mã hóa và không bao giờ được chia sẻ với bên thứ
                  ba mà không có sự đồng ý của bạn.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
