import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import reportsData from "../../data/reports.json";
import usersData from "../../data/users.json";
import coursesData from "../../data/courses.json";
import "./SupportChat.css";

const SupportChat = () => {
  const { user } = useSelector((state) => state.auth);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [viewingStudent, setViewingStudent] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("chatSessions");
    setChatSessions(stored ? JSON.parse(stored) : reportsData.chatSessions);
  }, []);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    // Mark as read
    const updatedSessions = chatSessions.map((s) =>
      s.id === chat.id ? { ...s, unreadCount: 0 } : s
    );
    setChatSessions(updatedSessions);
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderType: "staff",
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };

    const updatedSessions = chatSessions.map((s) =>
      s.id === selectedChat.id
        ? {
            ...s,
            messages: [...s.messages, newMessage],
            lastMessage: message,
            lastMessageTime: newMessage.timestamp,
          }
        : s
    );

    setChatSessions(updatedSessions);
    setSelectedChat({
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
    });
    localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
    setMessage("");
  };

  const handleViewStudent = (userId) => {
    const student = usersData.users.find((u) => u.id === parseInt(userId));
    if (!student) return;

    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    const studentEnrollments = enrollments.filter(
      (e) => e.userId === student.id
    );
    const enrolledCourses = studentEnrollments.map((e) => {
      const course = coursesData.courses.find((c) => c.id === e.courseId);
      return {
        ...course,
        progress: e.progress || 0,
        enrolledAt: e.enrolledAt,
      };
    });

    const payments = JSON.parse(localStorage.getItem("payments")) || [];
    const studentPayments = payments.filter((p) => p.userId === student.id);

    setViewingStudent({
      ...student,
      enrolledCourses,
      payments: studentPayments,
      totalSpent: studentPayments.reduce((sum, p) => sum + p.amount, 0),
      lastLogin: student.lastLogin || "Chưa có thông tin",
    });
  };

  return (
    <div className="support-chat-page">
      <div className="chat-sidebar">
        <h2>💬 Chat hỗ trợ</h2>
        <div className="chat-list">
          {chatSessions.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${
                selectedChat?.id === chat.id ? "active" : ""
              } ${chat.unreadCount > 0 ? "unread" : ""}`}
              onClick={() => handleSelectChat(chat)}
            >
              <img src={chat.userAvatar} alt={chat.userName} />
              <div className="chat-info">
                <strong>{chat.userName}</strong>
                <p>{chat.lastMessage}</p>
                <small>
                  {new Date(chat.lastMessageTime).toLocaleString("vi-VN")}
                </small>
              </div>
              {chat.unreadCount > 0 && (
                <span className="unread-badge">{chat.unreadCount}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-header">
              <div className="user-info">
                <img
                  src={selectedChat.userAvatar}
                  alt={selectedChat.userName}
                />
                <div>
                  <strong>{selectedChat.userName}</strong>
                  <span className={`status ${selectedChat.status}`}>
                    {selectedChat.status === "active"
                      ? "🟢 Đang hoạt động"
                      : "⚪ Đã đóng"}
                  </span>
                </div>
              </div>
              <button
                className="btn-view-profile"
                onClick={() => handleViewStudent(selectedChat.userId)}
              >
                👤 Xem thông tin
              </button>
            </div>

            <div className="messages-container">
              {selectedChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${
                    msg.senderType === "staff" ? "staff" : "user"
                  }`}
                >
                  <div className="message-bubble">
                    <p>{msg.message}</p>
                    <small>
                      {new Date(msg.timestamp).toLocaleTimeString("vi-VN")}
                    </small>
                  </div>
                </div>
              ))}
            </div>

            <div className="message-input">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Nhập tin nhắn..."
              />
              <button onClick={handleSendMessage}>📤 Gửi</button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>💬 Chọn một cuộc hội thoại để bắt đầu</h3>
          </div>
        )}
      </div>

      {viewingStudent && (
        <div
          className="student-modal-overlay"
          onClick={() => setViewingStudent(null)}
        >
          <div className="student-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thông tin học viên</h2>
              <button onClick={() => setViewingStudent(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="student-profile">
                <img
                  src={viewingStudent.avatar}
                  alt={viewingStudent.fullName}
                />
                <h3>{viewingStudent.fullName}</h3>
                <p>{viewingStudent.email}</p>
              </div>

              <div className="info-section">
                <h4>📊 Thông tin chung</h4>
                <div className="info-grid">
                  <div>
                    <strong>Tham gia:</strong>
                    <span>
                      {new Date(viewingStudent.joinedDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  <div>
                    <strong>Đăng nhập cuối:</strong>
                    <span>{viewingStudent.lastLogin}</span>
                  </div>
                  <div>
                    <strong>Tổng điểm:</strong>
                    <span>{viewingStudent.totalPoints || 0}</span>
                  </div>
                  <div>
                    <strong>Tổng chi tiêu:</strong>
                    <span>{viewingStudent.totalSpent.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>
                  📚 Khóa học đã đăng ký (
                  {viewingStudent.enrolledCourses.length})
                </h4>
                <div className="courses-list">
                  {viewingStudent.enrolledCourses.map((course) => (
                    <div key={course.id} className="course-item">
                      <strong>{course.title}</strong>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <small>{course.progress}% hoàn thành</small>
                    </div>
                  ))}
                </div>
              </div>

              <div className="info-section">
                <h4>
                  💳 Lịch sử thanh toán ({viewingStudent.payments.length})
                </h4>
                <div className="payments-list">
                  {viewingStudent.payments.map((payment) => (
                    <div key={payment.id} className="payment-item">
                      <span>{payment.amount.toLocaleString()}đ</span>
                      <small>
                        {new Date(payment.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportChat;
