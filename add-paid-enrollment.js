// Script để thêm enrollment khóa học có phí cho học viên
// Chạy script này trong Console của trình duyệt (F12)

const newEnrollment = {
  id: Date.now(),
  courseId: 7, // Python cho Data Science - 3,500,000 VNĐ
  userId: 5, // Lê Thị Học Viên (student001)
  enrolledAt: new Date().toISOString(),
  progress: 35, // Đã học 35%
  completedLessons: ["7-1-1", "7-1-2", "7-2-1"], // Đã hoàn thành 3 bài
  currentModule: 2, // Đang ở module 2
  currentLesson: 2, // Đang ở bài 2
  paymentStatus: "completed", // Đã thanh toán
  amount: 3500000,
  paymentMethod: "vnpay",
  transactionId: "VNPAY" + Date.now(),
  paidAt: new Date().toISOString(),
  lastAccessedAt: new Date().toISOString(),
};

// Thêm transaction vào lịch sử
const newTransaction = {
  id: "TXN" + Date.now(),
  courseId: 7,
  courseName: "Python cho Data Science",
  userId: 5,
  amount: 3500000,
  method: "vnpay",
  status: "completed",
  transactionId: newEnrollment.transactionId,
  createdAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
};

// Lấy dữ liệu hiện tại từ localStorage
const enrollments = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");

// Kiểm tra xem đã đăng ký khóa này chưa
const existingEnrollment = enrollments.find(
  (e) => e.courseId === 7 && e.userId === 5
);

if (existingEnrollment) {
  console.log("❌ Học viên đã đăng ký khóa học này rồi!");
  console.log("Enrollment hiện tại:", existingEnrollment);
} else {
  // Thêm enrollment mới
  enrollments.push(newEnrollment);
  transactions.push(newTransaction);

  // Lưu vào localStorage
  localStorage.setItem("enrolledCourses", JSON.stringify(enrollments));
  localStorage.setItem("transactions", JSON.stringify(transactions));

  console.log("✅ Đã thêm enrollment thành công!");
  console.log("Thông tin khóa học:");
  console.log("- Khóa học: Python cho Data Science");
  console.log("- Học viên: Lê Thị Học Viên (student001)");
  console.log("- Học phí: 3,500,000 VNĐ");
  console.log("- Trạng thái: Đã thanh toán qua VNPay");
  console.log("- Tiến độ: 35% (3/10 bài)");
  console.log("- Transaction ID:", newEnrollment.transactionId);
  console.log("\nDữ liệu enrollment:", newEnrollment);
  console.log("\nDữ liệu transaction:", newTransaction);
  console.log("\n🎉 Reload trang để thấy thay đổi!");
}
