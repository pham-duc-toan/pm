import React, { useState, useEffect } from "react";
import reportsData from "../../data/reports.json";
import courseReviewsData from "../../data/courseReviews.json";
import commentsData from "../../data/comments.json";
import "./Statistics.css";

const Statistics = () => {
  const [stats, setStats] = useState({
    reports: { total: 0, pending: 0, resolved: 0 },
    reviews: { total: 0, pending: 0, approved: 0, rejected: 0 },
    comments: { total: 0, flagged: 0 },
  });

  useEffect(() => {
    // Lấy dữ liệu từ localStorage hoặc file JSON
    const storedReports = localStorage.getItem("allReports");
    const reports = storedReports
      ? JSON.parse(storedReports)
      : reportsData.reports;

    const storedReviews = localStorage.getItem("courseReviews");
    const reviews = storedReviews
      ? JSON.parse(storedReviews)
      : courseReviewsData.courseReviews;

    const storedComments = localStorage.getItem("comments");
    const comments = storedComments
      ? JSON.parse(storedComments)
      : commentsData.comments;

    setStats({
      reports: {
        total: reports.length,
        pending: reports.filter((r) => r.status === "pending").length,
        resolved: reports.filter((r) => r.status === "resolved").length,
      },
      reviews: {
        total: reviews.length,
        pending: reviews.filter((r) => r.status === "pending").length,
        approved: reviews.filter((r) => r.status === "approved").length,
        rejected: reviews.filter((r) => r.status === "rejected").length,
      },
      comments: {
        total: comments.length,
        flagged: comments.filter((c) => c.isFlagged).length,
      },
    });
  }, []);

  const reportTypes = reportsData.reports.reduce((acc, report) => {
    acc[report.type] = (acc[report.type] || 0) + 1;
    return acc;
  }, {});

  const reportReasons = reportsData.reports.reduce((acc, report) => {
    acc[report.reason] = (acc[report.reason] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="statistics-page">
      <div className="page-header">
        <h1>📊 Báo cáo thống kê</h1>
        <p className="subtitle">Tổng quan hoạt động kiểm duyệt</p>
      </div>

      <div className="stats-grid">
        {/* Báo cáo vi phạm */}
        <div className="stat-card reports">
          <div className="stat-header">
            <h3>🚨 Báo cáo vi phạm</h3>
          </div>
          <div className="stat-body">
            <div className="stat-item total">
              <span className="label">Tổng số:</span>
              <span className="value">{stats.reports.total}</span>
            </div>
            <div className="stat-item pending">
              <span className="label">Chờ xử lý:</span>
              <span className="value">{stats.reports.pending}</span>
            </div>
            <div className="stat-item resolved">
              <span className="label">Đã giải quyết:</span>
              <span className="value">{stats.reports.resolved}</span>
            </div>
          </div>
        </div>

        {/* Duyệt khóa học */}
        <div className="stat-card reviews">
          <div className="stat-header">
            <h3>📚 Duyệt khóa học</h3>
          </div>
          <div className="stat-body">
            <div className="stat-item total">
              <span className="label">Tổng số:</span>
              <span className="value">{stats.reviews.total}</span>
            </div>
            <div className="stat-item pending">
              <span className="label">Chờ duyệt:</span>
              <span className="value">{stats.reviews.pending}</span>
            </div>
            <div className="stat-item approved">
              <span className="label">Đã duyệt:</span>
              <span className="value">{stats.reviews.approved}</span>
            </div>
            <div className="stat-item rejected">
              <span className="label">Từ chối:</span>
              <span className="value">{stats.reviews.rejected}</span>
            </div>
          </div>
        </div>

        {/* Kiểm duyệt bình luận */}
        <div className="stat-card comments">
          <div className="stat-header">
            <h3>💬 Bình luận</h3>
          </div>
          <div className="stat-body">
            <div className="stat-item total">
              <span className="label">Tổng số:</span>
              <span className="value">{stats.comments.total}</span>
            </div>
            <div className="stat-item flagged">
              <span className="label">Đã đánh dấu:</span>
              <span className="value">{stats.comments.flagged}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phân loại báo cáo */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>📊 Loại báo cáo</h3>
          <div className="chart-list">
            {Object.entries(reportTypes).map(([type, count]) => (
              <div key={type} className="chart-item">
                <span className="chart-label">
                  {type === "comment"
                    ? "💬 Bình luận"
                    : type === "course"
                    ? "📚 Khóa học"
                    : type === "user"
                    ? "👤 Người dùng"
                    : "📝 Khác"}
                </span>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(count / stats.reports.total) * 100}%`,
                    }}
                  ></div>
                  <span className="chart-value">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>⚠️ Lý do báo cáo</h3>
          <div className="chart-list">
            {Object.entries(reportReasons).map(([reason, count]) => (
              <div key={reason} className="chart-item">
                <span className="chart-label">
                  {reason === "spam"
                    ? "🚫 Spam"
                    : reason === "hate_speech"
                    ? "😡 Hate Speech"
                    : reason === "inappropriate"
                    ? "⚠️ Không phù hợp"
                    : reason === "copyright"
                    ? "©️ Vi phạm bản quyền"
                    : reason === "fake"
                    ? "🎭 Giả mạo"
                    : "😠 Khác"}
                </span>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(count / stats.reports.total) * 100}%`,
                    }}
                  ></div>
                  <span className="chart-value">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hiệu suất */}
      <div className="performance-section">
        <h3>🎯 Hiệu suất xử lý</h3>
        <div className="performance-grid">
          <div className="performance-item">
            <div className="performance-value">
              {stats.reports.total > 0
                ? Math.round(
                    (stats.reports.resolved / stats.reports.total) * 100
                  )
                : 0}
              %
            </div>
            <div className="performance-label">Tỷ lệ giải quyết báo cáo</div>
          </div>
          <div className="performance-item">
            <div className="performance-value">
              {stats.reviews.total > 0
                ? Math.round(
                    ((stats.reviews.approved + stats.reviews.rejected) /
                      stats.reviews.total) *
                      100
                  )
                : 0}
              %
            </div>
            <div className="performance-label">Tỷ lệ duyệt khóa học</div>
          </div>
          <div className="performance-item">
            <div className="performance-value">{stats.reports.pending}</div>
            <div className="performance-label">Công việc chờ xử lý</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
