import React, { useState } from "react";
import ReviewForm from "./ReviewForm";
import "./ReviewList.css";

const ReviewList = ({ reviews, currentUserId, onEdit, onDelete }) => {
  const [editingReviewId, setEditingReviewId] = useState(null);

  const handleEditClick = (reviewId) => {
    setEditingReviewId(reviewId);
  };

  const handleEditSubmit = (reviewId, updatedData) => {
    onEdit(reviewId, updatedData);
    setEditingReviewId(null);
  };

  const handleEditCancel = () => {
    setEditingReviewId(null);
  };

  const handleDelete = (reviewId) => {
    if (window.confirm("🗑️ Bạn có chắc muốn xóa đánh giá này?")) {
      onDelete(reviewId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`review-star ${star <= rating ? "filled" : ""}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();
  const averageRating = calculateAverageRating();

  return (
    <div className="review-list-section">
      <h2 className="review-section-title">
        📊 Đánh giá từ học viên ({reviews.length})
      </h2>

      {reviews.length > 0 && (
        <div className="review-summary">
          <div className="average-rating">
            <div className="average-number">{averageRating}</div>
            {renderStars(Math.round(averageRating))}
            <div className="total-reviews">{reviews.length} đánh giá</div>
          </div>

          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="rating-bar-row">
                <span className="star-label">{star} ★</span>
                <div className="rating-bar">
                  <div
                    className="rating-bar-fill"
                    style={{
                      width: `${
                        reviews.length > 0
                          ? (distribution[star] / reviews.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="rating-count">{distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <span className="no-reviews-icon">💬</span>
            <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              {editingReviewId === review.id ? (
                <ReviewForm
                  existingReview={review}
                  onSubmit={(updatedData) =>
                    handleEditSubmit(review.id, updatedData)
                  }
                  onCancel={handleEditCancel}
                />
              ) : (
                <>
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.userName?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="reviewer-name">{review.userName}</div>
                        <div className="review-date">
                          {formatDate(review.createdAt)}
                          {review.updatedAt !== review.createdAt && (
                            <span className="edited-label">(đã chỉnh sửa)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {currentUserId === review.userId && (
                      <div className="review-actions">
                        <button
                          className="edit-review-btn"
                          onClick={() => handleEditClick(review.id)}
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        <button
                          className="delete-review-btn"
                          onClick={() => handleDelete(review.id)}
                          title="Xóa"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>

                  <div className="review-comment">{review.comment}</div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;
