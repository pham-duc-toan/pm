import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import coursesData from "../data/courses.json";
import lessonsData from "../data/lessons.json";
import "./MyCourses.css";

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.enrollment);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (!user) {
    navigate("/login");
    return null;
  }

  const userEnrollments = enrolledCourses.filter((e) => e.userId === user.id);

  const enrolledCoursesData = userEnrollments
    .map((enrollment) => {
      const course = coursesData.courses.find(
        (c) => c.id === enrollment.courseId
      );
      if (!course) return null;
      return {
        ...course,
        enrollment,
      };
    })
    .filter((course) => course !== null);

  return (
    <div className="my-courses-page">
      <div className="my-courses-container">
        <div className="page-header">
          <h1>📚 Khóa học của tôi</h1>
          <p>Quản lý và theo dõi tiến độ học tập của bạn</p>
        </div>

        {enrolledCoursesData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h2>Bạn chưa đăng ký khóa học nào</h2>
            <p>Khám phá và đăng ký các khóa học phù hợp với bạn</p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Khám phá khóa học
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {enrolledCoursesData.map((course) => (
              <div key={course.id} className="my-course-card">
                <div className="course-thumbnail">
                  <img src={course.thumbnail} alt={course.title} />
                  <div className="course-progress-overlay">
                    <div className="progress-circle">
                      <span className="progress-text">
                        {course.enrollment.progress}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="course-info">
                  <div className="course-category">{course.category}</div>
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>

                  <div className="course-progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${course.enrollment.progress}%` }}
                    ></div>
                  </div>

                  <div className="course-meta">
                    <span className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      {course.totalDuration || course.duration}
                    </span>
                    <span className="meta-item">
                      <span className="meta-icon">📊</span>
                      {course.level}
                    </span>
                    <span
                      className={`payment-badge ${course.enrollment.paymentStatus}`}
                    >
                      {course.enrollment.paymentStatus === "free"
                        ? "Miễn phí"
                        : "Đã thanh toán"}
                    </span>
                  </div>

                  <div className="course-actions">
                    <button
                      className="btn-continue"
                      onClick={() => navigate(`/learn/${course.id}`)}
                    >
                      {course.enrollment.progress === 0
                        ? "Bắt đầu học"
                        : "Tiếp tục học"}
                    </button>
                    <button
                      className="btn-detail"
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowDetailModal(true);
                      }}
                    >
                      📊 Chi tiết
                    </button>
                    {course.enrollment.transactionId && (
                      <button
                        className="btn-invoice"
                        onClick={() =>
                          alert(
                            `Tải biên lai: ${course.enrollment.transactionId}`
                          )
                        }
                      >
                        📄 Biên lai
                      </button>
                    )}
                  </div>

                  <div className="enrollment-date">
                    Đăng ký:{" "}
                    {new Date(course.enrollment.enrolledAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {enrolledCoursesData.length > 0 && (
          <div className="more-courses">
            <button className="btn-outline" onClick={() => navigate("/")}>
              Khám phá thêm khóa học
            </button>
          </div>
        )}
      </div>

      {/* Progress Detail Modal */}
      {showDetailModal && selectedCourse && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📊 Chi tiết tiến độ học tập</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="course-overview">
                <img
                  src={selectedCourse.thumbnail}
                  alt={selectedCourse.title}
                />
                <div>
                  <h3>{selectedCourse.title}</h3>
                  <div className="progress-stats">
                    <div className="stat-item">
                      <div className="stat-value">
                        {selectedCourse.enrollment.progress}%
                      </div>
                      <div className="stat-label">Hoàn thành</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">
                        {selectedCourse.enrollment.completedLessons?.length ||
                          0}
                      </div>
                      <div className="stat-label">Bài đã học</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-value">
                        {new Date(
                          selectedCourse.enrollment.lastAccessedAt
                        ).toLocaleDateString("vi-VN")}
                      </div>
                      <div className="stat-label">Lần học cuối</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lessons-progress">
                <h4>📚 Danh sách bài học</h4>
                {(() => {
                  // Lấy lessons từ JSON mới và group theo chapter
                  const courseLessons = lessonsData.lessons.filter(
                    (l) => l.courseId === selectedCourse.id
                  );

                  const curriculum = courseLessons.reduce((acc, lesson) => {
                    const chapterKey = lesson.chapterTitle;
                    if (!acc[chapterKey]) {
                      acc[chapterKey] = {
                        title: lesson.chapterTitle,
                        lessons: [],
                      };
                    }
                    acc[chapterKey].lessons.push({
                      id: lesson.id,
                      title: lesson.title,
                      type: lesson.type,
                      duration: lesson.duration,
                    });
                    return acc;
                  }, {});

                  const modules = Object.values(curriculum);
                  const completedLessons =
                    selectedCourse.enrollment.completedLessons || [];

                  return modules.map((module, moduleIndex) => (
                    <div key={moduleIndex} className="module-detail">
                      <h5>
                        {moduleIndex + 1}. {module.title}
                      </h5>
                      <div className="lessons-list">
                        {module.lessons.map((lesson, lessonIndex) => {
                          const lessonId = lesson.id;
                          const isCompleted =
                            completedLessons.includes(lessonId);

                          return (
                            <div
                              key={lessonIndex}
                              className={`lesson-detail-item ${
                                isCompleted ? "completed" : ""
                              }`}
                            >
                              <span className="lesson-status">
                                {isCompleted ? "✅" : "⭕"}
                              </span>
                              <span className="lesson-name">
                                {lesson.title}
                              </span>
                              <span className="lesson-type">
                                {lesson.type === "video"
                                  ? "▶️"
                                  : lesson.type === "quiz"
                                  ? "📝"
                                  : "📄"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
