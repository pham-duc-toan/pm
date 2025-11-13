import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import usersData from "../../data/users.json";
import "./UserManagement.css";

const UserManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Check if user is admin
  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const [users, setUsers] = useState(usersData.users);
  const [activityLogs, setActivityLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showLogs, setShowLogs] = useState(false);
  const [selectedUserLogs, setSelectedUserLogs] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "support",
    password: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Filter users (exclude students and teachers - they register themselves)
  const managedUsers = users.filter(
    (u) => u.role === "admin" || u.role === "moderator" || u.role === "support"
  );

  // Filter and search
  const filteredUsers = useMemo(() => {
    return managedUsers.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = filterRole === "all" || u.role === filterRole;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && u.isActive) ||
        (filterStatus === "inactive" && !u.isActive);

      return matchSearch && matchRole && matchStatus;
    });
  }, [managedUsers, searchTerm, filterRole, filterStatus]);

  // Add activity log
  const addLog = (action, targetUser, details = "") => {
    const log = {
      id: Date.now(),
      adminId: user.id,
      adminName: user.fullName,
      action,
      targetUserId: targetUser?.id,
      targetUserName: targetUser?.fullName,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs([log, ...activityLogs]);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ tên không được để trống";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    } else {
      // Check duplicate email
      const existingUser = users.find(
        (u) =>
          u.email === formData.email &&
          (modalMode === "create" || u.id !== selectedUser?.id)
      );
      if (existingUser) {
        newErrors.email = "Email đã tồn tại trong hệ thống";
      }
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    } else if (formData.phone) {
      // Check duplicate phone
      const existingUser = users.find(
        (u) =>
          u.phone === formData.phone &&
          (modalMode === "create" || u.id !== selectedUser?.id)
      );
      if (existingUser) {
        newErrors.phone = "Số điện thoại đã tồn tại trong hệ thống";
      }
    }

    if (modalMode === "create" && !formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (modalMode === "create" && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle create user
  const handleCreateUser = () => {
    setModalMode("create");
    setSelectedUser(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      role: "support",
      password: "",
      isActive: true,
    });
    setErrors({});
    setShowModal(true);
  };

  // Handle edit user
  const handleEditUser = (userToEdit) => {
    setModalMode("edit");
    setSelectedUser(userToEdit);
    setFormData({
      fullName: userToEdit.fullName,
      email: userToEdit.email,
      phone: userToEdit.phone || "",
      role: userToEdit.role,
      password: "",
      isActive: userToEdit.isActive,
    });
    setErrors({});
    setShowModal(true);
  };

  // Handle view user details
  const handleViewUser = (userToView) => {
    setModalMode("view");
    setSelectedUser(userToView);
    setShowModal(true);
  };

  // Handle submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (modalMode === "create") {
      const newUser = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        username:
          formData.email.split("@")[0] + Math.floor(Math.random() * 1000),
        ...formData,
        avatar: `https://i.pravatar.cc/150?img=${Math.floor(
          Math.random() * 70
        )}`,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        createdBy: user.id,
      };

      setUsers([...users, newUser]);
      addLog("CREATE", newUser, `Tạo tài khoản ${getRoleName(newUser.role)}`);
      showSuccessMessage(`Tạo tài khoản ${newUser.fullName} thành công!`);
    } else if (modalMode === "edit") {
      const updatedUsers = users.map((u) => {
        if (u.id === selectedUser.id) {
          return {
            ...u,
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            isActive: formData.isActive,
            ...(formData.password && { password: formData.password }),
          };
        }
        return u;
      });

      setUsers(updatedUsers);
      addLog(
        "UPDATE",
        selectedUser,
        `Cập nhật thông tin tài khoản ${selectedUser.fullName}`
      );
      showSuccessMessage(`Cập nhật tài khoản ${formData.fullName} thành công!`);
    }

    setShowModal(false);
  };

  // Handle delete user
  const handleDeleteUser = (userToDelete) => {
    if (userToDelete.id === user.id) {
      alert("Bạn không thể xóa tài khoản của chính mình!");
      return;
    }

    if (
      window.confirm(
        `Bạn có chắc chắn muốn xóa tài khoản "${userToDelete.fullName}"?\nHành động này không thể hoàn tác!`
      )
    ) {
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      addLog("DELETE", userToDelete, `Xóa tài khoản ${userToDelete.fullName}`);
      showSuccessMessage(`Đã xóa tài khoản ${userToDelete.fullName}`);
    }
  };

  // Handle toggle active status
  const handleToggleStatus = (userToToggle) => {
    if (userToToggle.id === user.id) {
      alert("Bạn không thể khóa tài khoản của chính mình!");
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === userToToggle.id) {
        return { ...u, isActive: !u.isActive };
      }
      return u;
    });

    setUsers(updatedUsers);
    const action = userToToggle.isActive ? "LOCK" : "UNLOCK";
    addLog(
      action,
      userToToggle,
      `${userToToggle.isActive ? "Khóa" : "Mở khóa"} tài khoản ${
        userToToggle.fullName
      }`
    );
    showSuccessMessage(
      `Đã ${userToToggle.isActive ? "khóa" : "mở khóa"} tài khoản ${
        userToToggle.fullName
      }`
    );
  };

  // Handle change role
  const handleChangeRole = (userToChange, newRole) => {
    if (userToChange.id === user.id && newRole !== "admin") {
      alert("Bạn không thể thay đổi vai trò của chính mình!");
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.id === userToChange.id) {
        return { ...u, role: newRole };
      }
      return u;
    });

    setUsers(updatedUsers);
    addLog(
      "CHANGE_ROLE",
      userToChange,
      `Thay đổi vai trò từ ${getRoleName(userToChange.role)} sang ${getRoleName(
        newRole
      )}`
    );
    showSuccessMessage(
      `Đã thay đổi vai trò của ${userToChange.fullName} thành ${getRoleName(
        newRole
      )}`
    );
  };

  // View user activity logs
  const handleViewLogs = (userToView) => {
    const userLogs = activityLogs.filter(
      (log) => log.targetUserId === userToView.id
    );
    setSelectedUserLogs({ user: userToView, logs: userLogs });
    setShowLogs(true);
  };

  // Show success message
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Get role name
  const getRoleName = (role) => {
    const roleNames = {
      admin: "Quản trị viên",
      moderator: "Người kiểm duyệt",
      support: "Người hỗ trợ",
    };
    return roleNames[role] || role;
  };

  // Get action name
  const getActionName = (action) => {
    const actions = {
      CREATE: "Tạo mới",
      UPDATE: "Cập nhật",
      DELETE: "Xóa",
      LOCK: "Khóa",
      UNLOCK: "Mở khóa",
      CHANGE_ROLE: "Thay đổi vai trò",
    };
    return actions[action] || action;
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div>
          <h1>Quản lý tài khoản</h1>
          <p>
            Quản lý tài khoản người hỗ trợ, kiểm duyệt viên và quản trị viên
          </p>
        </div>
        <button onClick={handleCreateUser} className="create-btn">
          ➕ Tạo tài khoản mới
        </button>
      </div>

      {showSuccess && <div className="success-banner">✅ {successMessage}</div>}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Quản trị viên</option>
          <option value="moderator">Người kiểm duyệt</option>
          <option value="support">Người hỗ trợ</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>

        <button onClick={() => setShowLogs(true)} className="view-logs-btn">
          📋 Lịch sử hoạt động ({activityLogs.length})
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{managedUsers.length}</h3>
            <p>Tổng tài khoản</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{managedUsers.filter((u) => u.isActive).length}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-info">
            <h3>{managedUsers.filter((u) => !u.isActive).length}</h3>
            <p>Đã khóa</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{activityLogs.length}</h3>
            <p>Hoạt động ghi nhận</p>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  Không tìm thấy tài khoản nào
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className={!u.isActive ? "inactive-row" : ""}>
                  <td>
                    <div className="user-cell">
                      <img src={u.avatar} alt={u.fullName} />
                      <div>
                        <div className="user-name">{u.fullName}</div>
                        <div className="user-username">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className={`role-badge ${u.role}`}>
                      {getRoleName(u.role)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        u.isActive ? "active" : "inactive"
                      }`}
                    >
                      {u.isActive ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewUser(u)}
                        className="action-btn view"
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditUser(u)}
                        className="action-btn edit"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`action-btn ${
                          u.isActive ? "lock" : "unlock"
                        }`}
                        title={u.isActive ? "Khóa tài khoản" : "Mở khóa"}
                      >
                        {u.isActive ? "🔒" : "🔓"}
                      </button>
                      <button
                        onClick={() => handleViewLogs(u)}
                        className="action-btn logs"
                        title="Xem lịch sử"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="action-btn delete"
                        title="Xóa tài khoản"
                        disabled={u.id === user.id}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === "create" && "Tạo tài khoản mới"}
                {modalMode === "edit" && "Chỉnh sửa tài khoản"}
                {modalMode === "view" && "Chi tiết tài khoản"}
              </h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                ✕
              </button>
            </div>

            {modalMode === "view" ? (
              <div className="view-content">
                <div className="view-avatar">
                  <img src={selectedUser.avatar} alt={selectedUser.fullName} />
                </div>
                <div className="view-info">
                  <div className="view-item">
                    <label>Họ tên:</label>
                    <span>{selectedUser.fullName}</span>
                  </div>
                  <div className="view-item">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="view-item">
                    <label>Số điện thoại:</label>
                    <span>{selectedUser.phone || "—"}</span>
                  </div>
                  <div className="view-item">
                    <label>Vai trò:</label>
                    <span className={`role-badge ${selectedUser.role}`}>
                      {getRoleName(selectedUser.role)}
                    </span>
                  </div>
                  <div className="view-item">
                    <label>Trạng thái:</label>
                    <span
                      className={`status-badge ${
                        selectedUser.isActive ? "active" : "inactive"
                      }`}
                    >
                      {selectedUser.isActive ? "Hoạt động" : "Đã khóa"}
                    </span>
                  </div>
                  <div className="view-item">
                    <label>Ngày tạo:</label>
                    <span>
                      {new Date(selectedUser.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  {selectedUser.lastLogin && (
                    <div className="view-item">
                      <label>Đăng nhập cuối:</label>
                      <span>
                        {new Date(selectedUser.lastLogin).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  )}
                </div>
                <div className="view-actions">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      handleEditUser(selectedUser);
                    }}
                    className="edit-btn"
                  >
                    ✏️ Chỉnh sửa
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>
                    Họ tên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Nhập họ tên"
                  />
                  {errors.fullName && (
                    <span className="error">{errors.fullName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <span className="error">{errors.email}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="0123456789"
                  />
                  {errors.phone && (
                    <span className="error">{errors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Vai trò <span className="required">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="admin">Quản trị viên</option>
                    <option value="moderator">Người kiểm duyệt</option>
                    <option value="support">Người hỗ trợ</option>
                  </select>
                </div>

                {modalMode === "create" && (
                  <div className="form-group">
                    <label>
                      Mật khẩu <span className="required">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Nhập mật khẩu"
                    />
                    {errors.password && (
                      <span className="error">{errors.password}</span>
                    )}
                  </div>
                )}

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                    />
                    Tài khoản hoạt động
                  </label>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="cancel-btn"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="submit-btn">
                    {modalMode === "create" ? "Tạo tài khoản" : "Cập nhật"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showLogs && (
        <div className="modal-overlay" onClick={() => setShowLogs(false)}>
          <div
            className="modal-content logs-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {selectedUserLogs
                  ? `Lịch sử hoạt động - ${selectedUserLogs.user.fullName}`
                  : "Lịch sử hoạt động"}
              </h2>
              <button onClick={() => setShowLogs(false)} className="close-btn">
                ✕
              </button>
            </div>

            <div className="logs-content">
              {(selectedUserLogs ? selectedUserLogs.logs : activityLogs)
                .length === 0 ? (
                <div className="no-logs">
                  Chưa có hoạt động nào được ghi nhận
                </div>
              ) : (
                <div className="logs-list">
                  {(selectedUserLogs
                    ? selectedUserLogs.logs
                    : activityLogs
                  ).map((log) => (
                    <div key={log.id} className="log-item">
                      <div className="log-icon">📝</div>
                      <div className="log-details">
                        <div className="log-header">
                          <strong>{getActionName(log.action)}</strong>
                          <span className="log-time">
                            {new Date(log.timestamp).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        <div className="log-info">
                          <div>
                            Admin: <strong>{log.adminName}</strong>
                          </div>
                          {log.targetUserName && (
                            <div>
                              Đối tượng: <strong>{log.targetUserName}</strong>
                            </div>
                          )}
                          {log.details && (
                            <div className="log-details-text">
                              {log.details}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
