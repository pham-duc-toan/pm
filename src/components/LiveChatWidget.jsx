import React, { useState, useEffect, useRef } from "react";
import "./LiveChatWidget.css";

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "support",
      text: "Xin chào! Tôi là nhân viên hỗ trợ. Tôi có thể giúp gì cho bạn?",
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const autoReply = (userMessage) => {
    const lowercaseMsg = userMessage.toLowerCase();

    if (
      lowercaseMsg.includes("thanh toán") ||
      lowercaseMsg.includes("payment")
    ) {
      return "Bạn có thể thanh toán qua thẻ tín dụng, ví điện tử hoặc chuyển khoản ngân hàng. Bạn cần hỗ trợ về phương thức thanh toán nào?";
    } else if (
      lowercaseMsg.includes("khóa học") ||
      lowercaseMsg.includes("course")
    ) {
      return "Chúng tôi có nhiều khóa học về lập trình, thiết kế, marketing, v.v. Bạn quan tâm đến lĩnh vực nào?";
    } else if (
      lowercaseMsg.includes("chứng chỉ") ||
      lowercaseMsg.includes("certificate")
    ) {
      return "Bạn sẽ nhận được chứng chỉ sau khi hoàn thành 100% khóa học và vượt qua bài kiểm tra cuối khóa với điểm tối thiểu 80%.";
    } else if (lowercaseMsg.includes("giá") || lowercaseMsg.includes("price")) {
      return "Giá khóa học dao động từ 0đ (miễn phí) đến 5.000.000đ tùy theo nội dung. Bạn có thể xem chi tiết giá tại trang chi tiết khóa học.";
    } else if (
      lowercaseMsg.includes("hỗ trợ") ||
      lowercaseMsg.includes("help")
    ) {
      return "Tôi luôn sẵn sàng hỗ trợ bạn! Bạn có thể hỏi về khóa học, thanh toán, chứng chỉ, hoặc bất kỳ vấn đề nào khác.";
    } else {
      return "Cảm ơn bạn đã liên hệ. Để được hỗ trợ chi tiết hơn, vui lòng gửi ticket hoặc hỏi cụ thể về: khóa học, thanh toán, chứng chỉ, v.v.";
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputMessage,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setInputMessage("");

    // Simulate support typing
    setIsTyping(true);
    setTimeout(() => {
      const replyMessage = {
        id: messages.length + 2,
        sender: "support",
        text: autoReply(inputMessage),
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, replyMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickReplies = [
    "💳 Thanh toán",
    "📚 Khóa học",
    "📜 Chứng chỉ",
    "💰 Giá cả",
  ];

  const handleQuickReply = (reply) => {
    setInputMessage(reply.replace(/^[^\s]+\s/, "")); // Remove emoji
  };

  return (
    <>
      {/* Chat Button */}
      <button
        className={`chat-toggle-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Chat với hỗ trợ"
      >
        {isOpen ? "✕" : "💬"}
        {!isOpen && <span className="chat-badge">1</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="support-avatar">👤</div>
              <div>
                <h3>Hỗ trợ trực tuyến</h3>
                <span className="support-status">
                  <span className="status-dot"></span>
                  Đang hoạt động
                </span>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${
                  msg.sender === "user" ? "user-message" : "support-message"
                }`}
              >
                {msg.sender === "support" && (
                  <div className="message-avatar">👤</div>
                )}
                <div className="message-content">
                  <p>{msg.text}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message support-message">
                <div className="message-avatar">👤</div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-replies">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                className="quick-reply-btn"
                onClick={() => handleQuickReply(reply)}
              >
                {reply}
              </button>
            ))}
          </div>

          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chat-input"
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              🚀
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;
