import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import coursesData from "../../data/courses.json";
import usersData from "../../data/users.json";
import lessonsData from "../../data/lessons.json";
import "./Statistics.css";

const Statistics = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.enrollment);

  // Lấy khóa học của giảng viên (từ JSON + localStorage)
  const jsonCourses = coursesData.courses.filter(
    (c) => c.instructor?.id === user?.id
  );
  const localCourses =
    JSON.parse(localStorage.getItem("instructorCourses")) || [];
  const myCourses = [
    ...jsonCourses.map((c) => ({ ...c, source: "json" })),
    ...localCourses
      .filter((c) => c.instructorId === user?.id)
      .map((c) => ({ ...c, source: "local" })),
  ];

  // Tính toán thống kê tổng quan
  const stats = useMemo(() => {
    const totalCourses = myCourses.length;

    // Tính tổng học viên và doanh thu
    let totalStudents = 0;
    let totalRevenue = 0;
    let completedStudents = 0;

    myCourses.forEach((course) => {
      const courseEnrollments = enrolledCourses.filter(
        (e) => e.courseId === course.id || e.courseId === parseInt(course.id)
      );

      totalStudents += courseEnrollments.length;
      totalRevenue += courseEnrollments.length * (course.price || 0);

      // Đếm học viên hoàn thành
      courseEnrollments.forEach((e) => {
        if (e.progress === 100) completedStudents++;
      });
    });

    // Tính tổng bài giảng
    const allLessons = myCourses.flatMap((course) =>
      lessonsData.lessons.filter(
        (l) => l.courseId === course.id || l.courseId === parseInt(course.id)
      )
    );
    const totalLessons = allLessons.length;

    // Tính rating trung bình
    const avgRating =
      totalCourses > 0
        ? (
            myCourses.reduce((sum, c) => sum + (c.rating || 0), 0) /
            totalCourses
          ).toFixed(1)
        : 0;

    return {
      totalCourses,
      totalStudents,
      totalRevenue,
      totalLessons,
      avgRating,
      completedStudents,
      completionRate:
        totalStudents > 0
          ? ((completedStudents / totalStudents) * 100).toFixed(1)
          : 0,
    };
  }, [myCourses, enrolledCourses]);

  // Thống kê theo từng khóa học
  const courseStats = useMemo(() => {
    return myCourses
      .map((course) => {
        const courseEnrollments = enrolledCourses.filter(
          (e) => e.courseId === course.id || e.courseId === parseInt(course.id)
        );

        const totalEnrolled = courseEnrollments.length;
        const revenue = totalEnrolled * (course.price || 0);

        // Tính tiến độ trung bình
        const avgProgress =
          totalEnrolled > 0
            ? Math.round(
                courseEnrollments.reduce(
                  (sum, e) => sum + (e.progress || 0),
                  0
                ) / totalEnrolled
              )
            : 0;

        // Đếm hoàn thành
        const completed = courseEnrollments.filter(
          (e) => e.progress === 100
        ).length;

        // Lấy số bài giảng
        const courseLessons = lessonsData.lessons.filter(
          (l) => l.courseId === course.id || l.courseId === parseInt(course.id)
        );

        return {
          id: course.id,
          title: course.title,
          thumbnail: course.thumbnail,
          category: course.category,
          level: course.level,
          price: course.price || 0,
          totalEnrolled,
          revenue,
          avgProgress,
          completed,
          completionRate:
            totalEnrolled > 0
              ? ((completed / totalEnrolled) * 100).toFixed(1)
              : 0,
          rating: course.rating || 0,
          totalLessons: courseLessons.length,
        };
      })
      .sort((a, b) => b.totalEnrolled - a.totalEnrolled);
  }, [myCourses, enrolledCourses]);

  // Top 5 học viên tích cực nhất
  const topStudents = useMemo(() => {
    const studentMap = new Map();

    myCourses.forEach((course) => {
      const courseEnrollments = enrolledCourses.filter(
        (e) => e.courseId === course.id || e.courseId === parseInt(course.id)
      );

      courseEnrollments.forEach((enrollment) => {
        const student = usersData.users.find((u) => u.id === enrollment.userId);
        if (!student) return;

        if (!studentMap.has(student.id)) {
          studentMap.set(student.id, {
            ...student,
            coursesEnrolled: 0,
            totalProgress: 0,
            coursesCompleted: 0,
          });
        }

        const data = studentMap.get(student.id);
        data.coursesEnrolled++;
        data.totalProgress += enrollment.progress || 0;
        if (enrollment.progress === 100) data.coursesCompleted++;
      });
    });

    return Array.from(studentMap.values())
      .map((s) => ({
        ...s,
        avgProgress: Math.round(s.totalProgress / s.coursesEnrolled),
      }))
      .sort(
        (a, b) =>
          b.avgProgress - a.avgProgress || b.coursesEnrolled - a.coursesEnrolled
      )
      .slice(0, 5);
  }, [myCourses, enrolledCourses]);

  // Thống kê theo tháng (6 tháng gần nhất)
  const monthlyStats = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      // Đếm enrollment trong tháng này
      const enrollmentsInMonth = enrolledCourses.filter((e) => {
        const courseIds = myCourses.map((c) => c.id);
        const isMyCourse =
          courseIds.includes(e.courseId) ||
          courseIds.includes(String(e.courseId));

        if (!isMyCourse) return false;

        // Giả sử enrolledDate trong enrollment
        const enrollDate = e.enrolledDate
          ? new Date(e.enrolledDate)
          : new Date();
        return (
          enrollDate.getFullYear() === date.getFullYear() &&
          enrollDate.getMonth() === date.getMonth()
        );
      });

      months.push({
        month: date.toLocaleDateString("vi-VN", {
          month: "short",
          year: "numeric",
        }),
        enrollments: enrollmentsInMonth.length,
        revenue: enrollmentsInMonth.reduce((sum, e) => {
          const course = myCourses.find(
            (c) => c.id === e.courseId || String(c.id) === String(e.courseId)
          );
          return sum + (course?.price || 0);
        }, 0),
      });
    }

    return months;
  }, [myCourses, enrolledCourses]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="statistics-page">
      <div className="page-header">
        <div>
          <h1>📊 Thống kê giảng dạy</h1>
          <p>Tổng quan về khóa học và học viên của bạn</p>
        </div>
      </div>

      {/* Tổng quan */}
      <div className="overview-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">Khóa học</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-label">Học viên</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="stat-label">Doanh thu</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedStudents}</div>
            <div className="stat-label">Hoàn thành</div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalLessons}</div>
            <div className="stat-label">Bài giảng</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{stats.avgRating}</div>
            <div className="stat-label">Đánh giá TB</div>
          </div>
        </div>
      </div>

      {/* Biểu đồ theo tháng */}
      <div className="section-card">
        <h2>📈 Xu hướng 6 tháng gần nhất</h2>
        <div className="chart-container">
          <div className="chart-bars">
            {monthlyStats.map((month, index) => {
              const maxEnrollments = Math.max(
                ...monthlyStats.map((m) => m.enrollments),
                1
              );
              const heightPercent = (month.enrollments / maxEnrollments) * 100;

              return (
                <div key={index} className="chart-bar-wrapper">
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar"
                      style={{ height: `${heightPercent}%` }}
                      title={`${month.enrollments} học viên`}
                    >
                      <span className="bar-value">{month.enrollments}</span>
                    </div>
                  </div>
                  <div className="chart-label">{month.month}</div>
                  <div className="chart-revenue">
                    {formatCurrency(month.revenue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Thống kê từng khóa học */}
      <div className="section-card">
        <h2>📚 Chi tiết từng khóa học</h2>
        <div className="courses-stats-table">
          <table>
            <thead>
              <tr>
                <th>Khóa học</th>
                <th>Học viên</th>
                <th>Tiến độ TB</th>
                <th>Hoàn thành</th>
                <th>Bài giảng</th>
                <th>Doanh thu</th>
                <th>Đánh giá</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {courseStats.map((course) => (
                <tr key={course.id}>
                  <td>
                    <div className="course-info">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="course-thumb"
                      />
                      <div>
                        <div className="course-name">{course.title}</div>
                        <div className="course-meta">
                          <span className="category-badge">
                            {course.category}
                          </span>
                          <span className={`level-badge ${course.level}`}>
                            {course.level === "beginner"
                              ? "Cơ bản"
                              : course.level === "intermediate"
                              ? "Trung cấp"
                              : "Nâng cao"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="badge-number">{course.totalEnrolled}</span>
                  </td>
                  <td>
                    <div className="progress-container">
                      <div className="progress-bar-small">
                        <div
                          className="progress-fill-small"
                          style={{ width: `${course.avgProgress}%` }}
                        />
                      </div>
                      <span className="progress-percent">
                        {course.avgProgress}%
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="completion-info">
                      <span className="completed-count">
                        {course.completed}
                      </span>
                      <span className="completion-rate">
                        ({course.completionRate}%)
                      </span>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className="badge-number">{course.totalLessons}</span>
                  </td>
                  <td className="text-right">
                    <span className="revenue-value">
                      {formatCurrency(course.revenue)}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className="rating-badge">⭐ {course.rating}</span>
                  </td>
                  <td>
                    <div className="action-buttons-small">
                      <button
                        className="btn-view-small"
                        onClick={() =>
                          navigate(`/instructor/course/${course.id}/students`)
                        }
                        title="Xem học viên"
                      >
                        👥
                      </button>
                      <button
                        className="btn-lessons-small"
                        onClick={() =>
                          navigate(`/instructor/course/${course.id}/lessons`)
                        }
                        title="Bài giảng"
                      >
                        📚
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top học viên */}
      <div className="section-card">
        <h2>🏆 Top 5 học viên xuất sắc</h2>
        <div className="top-students-grid">
          {topStudents.map((student, index) => (
            <div key={student.id} className="student-card">
              <div className="student-rank">#{index + 1}</div>
              <img
                src={student.avatar}
                alt={student.fullName}
                className="student-avatar-large"
              />
              <h3>{student.fullName}</h3>
              <p className="student-email">{student.email}</p>
              <div className="student-stats-grid">
                <div className="student-stat">
                  <div className="stat-number">{student.coursesEnrolled}</div>
                  <div className="stat-text">Khóa học</div>
                </div>
                <div className="student-stat">
                  <div className="stat-number">{student.avgProgress}%</div>
                  <div className="stat-text">Tiến độ</div>
                </div>
                <div className="student-stat">
                  <div className="stat-number">{student.coursesCompleted}</div>
                  <div className="stat-text">Hoàn thành</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
