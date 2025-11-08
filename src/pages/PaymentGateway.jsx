import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  completePaidEnrollment,
  failPayment,
  cancelPayment,
} from "../store/enrollmentSlice";
import { addNotification } from "../store/notificationsSlice";
import "./PaymentGateway.css";

const PaymentGateway = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { payment, course, paymentMethod } = location.state || {};
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!payment || !course || !user) {
      navigate("/");
      return;
    }

    // Simulate payment processing
    const timer = setTimeout(() => {
      // Random success/failure for demo (80% success rate)
      const isSuccess = Math.random() > 0.2;

      if (isSuccess) {
        const transactionId = `TXN-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)
          .toUpperCase()}`;

        dispatch(
          completePaidEnrollment({
            paymentId: payment.id,
            transactionId,
          })
        );

        // Add notification
        dispatch(
          addNotification({
            title: "🎉 Đăng ký khóa học thành công!",
            message: `Bạn đã đăng ký thành công khóa học "${course.title}". Chúc bạn học tốt!`,
            type: "success",
            userId: user.id,
          })
        );

        // Send email notification (simulated)
        console.log("📧 Email sent to:", user.email);
        console.log("Course:", course.title);
        console.log("Transaction ID:", transactionId);

        setResult({
          status: "success",
          transactionId,
          message: "Thanh toán thành công!",
        });
      } else {
        const errorMsg = "Giao dịch thất bại. Vui lòng thử lại.";
        dispatch(
          failPayment({
            paymentId: payment.id,
            error: errorMsg,
          })
        );

        dispatch(
          addNotification({
            title: "❌ Thanh toán thất bại",
            message: `Thanh toán khóa học "${course.title}" không thành công. Vui lòng thử lại.`,
            type: "error",
            userId: user.id,
          })
        );

        setResult({
          status: "failed",
          message: errorMsg,
        });
      }

      setProcessing(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [payment, course, user, dispatch, navigate]);

  useEffect(() => {
    if (!processing && result) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (result.status === "success") {
              navigate(`/learn/${course.id}`);
            } else {
              navigate(`/course/${course.id}`);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [processing, result, navigate, course]);

  const handleManualRedirect = () => {
    if (result?.status === "success") {
      navigate(`/learn/${course?.id}`);
    } else {
      navigate(`/course/${course?.id}`);
    }
  };

  const handleCancelPayment = () => {
    dispatch(cancelPayment({ paymentId: payment.id }));
    navigate(`/course/${course?.id}`);
  };

  if (!payment || !course) {
    return null;
  }

  const getMethodName = () => {
    const methods = {
      vnpay: "VNPay",
      momo: "MoMo",
      paypal: "PayPal",
    };
    return methods[paymentMethod] || paymentMethod;
  };

  return (
    <div className="payment-gateway-page">
      <div className="gateway-container">
        {processing ? (
          <div className="processing-card">
            <div className="processing-animation">
              <div className="spinner-large"></div>
            </div>
            <h2>Đang xử lý thanh toán...</h2>
            <p>Vui lòng không đóng trang này</p>
            <div className="gateway-info">
              <div className="info-row">
                <span>Cổng thanh toán:</span>
                <strong>{getMethodName()}</strong>
              </div>
              <div className="info-row">
                <span>Số tiền:</span>
                <strong className="amount">
                  {course.price.toLocaleString("vi-VN")} đ
                </strong>
              </div>
              <div className="info-row">
                <span>Khóa học:</span>
                <strong>{course.title}</strong>
              </div>
            </div>
            <button
              className="btn-cancel-processing"
              onClick={handleCancelPayment}
            >
              Hủy giao dịch
            </button>
          </div>
        ) : result?.status === "success" ? (
          <div className="result-card success">
            <div className="result-icon">
              <div className="success-checkmark">
                <div className="check-icon">
                  <span className="icon-line line-tip"></span>
                  <span className="icon-line line-long"></span>
                  <div className="icon-circle"></div>
                  <div className="icon-fix"></div>
                </div>
              </div>
            </div>
            <h2>🎉 Thanh toán thành công!</h2>
            <p className="success-message">
              Bạn đã đăng ký thành công khóa học "{course.title}"
            </p>

            <div className="transaction-details">
              <h3>Chi tiết giao dịch</h3>
              <div className="detail-row">
                <span>Mã giao dịch:</span>
                <strong>{result.transactionId}</strong>
              </div>
              <div className="detail-row">
                <span>Phương thức:</span>
                <strong>{getMethodName()}</strong>
              </div>
              <div className="detail-row">
                <span>Số tiền:</span>
                <strong className="amount">
                  {course.price.toLocaleString("vi-VN")} đ
                </strong>
              </div>
              <div className="detail-row">
                <span>Thời gian:</span>
                <strong>{new Date().toLocaleString("vi-VN")}</strong>
              </div>
            </div>

            <div className="notification-info">
              <div className="notification-item">
                <span className="notif-icon">📧</span>
                <span>Email xác nhận đã được gửi đến {user.email}</span>
              </div>
              <div className="notification-item">
                <span className="notif-icon">🔔</span>
                <span>Thông báo in-app đã được gửi</span>
              </div>
            </div>

            <div className="redirect-info">
              Chuyển hướng trong <strong>{countdown}</strong> giây...
            </div>

            <div className="action-buttons">
              <button className="btn-primary" onClick={handleManualRedirect}>
                Đến khóa học của tôi
              </button>
              <button
                className="btn-secondary"
                onClick={() => navigate(`/course/${course.id}`)}
              >
                Xem chi tiết khóa học
              </button>
            </div>
          </div>
        ) : (
          <div className="result-card failed">
            <div className="result-icon">
              <div className="error-icon">❌</div>
            </div>
            <h2>Thanh toán thất bại</h2>
            <p className="error-message">{result?.message}</p>

            <div className="error-details">
              <p>Có thể do một trong các lý do sau:</p>
              <ul>
                <li>Số dư tài khoản không đủ</li>
                <li>Thông tin thanh toán không chính xác</li>
                <li>Kết nối mạng không ổn định</li>
                <li>Ngân hàng từ chối giao dịch</li>
              </ul>
            </div>

            <div className="redirect-info">
              Chuyển hướng trong <strong>{countdown}</strong> giây...
            </div>

            <div className="action-buttons">
              <button className="btn-primary" onClick={handleManualRedirect}>
                Thử lại
              </button>
              <button className="btn-secondary" onClick={() => navigate("/")}>
                Về trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
