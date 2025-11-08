import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./CourseCard.css";

const CourseCard = ({ course }) => {
  const { user } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.enrollment);
  const navigate = useNavigate();

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner":
        return "#10b981";
      case "Intermediate":
        return "#f59e0b";
      case "Advanced":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const isEnrolled = enrolledCourses.some(
    (e) => e.courseId === course.id && e.userId === user?.id
  );

  const handleViewCourse = () => {
    navigate(`/course/${course.id}`);
  };

  const handleAction = (e) => {
    e.stopPropagation();
    if (isEnrolled) {
      navigate(`/learn/${course.id}`);
    } else {
      navigate(`/course/${course.id}`);
    }
  };

  return (
    <div className="course-card" onClick={handleViewCourse}>
      <div className="course-image">
        <img src={course.thumbnail} alt={course.title} />
        {course.featured && <span className="featured-badge">⭐ Nổi bật</span>}
        <span
          className="level-badge"
          style={{ backgroundColor: getLevelColor(course.level) }}
        >
          {course.level}
        </span>
      </div>

      <div className="course-content">
        <div className="course-category">{course.category}</div>
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>

        <div className="course-meta">
          <div className="meta-item">
            <span className="meta-icon">⏱️</span>
            <span>{course.duration}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">👥</span>
            <span>{course.students || 0} học viên</span>
          </div>
        </div>

        <div className="course-footer">
          <div className="course-price">
            {course.price === 0 ? (
              <span className="free">Miễn phí</span>
            ) : (
              <span className="price">
                {course.price.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>

          <button
            className={`btn-view-detail ${isEnrolled ? "enrolled" : ""}`}
            onClick={handleAction}
          >
            {isEnrolled ? "▶ Tiếp tục học" : "Xem chi tiết"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
