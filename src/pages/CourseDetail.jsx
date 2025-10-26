import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import fakeDatabase from "../data/fakeDatabase.json";
import courseDetailsData from "../data/courseDetails.json";
import {
  enrollFreeCourse,
  createPendingPayment,
} from "../store/enrollmentSlice";
import { addNotification } from "../store/notificationsSlice";
import "./CourseDetail.css";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.enrollment);
  const [activeTab, setActiveTab] = useState("overview");

  const course = fakeDatabase.courses.find((c) => c.id === parseInt(id));
  const courseDetails = courseDetailsData[id] || {};
  const teacher = fakeDatabase.users.find((u) => u.id === course?.teacherId);

  // Check if user is already enrolled
  const isEnrolled = enrolledCourses.some(
    (e) => e.courseId === parseInt(id) && e.userId === user?.id
  );

  useEffect(() => {
    if (!course) {
      navigate("/");
    }
  }, [course, navigate]);

  if (!course) {
    return null;
  }

  const handleEnroll = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đăng ký khóa học!");
      navigate("/login");
      return;
    }

    if (isEnrolled) {
      alert("Bạn đã đăng ký khóa học này rồi!");
      navigate("/my-courses");
      return;
    }

    if (course.price === 0) {
      // Free course - enroll immediately
      dispatch(
        enrollFreeCourse({
          courseId: course.id,
          userId: user.id,
        })
      );

      // Add notification
      dispatch(
        addNotification({
          title: "🎉 Đăng ký thành công!",
          message: `Bạn đã đăng ký thành công khóa học "${course.title}". Chúc bạn học tốt!`,
          type: "success",
          userId: user.id,
        })
      );

      // Simulate email notification
      console.log("📧 Email sent to:", user.email);
      console.log("Course:", course.title);

      setTimeout(() => {
        navigate("/my-courses");
      }, 500);
    } else {
      // Paid course - go to payment
      const payment = {
        id: `PAY-${Date.now()}`,
        courseId: course.id,
        userId: user.id,
        course,
      };

      dispatch(createPendingPayment(payment));

      navigate("/payment", {
        state: { payment, course },
      });
    }
  };

  const {
    fullDescription = "",
    curriculum = [],
    reviews = [],
    certificate = null,
    requirements = [],
    whatYouWillLearn = [],
  } = courseDetails;

  const tabs = [
    { id: "overview", label: "📖 Giới thiệu", icon: "📖" },
    { id: "curriculum", label: "📚 Giáo trình", icon: "📚" },
    { id: "reviews", label: "⭐ Đánh giá", icon: "⭐" },
    { id: "certificate", label: "🎓 Chứng chỉ", icon: "🎓" },
  ];

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="course-detail-page">
      {/* Hero Section */}
      <div className="course-hero">
        <div className="hero-container">
          <div className="course-hero-content">
            <div className="breadcrumb">
              <span onClick={() => navigate("/")} className="breadcrumb-link">
                Trang chủ
              </span>
              <span className="breadcrumb-separator">/</span>
              <span>{course.category}</span>
              <span className="breadcrumb-separator">/</span>
              <span>{course.title}</span>
            </div>

            <h1 className="course-title">{course.title}</h1>
            <p className="course-short-desc">{course.description}</p>

            <div className="course-meta">
              <div className="meta-item">
                <span className="meta-icon">👤</span>
                <span>
                  {teacher?.fullName || "Giảng viên"} • {course.students} học
                  viên
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span>{course.duration}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📊</span>
                <span className={`level-badge ${course.level.toLowerCase()}`}>
                  {course.level}
                </span>
              </div>
              {reviews.length > 0 && (
                <div className="meta-item">
                  <span className="meta-icon">⭐</span>
                  <span>
                    {averageRating} ({reviews.length} đánh giá)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="course-hero-sidebar">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="course-thumbnail"
            />
            <div className="course-price-card">
              <div className="price">
                {course.price === 0 ? (
                  <span className="free">Miễn phí</span>
                ) : (
                  <span className="paid">
                    {course.price.toLocaleString("vi-VN")} đ
                  </span>
                )}
              </div>
              <button
                className={`enroll-btn ${isEnrolled ? "enrolled" : ""}`}
                onClick={handleEnroll}
                disabled={isEnrolled}
              >
                {isEnrolled ? "✓ Đã đăng ký" : "Đăng ký học ngay"}
              </button>
              {isEnrolled && (
                <button
                  className="continue-btn"
                  onClick={() => {
                    const enrollment = enrolledCourses.find(
                      (e) =>
                        e.courseId === parseInt(id) && e.userId === user?.id
                    );
                    navigate(`/learn/${id}`);
                  }}
                >
                  ▶ Tiếp tục học
                </button>
              )}
              {user && !isEnrolled && (
                <button className="wishlist-btn">❤️ Thêm vào yêu thích</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="course-tabs">
        <div className="tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="course-content">
        <div className="content-container">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="tab-content">
              <section className="content-section">
                <h2>📝 Mô tả khóa học</h2>
                <div className="description-text">
                  {fullDescription ||
                    "Khóa học cung cấp kiến thức toàn diện và bài bản, giúp bạn nắm vững các kỹ năng cần thiết trong lĩnh vực này."}
                </div>
              </section>

              {whatYouWillLearn.length > 0 && (
                <section className="content-section">
                  <h2>🎯 Bạn sẽ học được gì</h2>
                  <div className="learning-outcomes">
                    {whatYouWillLearn.map((item, index) => (
                      <div key={index} className="outcome-item">
                        <span className="outcome-icon">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {requirements.length > 0 && (
                <section className="content-section">
                  <h2>📋 Yêu cầu</h2>
                  <ul className="requirements-list">
                    {requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="content-section">
                <h2>👨‍🏫 Giảng viên</h2>
                <div className="teacher-card">
                  <img
                    src={teacher?.avatar}
                    alt={teacher?.fullName}
                    className="teacher-avatar"
                  />
                  <div className="teacher-info">
                    <h3>{teacher?.fullName}</h3>
                    <p className="teacher-role">
                      {teacher?.department || "Giảng viên"}
                    </p>
                    {teacher?.subjects && (
                      <p className="teacher-subjects">
                        Môn dạy: {teacher.subjects.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Curriculum Tab */}
          {activeTab === "curriculum" && (
            <div className="tab-content">
              <section className="content-section">
                <h2>📚 Nội dung khóa học</h2>
                {curriculum.length === 0 ? (
                  <p className="empty-message">
                    Nội dung giáo trình đang được cập nhật...
                  </p>
                ) : (
                  <div className="curriculum-list">
                    {curriculum.map((module, index) => (
                      <div key={index} className="curriculum-module">
                        <div className="module-header">
                          <h3>
                            {index + 1}. {module.title}
                          </h3>
                          <span className="module-duration">
                            {module.lessons.length} bài học
                          </span>
                        </div>
                        <div className="module-lessons">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="lesson-item">
                              <div className="lesson-info">
                                <span className="lesson-icon">
                                  {lesson.type === "video"
                                    ? "▶️"
                                    : lesson.type === "quiz"
                                    ? "📝"
                                    : "📄"}
                                </span>
                                <span className="lesson-title">
                                  {lesson.title}
                                </span>
                              </div>
                              {lesson.duration && (
                                <span className="lesson-duration">
                                  {lesson.duration}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="tab-content">
              <section className="content-section">
                <div className="reviews-header">
                  <h2>⭐ Đánh giá từ học viên</h2>
                  {reviews.length > 0 && (
                    <div className="rating-summary">
                      <div className="rating-score">{averageRating}</div>
                      <div className="rating-stars">
                        {"⭐".repeat(Math.round(averageRating))}
                      </div>
                      <div className="rating-count">
                        {reviews.length} đánh giá
                      </div>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <p className="empty-message">
                    Chưa có đánh giá nào cho khóa học này.
                  </p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review, index) => (
                      <div key={index} className="review-item">
                        <div className="review-header">
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="review-avatar"
                          />
                          <div className="review-user-info">
                            <h4>{review.userName}</h4>
                            <div className="review-meta">
                              <span className="review-stars">
                                {"⭐".repeat(review.rating)}
                              </span>
                              <span className="review-date">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Certificate Tab */}
          {activeTab === "certificate" && (
            <div className="tab-content">
              <section className="content-section">
                <h2>🎓 Chứng chỉ hoàn thành</h2>
                {!certificate ? (
                  <p className="empty-message">
                    Khóa học này chưa cung cấp chứng chỉ.
                  </p>
                ) : (
                  <div className="certificate-info">
                    <div className="certificate-preview">
                      <img
                        src={certificate.thumbnail}
                        alt={certificate.name}
                        className="certificate-image"
                      />
                    </div>
                    <div className="certificate-details">
                      <h3>{certificate.name}</h3>
                      <p className="certificate-description">
                        {certificate.description}
                      </p>
                      <div className="certificate-features">
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span>
                            Chứng chỉ được cấp sau khi hoàn thành khóa học
                          </span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span>Có thể chia sẻ trên LinkedIn và CV</span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span>Được công nhận bởi các doanh nghiệp</span>
                        </div>
                        <div className="feature-item">
                          <span className="feature-icon">✓</span>
                          <span>Có thể tải xuống dưới dạng PDF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
