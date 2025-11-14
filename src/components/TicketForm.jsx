import React, { useState } from "react";
import "./TicketForm.css";

const TicketForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    subject: "",
    category: "technical",
    priority: "medium",
    description: "",
    attachments: [],
  });
  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [...formData.attachments, ...files];

    // Tạo preview cho ảnh
    const newPreviews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));

    setFormData({ ...formData, attachments: newAttachments });
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const removeAttachment = (index) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);

    // Revoke object URL để tránh memory leak
    URL.revokeObjectURL(previewImages[index].url);

    setFormData({ ...formData, attachments: newAttachments });
    setPreviewImages(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.description) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Tạo ticket với ID ngẫu nhiên
    const ticket = {
      id: "TKT-" + Date.now(),
      ...formData,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(ticket);

    // Reset form
    setFormData({
      subject: "",
      category: "technical",
      priority: "medium",
      description: "",
      attachments: [],
    });
    previewImages.forEach((preview) => URL.revokeObjectURL(preview.url));
    setPreviewImages([]);

    alert("✅ Gửi yêu cầu hỗ trợ thành công! Mã ticket: " + ticket.id);
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-form">
      <h2 className="ticket-form-title">📝 Gửi yêu cầu hỗ trợ</h2>

      <div className="form-group">
        <label htmlFor="subject">Tiêu đề yêu cầu *</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Mô tả ngắn gọn vấn đề của bạn"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">Danh mục</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="technical">Kỹ thuật</option>
            <option value="payment">Thanh toán</option>
            <option value="course">Khóa học</option>
            <option value="account">Tài khoản</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">Độ ưu tiên</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Thấp</option>
            <option value="medium">Trung bình</option>
            <option value="high">Cao</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Mô tả chi tiết *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="6"
          placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="attachments">
          Đính kèm ảnh (nếu có)
          <span className="label-hint">Hỗ trợ: JPG, PNG, GIF (Max 5MB)</span>
        </label>
        <div className="file-input-wrapper">
          <input
            type="file"
            id="attachments"
            name="attachments"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="attachments" className="file-input-label">
            📎 Chọn ảnh
          </label>
        </div>

        {previewImages.length > 0 && (
          <div className="attachments-preview">
            {previewImages.map((preview, index) => (
              <div key={index} className="attachment-item">
                {preview.type.startsWith("image/") ? (
                  <img src={preview.url} alt={preview.name} />
                ) : (
                  <div className="file-icon">📄</div>
                )}
                <button
                  type="button"
                  className="remove-attachment"
                  onClick={() => removeAttachment(index)}
                  title="Xóa file"
                >
                  ✕
                </button>
                <span className="attachment-name">{preview.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="submit-ticket-btn">
        🚀 Gửi yêu cầu hỗ trợ
      </button>
    </form>
  );
};

export default TicketForm;
