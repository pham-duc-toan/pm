import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import coursesData from "../../data/courses.json";
import usersData from "../../data/users.json";
import staffData from "../../data/staff.json";
import "./SystemReport.css";

const SystemReport = () => {
  const { user } = useSelector((state) => state.auth);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    generateReport();
  }, [dateRange]);

  const generateReport = () => {
    // Lấy dữ liệu từ localStorage
    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    const payments = JSON.parse(localStorage.getItem("payments")) || [];
    const comments = JSON.parse(localStorage.getItem("comments")) || [];

    // Sử dụng staff data đã import
    const staff = staffData.staff || [];

    // Import lessons và exercises để tính tổng
    const lessons = JSON.parse(localStorage.getItem("lessons")) || [];
    const exercises = JSON.parse(localStorage.getItem("exercises")) || [];

    // Tính toán thống kê
    const totalUsers = usersData.users.length;
    const totalCourses = coursesData.courses.length;
    const totalEnrollments = enrollments.length;
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalLessons = lessons.length;
    const totalExercises = exercises.length;
    const totalComments = comments.length;
    const activeStaff = staff.filter((s) => s.status === "active").length;

    // Thống kê theo role
    const usersByRole = usersData.users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    // Thống kê theo khóa học
    const courseStats = coursesData.courses.map((course) => {
      const courseEnrollments = enrollments.filter(
        (e) => e.courseId === course.id
      );
      const courseRevenue = courseEnrollments.reduce(
        (sum, e) => sum + (course.price || 0),
        0
      );
      return {
        id: course.id,
        title: course.title,
        instructor: course.instructor?.fullName || course.instructor,
        enrollments: courseEnrollments.length,
        revenue: courseRevenue,
        avgProgress:
          courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
            courseEnrollments.length || 0,
        completionRate:
          (courseEnrollments.filter((e) => e.progress === 100).length /
            courseEnrollments.length) *
            100 || 0,
      };
    });

    // Top instructors
    const instructorStats = {};
    coursesData.courses.forEach((course) => {
      const instructorName = course.instructor?.fullName || course.instructor;
      if (!instructorStats[instructorName]) {
        instructorStats[instructorName] = {
          name: instructorName,
          courses: 0,
          students: 0,
          revenue: 0,
        };
      }
      instructorStats[instructorName].courses += 1;
      const courseEnrollments = enrollments.filter(
        (e) => e.courseId === course.id
      );
      instructorStats[instructorName].students += courseEnrollments.length;
      instructorStats[instructorName].revenue += courseEnrollments.reduce(
        (sum, e) => sum + (course.price || 0),
        0
      );
    });

    const topInstructors = Object.values(instructorStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Thống kê theo tháng
    const monthlyStats = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthKey = `${year}-${month.toString().padStart(2, "0")}`;

      const monthEnrollments = enrollments.filter((e) => {
        const enrollDate = new Date(e.enrolledAt);
        return (
          enrollDate.getMonth() + 1 === month &&
          enrollDate.getFullYear() === year
        );
      });

      monthlyStats.push({
        month: monthKey,
        enrollments: monthEnrollments.length,
        revenue: monthEnrollments.reduce((sum, e) => {
          const course = coursesData.courses.find((c) => c.id === e.courseId);
          return sum + (course?.price || 0);
        }, 0),
        newUsers: usersData.users.filter((u) => {
          const joinDate = new Date(u.joinedAt || u.createdAt);
          return (
            joinDate.getMonth() + 1 === month && joinDate.getFullYear() === year
          );
        }).length,
      });
    }

    setReportData({
      overview: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalRevenue,
        totalLessons,
        totalExercises,
        totalComments,
        activeStaff,
      },
      usersByRole,
      courseStats,
      topInstructors,
      monthlyStats,
    });
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";

    // Overview
    csvContent += "BÁO CÁO TỔNG HỢP HỆ THỐNG\n\n";
    csvContent += "TỔNG QUAN\n";
    csvContent += `Tổng số người dùng,${reportData.overview.totalUsers}\n`;
    csvContent += `Tổng số khóa học,${reportData.overview.totalCourses}\n`;
    csvContent += `Tổng số đăng ký,${reportData.overview.totalEnrollments}\n`;
    csvContent += `Tổng doanh thu,${reportData.overview.totalRevenue.toLocaleString()}đ\n`;
    csvContent += `Tổng bài giảng,${reportData.overview.totalLessons}\n`;
    csvContent += `Tổng bài tập,${reportData.overview.totalExercises}\n`;
    csvContent += `Tổng bình luận,${reportData.overview.totalComments}\n`;
    csvContent += `Nhân viên hoạt động,${reportData.overview.activeStaff}\n\n`;

    // Course stats
    csvContent += "THỐNG KÊ KHÓA HỌC\n";
    csvContent +=
      "ID,Tên khóa học,Giảng viên,Số học viên,Doanh thu,Tiến độ TB,Tỉ lệ hoàn thành\n";
    reportData.courseStats.forEach((course) => {
      csvContent += `${course.id},"${course.title}","${
        course.instructor?.fullName || course.instructor
      }",${course.enrollments},${course.revenue},${course.avgProgress.toFixed(
        1
      )}%,${course.completionRate.toFixed(1)}%\n`;
    });
    csvContent += "\n";

    // Top instructors
    csvContent += "TOP GIẢNG VIÊN\n";
    csvContent += "Tên,Số khóa học,Số học viên,Doanh thu\n";
    reportData.topInstructors.forEach((instructor) => {
      csvContent += `"${instructor.name}",${instructor.courses},${
        instructor.students
      },${instructor.revenue.toLocaleString()}đ\n`;
    });
    csvContent += "\n";

    // Monthly stats
    csvContent += "THỐNG KÊ THEO THÁNG\n";
    csvContent += "Tháng,Đăng ký mới,Doanh thu,Người dùng mới\n";
    reportData.monthlyStats.forEach((stat) => {
      csvContent += `${stat.month},${
        stat.enrollments
      },${stat.revenue.toLocaleString()}đ,${stat.newUsers}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `bao-cao-he-thong-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    if (!reportData) return;

    // Tạo nội dung HTML table để export
    let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #667eea; color: white; font-weight: bold; }
            h2 { color: #667eea; margin-top: 30px; }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO TỔNG HỢP HỆ THỐNG</h1>
          <p>Ngày xuất: ${new Date().toLocaleString("vi-VN")}</p>
          
          <h2>TỔNG QUAN</h2>
          <table>
            <tr><th>Chỉ số</th><th>Giá trị</th></tr>
            <tr><td>Tổng số người dùng</td><td>${
              reportData.overview.totalUsers
            }</td></tr>
            <tr><td>Tổng số khóa học</td><td>${
              reportData.overview.totalCourses
            }</td></tr>
            <tr><td>Tổng số đăng ký</td><td>${
              reportData.overview.totalEnrollments
            }</td></tr>
            <tr><td>Tổng doanh thu</td><td>${reportData.overview.totalRevenue.toLocaleString()}đ</td></tr>
            <tr><td>Tổng bài giảng</td><td>${
              reportData.overview.totalLessons
            }</td></tr>
            <tr><td>Tổng bài tập</td><td>${
              reportData.overview.totalExercises
            }</td></tr>
            <tr><td>Tổng bình luận</td><td>${
              reportData.overview.totalComments
            }</td></tr>
            <tr><td>Nhân viên hoạt động</td><td>${
              reportData.overview.activeStaff
            }</td></tr>
          </table>

          <h2>THỐNG KÊ KHÓA HỌC</h2>
          <table>
            <tr>
              <th>ID</th>
              <th>Tên khóa học</th>
              <th>Giảng viên</th>
              <th>Số học viên</th>
              <th>Doanh thu</th>
              <th>Tiến độ TB</th>
              <th>Tỉ lệ hoàn thành</th>
            </tr>
            ${reportData.courseStats
              .map(
                (course) => `
              <tr>
                <td>${course.id}</td>
                <td>${course.title}</td>
                <td>${course.instructor?.fullName || course.instructor}</td>
                <td>${course.enrollments}</td>
                <td>${course.revenue.toLocaleString()}đ</td>
                <td>${course.avgProgress.toFixed(1)}%</td>
                <td>${course.completionRate.toFixed(1)}%</td>
              </tr>
            `
              )
              .join("")}
          </table>

          <h2>TOP GIẢNG VIÊN</h2>
          <table>
            <tr>
              <th>Tên</th>
              <th>Số khóa học</th>
              <th>Số học viên</th>
              <th>Doanh thu</th>
            </tr>
            ${reportData.topInstructors
              .map(
                (instructor) => `
              <tr>
                <td>${instructor.name}</td>
                <td>${instructor.courses}</td>
                <td>${instructor.students}</td>
                <td>${instructor.revenue.toLocaleString()}đ</td>
              </tr>
            `
              )
              .join("")}
          </table>

          <h2>THỐNG KÊ THEO THÁNG</h2>
          <table>
            <tr>
              <th>Tháng</th>
              <th>Đăng ký mới</th>
              <th>Doanh thu</th>
              <th>Người dùng mới</th>
            </tr>
            ${reportData.monthlyStats
              .map(
                (stat) => `
              <tr>
                <td>${stat.month}</td>
                <td>${stat.enrollments}</td>
                <td>${stat.revenue.toLocaleString()}đ</td>
                <td>${stat.newUsers}</td>
              </tr>
            `
              )
              .join("")}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], {
      type: "application/vnd.ms-excel;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `bao-cao-he-thong-${
      new Date().toISOString().split("T")[0]
    }.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!reportData) {
    return (
      <div className="system-report-page">
        <div className="loading">Đang tạo báo cáo...</div>
      </div>
    );
  }

  return (
    <div className="system-report-page">
      <div className="page-header">
        <div>
          <h1>Báo cáo tổng hợp hệ thống</h1>
          <p className="subtitle">
            Tổng quan về hoạt động và hiệu suất của nền tảng
          </p>
        </div>
        <div className="export-buttons">
          <button className="btn-export csv" onClick={exportToCSV}>
            📊 Export CSV
          </button>
          <button className="btn-export excel" onClick={exportToExcel}>
            📈 Export Excel
          </button>
        </div>
      </div>

      <div className="date-filter">
        <label>Từ ngày:</label>
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
        />
        <label>Đến ngày:</label>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
        />
        <button className="btn-primary" onClick={generateReport}>
          🔄 Làm mới
        </button>
      </div>

      <div className="overview-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{reportData.overview.totalUsers.toLocaleString()}</h3>
            <p>Người dùng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{reportData.overview.totalCourses.toLocaleString()}</h3>
            <p>Khóa học</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{reportData.overview.totalEnrollments.toLocaleString()}</h3>
            <p>Đăng ký</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{reportData.overview.totalRevenue.toLocaleString()}đ</h3>
            <p>Doanh thu</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{reportData.overview.totalLessons.toLocaleString()}</h3>
            <p>Bài giảng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💻</div>
          <div className="stat-content">
            <h3>{reportData.overview.totalExercises.toLocaleString()}</h3>
            <p>Bài tập</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>{reportData.overview.totalComments.toLocaleString()}</h3>
            <p>Bình luận</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👔</div>
          <div className="stat-content">
            <h3>{reportData.overview.activeStaff.toLocaleString()}</h3>
            <p>Nhân viên</p>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h2>Top giảng viên</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Xếp hạng</th>
                <th>Tên giảng viên</th>
                <th>Khóa học</th>
                <th>Học viên</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {reportData.topInstructors.map((instructor, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="rank">#{idx + 1}</span>
                  </td>
                  <td>
                    <strong>{instructor.name}</strong>
                  </td>
                  <td>{instructor.courses}</td>
                  <td>{instructor.students.toLocaleString()}</td>
                  <td className="revenue">
                    {instructor.revenue.toLocaleString()}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-section">
        <h2>Thống kê theo tháng</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tháng</th>
                <th>Đăng ký mới</th>
                <th>Doanh thu</th>
                <th>Người dùng mới</th>
              </tr>
            </thead>
            <tbody>
              {reportData.monthlyStats.map((stat, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{stat.month}</strong>
                  </td>
                  <td>{stat.enrollments.toLocaleString()}</td>
                  <td className="revenue">{stat.revenue.toLocaleString()}đ</td>
                  <td>{stat.newUsers.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-section">
        <h2>Chi tiết khóa học</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên khóa học</th>
                <th>Giảng viên</th>
                <th>Học viên</th>
                <th>Doanh thu</th>
                <th>Tiến độ TB</th>
                <th>Hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              {reportData.courseStats.map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>
                    <strong>{course.title}</strong>
                  </td>
                  <td>{course.instructor?.fullName || course.instructor}</td>
                  <td>{course.enrollments.toLocaleString()}</td>
                  <td className="revenue">
                    {course.revenue.toLocaleString()}đ
                  </td>
                  <td>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.avgProgress}%` }}
                      ></div>
                      <span>{course.avgProgress.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>{course.completionRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemReport;
