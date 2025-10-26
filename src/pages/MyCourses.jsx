import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import fakeDatabase from "../data/fakeDatabase.json";
import "./MyCourses.css";

const MyCourses = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.enrollment);

  if (!user) {
    navigate("/login");
    return null;
  }

  const userEnrollments = enrolledCourses.filter((e) => e.userId === user.id);

  const enrolledCoursesData = userEnrollments.map((enrollment) => {
    const course = fakeDatabase.courses.find(
      (c) => c.id === enrollment.courseId
    );
    return {
      ...course,
      enrollment,
    };
  });

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
                      {course.duration}
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
    </div>
  );
};

export default MyCourses;
