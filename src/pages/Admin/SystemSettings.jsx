import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import "./SystemSettings.css";

const SystemSettings = () => {
  const { user } = useSelector((state) => state.auth);
  const [settings, setSettings] = useState({
    siteName: "CodeLearn",
    siteUrl: "https://codelearn.io",
    supportEmail: "support@codelearn.io",
    logo: "https://via.placeholder.com/200x60?text=CodeLearn",
    favicon: "https://via.placeholder.com/32x32",
    maintenanceMode: false,
    maintenanceMessage: "Hệ thống đang bảo trì. Vui lòng quay lại sau ít phút.",
    registrationEnabled: true,
    emailVerificationRequired: true,
    courseApprovalRequired: true,
    maxFileUploadSize: 10,
    allowedFileTypes: ["jpg", "png", "pdf", "mp4"],
    defaultLanguage: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    currency: "VND",
    commissionRate: 30,
    minPayoutAmount: 500000,
    paymentMethods: ["vnpay", "momo", "bank_transfer"],
    socialLinks: {
      facebook: "https://facebook.com/codelearn",
      youtube: "https://youtube.com/@codelearn",
      twitter: "https://twitter.com/codelearn",
      linkedin: "https://linkedin.com/company/codelearn",
    },
    seo: {
      metaTitle: "CodeLearn - Học lập trình online",
      metaDescription:
        "Nền tảng học lập trình hàng đầu Việt Nam với hơn 100 khóa học chất lượng",
      metaKeywords: "học lập trình, lập trình online, khóa học lập trình",
      googleAnalyticsId: "UA-XXXXXXXXX-X",
      facebookPixelId: "XXXXXXXXXXXXXXXXX",
    },
    smtp: {
      host: "smtp.gmail.com",
      port: 587,
      username: "noreply@codelearn.io",
      password: "••••••••",
      fromName: "CodeLearn Support",
      fromEmail: "noreply@codelearn.io",
    },
  });

  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("systemSettings"));
    if (savedSettings) {
      setSettings(savedSettings);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("systemSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    alert("Đã lưu cài đặt thành công!");
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn reset tất cả cài đặt?")) {
      localStorage.removeItem("systemSettings");
      window.location.reload();
    }
  };

  const updateSetting = (path, value) => {
    const keys = path.split(".");
    setSettings((prev) => {
      const newSettings = { ...prev };
      let current = newSettings;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const tabs = [
    { id: "general", label: "Tổng quan", icon: "⚙️" },
    { id: "payment", label: "Thanh toán", icon: "💰" },
    { id: "email", label: "Email", icon: "✉️" },
    { id: "social", label: "Social Media", icon: "🌐" },
    { id: "seo", label: "SEO", icon: "📊" },
    { id: "security", label: "Bảo mật", icon: "🔒" },
  ];

  return (
    <div className="system-settings-page">
      <div className="page-header">
        <div>
          <h1>Cài đặt hệ thống</h1>
          <p className="subtitle">Quản lý cấu hình tổng thể của nền tảng</p>
        </div>
        <div className="header-actions">
          <button className="btn-reset" onClick={handleReset}>
            🔄 Reset
          </button>
          <button className="btn-save" onClick={handleSave}>
            {saved ? "✓ Đã lưu" : "💾 Lưu thay đổi"}
          </button>
        </div>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === "general" && (
            <div className="settings-section">
              <h2>Cài đặt tổng quan</h2>

              <div className="form-group">
                <label>Tên website</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateSetting("siteName", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>URL website</label>
                <input
                  type="url"
                  value={settings.siteUrl}
                  onChange={(e) => updateSetting("siteUrl", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email hỗ trợ</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    updateSetting("supportEmail", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Logo URL</label>
                <input
                  type="url"
                  value={settings.logo}
                  onChange={(e) => updateSetting("logo", e.target.value)}
                  className="form-input"
                />
                <img
                  src={settings.logo}
                  alt="Logo preview"
                  className="logo-preview"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) =>
                      updateSetting("maintenanceMode", e.target.checked)
                    }
                  />
                  <span>Chế độ bảo trì</span>
                </label>
              </div>

              {settings.maintenanceMode && (
                <div className="form-group">
                  <label>Thông báo bảo trì</label>
                  <textarea
                    value={settings.maintenanceMessage}
                    onChange={(e) =>
                      updateSetting("maintenanceMessage", e.target.value)
                    }
                    rows="3"
                    className="form-textarea"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Ngôn ngữ mặc định</label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) =>
                    updateSetting("defaultLanguage", e.target.value)
                  }
                  className="form-select"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="form-group">
                <label>Múi giờ</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSetting("timezone", e.target.value)}
                  className="form-select"
                >
                  <option value="Asia/Ho_Chi_Minh">GMT+7 (Ho Chi Minh)</option>
                  <option value="Asia/Bangkok">GMT+7 (Bangkok)</option>
                  <option value="Asia/Singapore">GMT+8 (Singapore)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="settings-section">
              <h2>Cài đặt thanh toán</h2>

              <div className="form-group">
                <label>Đơn vị tiền tệ</label>
                <select
                  value={settings.currency}
                  onChange={(e) => updateSetting("currency", e.target.value)}
                  className="form-select"
                >
                  <option value="VND">VND (₫)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tỷ lệ hoa hồng (%)</label>
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) =>
                    updateSetting("commissionRate", parseInt(e.target.value))
                  }
                  min="0"
                  max="100"
                  className="form-input"
                />
                <small>
                  Nền tảng nhận {settings.commissionRate}%, giảng viên nhận{" "}
                  {100 - settings.commissionRate}%
                </small>
              </div>

              <div className="form-group">
                <label>Số tiền rút tối thiểu (VND)</label>
                <input
                  type="number"
                  value={settings.minPayoutAmount}
                  onChange={(e) =>
                    updateSetting("minPayoutAmount", parseInt(e.target.value))
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Phương thức thanh toán</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.includes("vnpay")}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...settings.paymentMethods, "vnpay"]
                          : settings.paymentMethods.filter(
                              (m) => m !== "vnpay"
                            );
                        updateSetting("paymentMethods", methods);
                      }}
                    />
                    <span>VNPay</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.includes("momo")}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...settings.paymentMethods, "momo"]
                          : settings.paymentMethods.filter((m) => m !== "momo");
                        updateSetting("paymentMethods", methods);
                      }}
                    />
                    <span>MoMo</span>
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.paymentMethods.includes(
                        "bank_transfer"
                      )}
                      onChange={(e) => {
                        const methods = e.target.checked
                          ? [...settings.paymentMethods, "bank_transfer"]
                          : settings.paymentMethods.filter(
                              (m) => m !== "bank_transfer"
                            );
                        updateSetting("paymentMethods", methods);
                      }}
                    />
                    <span>Chuyển khoản ngân hàng</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="settings-section">
              <h2>Cài đặt Email (SMTP)</h2>

              <div className="form-group">
                <label>SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtp.host}
                  onChange={(e) => updateSetting("smtp.host", e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>SMTP Port</label>
                <input
                  type="number"
                  value={settings.smtp.port}
                  onChange={(e) =>
                    updateSetting("smtp.port", parseInt(e.target.value))
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={settings.smtp.username}
                  onChange={(e) =>
                    updateSetting("smtp.username", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={settings.smtp.password}
                  onChange={(e) =>
                    updateSetting("smtp.password", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>From Name</label>
                <input
                  type="text"
                  value={settings.smtp.fromName}
                  onChange={(e) =>
                    updateSetting("smtp.fromName", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>From Email</label>
                <input
                  type="email"
                  value={settings.smtp.fromEmail}
                  onChange={(e) =>
                    updateSetting("smtp.fromEmail", e.target.value)
                  }
                  className="form-input"
                />
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="settings-section">
              <h2>Social Media Links</h2>

              <div className="form-group">
                <label>Facebook</label>
                <input
                  type="url"
                  value={settings.socialLinks.facebook}
                  onChange={(e) =>
                    updateSetting("socialLinks.facebook", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>YouTube</label>
                <input
                  type="url"
                  value={settings.socialLinks.youtube}
                  onChange={(e) =>
                    updateSetting("socialLinks.youtube", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Twitter</label>
                <input
                  type="url"
                  value={settings.socialLinks.twitter}
                  onChange={(e) =>
                    updateSetting("socialLinks.twitter", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>LinkedIn</label>
                <input
                  type="url"
                  value={settings.socialLinks.linkedin}
                  onChange={(e) =>
                    updateSetting("socialLinks.linkedin", e.target.value)
                  }
                  className="form-input"
                />
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="settings-section">
              <h2>Cài đặt SEO</h2>

              <div className="form-group">
                <label>Meta Title</label>
                <input
                  type="text"
                  value={settings.seo.metaTitle}
                  onChange={(e) =>
                    updateSetting("seo.metaTitle", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Meta Description</label>
                <textarea
                  value={settings.seo.metaDescription}
                  onChange={(e) =>
                    updateSetting("seo.metaDescription", e.target.value)
                  }
                  rows="3"
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label>Meta Keywords</label>
                <input
                  type="text"
                  value={settings.seo.metaKeywords}
                  onChange={(e) =>
                    updateSetting("seo.metaKeywords", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Google Analytics ID</label>
                <input
                  type="text"
                  value={settings.seo.googleAnalyticsId}
                  onChange={(e) =>
                    updateSetting("seo.googleAnalyticsId", e.target.value)
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Facebook Pixel ID</label>
                <input
                  type="text"
                  value={settings.seo.facebookPixelId}
                  onChange={(e) =>
                    updateSetting("seo.facebookPixelId", e.target.value)
                  }
                  className="form-input"
                />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="settings-section">
              <h2>Cài đặt bảo mật</h2>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.registrationEnabled}
                    onChange={(e) =>
                      updateSetting("registrationEnabled", e.target.checked)
                    }
                  />
                  <span>Cho phép đăng ký người dùng mới</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.emailVerificationRequired}
                    onChange={(e) =>
                      updateSetting(
                        "emailVerificationRequired",
                        e.target.checked
                      )
                    }
                  />
                  <span>Yêu cầu xác thực email</span>
                </label>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.courseApprovalRequired}
                    onChange={(e) =>
                      updateSetting("courseApprovalRequired", e.target.checked)
                    }
                  />
                  <span>Yêu cầu phê duyệt khóa học</span>
                </label>
              </div>

              <div className="form-group">
                <label>Kích thước file upload tối đa (MB)</label>
                <input
                  type="number"
                  value={settings.maxFileUploadSize}
                  onChange={(e) =>
                    updateSetting("maxFileUploadSize", parseInt(e.target.value))
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Loại file được phép upload</label>
                <input
                  type="text"
                  value={settings.allowedFileTypes.join(", ")}
                  onChange={(e) =>
                    updateSetting(
                      "allowedFileTypes",
                      e.target.value.split(",").map((t) => t.trim())
                    )
                  }
                  className="form-input"
                  placeholder="jpg, png, pdf, mp4"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
