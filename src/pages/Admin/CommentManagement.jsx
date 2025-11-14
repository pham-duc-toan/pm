import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import commentsData from "../../data/comments.json";
import "./CommentManagement.css";

const CommentManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedComment, setSelectedComment] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    // Load comments từ localStorage hoặc JSON
    const savedComments =
      JSON.parse(localStorage.getItem("comments")) || commentsData.comments;

    // Thêm status nếu chưa có
    const commentsWithStatus = savedComments.map((c) => ({
      ...c,
      status: c.status || "approved",
      moderatedBy: c.moderatedBy || null,
      moderatedAt: c.moderatedAt || null,
      moderationReason: c.moderationReason || null,
    }));

    setComments(commentsWithStatus);
    setFilteredComments(commentsWithStatus);
  }, []);

  useEffect(() => {
    // Filter comments
    let result = comments;

    if (searchTerm) {
      result = result.filter(
        (comment) =>
          comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          comment.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      result = result.filter((comment) => comment.type === filterType);
    }

    if (filterStatus !== "all") {
      result = result.filter((comment) => comment.status === filterStatus);
    }

    setFilteredComments(result);
  }, [searchTerm, filterType, filterStatus, comments]);

  const handleAction = (comment, action) => {
    if (action === "approve") {
      updateCommentStatus(comment.id, "approved", null);
    } else {
      setSelectedComment(comment);
      setActionType(action);
      setShowReasonModal(true);
    }
  };

  const updateCommentStatus = (commentId, newStatus, moderationReason) => {
    const updatedComments = comments.map((c) =>
      c.id === commentId
        ? {
            ...c,
            status: newStatus,
            moderatedBy: user?.name || "Admin",
            moderatedAt: new Date().toISOString(),
            moderationReason: moderationReason,
          }
        : c
    );
    setComments(updatedComments);
    localStorage.setItem("comments", JSON.stringify(updatedComments));
  };

  const handleConfirmAction = () => {
    if (!reason.trim() && actionType !== "approve") {
      alert("Vui lòng nhập lý do!");
      return;
    }

    const statusMap = {
      hide: "hidden",
      delete: "deleted",
      report: "reported",
      approve: "approved",
    };

    updateCommentStatus(
      selectedComment.id,
      statusMap[actionType],
      reason.trim()
    );

    setShowReasonModal(false);
    setReason("");
    setSelectedComment(null);

    const actionMessages = {
      hide: "ẩn",
      delete: "xóa",
      report: "báo cáo",
      approve: "duyệt",
    };
    alert(`Đã ${actionMessages[actionType]} bình luận thành công!`);
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { label: "Đã duyệt", className: "status-approved" },
      pending: { label: "Chờ duyệt", className: "status-pending" },
      hidden: { label: "Đã ẩn", className: "status-hidden" },
      deleted: { label: "Đã xóa", className: "status-deleted" },
      reported: { label: "Bị báo cáo", className: "status-reported" },
    };
    return badges[status] || { label: status, className: "" };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  return (
    <div className="comment-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý bình luận</h1>
          <p className="subtitle">
            Kiểm duyệt và quản lý bình luận của người dùng
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{comments.length}</span>
            <span className="stat-label">Tổng bình luận</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {comments.filter((c) => c.status === "pending").length}
            </span>
            <span className="stat-label">Chờ duyệt</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {comments.filter((c) => c.status === "reported").length}
            </span>
            <span className="stat-label">Bị báo cáo</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm bình luận, người dùng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả loại</option>
          <option value="lesson">Bài giảng</option>
          <option value="exercise">Bài tập</option>
          <option value="course">Khóa học</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="approved">Đã duyệt</option>
          <option value="pending">Chờ duyệt</option>
          <option value="hidden">Đã ẩn</option>
          <option value="deleted">Đã xóa</option>
          <option value="reported">Bị báo cáo</option>
        </select>
      </div>

      <div className="comments-list">
        {filteredComments.length === 0 ? (
          <div className="empty-state">
            <p>Không tìm thấy bình luận nào</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <div className="user-info">
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    className="user-avatar"
                  />
                  <div>
                    <strong>{comment.userName}</strong>
                    <div className="comment-meta">
                      <span className="badge badge-type">{comment.type}</span>
                      <span className="comment-date">
                        {formatDate(comment.createdAt)}
                      </span>
                      {comment.likes && (
                        <span className="likes">👍 {comment.likes}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span
                  className={`badge ${
                    getStatusBadge(comment.status).className
                  }`}
                >
                  {getStatusBadge(comment.status).label}
                </span>
              </div>

              <div className="comment-content">{comment.content}</div>

              {comment.rating && (
                <div className="comment-rating">
                  Đánh giá: {"⭐".repeat(comment.rating)}
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="replies-section">
                  <strong>💬 {comment.replies.length} phản hồi</strong>
                  <div className="replies-list">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="reply-item">
                        <img
                          src={reply.userAvatar}
                          alt={reply.userName}
                          className="reply-avatar"
                        />
                        <div>
                          <strong>{reply.userName}</strong>
                          <p>{reply.content}</p>
                          <small>{formatDate(reply.createdAt)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {comment.moderatedBy && (
                <div className="moderation-info">
                  <strong>Kiểm duyệt bởi:</strong> {comment.moderatedBy} -{" "}
                  {formatDate(comment.moderatedAt)}
                  {comment.moderationReason && (
                    <div className="moderation-reason">
                      <strong>Lý do:</strong> {comment.moderationReason}
                    </div>
                  )}
                </div>
              )}

              <div className="comment-actions">
                {comment.status !== "approved" && (
                  <button
                    className="btn-action btn-approve"
                    onClick={() => handleAction(comment, "approve")}
                  >
                    ✓ Duyệt
                  </button>
                )}
                {comment.status !== "hidden" && (
                  <button
                    className="btn-action btn-hide"
                    onClick={() => handleAction(comment, "hide")}
                  >
                    👁️ Ẩn
                  </button>
                )}
                <button
                  className="btn-action btn-report"
                  onClick={() => handleAction(comment, "report")}
                >
                  🚩 Báo cáo
                </button>
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleAction(comment, "delete")}
                >
                  🗑️ Xóa
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showReasonModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowReasonModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {actionType === "hide" && "Ẩn bình luận"}
                {actionType === "delete" && "Xóa bình luận"}
                {actionType === "report" && "Báo cáo bình luận"}
              </h2>
              <button
                className="btn-close"
                onClick={() => setShowReasonModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Người dùng:</strong> {selectedComment?.userName}
              </p>
              <p>
                <strong>Nội dung:</strong> {selectedComment?.content}
              </p>
              <label>
                <strong>Lý do:</strong>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Nhập lý do kiểm duyệt..."
                  rows="4"
                  className="reason-input"
                />
              </label>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowReasonModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-confirm" onClick={handleConfirmAction}>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentManagement;
