import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import emailTemplatesData from "../../data/emailTemplates.json";
import "./EmailTemplates.css";

const EmailTemplates = () => {
  const { user } = useSelector((state) => state.auth);
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    subject: "",
    content: "",
    status: "active",
  });

  useEffect(() => {
    const savedTemplates =
      JSON.parse(localStorage.getItem("emailTemplates")) ||
      emailTemplatesData.templates;
    setTemplates(savedTemplates);
    setFilteredTemplates(savedTemplates);
  }, []);

  useEffect(() => {
    let result = templates;

    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      result = result.filter((t) => t.category === filterCategory);
    }

    setFilteredTemplates(result);
  }, [searchTerm, filterCategory, templates]);

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      status: template.status,
    });
    setShowEditModal(true);
  };

  const handleSave = () => {
    if (!editForm.name.trim() || !editForm.subject.trim()) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const updatedTemplates = templates.map((t) =>
      t.id === selectedTemplate.id
        ? {
            ...t,
            ...editForm,
            version: t.version + 1,
            updatedAt: new Date().toISOString(),
          }
        : t
    );

    setTemplates(updatedTemplates);
    localStorage.setItem("emailTemplates", JSON.stringify(updatedTemplates));
    setShowEditModal(false);
    alert("Đã lưu template thành công!");
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleToggleStatus = (templateId) => {
    const updatedTemplates = templates.map((t) =>
      t.id === templateId
        ? { ...t, status: t.status === "active" ? "inactive" : "active" }
        : t
    );
    setTemplates(updatedTemplates);
    localStorage.setItem("emailTemplates", JSON.stringify(updatedTemplates));
  };

  const renderPreview = () => {
    if (!selectedTemplate) return "";
    let preview = selectedTemplate.content;
    selectedTemplate.variables?.forEach((variable) => {
      const sampleData = {
        "{Tên}": "Nguyễn Văn A",
        "{Email}": "example@gmail.com",
        "{SiteUrl}": "https://codelearn.io",
        "{KhoaHoc}": "JavaScript & React Fundamentals",
        "{BaiHoc}": "State Management với Redux",
        "{ThoiLuong}": "45",
        "{MoTa}": "Học cách quản lý state toàn cục với Redux Toolkit",
        "{LinkBaiHoc}": "https://codelearn.io/lessons/123",
        "{PhanTram}": "30",
        "{SoNgay}": "3",
        "{LinkKhuyenMai}": "https://codelearn.io/promotion",
        "{TenGiangVien}": "Nguyễn Văn A",
        "{NgayDuyet}": "14/11/2025",
        "{NguoiDuyet}": "Admin",
        "{LinkKhoaHoc}": "https://codelearn.io/courses/123",
        "{LyDo}": "Nội dung chưa đủ chi tiết",
        "{GoiY}":
          "<li>Bổ sung thêm ví dụ thực tế</li><li>Cải thiện chất lượng video</li>",
        "{LinkChinhSua}": "https://codelearn.io/instructor/courses/edit/123",
        "{DiemSo}": "95",
        "{LinkChungChi}": "https://codelearn.io/certificates/download/456",
      };
      preview = preview.replace(
        new RegExp(variable, "g"),
        sampleData[variable] || variable
      );
    });
    return preview;
  };

  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "onboarding", label: "Onboarding" },
    { value: "notification", label: "Thông báo" },
    { value: "marketing", label: "Marketing" },
    { value: "instructor", label: "Giảng viên" },
    { value: "achievement", label: "Thành tích" },
  ];

  return (
    <div className="email-templates-page">
      <div className="page-header">
        <div>
          <h1>Quản lý Email Templates</h1>
          <p className="subtitle">
            Tùy chỉnh nội dung email tự động gửi đến người dùng
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{templates.length}</span>
            <span className="stat-label">Tổng templates</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {templates.filter((t) => t.status === "active").length}
            </span>
            <span className="stat-label">Đang hoạt động</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {templates.reduce((sum, t) => sum + (t.stats?.sent || 0), 0)}
            </span>
            <span className="stat-label">Đã gửi</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm template..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="templates-grid">
        {filteredTemplates.length === 0 ? (
          <div className="empty-state">
            <p>Không tìm thấy template nào</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="template-card">
              <div className="template-header">
                <div>
                  <h3>{template.name}</h3>
                  <span className={`badge badge-${template.category}`}>
                    {categories.find((c) => c.value === template.category)
                      ?.label || template.category}
                  </span>
                </div>
                <button
                  className={`btn-toggle ${
                    template.status === "active" ? "active" : ""
                  }`}
                  onClick={() => handleToggleStatus(template.id)}
                >
                  {template.status === "active" ? "🟢" : "🔴"}
                </button>
              </div>

              <div className="template-subject">
                <strong>Subject:</strong> {template.subject}
              </div>

              <div className="template-variables">
                <strong>Biến:</strong>
                <div className="variables-list">
                  {template.variables?.map((v, idx) => (
                    <span key={idx} className="variable-badge">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {template.stats && (
                <div className="template-stats">
                  <div className="stat">
                    <span className="stat-label">Đã gửi</span>
                    <span className="stat-value">{template.stats.sent}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Open rate</span>
                    <span className="stat-value">
                      {template.stats.openRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Click rate</span>
                    <span className="stat-value">
                      {template.stats.clickRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="template-footer">
                <span className="version">v{template.version}</span>
                <div className="template-actions">
                  <button
                    className="btn-action btn-preview"
                    onClick={() => handlePreview(template)}
                  >
                    👁️ Xem
                  </button>
                  <button
                    className="btn-action btn-edit"
                    onClick={() => handleEdit(template)}
                  >
                    ✏️ Sửa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showPreview && selectedTemplate && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div
            className="modal-content modal-preview"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Preview: {selectedTemplate.name}</h2>
              <button
                className="btn-close"
                onClick={() => setShowPreview(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="preview-info">
                <p>
                  <strong>Subject:</strong> {selectedTemplate.subject}
                </p>
                <p>
                  <strong>Category:</strong> {selectedTemplate.category}
                </p>
              </div>
              <div className="preview-divider"></div>
              <div
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: renderPreview() }}
              />
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedTemplate && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content modal-edit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Chỉnh sửa Template</h2>
              <button
                className="btn-close"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  <strong>Tên template:</strong>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="form-input"
                  />
                </label>
              </div>

              <div className="form-group">
                <label>
                  <strong>Subject:</strong>
                  <input
                    type="text"
                    value={editForm.subject}
                    onChange={(e) =>
                      setEditForm({ ...editForm, subject: e.target.value })
                    }
                    className="form-input"
                  />
                </label>
              </div>

              <div className="form-group">
                <label>
                  <strong>Nội dung (HTML):</strong>
                  <textarea
                    value={editForm.content}
                    onChange={(e) =>
                      setEditForm({ ...editForm, content: e.target.value })
                    }
                    rows="12"
                    className="form-textarea"
                  />
                </label>
              </div>

              <div className="form-group">
                <label>
                  <strong>Trạng thái:</strong>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="variables-help">
                <strong>Biến có sẵn:</strong>
                <div className="variables-list">
                  {selectedTemplate.variables?.map((v, idx) => (
                    <span key={idx} className="variable-badge">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button className="btn-save" onClick={handleSave}>
                  💾 Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplates;
