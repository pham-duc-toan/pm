import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  completePaidEnrollment,
  cancelPayment,
  failPayment,
} from "../store/enrollmentSlice";
import { addNotification } from "../store/notificationsSlice";
import "./Payment.css";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { payment, course } = location.state || {};
  const [selectedMethod, setSelectedMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!payment || !course || !user) {
      navigate("/");
    }
  }, [payment, course, user, navigate]);

  if (!payment || !course) {
    return null;
  }

  const paymentMethods = [
    {
      id: "vnpay",
      name: "VNPay",
      logo: "https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746087.png",
      description: "Thanh toán qua VNPay",
    },
    {
      id: "momo",
      name: "MoMo",
      logo: "https://developers.momo.vn/v3/assets/images/square-logo.png",
      description: "Ví điện tử MoMo",
    },
    {
      id: "paypal",
      name: "PayPal",
      logo: "https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg",
      description: "Thanh toán quốc tế PayPal",
    },
  ];

  const handlePayment = () => {
    if (!selectedMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    setProcessing(true);

    // Simulate payment gateway redirect
    setTimeout(() => {
      navigate("/payment-gateway", {
        state: { payment, course, paymentMethod: selectedMethod },
      });
    }, 1500);
  };

  const handleCancel = () => {
    if (window.confirm("Bạn có chắc muốn hủy thanh toán?")) {
      dispatch(cancelPayment({ paymentId: payment.id }));
      navigate("/");
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-content">
          {/* Left - Course Info */}
          <div className="course-summary">
            <h2>📝 Thông tin khóa học</h2>
            <div className="course-summary-card">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="course-thumbnail"
              />
              <div className="course-details">
                <h3>{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                <div className="course-info-list">
                  <div className="info-item">
                    <span className="info-icon">⏱️</span>
                    <span>Thời lượng: {course.duration}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">📊</span>
                    <span>Cấp độ: {course.level}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-icon">👥</span>
                    <span>{course.students} học viên</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="payment-summary">
              <div className="summary-row">
                <span>Giá khóa học:</span>
                <span className="amount">
                  {course.price.toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="summary-row">
                <span>Giảm giá:</span>
                <span className="discount">0 đ</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Tổng thanh toán:</span>
                <span className="total-amount">
                  {course.price.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </div>

          {/* Right - Payment Methods */}
          <div className="payment-methods">
            <h2>💳 Chọn phương thức thanh toán</h2>
            <div className="methods-list">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`method-card ${
                    selectedMethod === method.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="method-radio">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={selectedMethod === method.id}
                      onChange={() => setSelectedMethod(method.id)}
                    />
                  </div>
                  <img
                    src={method.logo}
                    alt={method.name}
                    className="method-logo"
                  />
                  <div className="method-info">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="payment-actions">
              <button
                className="btn-pay"
                onClick={handlePayment}
                disabled={!selectedMethod || processing}
              >
                {processing ? (
                  <span>
                    <span className="spinner"></span> Đang xử lý...
                  </span>
                ) : (
                  "Thanh toán ngay"
                )}
              </button>
              <button className="btn-cancel" onClick={handleCancel}>
                Hủy bỏ
              </button>
            </div>

            <div className="payment-security">
              <div className="security-icon">🔒</div>
              <div className="security-text">
                <strong>Giao dịch được bảo mật</strong>
                <p>Thông tin của bạn được mã hóa và bảo vệ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
