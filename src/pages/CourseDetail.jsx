import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import usersData from "../data/users.json";
import coursesData from "../data/courses.json";
import lessonsData from "../data/lessons.json";
import reviewsData from "../data/reviews.json";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
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
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [canReview, setCanReview] = useState(false);

  const course = coursesData.courses.find((c) => c.id === parseInt(id));

  // Lấy thông tin từ JSON mới
  const courseInfo = course;
  const courseLessons = lessonsData.lessons.filter(
    (l) => l.courseId === parseInt(id)
  );
  const courseReviews = reviewsData.reviews.filter(
    (r) => r.courseId === parseInt(id)
  );

  const teacher = usersData.users.find(
    (u) => u.id === courseInfo?.instructor?.id
  );

  // Check if user is already enrolled
  const isEnrolled = enrolledCourses.some(
    (e) => e.courseId === parseInt(id) && e.userId === user?.id
  );

  // Kiểm tra xem học viên đã hoàn thành bài kiểm tra cuối khóa chưa
  useEffect(() => {
    if (!user || !isEnrolled) {
      setCanReview(false);
      return;
    }

    // Tìm enrollment của user cho khóa học này
    const enrollment = enrolledCourses.find(
      (e) => e.courseId === parseInt(id) && e.userId === user.id
    );

    if (!enrollment) {
      setCanReview(false);
      return;
    }

    // Tìm bài kiểm tra cuối khóa (quiz có title chứa "Kiểm tra cuối khóa")
    const finalQuiz = courseLessons.find(
      (lesson) =>
        lesson.type === "quiz" && lesson.title.includes("Kiểm tra cuối khóa")
    );

    if (!finalQuiz) {
      // Nếu không có quiz cuối, cho phép đánh giá khi hoàn thành > 80% khóa học
      const completionRate =
        enrollment.completedLessons.length / courseLessons.length;
      setCanReview(completionRate > 0.8);
    } else {
      // Kiểm tra xem đã hoàn thành quiz cuối chưa
      const hasCompletedFinalQuiz = enrollment.completedLessons.includes(
        finalQuiz.id
      );
      setCanReview(hasCompletedFinalQuiz);
    }
  }, [user, isEnrolled, enrolledCourses, id, courseLessons]);

  // Load reviews từ localStorage hoặc data
  useEffect(() => {
    const storedReviews =
      JSON.parse(localStorage.getItem("courseReviews")) || [];
    const courseReviewsFromStorage = storedReviews.filter(
      (r) => r.courseId === parseInt(id)
    );

    // Merge với reviews từ JSON
    const allReviews = [...courseReviews, ...courseReviewsFromStorage];

    // Remove duplicates by id
    const uniqueReviews = allReviews.reduce((acc, review) => {
      if (!acc.find((r) => r.id === review.id)) {
        acc.push(review);
      }
      return acc;
    }, []);

    setReviews(uniqueReviews);

    // Tìm review của user hiện tại
    if (user) {
      const existingReview = uniqueReviews.find((r) => r.userId === user.id);
      setUserReview(existingReview || null);
    }
  }, [id, user, courseReviews]);

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
        navigate(`/learn/${course.id}`);
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

  // Xử lý submit review
  const handleReviewSubmit = (reviewData) => {
    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá!");
      return;
    }

    const newReview = {
      id: `review-${Date.now()}`,
      courseId: parseInt(id),
      userId: user.id,
      userName: user.fullName,
      userAvatar: user.avatar || "https://via.placeholder.com/48",
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Lưu vào localStorage
    const storedReviews =
      JSON.parse(localStorage.getItem("courseReviews")) || [];
    storedReviews.push(newReview);
    localStorage.setItem("courseReviews", JSON.stringify(storedReviews));

    // Cập nhật state
    setReviews([...reviews, newReview]);
    setUserReview(newReview);

    alert("✅ Đánh giá của bạn đã được gửi thành công!");
  };

  // Xử lý edit review
  const handleReviewEdit = (reviewId, updatedData) => {
    const storedReviews =
      JSON.parse(localStorage.getItem("courseReviews")) || [];
    const reviewIndex = storedReviews.findIndex((r) => r.id === reviewId);

    if (reviewIndex !== -1) {
      storedReviews[reviewIndex] = {
        ...storedReviews[reviewIndex],
        rating: updatedData.rating,
        comment: updatedData.comment,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("courseReviews", JSON.stringify(storedReviews));

      // Cập nhật state
      const updatedReviews = reviews.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              rating: updatedData.rating,
              comment: updatedData.comment,
              updatedAt: new Date().toISOString(),
            }
          : r
      );
      setReviews(updatedReviews);
      setUserReview(updatedReviews.find((r) => r.id === reviewId));

      alert("✅ Đánh giá đã được cập nhật!");
    }
  };

  // Xử lý delete review
  const handleReviewDelete = (reviewId) => {
    const storedReviews =
      JSON.parse(localStorage.getItem("courseReviews")) || [];
    const filteredReviews = storedReviews.filter((r) => r.id !== reviewId);
    localStorage.setItem("courseReviews", JSON.stringify(filteredReviews));

    // Cập nhật state
    setReviews(reviews.filter((r) => r.id !== reviewId));
    setUserReview(null);

    alert("🗑️ Đánh giá đã được xóa!");
  };

  const {
    fullDescription = courseInfo?.fullDescription || "",
    curriculum = [],
    certificate = courseInfo?.certificate || null,
    requirements = courseInfo?.requirements || [],
    whatYouWillLearn = courseInfo?.whatYouWillLearn || [],
  } = (() => {
    // Group lessons theo chapter
    const grouped = courseLessons.reduce((acc, lesson) => {
      const chapterTitle = lesson.chapterTitle;
      if (!acc[chapterTitle]) {
        acc[chapterTitle] = {
          title: chapterTitle,
          lessons: [],
        };
      }
      acc[chapterTitle].lessons.push({
        title: lesson.title,
        type: lesson.type,
        duration: lesson.duration,
      });
      return acc;
    }, {});

    return {
      fullDescription: courseInfo?.fullDescription || "",
      curriculum: Object.values(grouped),
      certificate: courseInfo?.certificate || null,
      requirements: courseInfo?.requirements || [],
      whatYouWillLearn: courseInfo?.whatYouWillLearn || [],
    };
  })();

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
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate("/");
                }}
                className="breadcrumb-link"
              >
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
                  {teacher?.fullName || "Giảng viên"} •{" "}
                  {course.totalStudents || course.students || 0} học viên
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">⏱️</span>
                <span>{course.totalDuration || course.duration}</span>
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
              {!isEnrolled && (
                <button className="enroll-btn" onClick={handleEnroll}>
                  Đăng ký học ngay
                </button>
              )}
              {isEnrolled && (
                <button
                  className="continue-btn"
                  onClick={() => {
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
                {/* Form đánh giá - chỉ hiển thị khi đã hoàn thành quiz cuối */}
                {user && isEnrolled && canReview && !userReview && (
                  <ReviewForm onSubmit={handleReviewSubmit} />
                )}

                {/* Thông báo chưa thể đánh giá */}
                {user && isEnrolled && !canReview && (
                  <div className="review-locked-notice">
                    <span className="lock-icon">🔒</span>
                    <h3>Chưa thể đánh giá khóa học</h3>
                    <p>
                      Bạn cần hoàn thành bài kiểm tra cuối khóa để có thể đánh
                      giá và bình luận về khóa học này.
                    </p>
                  </div>
                )}

                {/* Thông báo chưa đăng ký */}
                {!user && (
                  <div className="review-locked-notice">
                    <span className="lock-icon">👤</span>
                    <h3>Vui lòng đăng nhập</h3>
                    <p>Bạn cần đăng nhập và hoàn thành khóa học để đánh giá.</p>
                  </div>
                )}

                {!isEnrolled && user && (
                  <div className="review-locked-notice">
                    <span className="lock-icon">📚</span>
                    <h3>Chưa đăng ký khóa học</h3>
                    <p>
                      Bạn cần đăng ký và hoàn thành khóa học để có thể đánh giá.
                    </p>
                  </div>
                )}

                {/* Danh sách đánh giá */}
                <ReviewList
                  reviews={reviews}
                  currentUserId={user?.id}
                  onEdit={handleReviewEdit}
                  onDelete={handleReviewDelete}
                />
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
