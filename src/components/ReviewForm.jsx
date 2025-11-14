import React, { useState } from "react";
import "./ReviewForm.css";

const ReviewForm = ({ onSubmit, existingReview = null, onCancel = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("⚠️ Vui lòng chọn số sao đánh giá!");
      return;
    }

    if (!comment.trim()) {
      alert("⚠️ Vui lòng nhập nội dung đánh giá!");
      return;
    }

    onSubmit({ rating, comment: comment.trim() });
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`star-btn ${
          star <= (hoverRating || rating) ? "active" : ""
        }`}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(star)}
      >
        ★
      </button>
    ));
  };

  const ratingLabels = {
    1: "Rất tệ",
    2: "Tệ",
    3: "Bình thường",
    4: "Tốt",
    5: "Xuất sắc",
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3 className="review-form-title">
        {existingReview ? "✏️ Chỉnh sửa đánh giá" : "⭐ Đánh giá khóa học"}
      </h3>

      <div className="rating-section">
        <label>Đánh giá của bạn</label>
        <div className="star-rating">
          {renderStars()}
          {(hoverRating || rating) > 0 && (
            <span className="rating-label">
              {ratingLabels[hoverRating || rating]}
            </span>
          )}
        </div>
      </div>

      <div className="comment-section">
        <label htmlFor="review-comment">Nhận xét chi tiết</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về khóa học này..."
          rows="5"
          maxLength="500"
        />
        <div className="char-count">{comment.length}/500 ký tự</div>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Hủy
          </button>
        )}
        <button type="submit" className="submit-review-btn">
          {existingReview ? "💾 Cập nhật" : "🚀 Gửi đánh giá"}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
