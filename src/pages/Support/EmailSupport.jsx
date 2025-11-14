import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import emailTemplatesData from "../../data/emailTemplates.json";
import "./EmailSupport.css";

const EmailSupport = () => {
  const { user } = useSelector((state) => state.auth);
  const [emails, setEmails] = useState([]);
  const [filter, setFilter] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composing, setComposing] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [newEmail, setNewEmail] = useState({
    to: "",
    subject: "",
    body: "",
  });

  useEffect(() => {
    // Load emails từ localStorage hoặc tạo demo data
    const stored = localStorage.getItem("supportEmails");
    if (stored) {
      setEmails(JSON.parse(stored));
    } else {
      const demoEmails = [
        {
          id: "email-1",
          from: "student1@example.com",
          fromName: "Nguyễn Văn A",
          to: user.email,
          subject: "Hỏi về chứng chỉ khóa học",
          body: "Chào anh/chị,\n\nEm đã hoàn thành khóa học React nhưng chưa nhận được chứng chỉ. Anh chị có thể giúp em kiểm tra không ạ?\n\nCảm ơn anh chị!",
          timestamp: "2025-11-14T08:30:00Z",
          status: "unread",
          category: "certificate",
          replies: [],
        },
        {
          id: "email-2",
          from: "student2@example.com",
          fromName: "Trần Thị B",
          to: user.email,
          subject: "Vấn đề thanh toán",
          body: "Xin chào,\n\nTôi đã thanh toán khóa học qua VNPay nhưng chưa được kích hoạt. Mã giao dịch: VNP123456789\n\nVui lòng hỗ trợ tôi.",
          timestamp: "2025-11-14T09:15:00Z",
          status: "unread",
          category: "billing",
          replies: [],
        },
        {
          id: "email-3",
          from: "student3@example.com",
          fromName: "Phạm Văn C",
          to: user.email,
          subject: "Không truy cập được bài học",
          body: "Chào support,\n\nMình bị lỗi khi mở bài học số 5 của khóa Python cơ bản. Trang web báo lỗi 404.\n\nMong được hỗ trợ sớm.",
          timestamp: "2025-11-13T16:45:00Z",
          status: "read",
          category: "technical",
          replies: [
            {
              id: "reply-1",
              from: user.email,
              fromName: user.fullName,
              body: "Chào bạn,\n\nMình đã kiểm tra và thấy link bài học bị lỗi. Team kỹ thuật đang khắc phục và sẽ hoàn thành trong 24h.\n\nCảm ơn bạn đã báo cáo!",
              timestamp: "2025-11-13T17:00:00Z",
            },
          ],
        },
      ];
      setEmails(demoEmails);
      localStorage.setItem("supportEmails", JSON.stringify(demoEmails));
    }
  }, [user]);

  const handleSelectEmail = (email) => {
    setSelectedEmail(email);
    setComposing(false);
    // Mark as read
    const updatedEmails = emails.map((e) =>
      e.id === email.id ? { ...e, status: "read" } : e
    );
    setEmails(updatedEmails);
    localStorage.setItem("supportEmails", JSON.stringify(updatedEmails));
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedEmail) return;

    const reply = {
      id: `reply-${Date.now()}`,
      from: user.email,
      fromName: user.fullName,
      body: replyText,
      timestamp: new Date().toISOString(),
    };

    const updatedEmails = emails.map((e) =>
      e.id === selectedEmail.id
        ? { ...e, replies: [...e.replies, reply], status: "replied" }
        : e
    );

    setEmails(updatedEmails);
    setSelectedEmail({
      ...selectedEmail,
      replies: [...selectedEmail.replies, reply],
    });
    localStorage.setItem("supportEmails", JSON.stringify(updatedEmails));
    setReplyText("");
  };

  const handleSendNew = () => {
    if (!newEmail.to || !newEmail.subject || !newEmail.body) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const email = {
      id: `email-${Date.now()}`,
      from: user.email,
      fromName: user.fullName,
      to: newEmail.to,
      subject: newEmail.subject,
      body: newEmail.body,
      timestamp: new Date().toISOString(),
      status: "sent",
      category: "support",
      replies: [],
    };

    const updatedEmails = [email, ...emails];
    setEmails(updatedEmails);
    localStorage.setItem("supportEmails", JSON.stringify(updatedEmails));
    setNewEmail({ to: "", subject: "", body: "" });
    setComposing(false);
  };

  const filteredEmails = emails.filter((e) => {
    if (filter === "inbox") return e.to === user.email && e.status !== "sent";
    if (filter === "sent") return e.from === user.email;
    if (filter === "unread") return e.status === "unread";
    if (filter === "replied") return e.status === "replied";
    return true;
  });

  const getCategoryLabel = (category) => {
    const labels = {
      technical: "🔧 Kỹ thuật",
      billing: "💳 Thanh toán",
      certificate: "📜 Chứng chỉ",
      account: "👤 Tài khoản",
      support: "💬 Hỗ trợ",
    };
    return labels[category] || category;
  };

  return (
    <div className="email-support-page">
      <div className="email-sidebar">
        <button className="btn-compose" onClick={() => setComposing(true)}>
          ✉️ Soạn email mới
        </button>

        <div className="email-filters">
          <button
            className={filter === "inbox" ? "active" : ""}
            onClick={() => setFilter("inbox")}
          >
            📥 Hộp thư đến (
            {
              emails.filter((e) => e.to === user.email && e.status !== "sent")
                .length
            }
            )
          </button>
          <button
            className={filter === "sent" ? "active" : ""}
            onClick={() => setFilter("sent")}
          >
            📤 Đã gửi ({emails.filter((e) => e.from === user.email).length})
          </button>
          <button
            className={filter === "unread" ? "active" : ""}
            onClick={() => setFilter("unread")}
          >
            📬 Chưa đọc ({emails.filter((e) => e.status === "unread").length})
          </button>
          <button
            className={filter === "replied" ? "active" : ""}
            onClick={() => setFilter("replied")}
          >
            ↩️ Đã trả lời ({emails.filter((e) => e.status === "replied").length}
            )
          </button>
        </div>

        <div className="email-list">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              className={`email-item ${
                selectedEmail?.id === email.id ? "active" : ""
              } ${email.status === "unread" ? "unread" : ""}`}
              onClick={() => handleSelectEmail(email)}
            >
              <div className="email-item-header">
                <strong>
                  {filter === "sent" ? email.to : email.fromName || email.from}
                </strong>
                <span className="category-badge">
                  {getCategoryLabel(email.category)}
                </span>
              </div>
              <p className="email-subject">{email.subject}</p>
              <small>{new Date(email.timestamp).toLocaleString("vi-VN")}</small>
            </div>
          ))}
        </div>
      </div>

      <div className="email-main">
        {composing ? (
          <div className="compose-email">
            <h2>✉️ Soạn email mới</h2>
            <div className="form-group">
              <label>Đến:</label>
              <input
                type="email"
                value={newEmail.to}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, to: e.target.value })
                }
                placeholder="email@example.com"
              />
            </div>
            <div className="form-group">
              <label>Tiêu đề:</label>
              <input
                type="text"
                value={newEmail.subject}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, subject: e.target.value })
                }
                placeholder="Nhập tiêu đề email..."
              />
            </div>
            <div className="form-group">
              <label>Nội dung:</label>
              <textarea
                value={newEmail.body}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, body: e.target.value })
                }
                placeholder="Nhập nội dung email..."
                rows={12}
              />
            </div>
            <div className="compose-actions">
              <button
                className="btn-cancel"
                onClick={() => setComposing(false)}
              >
                Hủy
              </button>
              <button className="btn-send" onClick={handleSendNew}>
                📤 Gửi email
              </button>
            </div>
          </div>
        ) : selectedEmail ? (
          <div className="email-detail">
            <div className="email-header">
              <h2>{selectedEmail.subject}</h2>
              <span className="category-badge">
                {getCategoryLabel(selectedEmail.category)}
              </span>
            </div>

            <div className="email-meta">
              <p>
                <strong>Từ:</strong> {selectedEmail.fromName} (
                {selectedEmail.from})
              </p>
              <p>
                <strong>Đến:</strong> {selectedEmail.to}
              </p>
              <p>
                <strong>Thời gian:</strong>{" "}
                {new Date(selectedEmail.timestamp).toLocaleString("vi-VN")}
              </p>
            </div>

            <div className="email-body">
              <p>{selectedEmail.body}</p>
            </div>

            {selectedEmail.replies && selectedEmail.replies.length > 0 && (
              <div className="email-replies">
                <h3>💬 Phản hồi:</h3>
                {selectedEmail.replies.map((reply) => (
                  <div key={reply.id} className="reply-item">
                    <div className="reply-header">
                      <strong>{reply.fromName}</strong>
                      <small>
                        {new Date(reply.timestamp).toLocaleString("vi-VN")}
                      </small>
                    </div>
                    <p>{reply.body}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="reply-section">
              <h3>↩️ Trả lời:</h3>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập phản hồi..."
                rows={6}
              />
              <button className="btn-reply" onClick={handleReply}>
                📤 Gửi phản hồi
              </button>
            </div>
          </div>
        ) : (
          <div className="no-email-selected">
            <h3>📧 Chọn một email để xem chi tiết</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailSupport;
