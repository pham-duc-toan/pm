import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import reportsData from "../../data/reports.json";
import "./CommentModeration.css";

const CommentModeration = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const stored = localStorage.getItem("reports");
    const allReports = stored ? JSON.parse(stored) : reportsData.reports;
    setReports(allReports.filter((r) => r.type === "comment"));
  }, []);

  const handleAction = (reportId, action) => {
    const updatedReports = reports.map((r) =>
      r.id === reportId
        ? {
            ...r,
            status: "resolved",
            action,
            reviewedBy: user.id,
            reviewedAt: new Date().toISOString(),
          }
        : r
    );
    setReports(updatedReports);
    localStorage.setItem("reports", JSON.stringify(updatedReports));
  };

  const filteredReports = reports.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === "pending";
    if (filter === "resolved") return r.status === "resolved";
    return true;
  });

  return (
    <div className="moderation-page">
      <div className="page-header">
        <h1>Kiểm duyệt bình luận</h1>
        <div className="stats">
          <span className="stat pending">
            {reports.filter((r) => r.status === "pending").length} chờ duyệt
          </span>
          <span className="stat resolved">
            {reports.filter((r) => r.status === "resolved").length} đã xử lý
          </span>
        </div>
      </div>

      <div className="filters">
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          Tất cả
        </button>
        <button
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Chờ duyệt
        </button>
        <button
          className={filter === "resolved" ? "active" : ""}
          onClick={() => setFilter("resolved")}
        >
          Đã xử lý
        </button>
      </div>

      <div className="reports-list">
        {filteredReports.map((report) => (
          <div key={report.id} className={`report-card ${report.status}`}>
            <div className="report-header">
              <div className="reporter-info">
                <strong>📢 Báo cáo bởi:</strong> {report.reporterName}
                <span className={`reason-badge ${report.reason}`}>
                  {report.reason === "spam"
                    ? "🚫 Spam"
                    : report.reason === "hate_speech"
                    ? "😡 Hate Speech"
                    : "⚠️ Không phù hợp"}
                </span>
              </div>
              <span className="report-time">
                {new Date(report.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>

            <div className="report-description">
              <strong>Lý do:</strong>
              <p>{report.description}</p>
            </div>

            <div className="comment-content">
              <div className="comment-author">
                <img
                  src={report.content.authorAvatar}
                  alt={report.content.author}
                />
                <span>{report.content.author}</span>
              </div>
              <div className="comment-text">{report.content.text}</div>
              <div className="comment-meta">
                Khóa học ID: {report.content.courseId} • Bài học:{" "}
                {report.content.lessonId}
              </div>
            </div>

            {report.status === "pending" ? (
              <div className="action-buttons">
                <button
                  className="btn approve"
                  onClick={() => handleAction(report.id, "approved")}
                >
                  ✅ Duyệt (Không vi phạm)
                </button>
                <button
                  className="btn hide"
                  onClick={() => handleAction(report.id, "hidden")}
                >
                  👁️‍🗨️ Ẩn bình luận
                </button>
                <button
                  className="btn delete"
                  onClick={() => handleAction(report.id, "deleted")}
                >
                  🗑️ Xóa bình luận
                </button>
                <button
                  className="btn flag"
                  onClick={() => handleAction(report.id, "flagged_spam")}
                >
                  🚩 Flag Spam
                </button>
              </div>
            ) : (
              <div className="resolution-info">
                <strong>✅ Đã xử lý:</strong> {report.action} bởi{" "}
                {report.reviewedBy} lúc{" "}
                {new Date(report.reviewedAt).toLocaleString("vi-VN")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentModeration;
