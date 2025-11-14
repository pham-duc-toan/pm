import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import coursesData from "../../data/courses.json";
import usersData from "../../data/users.json";
import lessonsData from "../../data/lessons.json";
import "./CourseStudents.css";

const CourseStudents = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { enrolledCourses } = useSelector((state) => state.enrollment);

  // Lấy khóa học (từ JSON hoặc localStorage)
  const jsonCourse = coursesData.courses.find(
    (c) => c.id === parseInt(courseId)
  );
  const localCourses =
    JSON.parse(localStorage.getItem("instructorCourses")) || [];
  const localCourse = localCourses.find((c) => c.id === courseId);
  const course = jsonCourse || localCourse;

  // Lấy danh sách học viên đã đăng ký khóa học này
  const courseEnrollments = enrolledCourses.filter(
    (e) => e.courseId === parseInt(courseId) || e.courseId === courseId
  );

  const students = courseEnrollments
    .map((enrollment) => {
      const student = usersData.users.find((u) => u.id === enrollment.userId);
      return { ...student, enrollment };
    })
    .filter(Boolean);

  if (!course) {
    return (
      <div className="course-students-page">
        <div className="not-found">
          <h2>Không tìm thấy khóa học</h2>
          <button onClick={() => navigate("/instructor/courses")}>
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const getCompletedLessons = (userId) => {
    const enrollment = enrolledCourses.find(
      (e) =>
        e.userId === userId &&
        (e.courseId === parseInt(courseId) || e.courseId === courseId)
    );
    return enrollment?.completedLessons?.length || 0;
  };

  const getTotalLessons = () => {
    return lessonsData.lessons.filter(
      (l) => l.courseId === parseInt(courseId) || l.courseId === courseId
    ).length;
  };

  const getStudentProgress = (userId) => {
    const enrollment = enrolledCourses.find(
      (e) =>
        e.userId === userId &&
        (e.courseId === parseInt(courseId) || e.courseId === courseId)
    );
    return enrollment?.progress || 0;
  };

  const totalLessons = getTotalLessons();
  const avgProgress =
    students.length > 0
      ? Math.round(
          students.reduce((sum, s) => sum + getStudentProgress(s.id), 0) /
            students.length
        )
      : 0;

  return (
    <div className="course-students-page">
      <div className="page-header">
        <button
          className="btn-back"
          onClick={() => navigate("/instructor/courses")}
        >
          ← Quay lại
        </button>
        <div>
          <h1>{course.title}</h1>
          <p className="course-subtitle">Quản lý học viên</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div>
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Tổng học viên</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <div className="stat-value">{totalLessons}</div>
            <div className="stat-label">Tổng bài giảng</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div>
            <div className="stat-value">{avgProgress}%</div>
            <div className="stat-label">Tiến độ trung bình</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div>
            <div className="stat-value">
              {students.filter((s) => getStudentProgress(s.id) === 100).length}
            </div>
            <div className="stat-label">Đã hoàn thành</div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2>👥 Danh sách học viên ({students.length})</h2>
        </div>

        {students.length === 0 ? (
          <div className="empty-list">
            <div className="empty-icon">👨‍🎓</div>
            <h3>Chưa có học viên nào</h3>
            <p>Chưa có học viên nào đăng ký khóa học này</p>
          </div>
        ) : (
          <div className="students-table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Học viên</th>
                  <th>Email</th>
                  <th>Tiến độ</th>
                  <th>Bài đã học</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const progress = getStudentProgress(student.id);
                  const completed = getCompletedLessons(student.id);

                  return (
                    <tr key={student.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div className="student-info">
                          <img
                            src={student.avatar}
                            alt={student.fullName}
                            className="student-avatar"
                          />
                          <div>
                            <div className="student-name">
                              {student.fullName}
                            </div>
                            <div className="student-id">ID: {student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>
                        <div className="progress-cell">
                          <div className="progress-bar-mini">
                            <div
                              className="progress-fill-mini"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="progress-text">{progress}%</span>
                        </div>
                      </td>
                      <td className="lessons-count">
                        {completed}/{totalLessons}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            progress === 100
                              ? "completed"
                              : progress > 0
                              ? "learning"
                              : "not-started"
                          }`}
                        >
                          {progress === 100
                            ? "✅ Hoàn thành"
                            : progress > 0
                            ? "📚 Đang học"
                            : "⏸️ Chưa học"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-view-progress"
                          onClick={() =>
                            navigate(
                              `/instructor/student/${student.id}/progress?courseId=${courseId}`
                            )
                          }
                          title="Xem tiến độ chi tiết"
                        >
                          📊 Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseStudents;
