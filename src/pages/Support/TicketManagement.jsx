import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import reportsData from "../../data/reports.json";
import "./TicketManagement.css";

const TicketManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [replyMessage, setReplyMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("tickets");
    setTickets(stored ? JSON.parse(stored) : reportsData.tickets);
  }, []);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    // Mark as read
    if (ticket.status === "pending") {
      const updatedTickets = tickets.map((t) =>
        t.id === ticket.id ? { ...t, status: "in_progress" } : t
      );
      setTickets(updatedTickets);
      localStorage.setItem("tickets", JSON.stringify(updatedTickets));
    }
  };

  const handleReply = () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    const newReply = {
      id: `reply-${Date.now()}`,
      staffId: user.id,
      staffName: user.fullName,
      message: replyMessage,
      timestamp: new Date().toISOString(),
    };

    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            replies: [...(t.replies || []), newReply],
            lastReply: replyMessage,
            lastReplyTime: newReply.timestamp,
          }
        : t
    );

    setTickets(updatedTickets);
    setSelectedTicket({
      ...selectedTicket,
      replies: [...(selectedTicket.replies || []), newReply],
    });
    localStorage.setItem("tickets", JSON.stringify(updatedTickets));
    setReplyMessage("");
  };

  const handleResolve = () => {
    if (!selectedTicket) return;

    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            status: "resolved",
            resolvedAt: new Date().toISOString(),
            resolvedBy: user.id,
          }
        : t
    );

    setTickets(updatedTickets);
    setSelectedTicket({ ...selectedTicket, status: "resolved" });
    localStorage.setItem("tickets", JSON.stringify(updatedTickets));
  };

  const handleClose = () => {
    if (!selectedTicket) return;

    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id
        ? {
            ...t,
            status: "closed",
            closedAt: new Date().toISOString(),
            closedBy: user.id,
          }
        : t
    );

    setTickets(updatedTickets);
    setSelectedTicket({ ...selectedTicket, status: "closed" });
    localStorage.setItem("tickets", JSON.stringify(updatedTickets));
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus !== "all" && ticket.status !== filterStatus) return false;
    if (filterCategory !== "all" && ticket.category !== filterCategory)
      return false;
    return true;
  });

  const getCategoryLabel = (category) => {
    const labels = {
      technical: "Kỹ thuật",
      billing: "Thanh toán",
      certificate: "Chứng chỉ",
      account: "Tài khoản",
      course_content: "Nội dung khóa học",
    };
    return labels[category] || category;
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Chờ xử lý",
      in_progress: "Đang xử lý",
      resolved: "Đã giải quyết",
      closed: "Đã đóng",
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      low: "Thấp",
      medium: "Trung bình",
      high: "Cao",
      urgent: "Khẩn cấp",
    };
    return labels[priority] || priority;
  };

  return (
    <div className="ticket-management-page">
      <div className="tickets-sidebar">
        <div className="sidebar-header">
          <h2>🎫 Quản lý Tickets</h2>
          <div className="filters">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="resolved">Đã giải quyết</option>
              <option value="closed">Đã đóng</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Tất cả danh mục</option>
              <option value="technical">Kỹ thuật</option>
              <option value="billing">Thanh toán</option>
              <option value="certificate">Chứng chỉ</option>
              <option value="account">Tài khoản</option>
              <option value="course_content">Nội dung khóa học</option>
            </select>
          </div>
        </div>

        <div className="tickets-list">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`ticket-item ${
                selectedTicket?.id === ticket.id ? "active" : ""
              } ${ticket.status === "pending" ? "unread" : ""}`}
              onClick={() => handleSelectTicket(ticket)}
            >
              <div className="ticket-header">
                <span className={`priority ${ticket.priority}`}>
                  {getPriorityLabel(ticket.priority)}
                </span>
                <span className={`status ${ticket.status}`}>
                  {getStatusLabel(ticket.status)}
                </span>
              </div>
              <strong>{ticket.subject}</strong>
              <p className="ticket-meta">
                <span className="category">
                  {getCategoryLabel(ticket.category)}
                </span>
                {" · "}
                <span>{ticket.userName}</span>
              </p>
              <small>
                {new Date(ticket.createdAt).toLocaleString("vi-VN")}
              </small>
            </div>
          ))}
        </div>
      </div>

      <div className="ticket-detail">
        {selectedTicket ? (
          <>
            <div className="detail-header">
              <div>
                <h2>{selectedTicket.subject}</h2>
                <div className="ticket-badges">
                  <span className={`badge priority ${selectedTicket.priority}`}>
                    {getPriorityLabel(selectedTicket.priority)}
                  </span>
                  <span className={`badge status ${selectedTicket.status}`}>
                    {getStatusLabel(selectedTicket.status)}
                  </span>
                  <span className="badge category">
                    {getCategoryLabel(selectedTicket.category)}
                  </span>
                </div>
              </div>
              <div className="action-buttons">
                {selectedTicket.status !== "resolved" &&
                  selectedTicket.status !== "closed" && (
                    <button className="btn-resolve" onClick={handleResolve}>
                      ✅ Giải quyết
                    </button>
                  )}
                {selectedTicket.status !== "closed" && (
                  <button className="btn-close" onClick={handleClose}>
                    🔒 Đóng ticket
                  </button>
                )}
              </div>
            </div>

            <div className="ticket-info">
              <div className="info-item">
                <strong>Người gửi:</strong>
                <span>{selectedTicket.userName}</span>
              </div>
              <div className="info-item">
                <strong>Email:</strong>
                <span>{selectedTicket.userEmail}</span>
              </div>
              <div className="info-item">
                <strong>Thời gian tạo:</strong>
                <span>
                  {new Date(selectedTicket.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              {selectedTicket.assignedTo && (
                <div className="info-item">
                  <strong>Người xử lý:</strong>
                  <span>{selectedTicket.assignedTo}</span>
                </div>
              )}
            </div>

            <div className="ticket-content">
              <h3>📝 Nội dung:</h3>
              <p>{selectedTicket.description}</p>
            </div>

            <div className="replies-section">
              <h3>💬 Phản hồi ({selectedTicket.replies?.length || 0})</h3>
              <div className="replies-list">
                {selectedTicket.replies?.map((reply) => (
                  <div key={reply.id} className="reply-item">
                    <div className="reply-header">
                      <strong>{reply.staffName}</strong>
                      <small>
                        {new Date(reply.timestamp).toLocaleString("vi-VN")}
                      </small>
                    </div>
                    <p>{reply.message}</p>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== "closed" && (
                <div className="reply-input">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Nhập phản hồi..."
                    rows={4}
                  />
                  <button onClick={handleReply}>📤 Gửi phản hồi</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-ticket-selected">
            <h3>🎫 Chọn một ticket để xem chi tiết</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketManagement;
