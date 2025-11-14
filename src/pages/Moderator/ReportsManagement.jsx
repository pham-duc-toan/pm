import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import reportsData from "../../data/reports.json";
import "./ReportsManagement.css";

const ReportsManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const stored = localStorage.getItem("allReports");
    setReports(stored ? JSON.parse(stored) : reportsData.reports);
  }, []);

  const handleResolve = (reportId, action) => {
    const updatedReports = reports.map((r) =>
      r.id === reportId
        ? {
            ...r,
            status: "resolved",
            action,
            resolvedBy: user.id,
            resolvedByName: user.fullName,
            resolvedAt: new Date().toISOString(),
          }
        : r
    );
    setReports(updatedReports);
    localStorage.setItem("allReports", JSON.stringify(updatedReports));
  };

  const filteredReports = reports.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const getTypeLabel = (type) => {
    const labels = {
      comment: "💬 Bình luận",
      course: "📚 Khóa học",
      user: "👤 Người dùng",
      content: "📝 Nội dung",
    };
    return labels[type] || type;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      spam: "🚫 Spam",
      hate_speech: "😡 Hate Speech",
      inappropriate: "⚠️ Không phù hợp",
      copyright: "©️ Vi phạm bản quyền",
      fake: "🎭 Giả mạo",
      harassment: "😠 Quấy rối",
    };
    return labels[reason] || reason;
  };

  return (
    <div className="reports-management-page">
      <div className="page-header">
        <h1>🚨 Quản lý báo cáo vi phạm</h1>
        <div className="stats">
          <span className="stat pending">
            {reports.filter((r) => r.status === "pending").length} chờ xử lý
          </span>
          <span className="stat resolved">
            {reports.filter((r) => r.status === "resolved").length} đã giải
            quyết
          </span>
        </div>
      </div>

      <div className="filters-row">
        <div className="filter-group">
          <label>Loại báo cáo:</label>
          <div className="filters">
            <button
              className={filterType === "all" ? "active" : ""}
              onClick={() => setFilterType("all")}
            >
              Tất cả
            </button>
            <button
              className={filterType === "comment" ? "active" : ""}
              onClick={() => setFilterType("comment")}
            >
              💬 Bình luận
            </button>
            <button
              className={filterType === "course" ? "active" : ""}
              onClick={() => setFilterType("course")}
            >
              📚 Khóa học
            </button>
            <button
              className={filterType === "user" ? "active" : ""}
              onClick={() => setFilterType("user")}
            >
              👤 Người dùng
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Trạng thái:</label>
          <div className="filters">
            <button
              className={filterStatus === "all" ? "active" : ""}
              onClick={() => setFilterStatus("all")}
            >
              Tất cả
            </button>
            <button
              className={filterStatus === "pending" ? "active" : ""}
              onClick={() => setFilterStatus("pending")}
            >
              Chờ xử lý
            </button>
            <button
              className={filterStatus === "resolved" ? "active" : ""}
              onClick={() => setFilterStatus("resolved")}
            >
              Đã giải quyết
            </button>
          </div>
        </div>
      </div>

      <div className="reports-list">
        {filteredReports.map((report) => (
          <div key={report.id} className={`report-card ${report.status}`}>
            <div className="report-header">
              <div>
                <span className="type-badge">{getTypeLabel(report.type)}</span>
                <span className={`reason-badge ${report.reason}`}>
                  {getReasonLabel(report.reason)}
                </span>
                <span className={`status-badge ${report.status}`}>
                  {report.status === "pending"
                    ? "⏳ Chờ xử lý"
                    : "✅ Đã giải quyết"}
                </span>
              </div>
              <span className="report-date">
                {new Date(report.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>

            <div className="reporter-info">
              <strong>📢 Báo cáo bởi:</strong> {report.reporterName} (
              {report.reporterEmail})
            </div>

            <div className="report-description">
              <strong>Lý do chi tiết:</strong>
              <p>{report.description}</p>
            </div>

            {report.content && (
              <div className="reported-content">
                <strong>Nội dung bị báo cáo:</strong>
                {report.type === "comment" && (
                  <div className="comment-preview">
                    <div className="author-info">
                      <img
                        src={report.content.authorAvatar}
                        alt={report.content.author}
                      />
                      <span>{report.content.author}</span>
                    </div>
                    <p>{report.content.text}</p>
                    <small>
                      Khóa học ID: {report.content.courseId} • Bài học:{" "}
                      {report.content.lessonId}
                    </small>
                  </div>
                )}
                {report.type === "course" && (
                  <div className="course-preview">
                    <p>
                      <strong>Tiêu đề:</strong> {report.content.courseTitle}
                    </p>
                    <p>
                      <strong>Giảng viên:</strong>{" "}
                      {report.content.instructorName}
                    </p>
                  </div>
                )}
              </div>
            )}

            {report.status === "pending" ? (
              <div className="action-buttons">
                <button
                  className="btn approve"
                  onClick={() => handleResolve(report.id, "approved")}
                >
                  ✅ Không vi phạm
                </button>
                <button
                  className="btn hide"
                  onClick={() => handleResolve(report.id, "hidden")}
                >
                  👁️‍🗨️ Ẩn nội dung
                </button>
                <button
                  className="btn delete"
                  onClick={() => handleResolve(report.id, "deleted")}
                >
                  🗑️ Xóa nội dung
                </button>
                <button
                  className="btn ban"
                  onClick={() => handleResolve(report.id, "banned")}
                >
                  🚫 Cấm người dùng
                </button>
              </div>
            ) : (
              <div className="resolution-info">
                <p>
                  <strong>✅ Đã xử lý:</strong> {report.action} bởi{" "}
                  {report.resolvedByName}
                </p>
                <p>
                  <strong>Thời gian:</strong>{" "}
                  {new Date(report.resolvedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsManagement;
