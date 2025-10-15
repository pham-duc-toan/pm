import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setCourses } from "../store/coursesSlice";
import fakeDatabase from "../data/fakeDatabase.json";
import "./Home.css";

const Home = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { courses } = useSelector((state) => state.courses);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCourses(fakeDatabase.courses));
  }, [dispatch]);

  if (!isAuthenticated) {
    return <GuestHome />;
  }

  switch (user?.role) {
    case "admin":
      return <AdminHome user={user} courses={courses} />;
    case "moderator":
      return <ModeratorHome user={user} courses={courses} />;
    case "support":
      return <SupportHome user={user} />;
    case "teacher":
      return <TeacherHome user={user} courses={courses} />;
    case "student":
      return <StudentHome user={user} courses={courses} />;
    default:
      return <GuestHome />;
  }
};

const GuestHome = () => (
  <div className="home-container">
    <div className="hero-section">
      <div className="hero-content">
        <h1>🎓 Chào mừng đến với EduSystem</h1>
        <p>Hệ thống quản lý học tập hiện đại và thông minh</p>
        <div className="hero-buttons">
          <a href="/register" className="btn btn-primary">
            Đăng ký ngay
          </a>
          <a href="/login" className="btn btn-secondary">
            Đăng nhập
          </a>
        </div>
      </div>
    </div>

    <div className="features-section">
      <div className="container">
        <h2>Tính năng nổi bật</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Khóa học đa dạng</h3>
            <p>Hàng trăm khóa học chất lượng cao</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Giảng viên uy tín</h3>
            <p>Đội ngũ giảng viên giàu kinh nghiệm</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Học mọi lúc mọi nơi</h3>
            <p>Truy cập từ mọi thiết bị</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminHome = ({ user, courses }) => (
  <div className="home-container">
    <div className="admin-dashboard">
      <div className="welcome-section">
        <h1>👋 Chào mừng, {user.fullName}</h1>
        <p className="role-badge admin">Quản trị viên hệ thống</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{fakeDatabase.users.length}</h3>
            <p>Tổng người dùng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <h3>{courses.length}</h3>
            <p>Khóa học</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎓</div>
          <div className="stat-info">
            <h3>
              {fakeDatabase.users.filter((u) => u.role === "student").length}
            </h3>
            <p>Học viên</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <div className="stat-info">
            <h3>
              {fakeDatabase.users.filter((u) => u.role === "teacher").length}
            </h3>
            <p>Giảng viên</p>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <h3>🛠️ Quản lý hệ thống</h3>
        <div className="action-grid">
          <button className="action-btn">
            <span>👥</span>
            <div>
              <h4>Quản lý người dùng</h4>
              <p>Thêm, sửa, xóa tài khoản</p>
            </div>
          </button>
          <button className="action-btn">
            <span>📚</span>
            <div>
              <h4>Quản lý khóa học</h4>
              <p>Duyệt và quản lý nội dung</p>
            </div>
          </button>
          <button className="action-btn">
            <span>📊</span>
            <div>
              <h4>Báo cáo thống kê</h4>
              <p>Xem báo cáo chi tiết</p>
            </div>
          </button>
          <button className="action-btn">
            <span>⚙️</span>
            <div>
              <h4>Cài đặt hệ thống</h4>
              <p>Cấu hình tham số</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ModeratorHome = ({ user, courses }) => (
  <div className="home-container">
    <div className="moderator-dashboard">
      <div className="welcome-section">
        <h1>👋 Chào mừng, {user.fullName}</h1>
        <p className="role-badge moderator">Người kiểm duyệt</p>
      </div>

      <div className="pending-tasks">
        <h3>📋 Công việc cần xử lý</h3>
        <div className="task-list">
          <div className="task-item">
            <div className="task-icon">📚</div>
            <div className="task-info">
              <h4>3 khóa học chờ duyệt</h4>
              <p>Cần kiểm tra nội dung và phê duyệt</p>
            </div>
            <button className="task-btn">Xem ngay</button>
          </div>
          <div className="task-item">
            <div className="task-icon">💬</div>
            <div className="task-info">
              <h4>7 bình luận cần kiểm duyệt</h4>
              <p>Kiểm tra nội dung bình luận</p>
            </div>
            <button className="task-btn">Xem ngay</button>
          </div>
          <div className="task-item">
            <div className="task-icon">🚨</div>
            <div className="task-info">
              <h4>2 báo cáo vi phạm</h4>
              <p>Xử lý các báo cáo từ người dùng</p>
            </div>
            <button className="task-btn urgent">Ưu tiên</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SupportHome = ({ user }) => (
  <div className="home-container">
    <div className="support-dashboard">
      <div className="welcome-section">
        <h1>👋 Chào mừng, {user.fullName}</h1>
        <p className="role-badge support">Nhân viên hỗ trợ</p>
      </div>

      <div className="support-stats">
        <div className="support-card">
          <div className="support-icon">📞</div>
          <div className="support-info">
            <h3>12</h3>
            <p>Ticket chờ xử lý</p>
          </div>
        </div>
        <div className="support-card">
          <div className="support-icon">✅</div>
          <div className="support-info">
            <h3>45</h3>
            <p>Đã giải quyết hôm nay</p>
          </div>
        </div>
        <div className="support-card">
          <div className="support-icon">⭐</div>
          <div className="support-info">
            <h3>4.8</h3>
            <p>Đánh giá trung bình</p>
          </div>
        </div>
      </div>

      <div className="support-tools">
        <h3>🛠️ Công cụ hỗ trợ</h3>
        <div className="tools-grid">
          <button className="tool-btn">
            <span>💬</span>
            <div>
              <h4>Chat trực tiếp</h4>
              <p>Hỗ trợ khách hàng online</p>
            </div>
          </button>
          <button className="tool-btn">
            <span>📧</span>
            <div>
              <h4>Email hỗ trợ</h4>
              <p>Quản lý email từ khách hàng</p>
            </div>
          </button>
          <button className="tool-btn">
            <span>📋</span>
            <div>
              <h4>Quản lý ticket</h4>
              <p>Theo dõi yêu cầu hỗ trợ</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const TeacherHome = ({ user, courses }) => {
  const myCourses = courses.filter((course) => course.teacherId === user.id);

  return (
    <div className="home-container">
      <div className="teacher-dashboard">
        <div className="welcome-section">
          <h1>👋 Chào mừng, {user.fullName}</h1>
          <p className="role-badge teacher">Giảng viên</p>
          <p className="department">{user.department}</p>
        </div>

        <div className="teacher-stats">
          <div className="teacher-card">
            <div className="teacher-icon">📚</div>
            <div className="teacher-info">
              <h3>{myCourses.length}</h3>
              <p>Khóa học đang dạy</p>
            </div>
          </div>
          <div className="teacher-card">
            <div className="teacher-icon">👥</div>
            <div className="teacher-info">
              <h3>
                {
                  fakeDatabase.users.filter(
                    (u) =>
                      u.role === "student" &&
                      u.enrolledCourses?.some((courseId) =>
                        myCourses.map((c) => c.id).includes(courseId)
                      )
                  ).length
                }
              </h3>
              <p>Học viên</p>
            </div>
          </div>
          <div className="teacher-card">
            <div className="teacher-icon">📝</div>
            <div className="teacher-info">
              <h3>15</h3>
              <p>Bài tập cần chấm</p>
            </div>
          </div>
        </div>

        <div className="my-courses">
          <h3>📚 Khóa học của tôi</h3>
          <div className="courses-grid">
            {myCourses.map((course) => (
              <div key={course.id} className="course-card">
                <img src={course.thumbnail} alt={course.title} />
                <div className="course-info">
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span>⏱️ {course.duration}</span>
                    <span>📊 {course.level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentHome = ({ user, courses }) => {
  const enrolledCourses = courses.filter((course) =>
    user.enrolledCourses?.includes(course.id)
  );

  return (
    <div className="home-container">
      <div className="student-dashboard">
        <div className="welcome-section">
          <h1>👋 Chào mừng, {user.fullName}</h1>
          <p className="role-badge student">Học viên</p>
          <p className="student-info">
            <span>🎓 {user.studentId}</span>
            <span>📚 {user.class}</span>
          </p>
        </div>

        <div className="progress-section">
          <h3>📈 Tiến độ học tập</h3>
          <div className="progress-cards">
            <div className="progress-card">
              <div className="progress-icon">📚</div>
              <div className="progress-info">
                <h4>{enrolledCourses.length}</h4>
                <p>Khóa học đã đăng ký</p>
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-icon">✅</div>
              <div className="progress-info">
                <h4>2</h4>
                <p>Khóa học hoàn thành</p>
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-icon">📝</div>
              <div className="progress-info">
                <h4>5</h4>
                <p>Bài tập đã nộp</p>
              </div>
            </div>
            <div className="progress-card">
              <div className="progress-icon">⭐</div>
              <div className="progress-info">
                <h4>8.5</h4>
                <p>Điểm trung bình</p>
              </div>
            </div>
          </div>
        </div>

        <div className="enrolled-courses">
          <h3>📚 Khóa học của tôi</h3>
          <div className="courses-grid">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="course-card">
                <img src={course.thumbnail} alt={course.title} />
                <div className="course-info">
                  <h4>{course.title}</h4>
                  <p>{course.description}</p>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.random() * 100}%` }}
                      ></div>
                    </div>
                    <span>{Math.floor(Math.random() * 100)}% hoàn thành</span>
                  </div>
                  <button className="continue-btn">Tiếp tục học</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="available-courses">
          <h3>🆕 Khóa học mới</h3>
          <div className="courses-grid">
            {courses
              .filter((course) => !user.enrolledCourses?.includes(course.id))
              .slice(0, 3)
              .map((course) => (
                <div key={course.id} className="course-card available">
                  <img src={course.thumbnail} alt={course.title} />
                  <div className="course-info">
                    <h4>{course.title}</h4>
                    <p>{course.description}</p>
                    <div className="course-meta">
                      <span>⏱️ {course.duration}</span>
                      <span>💰 {course.price.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <button className="enroll-btn">Đăng ký ngay</button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
