import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import coursesData from "../../data/courses.json";
import usersData from "../../data/users.json";
import "./CourseManagementAdmin.css";

const CourseManagementAdmin = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load courses từ localStorage hoặc JSON
    const savedCourses =
      JSON.parse(localStorage.getItem("allCourses")) || coursesData.courses;

    // Map isPublished -> status và isFeatured -> featured
    const coursesWithStatus = savedCourses.map((c) => ({
      ...c,
      status: c.status || (c.isPublished ? "published" : "draft"),
      featured: c.featured !== undefined ? c.featured : c.isFeatured,
    }));

    setCourses(coursesWithStatus);
    setFilteredCourses(coursesWithStatus);
  }, []);

  useEffect(() => {
    // Filter courses
    let result = courses;

    if (searchTerm) {
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (course.instructor?.fullName || course.instructor || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((course) => course.status === filterStatus);
    }

    if (filterCategory !== "all") {
      result = result.filter((course) => course.category === filterCategory);
    }

    setFilteredCourses(result);
  }, [searchTerm, filterStatus, filterCategory, courses]);

  const handleView = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleDelete = (courseId) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa khóa học này? Thao tác này không thể hoàn tác!"
      )
    ) {
      const updatedCourses = courses.filter((c) => c.id !== courseId);
      setCourses(updatedCourses);
      localStorage.setItem("allCourses", JSON.stringify(updatedCourses));
      alert("Đã xóa khóa học thành công!");
    }
  };

  const handleStatusChange = (courseId, newStatus) => {
    const updatedCourses = courses.map((c) =>
      c.id === courseId
        ? {
            ...c,
            status: newStatus,
            isPublished: newStatus === "published",
          }
        : c
    );
    setCourses(updatedCourses);
    localStorage.setItem("allCourses", JSON.stringify(updatedCourses));
    alert(`Đã cập nhật trạng thái khóa học thành ${newStatus}!`);
  };

  const handleFeatureToggle = (courseId) => {
    const updatedCourses = courses.map((c) =>
      c.id === courseId
        ? {
            ...c,
            featured: !c.featured,
            isFeatured: !c.featured,
          }
        : c
    );
    setCourses(updatedCourses);
    localStorage.setItem("allCourses", JSON.stringify(updatedCourses));
    alert("Đã cập nhật khóa học nổi bật!");
  };

  const getEnrollmentCount = (courseId) => {
    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    return enrollments.filter((e) => e.courseId === courseId).length;
  };

  const getRevenue = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    const enrollmentCount = getEnrollmentCount(courseId);
    return course ? course.price * enrollmentCount : 0;
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: { label: "Đã xuất bản", className: "status-published" },
      draft: { label: "Bản nháp", className: "status-draft" },
      pending: { label: "Chờ duyệt", className: "status-pending" },
      rejected: { label: "Bị từ chối", className: "status-rejected" },
      archived: { label: "Đã lưu trữ", className: "status-archived" },
    };
    return badges[status] || { label: status, className: "" };
  };

  const categories = [
    "all",
    "Programming",
    "Database",
    "Web Development",
    "Mobile Development",
    "DevOps",
    "Data Science",
    "Design",
    "Other",
  ];

  return (
    <div className="course-management-admin-page">
      <div className="page-header">
        <div>
          <h1>Quản lý tất cả khóa học</h1>
          <p className="subtitle">
            Quản lý và kiểm duyệt toàn bộ khóa học trên nền tảng
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{courses.length}</span>
            <span className="stat-label">Tổng khóa học</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {courses.filter((c) => c.status === "published").length}
            </span>
            <span className="stat-label">Đã xuất bản</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {courses.filter((c) => c.status === "pending").length}
            </span>
            <span className="stat-label">Chờ duyệt</span>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm khóa học, giảng viên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
          <option value="pending">Chờ duyệt</option>
          <option value="rejected">Bị từ chối</option>
          <option value="archived">Đã lưu trữ</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "Tất cả danh mục" : cat}
            </option>
          ))}
        </select>
      </div>

      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Khóa học</th>
              <th>Giảng viên</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Học viên</th>
              <th>Doanh thu</th>
              <th>Trạng thái</th>
              <th>Nổi bật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  style={{ textAlign: "center", padding: "30px" }}
                >
                  Không tìm thấy khóa học nào
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>
                    <div className="course-info">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="course-thumbnail"
                      />
                      <div>
                        <strong>{course.title}</strong>
                        <p className="course-desc">{course.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>{course.instructor?.fullName || course.instructor}</td>
                  <td>
                    <span className="badge badge-category">
                      {course.category}
                    </span>
                  </td>
                  <td>
                    <strong>
                      {course.price === 0
                        ? "Miễn phí"
                        : `${course.price.toLocaleString()}đ`}
                    </strong>
                  </td>
                  <td>{getEnrollmentCount(course.id)}</td>
                  <td>
                    <strong className="revenue">
                      {getRevenue(course.id).toLocaleString()}đ
                    </strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        getStatusBadge(course.status).className
                      }`}
                    >
                      {getStatusBadge(course.status).label}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn-feature ${
                        course.featured ? "active" : ""
                      }`}
                      onClick={() => handleFeatureToggle(course.id)}
                      title="Đánh dấu khóa học nổi bật"
                    >
                      {course.featured ? "⭐" : "☆"}
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => handleView(course)}
                        title="Xem chi tiết"
                      >
                        👁️
                      </button>
                      <select
                        className="btn-action btn-status"
                        value={course.status}
                        onChange={(e) =>
                          handleStatusChange(course.id, e.target.value)
                        }
                        title="Thay đổi trạng thái"
                      >
                        <option value="published">Xuất bản</option>
                        <option value="draft">Bản nháp</option>
                        <option value="pending">Chờ duyệt</option>
                        <option value="rejected">Từ chối</option>
                        <option value="archived">Lưu trữ</option>
                      </select>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(course.id)}
                        title="Xóa khóa học"
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

      {showModal && selectedCourse && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết khóa học</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <img
                src={selectedCourse.thumbnail}
                alt={selectedCourse.title}
                className="modal-thumbnail"
              />
              <h3>{selectedCourse.title}</h3>
              <p className="modal-description">{selectedCourse.description}</p>
              <div className="course-details-grid">
                <div className="detail-item">
                  <strong>Giảng viên:</strong>{" "}
                  {selectedCourse.instructor?.fullName ||
                    selectedCourse.instructor}
                </div>
                <div className="detail-item">
                  <strong>Danh mục:</strong> {selectedCourse.category}
                </div>
                <div className="detail-item">
                  <strong>Cấp độ:</strong> {selectedCourse.level}
                </div>
                <div className="detail-item">
                  <strong>Giá:</strong>{" "}
                  {selectedCourse.price === 0
                    ? "Miễn phí"
                    : `${selectedCourse.price.toLocaleString()}đ`}
                </div>
                <div className="detail-item">
                  <strong>Thời lượng:</strong> {selectedCourse.duration}
                </div>
                <div className="detail-item">
                  <strong>Đánh giá:</strong> {selectedCourse.rating} ⭐ (
                  {selectedCourse.enrolledCount} đánh giá)
                </div>
                <div className="detail-item">
                  <strong>Học viên:</strong>{" "}
                  {getEnrollmentCount(selectedCourse.id)}
                </div>
                <div className="detail-item">
                  <strong>Doanh thu:</strong>{" "}
                  {getRevenue(selectedCourse.id).toLocaleString()}đ
                </div>
                <div className="detail-item">
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    className={`badge ${
                      getStatusBadge(selectedCourse.status).className
                    }`}
                  >
                    {getStatusBadge(selectedCourse.status).label}
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Nổi bật:</strong>{" "}
                  {selectedCourse.featured ? "✓" : "✗"}
                </div>
              </div>

              <h4>Nội dung khóa học:</h4>
              <ul className="course-content-list">
                {selectedCourse.syllabus?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                )) || <li>Chưa có thông tin</li>}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagementAdmin;
