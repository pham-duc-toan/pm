# Hướng dẫn test các role

## 1. Đăng nhập với các tài khoản

### Admin

```
Username: admin001
Password: admin123
```

**Chức năng:**

- 👥 Quản lý tài khoản học viên
- 👔 Quản lý nhân viên (Moderator, Supporter)
- 📊 Báo cáo hệ thống + Export CSV/XLSX
- 🎨 Quản lý Banner/Ads

**Test routes:**

- /admin/user-management
- /admin/staff-management
- /admin/system-report
- /admin/banners

---

### Moderator (Kiểm duyệt viên)

```
Email: moderator1@codelearn.io
Password: 123456
```

**Chức năng:**

- 💬 Kiểm duyệt bình luận vi phạm
- Xem báo cáo (spam, hate speech, inappropriate)
- Hành động: Phê duyệt, Ẩn, Xóa, Flag spam

**Test routes:**

- /moderator/comments

---

### Supporter (Hỗ trợ viên)

```
Email: support1@codelearn.io
Password: 123456
```

**Chức năng:**

- 💬 Chat trực tiếp với học viên
- 🎫 Quản lý tickets hỗ trợ
- 👤 Xem chi tiết học viên (khóa học, tiến độ, thanh toán)

**Test routes:**

- /support/chat
- /support/tickets

---

### Teacher (Giảng viên)

```
Email: nguyenvana@example.com
Password: teacher123
```

**Chức năng:**

- 📚 Quản lý khóa học
- 📝 Quản lý bài học
- 💻 Quản lý bài tập
- 👨‍🎓 Xem học viên + tiến độ + Export

**Test routes:**

- /instructor/courses
- /instructor/course/:id/lessons
- /instructor/course/:id/students
- /instructor/exercises
- /instructor/statistics

---

## 2. Dữ liệu đã được init

✅ **Enrollments** - Danh sách ghi danh khóa học
✅ **Payments** - Lịch sử thanh toán
✅ **Comments** - Bình luận học viên
✅ **Reports** - Báo cáo vi phạm (từ reports.json)
✅ **Tickets** - Yêu cầu hỗ trợ (từ reports.json)
✅ **Chat Sessions** - Lịch sử chat (từ reports.json)
✅ **Banner Stats** - Thống kê banner views/clicks
✅ **Activity Logs** - Lịch sử hoạt động hệ thống

Dữ liệu tự động load khi app khởi động từ file `src/utils/initData.js`

---

## 3. Fix đã thực hiện

### ✅ Filter Layout

- Chuyển từ flexbox dọc sang **ngang (row)**
- Thêm flex-wrap để responsive

### ✅ Màu chữ Button

- Tất cả button giờ có **color: white** hoặc màu phù hợp
- Filter active: màu trắng trên nền gradient
- Action buttons: màu trắng rõ ràng

### ✅ Select color

- Thêm **color: #333** cho các dropdown select

---

## 4. Test cases

### Admin

1. ✅ Login với admin001/admin123
2. ✅ Vào Staff Management - thêm/sửa/xóa/khóa nhân viên
3. ✅ Vào System Report - xem thống kê + export CSV/XLSX
4. ✅ Vào Banner Management - xem stats, edit banner

### Moderator

1. ✅ Login với moderator1@codelearn.io/123456
2. ✅ Vào Comment Moderation
3. ✅ Filter: Tất cả / Chờ duyệt / Đã xử lý
4. ✅ Test actions: Approve, Hide, Delete, Flag spam

### Supporter

1. ✅ Login với support1@codelearn.io/123456
2. ✅ Vào Support Chat - chọn chat, gửi tin nhắn
3. ✅ Click "Xem thông tin" - xem chi tiết học viên
4. ✅ Vào Ticket Management
5. ✅ Filter tickets theo status/category
6. ✅ Gửi reply, resolve, close ticket

---

## 5. Kiểm tra UI

### Filters

- ✅ Các button filter nằm **ngang** một dòng
- ✅ Màu chữ rõ ràng (đen khi inactive, trắng khi active)

### Buttons

- ✅ Tất cả button có màu chữ phù hợp
- ✅ Gradient buttons: chữ trắng
- ✅ Icon buttons hover: chữ trắng khi có background màu

### Select dropdowns

- ✅ Text màu #333 dễ đọc

---

## Demo nhanh

```bash
# 1. Start dev server
npm run dev

# 2. Mở browser: http://localhost:5173

# 3. Test lần lượt:
- Login admin → /admin/staff-management
- Logout → Login moderator → /moderator/comments
- Logout → Login supporter → /support/chat
```

🎉 **Tất cả đã sẵn sàng để test!**
