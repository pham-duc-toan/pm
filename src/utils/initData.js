// Script để init dữ liệu localStorage cho demo
// Chạy script này trong Console của browser

import reportsDataFile from "../data/reports.json";
import lessonsDataFile from "../data/lessons.json";
import exercisesDataFile from "../data/exercises.json";

const initData = () => {
  // 1. Enrollments - Danh sách ghi danh khóa học
  const enrollments = [
    {
      id: 1,
      userId: 5,
      courseId: 1,
      enrolledAt: "2025-03-20T10:00:00Z",
      progress: 35,
      lastAccessedLesson: 4,
      completedLessons: [1, 2, 3],
    },
    {
      id: 2,
      userId: 5,
      courseId: 2,
      enrolledAt: "2025-04-01T14:00:00Z",
      progress: 15,
      lastAccessedLesson: 2,
      completedLessons: [1],
    },
    {
      id: 3,
      userId: 8,
      courseId: 1,
      enrolledAt: "2025-04-25T09:00:00Z",
      progress: 100,
      lastAccessedLesson: 10,
      completedLessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    },
    {
      id: 4,
      userId: 8,
      courseId: 7,
      enrolledAt: "2025-05-10T11:00:00Z",
      progress: 20,
      lastAccessedLesson: 2,
      completedLessons: [1],
    },
  ];

  // 2. Payments - Lịch sử thanh toán
  const payments = [
    {
      id: "PAY-001",
      userId: 5,
      courseId: 1,
      amount: 799000,
      method: "vnpay",
      status: "completed",
      createdAt: "2025-03-20T10:00:00Z",
    },
    {
      id: "PAY-002",
      userId: 5,
      courseId: 2,
      amount: 1299000,
      method: "momo",
      status: "completed",
      createdAt: "2025-04-01T14:00:00Z",
    },
    {
      id: "PAY-003",
      userId: 8,
      courseId: 1,
      amount: 799000,
      method: "banking",
      status: "completed",
      createdAt: "2025-04-25T09:00:00Z",
    },
    {
      id: "PAY-004",
      userId: 8,
      courseId: 7,
      amount: 899000,
      method: "vnpay",
      status: "completed",
      createdAt: "2025-05-10T11:00:00Z",
    },
  ];

  // 3. Comments - Bình luận của học viên
  const comments = [
    {
      id: "cmt-001",
      courseId: 1,
      lessonId: 1,
      userId: 5,
      userName: "Nguyễn Văn D",
      userAvatar: "https://i.pravatar.cc/150?img=15",
      content: "Khóa học rất hay, giảng viên dạy dễ hiểu!",
      createdAt: "2025-03-21T15:30:00Z",
      likes: 12,
      replies: [],
    },
    {
      id: "cmt-002",
      courseId: 1,
      lessonId: 2,
      userId: 8,
      userName: "Trần Thị E",
      userAvatar: "https://i.pravatar.cc/150?img=28",
      content: "Mình đã học xong bài này và làm được bài tập rồi!",
      createdAt: "2025-04-26T10:00:00Z",
      likes: 8,
      replies: [],
    },
  ];

  // 4. Reports - Báo cáo đã có sẵn từ reports.json, chỉ cần load
  // File reports.json đã có dữ liệu đầy đủ

  // Load reports vào localStorage để các component khác dùng
  if (reportsDataFile && reportsDataFile.reports) {
    localStorage.setItem("allReports", JSON.stringify(reportsDataFile.reports));
  }

  // 5. Chat Sessions - Đã có trong reports.json
  if (reportsDataFile && reportsDataFile.chatSessions) {
    localStorage.setItem(
      "chatSessions",
      JSON.stringify(reportsDataFile.chatSessions)
    );
  }

  // 6. Tickets - Đã có trong reports.json
  if (reportsDataFile && reportsDataFile.tickets) {
    localStorage.setItem("tickets", JSON.stringify(reportsDataFile.tickets));
  }

  // 7. Banners statistics - Cập nhật view/click cho banners
  const bannerStats = {
    "banner-1": { views: 1250, clicks: 89 },
    "banner-2": { views: 980, clicks: 45 },
    "banner-3": { views: 1450, clicks: 123 },
    "banner-4": { views: 760, clicks: 34 },
    "banner-5": { views: 890, clicks: 56 },
  };

  // 8. System activity logs
  const activityLogs = [
    {
      id: "log-001",
      userId: 1,
      userName: "Admin User",
      action: "Cập nhật banner",
      target: "Banner Homepage",
      timestamp: "2025-11-14T08:30:00Z",
      status: "success",
    },
    {
      id: "log-002",
      userId: 1,
      userName: "Admin User",
      action: "Thêm nhân viên",
      target: "moderator1@codelearn.io",
      timestamp: "2025-11-14T09:15:00Z",
      status: "success",
    },
    {
      id: "log-003",
      userId: 1,
      userName: "Admin User",
      action: "Khóa tài khoản",
      target: "spammer@example.com",
      timestamp: "2025-11-14T10:00:00Z",
      status: "success",
    },
  ];

  // Load lessons và exercises từ JSON files
  const lessons = lessonsDataFile?.lessons || [];
  const exercises = exercisesDataFile?.exercises || [];

  // Save to localStorage
  localStorage.setItem("enrollments", JSON.stringify(enrollments));
  localStorage.setItem("payments", JSON.stringify(payments));
  localStorage.setItem("comments", JSON.stringify(comments));
  localStorage.setItem("bannerStats", JSON.stringify(bannerStats));
  localStorage.setItem("activityLogs", JSON.stringify(activityLogs));
  localStorage.setItem("lessons", JSON.stringify(lessons));
  localStorage.setItem("exercises", JSON.stringify(exercises));

  console.log("✅ Đã init dữ liệu localStorage thành công!");
  console.log("📦 Enrollments:", enrollments.length);
  console.log("💳 Payments:", payments.length);
  console.log("💬 Comments:", comments.length);
  console.log("📊 Banner Stats:", Object.keys(bannerStats).length);
  console.log("📝 Activity Logs:", activityLogs.length);
  console.log("📚 Lessons:", lessons.length);
  console.log("💻 Exercises:", exercises.length);
  if (reportsDataFile) {
    console.log("🚨 Reports:", reportsDataFile.reports?.length || 0);
    console.log("💬 Chat Sessions:", reportsDataFile.chatSessions?.length || 0);
    console.log("🎫 Tickets:", reportsDataFile.tickets?.length || 0);
  }
};

// Tự động chạy khi load
if (typeof window !== "undefined") {
  initData();
}

export default initData;
