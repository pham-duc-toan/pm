import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import staffData from "../../data/staff.json";
import "./StaffManagement.css";

const StaffManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [viewingLogs, setViewingLogs] = useState([]);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "supporter",
    phone: "",
    department: "",
    permissions: [],
  });

  useEffect(() => {
    // Load data từ localStorage hoặc JSON
    const storedStaff = localStorage.getItem("staff");
    const storedLogs = localStorage.getItem("actionLogs");

    setStaff(storedStaff ? JSON.parse(storedStaff) : staffData.staff);
    setActionLogs(storedLogs ? JSON.parse(storedLogs) : staffData.actionLogs);
    setPermissions(staffData.permissions);
  }, []);

  const saveToLocalStorage = (newStaff, newLogs) => {
    localStorage.setItem("staff", JSON.stringify(newStaff));
    if (newLogs) {
      localStorage.setItem("actionLogs", JSON.stringify(newLogs));
    }
  };

  const handleCreateOrUpdate = (e) => {
    e.preventDefault();

    if (selectedStaff) {
      // Update
      const updatedStaff = staff.map((s) =>
        s.id === selectedStaff.id
          ? {
              ...s,
              ...formData,
              permissions: formData.permissions,
            }
          : s
      );
      setStaff(updatedStaff);
      saveToLocalStorage(updatedStaff);

      // Log action
      const newLog = {
        id: `log-${Date.now()}`,
        staffId: user.id,
        action: "update_staff",
        targetType: "staff",
        targetId: selectedStaff.id,
        reason: `Updated staff: ${formData.fullName}`,
        timestamp: new Date().toISOString(),
        details: `Updated permissions: ${formData.permissions.join(", ")}`,
      };
      const updatedLogs = [newLog, ...actionLogs];
      setActionLogs(updatedLogs);
      saveToLocalStorage(updatedStaff, updatedLogs);
    } else {
      // Create
      const newStaff = {
        id: `staff-${Date.now()}`,
        ...formData,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(
          Math.random() * 70
        )}`,
        status: "active",
        createdAt: new Date().toISOString(),
        lastLogin: null,
      };
      const updatedStaff = [...staff, newStaff];
      setStaff(updatedStaff);
      saveToLocalStorage(updatedStaff);

      // Log action
      const newLog = {
        id: `log-${Date.now()}`,
        staffId: user.id,
        action: "create_staff",
        targetType: "staff",
        targetId: newStaff.id,
        reason: `Created new ${newStaff.role}: ${newStaff.fullName}`,
        timestamp: new Date().toISOString(),
        details: `Assigned permissions: ${formData.permissions.join(", ")}`,
      };
      const updatedLogs = [newLog, ...actionLogs];
      setActionLogs(updatedLogs);
      saveToLocalStorage(updatedStaff, updatedLogs);
    }

    resetForm();
  };

  const handleToggleStatus = (staffId) => {
    const updatedStaff = staff.map((s) =>
      s.id === staffId
        ? { ...s, status: s.status === "active" ? "inactive" : "active" }
        : s
    );
    setStaff(updatedStaff);
    saveToLocalStorage(updatedStaff);

    const staffMember = staff.find((s) => s.id === staffId);
    const newLog = {
      id: `log-${Date.now()}`,
      staffId: user.id,
      action:
        staffMember.status === "active" ? "deactivate_staff" : "activate_staff",
      targetType: "staff",
      targetId: staffId,
      reason: `${
        staffMember.status === "active" ? "Deactivated" : "Activated"
      } staff account`,
      timestamp: new Date().toISOString(),
      details: `Account: ${staffMember.email}`,
    };
    const updatedLogs = [newLog, ...actionLogs];
    setActionLogs(updatedLogs);
    saveToLocalStorage(updatedStaff, updatedLogs);
  };

  const handleDelete = (staffId) => {
    if (!confirm("Bạn có chắc muốn xóa tài khoản này?")) return;

    const staffMember = staff.find((s) => s.id === staffId);
    const updatedStaff = staff.filter((s) => s.id !== staffId);
    setStaff(updatedStaff);
    saveToLocalStorage(updatedStaff);

    const newLog = {
      id: `log-${Date.now()}`,
      staffId: user.id,
      action: "delete_staff",
      targetType: "staff",
      targetId: staffId,
      reason: `Deleted staff account: ${staffMember.fullName}`,
      timestamp: new Date().toISOString(),
      details: `Email: ${staffMember.email}, Role: ${staffMember.role}`,
    };
    const updatedLogs = [newLog, ...actionLogs];
    setActionLogs(updatedLogs);
    saveToLocalStorage(updatedStaff, updatedLogs);
  };

  const handleViewLogs = (staffId) => {
    const logs = actionLogs.filter((log) => log.staffId === staffId);
    setViewingLogs(logs);
    setShowLogModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      fullName: "",
      role: "supporter",
      phone: "",
      department: "",
      permissions: [],
    });
    setSelectedStaff(null);
    setShowModal(false);
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      email: staffMember.email,
      password: "",
      fullName: staffMember.fullName,
      role: staffMember.role,
      phone: staffMember.phone,
      department: staffMember.department,
      permissions: staffMember.permissions,
    });
    setShowModal(true);
  };

  const togglePermission = (permCode) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permCode)
        ? formData.permissions.filter((p) => p !== permCode)
        : [...formData.permissions, permCode],
    });
  };

  // Filter staff
  const filteredStaff = staff.filter((s) => {
    const matchRole = filterRole === "all" || s.role === filterRole;
    const matchStatus = filterStatus === "all" || s.status === filterStatus;
    const matchSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  return (
    <div className="staff-management-page">
      <div className="page-header">
        <h1>Quản lý nhân viên</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          ➕ Thêm nhân viên
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Tìm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="moderator">Kiểm duyệt viên</option>
          <option value="supporter">Người hỗ trợ</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
      </div>

      <div className="staff-table">
        <table>
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Phòng ban</th>
              <th>Quyền</th>
              <th>Trạng thái</th>
              <th>Đăng nhập cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="staff-info">
                    <img src={s.avatar} alt={s.fullName} />
                    <div>
                      <strong>{s.fullName}</strong>
                      <small>{s.phone}</small>
                    </div>
                  </div>
                </td>
                <td>{s.email}</td>
                <td>
                  <span className={`role-badge ${s.role}`}>
                    {s.role === "moderator" ? "🛡️ Kiểm duyệt" : "💬 Hỗ trợ"}
                  </span>
                </td>
                <td>{s.department}</td>
                <td>
                  <span className="permissions-count">
                    {s.permissions.length} quyền
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${s.status}`}>
                    {s.status === "active" ? "✅ Hoạt động" : "🔒 Đã khóa"}
                  </span>
                </td>
                <td>
                  {s.lastLogin
                    ? new Date(s.lastLogin).toLocaleDateString("vi-VN")
                    : "Chưa đăng nhập"}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(s)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleViewLogs(s.id)}
                      title="Lịch sử"
                    >
                      📋
                    </button>
                    <button
                      className={`btn-icon ${
                        s.status === "active" ? "lock" : "unlock"
                      }`}
                      onClick={() => handleToggleStatus(s.id)}
                      title={s.status === "active" ? "Khóa" : "Mở khóa"}
                    >
                      {s.status === "active" ? "🔒" : "🔓"}
                    </button>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(s.id)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {selectedStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
              </h2>
              <button className="close-btn" onClick={resetForm}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ tên *</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu {!selectedStaff && "*"}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder={selectedStaff ? "Để trống nếu không đổi" : ""}
                    required={!selectedStaff}
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vai trò *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="supporter">Người hỗ trợ</option>
                    <option value="moderator">Kiểm duyệt viên</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phòng ban</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Quyền hạn</label>
                <div className="permissions-grid">
                  {permissions
                    .filter((p) => {
                      if (formData.role === "supporter") {
                        return p.category === "support";
                      }
                      if (formData.role === "moderator") {
                        return ["content", "course", "analytics"].includes(
                          p.category
                        );
                      }
                      return true;
                    })
                    .map((perm) => (
                      <label key={perm.id} className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.code)}
                          onChange={() => togglePermission(perm.code)}
                        />
                        <div>
                          <strong>{perm.name}</strong>
                          <small>{perm.description}</small>
                        </div>
                      </label>
                    ))}
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
                  {selectedStaff ? "Cập nhật" : "Tạo tài khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Logs */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Lịch sử hành động</h2>
              <button
                className="close-btn"
                onClick={() => setShowLogModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="logs-list">
              {viewingLogs.length === 0 ? (
                <p className="empty-state">Chưa có hoạt động nào</p>
              ) : (
                viewingLogs.map((log) => (
                  <div key={log.id} className="log-item">
                    <div className="log-header">
                      <strong>{log.action.replace(/_/g, " ")}</strong>
                      <small>
                        {new Date(log.timestamp).toLocaleString("vi-VN")}
                      </small>
                    </div>
                    <p>{log.reason}</p>
                    <small className="log-details">{log.details}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
