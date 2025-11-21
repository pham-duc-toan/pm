import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import courseReviewsData from "../../data/courseReviews.json";
import coursesData from "../../data/courses.json";
import "./CourseReview.css";

const CourseReview = () => {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("courseReviews");
    setReviews(stored ? JSON.parse(stored) : courseReviewsData.courseReviews);
  }, []);

  const handleAction = (reviewId, action, actionReason = "") => {
    const updatedReviews = reviews.map((r) =>
      r.id === reviewId
        ? {
            ...r,
            status: action === "approved" ? "approved" : "rejected",
            result: action === "approved" ? "approved" : "rejected",
            reviewedBy: user.id,
            reviewedByName: user.fullName,
            reviewedAt: new Date().toISOString(),
            reason: action === "rejected" ? actionReason : r.reason || "",
          }
        : r
    );
    setReviews(updatedReviews);
    localStorage.setItem("courseReviews", JSON.stringify(updatedReviews));
    setSelectedReview(null);
    setReason("");
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === "pending";
    if (filter === "approved") return r.status === "approved";
    if (filter === "rejected") return r.status === "rejected";
    return true;
  });

  // Hàm lấy thông tin khóa học từ courses.json
  const getCourseInfo = (courseId) => {
    return coursesData.courses.find((c) => c.id === courseId);
  };

  return (
    <div className="course-review-page">
      <div className="page-header">
        <h1>📚 Kiểm duyệt khóa học</h1>
        <div className="stats">
          <span className="stat pending">
            {reviews.filter((r) => r.status === "pending").length} chờ duyệt
          </span>
          <span className="stat approved">
            {reviews.filter((r) => r.status === "approved").length} đã duyệt
          </span>
          <span className="stat rejected">
            {reviews.filter((r) => r.status === "rejected").length} từ chối
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
          className={filter === "approved" ? "active" : ""}
          onClick={() => setFilter("approved")}
        >
          Đã duyệt
        </button>
        <button
          className={filter === "rejected" ? "active" : ""}
          onClick={() => setFilter("rejected")}
        >
          Từ chối
        </button>
      </div>

      <div className="reviews-grid">
        {filteredReviews.map((review) => {
          const courseInfo = getCourseInfo(review.courseId);
          const snapshot = review.courseSnapshot || {};

          return (
            <div key={review.id} className={`review-card ${review.status}`}>
              <div className="course-thumbnail">
                <img
                  src={
                    courseInfo?.thumbnail ||
                    "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop"
                  }
                  alt={snapshot.title || "Course"}
                />
                <span className={`status-badge ${review.status}`}>
                  {review.status === "pending"
                    ? "⏳ Chờ duyệt"
                    : review.status === "approved"
                    ? "✅ Đã duyệt"
                    : "❌ Từ chối"}
                </span>
              </div>

              <div className="course-info">
                <h3>{snapshot.title || "Khóa học"}</h3>
                <p className="instructor">
                  👨‍🏫 {courseInfo?.instructor?.fullName || "Giảng viên"}
                </p>
                <p className="description">
                  {snapshot.description ||
                    courseInfo?.description ||
                    "Không có mô tả"}
                </p>

                <div className="course-meta">
                  <span>📊 {courseInfo?.level || "Chưa xác định"}</span>
                  <span>
                    ⏱️{" "}
                    {snapshot.totalDuration
                      ? `${Math.floor(snapshot.totalDuration / 60)} giờ ${
                          snapshot.totalDuration % 60
                        } phút`
                      : courseInfo?.totalDuration || "N/A"}
                  </span>
                  <span>💰 {(snapshot.price || 0).toLocaleString()}đ</span>
                </div>

                <div className="course-details">
                  <p>
                    <strong>Danh mục:</strong>{" "}
                    {courseInfo?.category || "Chưa xác định"}
                  </p>
                  <p>
                    <strong>Số bài học:</strong>{" "}
                    {snapshot.lessonsCount || courseInfo?.totalLessons || 0}
                  </p>
                  <p>
                    <strong>Ngôn ngữ:</strong>{" "}
                    {courseInfo?.language || "Tiếng Việt"}
                  </p>
                  <p>
                    <strong>Ngày gửi:</strong>{" "}
                    {new Date(review.submittedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>

                {review.status === "pending" ? (
                  <div className="action-buttons">
                    <button
                      className="btn approve"
                      onClick={() => handleAction(review.id, "approved")}
                    >
                      ✅ Phê duyệt
                    </button>
                    <button
                      className="btn reject"
                      onClick={() => setSelectedReview(review)}
                    >
                      ❌ Từ chối
                    </button>
                  </div>
                ) : (
                  <div className="review-info">
                    <p>
                      <strong>Người duyệt:</strong>{" "}
                      {review.reviewedByName || review.reviewedBy || "N/A"}
                    </p>
                    {review.reviewedAt && (
                      <p>
                        <strong>Thời gian:</strong>{" "}
                        {new Date(review.reviewedAt).toLocaleString("vi-VN")}
                      </p>
                    )}
                    {review.reason && (
                      <p className="rejection-reason">
                        <strong>Lý do:</strong> {review.reason}
                      </p>
                    )}
                    {review.suggestions && review.suggestions.length > 0 && (
                      <div className="suggestions">
                        <strong>Đề xuất cải thiện:</strong>
                        <ul>
                          {review.suggestions.map((sug, idx) => (
                            <li key={idx}>{sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedReview && (
        <div className="modal-overlay" onClick={() => setSelectedReview(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Từ chối khóa học</h2>
            <p>
              Bạn đang từ chối khóa học:{" "}
              <strong>
                {selectedReview.courseSnapshot?.title || "Khóa học"}
              </strong>
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              rows={5}
            />
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setSelectedReview(null)}
              >
                Hủy
              </button>
              <button
                className="btn-confirm"
                onClick={() =>
                  handleAction(selectedReview.id, "rejected", reason)
                }
                disabled={!reason.trim()}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseReview;
