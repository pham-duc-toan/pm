import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import bannersData from "../../data/banners.json";
import "./BannerManagement.css";

const BannerManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    position: "home_hero",
    priority: 1,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  useEffect(() => {
    const stored = localStorage.getItem("banners");
    setBanners(stored ? JSON.parse(stored) : bannersData.banners);
  }, []);

  const saveToLocalStorage = (newBanners) => {
    localStorage.setItem("banners", JSON.stringify(newBanners));
  };

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();

    if (selectedBanner) {
      // Update
      const updatedBanners = banners.map((b) =>
        b.id === selectedBanner.id
          ? {
              ...b,
              ...formData,
            }
          : b
      );
      setBanners(updatedBanners);
      saveToLocalStorage(updatedBanners);
    } else {
      // Create
      const newBanner = {
        id: `banner-${Date.now()}`,
        ...formData,
        status: "active",
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        stats: {
          views: 0,
          clicks: 0,
          ctr: 0,
        },
      };
      const updatedBanners = [...banners, newBanner];
      setBanners(updatedBanners);
      saveToLocalStorage(updatedBanners);
    }

    resetForm();
  };

  const handleToggleStatus = (bannerId) => {
    const updatedBanners = banners.map((b) =>
      b.id === bannerId
        ? { ...b, status: b.status === "active" ? "inactive" : "active" }
        : b
    );
    setBanners(updatedBanners);
    saveToLocalStorage(updatedBanners);
  };

  const handleDelete = (bannerId) => {
    if (!confirm("Bạn có chắc muốn xóa banner này?")) return;
    const updatedBanners = banners.filter((b) => b.id !== bannerId);
    setBanners(updatedBanners);
    saveToLocalStorage(updatedBanners);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      link: "",
      position: "home_hero",
      priority: 1,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    });
    setSelectedBanner(null);
    setShowModal(false);
  };

  const handleEdit = (banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      link: banner.link,
      position: banner.position,
      priority: banner.priority,
      startDate: banner.startDate.split("T")[0],
      endDate: banner.endDate.split("T")[0],
    });
    setShowModal(true);
  };

  const exportStats = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "THỐNG KÊ BANNER\n\n";
    csvContent += "ID,Tiêu đề,Vị trí,Trạng thái,Lượt xem,Lượt click,CTR (%)\n";
    banners.forEach((banner) => {
      csvContent += `${banner.id},"${banner.title}",${banner.position},${
        banner.status
      },${banner.stats.views},${banner.stats.clicks},${banner.stats.ctr.toFixed(
        2
      )}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `banner-stats-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="banner-management-page">
      <div className="page-header">
        <h1>Quản lý Banner & Quảng cáo</h1>
        <div className="header-actions">
          <button className="btn-export" onClick={exportStats}>
            📊 Export Thống kê
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            ➕ Thêm Banner
          </button>
        </div>
      </div>

      <div className="banners-grid">
        {banners.map((banner) => (
          <div key={banner.id} className="banner-card">
            <div className="banner-preview">
              <img src={banner.imageUrl} alt={banner.title} />
              <span className={`status-badge ${banner.status}`}>
                {banner.status === "active" ? "✅ Hoạt động" : "🔒 Đã tắt"}
              </span>
            </div>
            <div className="banner-info">
              <h3>{banner.title}</h3>
              <p>{banner.description}</p>
              <div className="banner-meta">
                <span className="position-badge">{banner.position}</span>
                <span className="priority-badge">
                  Ưu tiên: {banner.priority}
                </span>
              </div>
              <div className="banner-stats">
                <div className="stat">
                  <strong>{banner.stats.views.toLocaleString()}</strong>
                  <small>Lượt xem</small>
                </div>
                <div className="stat">
                  <strong>{banner.stats.clicks.toLocaleString()}</strong>
                  <small>Lượt click</small>
                </div>
                <div className="stat">
                  <strong>{banner.stats.ctr.toFixed(2)}%</strong>
                  <small>CTR</small>
                </div>
              </div>
              <div className="banner-dates">
                <small>
                  {new Date(banner.startDate).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(banner.endDate).toLocaleDateString("vi-VN")}
                </small>
              </div>
            </div>
            <div className="banner-actions">
              <button className="btn-icon" onClick={() => handleEdit(banner)}>
                ✏️
              </button>
              <button
                className="btn-icon"
                onClick={() => handleToggleStatus(banner.id)}
              >
                {banner.status === "active" ? "🔒" : "🔓"}
              </button>
              <button
                className="btn-icon delete"
                onClick={() => handleDelete(banner.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedBanner ? "Chỉnh sửa Banner" : "Thêm Banner mới"}</h2>
              <button className="close-btn" onClick={resetForm}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>URL hình ảnh *</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  required
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
              </div>

              <div className="form-group">
                <label>Link đích</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vị trí *</label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    required
                  >
                    <option value="home_hero">Trang chủ - Hero</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="footer">Footer</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Độ ưu tiên</label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {selectedBanner ? "Cập nhật" : "Tạo Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
