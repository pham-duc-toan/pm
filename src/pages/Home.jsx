import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setCourses } from "../store/coursesSlice";
import coursesData from "../data/courses.json";
import CourseList from "../components/CourseList";
import "./Home.css";

const Home = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCourses(coursesData.courses));
  }, [dispatch]);

  return (
    <div className="home-content">
      {!isAuthenticated ? <GuestHome /> : <AuthenticatedHome user={user} />}
    </div>
  );
};

const GuestHome = () => (
  <div className="home-container">
    <div className="hero-section">
      <div className="container">
        <h1 className="hero-title">🎓 Khám phá thế giới lập trình</h1>
        <p className="hero-subtitle">
          Học code online miễn phí và trả phí với hơn 10 khóa học chất lượng
        </p>
      </div>
    </div>

    <div className="courses-section">
      <div className="container">
        <h2>📚 Tất cả khóa học</h2>
        <CourseList />
      </div>
    </div>

    <div className="courses-section">
      <div className="container">
        <h2>⭐ Khóa học nổi bật</h2>
        <CourseList featured={true} limit={3} />
      </div>
    </div>
  </div>
);

const AuthenticatedHome = ({ user }) => (
  <div className="home-container">
    <div className="hero-section authenticated">
      <div className="container">
        <div className="welcome-banner">
          <h1>👋 Chào mừng trở lại, {user.fullName}!</h1>
          <p className={`role-badge ${user.role}`}>
            {user.role === "admin" && "Quản trị viên"}
            {user.role === "moderator" && "Người kiểm duyệt"}
            {user.role === "support" && "Nhân viên hỗ trợ"}
            {user.role === "teacher" && "Giảng viên"}
            {user.role === "student" && "Học viên"}
          </p>
        </div>
      </div>
    </div>

    <div className="courses-section">
      <div className="container">
        <h2>📚 Tất cả khóa học</h2>
        <CourseList />
      </div>
    </div>

    <div className="courses-section">
      <div className="container">
        <h2>⭐ Khóa học nổi bật</h2>
        <CourseList featured={true} limit={6} />
      </div>
    </div>
  </div>
);

export default Home;
