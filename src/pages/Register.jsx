import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    studentId: "",
    class: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Tên đăng nhập không được để trống";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Xác nhận mật khẩu không khớp";
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = "Mã sinh viên không được để trống";
    }

    if (!formData.class.trim()) {
      newErrors.class = "Lớp không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
      setIsSubmitting(false);
    }, 2000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>📚 Đăng ký học viên</h2>
          <p>Tạo tài khoản mới để bắt đầu học tập</p>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nhập họ và tên"
                className={errors.fullName ? "error" : ""}
              />
              {errors.fullName && (
                <span className="error-text">{errors.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Tên đăng nhập *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Nhập tên đăng nhập"
                className={errors.username ? "error" : ""}
              />
              {errors.username && (
                <span className="error-text">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="studentId">Mã sinh viên *</label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                placeholder="SV001234"
                className={errors.studentId ? "error" : ""}
              />
              {errors.studentId && (
                <span className="error-text">{errors.studentId}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="class">Lớp *</label>
            <select
              id="class"
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              className={errors.class ? "error" : ""}
            >
              <option value="">Chọn lớp</option>
              <option value="IT2024A">IT2024A - Công nghệ thông tin A</option>
              <option value="IT2024B">IT2024B - Công nghệ thông tin B</option>
              <option value="CS2024A">CS2024A - Khoa học máy tính A</option>
              <option value="CS2024B">CS2024B - Khoa học máy tính B</option>
              <option value="IS2024A">IS2024A - Hệ thống thông tin A</option>
            </select>
            {errors.class && <span className="error-text">{errors.class}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Mật khẩu *</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu"
                  className={errors.password ? "error" : ""}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Nhập lại mật khẩu"
                className={errors.confirmPassword ? "error" : ""}
              />
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="terms-section">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span className="checkmark"></span>
              Tôi đồng ý với{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Điều khoản sử dụng
              </a>{" "}
              và{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                Chính sách bảo mật
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="register-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "⏳ Đang xử lý..." : "🚀 Đăng ký"}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
