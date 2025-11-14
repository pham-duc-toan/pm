import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import usersData from "../../data/users.json";
import lessonsData from "../../data/lessons.json";
import "./StudentDetailProgress.css";

const StudentDetailProgress = () => {
  const { courseId, userId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [progressDetails, setProgressDetails] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("order");

  useEffect(() => {
    // Load student info
    const studentData = usersData.users.find((u) => u.id === parseInt(userId));
    setStudent(studentData);

    // Load progress from localStorage
    const enrollments = JSON.parse(localStorage.getItem("enrollments")) || [];
    const enrollment = enrollments.find(
      (e) =>
        (e.courseId === parseInt(courseId) || e.courseId === courseId) &&
        e.userId === parseInt(userId)
    );

    if (enrollment) {
      // Get all lessons
      const jsonLessons = lessonsData.lessons.filter(
        (l) => l.courseId === parseInt(courseId) || l.courseId === courseId
      );
      const localLessons =
        JSON.parse(localStorage.getItem("instructorLessons")) || [];
      const courseLessons = localLessons.filter(
        (l) => l.courseId === courseId || l.courseId === parseInt(courseId)
      );
      const allLessons = [...jsonLessons, ...courseLessons];

      // Build progress details
      const details = allLessons.map((lesson) => {
        const lessonProgress = enrollment.completedLessons?.find(
          (cl) => cl === lesson.id || cl.lessonId === lesson.id
        );
        const isCompleted = !!lessonProgress;

        let score = null;
        let submissionData = null;

        if (lesson.type === "quiz" && isCompleted) {
          // Simulate quiz score
          score = Math.floor(Math.random() * 30) + 70; // 70-100
        } else if (lesson.type === "exercise" && isCompleted) {
          // Simulate exercise test cases
          const totalTests = 10;
          const passedTests = Math.floor(Math.random() * 3) + 7; // 7-10
          score = `${passedTests}/${totalTests}`;
          submissionData = {
            code: `// Student submission for ${lesson.title}\nfunction solution() {\n  // Implementation here\n  return result;\n}`,
            language: "javascript",
            submittedAt: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          };
        }

        return {
          ...lesson,
          isCompleted,
          completedAt: isCompleted
            ? new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
              ).toISOString()
            : null,
          score,
          submissionData,
        };
      });

      setProgressDetails(details);
    }
  }, [courseId, userId]);

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "BÁO CÁO TIẾN ĐỘ HỌC VIÊN\n\n";
    csvContent += `Học viên,${student?.fullName}\n`;
    csvContent += `Email,${student?.email}\n`;
    csvContent += `Khóa học ID,${courseId}\n\n`;

    csvContent += "STT,Chương,Bài học,Loại,Trạng thái,Điểm,Ngày hoàn thành\n";
    progressDetails.forEach((lesson, idx) => {
      csvContent += `${idx + 1},${lesson.chapterNumber},"${lesson.title}",${
        lesson.type
      },${lesson.isCompleted ? "Đã làm" : "Chưa làm"},${
        lesson.score || "N/A"
      },${
        lesson.completedAt
          ? new Date(lesson.completedAt).toLocaleDateString("vi-VN")
          : "N/A"
      }\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `tien-do-${student?.fullName}-${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #667eea; color: white; }
            h2 { color: #667eea; }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO TIẾN ĐỘ HỌC VIÊN</h1>
          <p><strong>Học viên:</strong> ${student?.fullName}</p>
          <p><strong>Email:</strong> ${student?.email}</p>
          <p><strong>Khóa học ID:</strong> ${courseId}</p>
          <p><strong>Ngày xuất:</strong> ${new Date().toLocaleString(
            "vi-VN"
          )}</p>
          
          <h2>Chi tiết tiến độ</h2>
          <table>
            <tr>
              <th>STT</th>
              <th>Chương</th>
              <th>Bài học</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Điểm</th>
              <th>Ngày hoàn thành</th>
            </tr>
            ${progressDetails
              .map(
                (lesson, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${lesson.chapterNumber}</td>
                <td>${lesson.title}</td>
                <td>${lesson.type}</td>
                <td>${lesson.isCompleted ? "✅ Đã làm" : "❌ Chưa làm"}</td>
                <td>${lesson.score || "N/A"}</td>
                <td>${
                  lesson.completedAt
                    ? new Date(lesson.completedAt).toLocaleDateString("vi-VN")
                    : "N/A"
                }</td>
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
    link.download = `tien-do-${student?.fullName}-${
      new Date().toISOString().split("T")[0]
    }.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!student) {
    return (
      <div className="student-detail-progress">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  // Filter and sort
  let filteredLessons = progressDetails;
  if (filterStatus === "completed") {
    filteredLessons = progressDetails.filter((l) => l.isCompleted);
  } else if (filterStatus === "incomplete") {
    filteredLessons = progressDetails.filter((l) => !l.isCompleted);
  }

  if (sortBy === "name") {
    filteredLessons = [...filteredLessons].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  } else if (sortBy === "date") {
    filteredLessons = [...filteredLessons].sort((a, b) => {
      if (!a.completedAt) return 1;
      if (!b.completedAt) return -1;
      return new Date(b.completedAt) - new Date(a.completedAt);
    });
  }

  const completionRate =
    (progressDetails.filter((l) => l.isCompleted).length /
      progressDetails.length) *
    100;

  return (
    <div className="student-detail-progress">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <div className="export-buttons">
          <button className="btn-export csv" onClick={exportToCSV}>
            📊 Export CSV
          </button>
          <button className="btn-export excel" onClick={exportToExcel}>
            📈 Export Excel
          </button>
        </div>
      </div>

      <div className="student-header">
        <img src={student.avatar} alt={student.fullName} />
        <div className="student-info">
          <h1>{student.fullName}</h1>
          <p>{student.email}</p>
          <div className="stats">
            <span>
              📚 {progressDetails.filter((l) => l.isCompleted).length}/
              {progressDetails.length} bài học
            </span>
            <span>📊 {completionRate.toFixed(1)}% hoàn thành</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="incomplete">Chưa hoàn thành</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="order">Sắp xếp theo thứ tự</option>
          <option value="name">Sắp xếp theo tên</option>
          <option value="date">Sắp xếp theo ngày</option>
        </select>
      </div>

      <div className="lessons-list">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className={`lesson-card ${lesson.isCompleted ? "completed" : ""}`}
          >
            <div className="lesson-header">
              <div>
                <span className="chapter-badge">
                  Chương {lesson.chapterNumber}
                </span>
                <h3>{lesson.title}</h3>
                <span className={`type-badge ${lesson.type}`}>
                  {lesson.type === "video"
                    ? "🎥 Video"
                    : lesson.type === "exercise"
                    ? "💻 Bài tập"
                    : "✏️ Quiz"}
                </span>
              </div>
              <div className="lesson-status">
                {lesson.isCompleted ? (
                  <span className="status-badge completed">
                    ✅ Đã hoàn thành
                  </span>
                ) : (
                  <span className="status-badge incomplete">⏳ Chưa làm</span>
                )}
              </div>
            </div>

            {lesson.isCompleted && (
              <div className="lesson-details">
                <div className="detail-item">
                  <strong>Hoàn thành lúc:</strong>
                  <span>
                    {new Date(lesson.completedAt).toLocaleString("vi-VN")}
                  </span>
                </div>

                {lesson.type === "quiz" && lesson.score && (
                  <div className="detail-item">
                    <strong>Điểm số:</strong>
                    <span className="score">{lesson.score}/100</span>
                  </div>
                )}

                {lesson.type === "exercise" && lesson.score && (
                  <>
                    <div className="detail-item">
                      <strong>Test cases:</strong>
                      <span className="score">{lesson.score} đúng</span>
                    </div>
                    {lesson.submissionData && (
                      <div className="code-submission">
                        <strong>Code submission:</strong>
                        <pre>
                          <code>{lesson.submissionData.code}</code>
                        </pre>
                        <small>
                          Ngôn ngữ:{" "}
                          {lesson.submissionData.language.toUpperCase()} • Nộp
                          lúc:{" "}
                          {new Date(
                            lesson.submissionData.submittedAt
                          ).toLocaleString("vi-VN")}
                        </small>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDetailProgress;
