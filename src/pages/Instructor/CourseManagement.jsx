import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import coursesData from "../../data/courses.json";
import "./CourseManagement.css";

const CourseManagement = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.enrollment);

  // Lấy khóa học của giảng viên từ courses.json
  const instructorCourses = coursesData.courses.filter(
    (c) => c.instructor?.id === user?.id
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "Web Development",
    level: "beginner",
    price: 0,
    thumbnail: "",
  });

  // Lấy localStorage courses (khóa học do giảng viên tạo mới)
  const [localCourses, setLocalCourses] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("instructorCourses")) || [];
    return stored.filter((c) => c.instructorId === user?.id);
  });

  // Kết hợp courses từ JSON và localStorage
  const allCourses = [
    ...instructorCourses.map((c) => ({ ...c, source: "json" })),
    ...localCourses.map((c) => ({ ...c, source: "local" })),
  ];

  const handleCreateCourse = (e) => {
    e.preventDefault();

    const newCourse = {
      id: `course-${Date.now()}`,
      title: courseForm.title,
      slug: courseForm.title.toLowerCase().replace(/\s+/g, "-"),
      description: courseForm.description,
      shortDescription: courseForm.description,
      fullDescription: courseForm.description,
      category: courseForm.category,
      level: courseForm.level,
      price: parseInt(courseForm.price) || 0,
      originalPrice: 0,
      discount: 0,
      thumbnail:
        courseForm.thumbnail ||
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop",
      instructor: {
        id: user.id,
        fullName: user.fullName,
        avatar: user.avatar,
        bio: "Giảng viên",
      },
      instructorId: user.id,
      rating: 0,
      totalStudents: 0,
      totalLessons: 0,
      totalDuration: "0 giờ",
      language: "Tiếng Việt",
      subtitles: ["Tiếng Việt"],
      whatYouWillLearn: [],
      requirements: [],
      targetAudience: [],
      certificate: {
        available: true,
        name: `Chứng chỉ ${courseForm.title}`,
        thumbnail: courseForm.thumbnail,
        description: `Chứng chỉ hoàn thành khóa học ${courseForm.title}`,
      },
      isPublished: true,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allLocalCourses =
      JSON.parse(localStorage.getItem("instructorCourses")) || [];
    allLocalCourses.push(newCourse);
    localStorage.setItem("instructorCourses", JSON.stringify(allLocalCourses));

    setLocalCourses([...localCourses, newCourse]);
    setShowCreateModal(false);
    setCourseForm({
      title: "",
      description: "",
      category: "Web Development",
      level: "beginner",
      price: 0,
      thumbnail: "",
    });

    alert("✅ Tạo khóa học thành công!");
  };

  const handleEditClick = (course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || course.shortDescription,
      category: course.category,
      level: course.level,
      price: course.price,
      thumbnail: course.thumbnail,
    });
    setShowEditModal(true);
  };

  const handleUpdateCourse = (e) => {
    e.preventDefault();

    if (selectedCourse.source === "local") {
      const allLocalCourses =
        JSON.parse(localStorage.getItem("instructorCourses")) || [];
      const index = allLocalCourses.findIndex(
        (c) => c.id === selectedCourse.id
      );

      if (index !== -1) {
        allLocalCourses[index] = {
          ...allLocalCourses[index],
          title: courseForm.title,
          description: courseForm.description,
          shortDescription: courseForm.description,
          category: courseForm.category,
          level: courseForm.level,
          price: parseInt(courseForm.price) || 0,
          thumbnail: courseForm.thumbnail,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(
          "instructorCourses",
          JSON.stringify(allLocalCourses)
        );
        setLocalCourses(
          allLocalCourses.filter((c) => c.instructorId === user?.id)
        );
        setShowEditModal(false);
        alert("✅ Cập nhật khóa học thành công!");
      }
    } else {
      alert("⚠️ Không thể sửa khóa học gốc từ hệ thống!");
    }
  };

  const handleDeleteCourse = (course) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khóa học "${course.title}"?`))
      return;

    if (course.source === "local") {
      const allLocalCourses =
        JSON.parse(localStorage.getItem("instructorCourses")) || [];
      const filtered = allLocalCourses.filter((c) => c.id !== course.id);
      localStorage.setItem("instructorCourses", JSON.stringify(filtered));
      setLocalCourses(filtered.filter((c) => c.instructorId === user?.id));
      alert("✅ Đã xóa khóa học!");
    } else {
      alert("⚠️ Không thể xóa khóa học gốc từ hệ thống!");
    }
  };

  const getCourseStats = (courseId) => {
    const enrollments = enrolledCourses.filter((e) => e.courseId === courseId);
    const totalStudents = enrollments.length;
    const avgProgress =
      totalStudents > 0
        ? Math.round(
            enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
              totalStudents
          )
        : 0;

    return { totalStudents, avgProgress };
  };

  return (
    <div className="course-management-page">
      <div className="page-header">
        <div>
          <h1>📚 Quản lý khóa học</h1>
          <p>Quản lý các khóa học, bài giảng và học viên của bạn</p>
        </div>
        <button
          className="btn-create-course"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Tạo khóa học mới
        </button>
      </div>

      {allCourses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h2>Chưa có khóa học nào</h2>
          <p>Tạo khóa học đầu tiên để bắt đầu giảng dạy</p>
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            ➕ Tạo khóa học
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {allCourses.map((course) => {
            const stats = getCourseStats(course.id);
            return (
              <div key={course.id} className="course-card">
                <div className="course-thumbnail">
                  <img src={course.thumbnail} alt={course.title} />
                  {course.source === "local" && (
                    <span className="badge-new">Tự tạo</span>
                  )}
                </div>

                <div className="course-header">
                  <h3>{course.title}</h3>
                  <div className="course-meta">
                    <span className="category">{course.category}</span>
                    <span className={`level ${course.level}`}>
                      {course.level === "beginner"
                        ? "Cơ bản"
                        : course.level === "intermediate"
                        ? "Trung cấp"
                        : "Nâng cao"}
                    </span>
                  </div>
                </div>

                <p className="course-description">
                  {course.shortDescription || course.description}
                </p>

                <div className="course-stats">
                  <div className="stat-item">
                    <span className="stat-icon">👥</span>
                    <div>
                      <div className="stat-value">{stats.totalStudents}</div>
                      <div className="stat-label">Học viên</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📊</span>
                    <div>
                      <div className="stat-value">{stats.avgProgress}%</div>
                      <div className="stat-label">Tiến độ TB</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <span className="stat-icon">📚</span>
                    <div>
                      <div className="stat-value">
                        {course.totalLessons || 0}
                      </div>
                      <div className="stat-label">Bài giảng</div>
                    </div>
                  </div>
                </div>

                <div className="course-actions">
                  <button
                    className="btn-view"
                    onClick={() =>
                      navigate(`/instructor/course/${course.id}/students`)
                    }
                  >
                    👥 Học viên
                  </button>
                  <button
                    className="btn-lessons"
                    onClick={() =>
                      navigate(`/instructor/course/${course.id}/lessons`)
                    }
                  >
                    📚 Bài giảng
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => handleEditClick(course)}
                  >
                    ✏️ Sửa
                  </button>
                  {course.source === "local" && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCourse(course)}
                    >
                      🗑️ Xóa
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Tạo khóa học mới</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="modal-body">
              <div className="form-group">
                <label htmlFor="title">Tên khóa học *</label>
                <input
                  type="text"
                  id="title"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, title: e.target.value })
                  }
                  placeholder="VD: React Nâng Cao"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả khóa học *</label>
                <textarea
                  id="description"
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      description: e.target.value,
                    })
                  }
                  rows="4"
                  placeholder="Mô tả chi tiết về khóa học..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Danh mục</label>
                  <select
                    id="category"
                    value={courseForm.category}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, category: e.target.value })
                    }
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Programming">Programming</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Backend Development">
                      Backend Development
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="level">Cấp độ</label>
                  <select
                    id="level"
                    value={courseForm.level}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, level: e.target.value })
                    }
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Giá (VNĐ)</label>
                  <input
                    type="number"
                    id="price"
                    value={courseForm.price}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, price: e.target.value })
                    }
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="thumbnail">URL ảnh thumbnail</label>
                  <input
                    type="url"
                    id="thumbnail"
                    value={courseForm.thumbnail}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        thumbnail: e.target.value,
                      })
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  ✅ Tạo khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Sửa khóa học</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-title">Tên khóa học *</label>
                <input
                  type="text"
                  id="edit-title"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Mô tả *</label>
                <textarea
                  id="edit-description"
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      description: e.target.value,
                    })
                  }
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-category">Danh mục</label>
                  <select
                    id="edit-category"
                    value={courseForm.category}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, category: e.target.value })
                    }
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Programming">Programming</option>
                    <option value="Database">Database</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Backend Development">
                      Backend Development
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-level">Cấp độ</label>
                  <select
                    id="edit-level"
                    value={courseForm.level}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, level: e.target.value })
                    }
                  >
                    <option value="beginner">Cơ bản</option>
                    <option value="intermediate">Trung cấp</option>
                    <option value="advanced">Nâng cao</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-price">Giá (VNĐ)</label>
                  <input
                    type="number"
                    id="edit-price"
                    value={courseForm.price}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, price: e.target.value })
                    }
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-thumbnail">URL ảnh</label>
                  <input
                    type="url"
                    id="edit-thumbnail"
                    value={courseForm.thumbnail}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        thumbnail: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit">
                  ✅ Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;
