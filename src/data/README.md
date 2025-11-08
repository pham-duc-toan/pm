# Hướng dẫn sử dụng Data JSON

## Tổng quan

Dữ liệu được tổ chức theo **6 entities riêng biệt**, mỗi file JSON tương ứng với 1 entity để dễ quản lý và mở rộng.

## Cấu trúc Files

### 1. **courses.json** - Thông tin khóa học

```
{
  "courses": [
    {
      "id": 1,
      "title": "JavaScript & React - From Zero to Hero",
      "slug": "javascript-react-zero-to-hero",
      "shortDescription": "...",
      "fullDescription": "...",
      "thumbnail": "...",
      "level": "beginner|intermediate|advanced",
      "category": "Web Development|Database|Programming",
      "instructor": { id, name, avatar, bio },
      "price": 0,
      "originalPrice": 1999000,
      "discount": 100,
      "rating": 4.8,
      "totalStudents": 1245,
      "totalLessons": 48,
      "totalDuration": "12 giờ 30 phút",
      "language": "Tiếng Việt",
      "whatYouWillLearn": [...],
      "requirements": [...],
      "targetAudience": [...],
      "certificate": {...},
      "isPublished": true,
      "isFeatured": true
    }
  ]
}
```

**Use cases:**

- Hiển thị danh sách khóa học
- Trang chi tiết khóa học
- Search và filter khóa học

---

### 2. **lessons.json** - Chi tiết bài học

```
{
  "lessons": [
    {
      "id": "1-1-1",
      "courseId": 1,
      "chapterNumber": 1,
      "chapterTitle": "Getting Started",
      "lessonNumber": 1,
      "title": "Giới thiệu khóa học & setup môi trường",
      "slug": "gioi-thieu-khoa-hoc-setup-moi-truong",
      "type": "video|exercise|project|quiz",
      "duration": "15:30",
      "videoUrl": "...",
      "content": "...",
      "objectives": [...],
      "resources": [...],
      "isFree": true,
      "order": 1
    }
  ]
}
```

**Use cases:**

- Hiển thị curriculum của khóa học
- Trang học bài (CourseLearn)
- Track tiến độ học

**Cách lọc:**

```javascript
// Lấy tất cả lessons của course 1
const courseLessons = lessons.filter((l) => l.courseId === 1);

// Group lessons theo chapter
const grouped = courseLessons.reduce((acc, lesson) => {
  const key = `${lesson.chapterNumber}-${lesson.chapterTitle}`;
  if (!acc[key]) acc[key] = [];
  acc[key].push(lesson);
  return acc;
}, {});
```

---

### 3. **exercises.json** - Bài tập code

```
{
  "exercises": [
    {
      "id": "ex-1-1",
      "courseId": 1,
      "lessonId": "1-2-6",
      "title": "Bài 1: Tính tổng hai số",
      "slug": "tinh-tong-hai-so",
      "description": "...",
      "difficulty": "easy|medium|hard",
      "points": 10,
      "timeLimit": 300,
      "initialCode": "...",
      "solution": "...",
      "testCases": [
        { "input": "...", "expected": "...", "hidden": false }
      ],
      "hints": [...],
      "tags": [...],
      "order": 1
    }
  ]
}
```

**Use cases:**

- Hiển thị bài tập trong lesson type="exercise"
- Code Editor component
- Submit và chấm bài tự động

**Cách lọc:**

```javascript
// Lấy exercises của lesson
const lessonExercises = exercises.filter((ex) => ex.lessonId === "1-2-6");

// Lấy exercises theo độ khó
const easyExercises = exercises.filter((ex) => ex.difficulty === "easy");
```

---

### 4. **comments.json** - Comments cho lessons và exercises

```
{
  "comments": [
    {
      "id": "cmt-lesson-1",
      "type": "lesson|exercise",
      "targetId": "1-1-1",
      "userId": 5,
      "userName": "Nguyễn Văn D",
      "userAvatar": "...",
      "content": "...",
      "rating": 5,
      "createdAt": "...",
      "likes": 12,
      "replies": [
        {
          "id": "reply-1",
          "userId": 101,
          "userName": "...",
          "content": "...",
          "createdAt": "...",
          "likes": 5
        }
      ]
    }
  ]
}
```

**Use cases:**

- Hiển thị comments dưới mỗi bài học
- Hiển thị comments dưới bài tập code
- Hệ thống Q&A

**Cách lọc:**

```javascript
// Lấy comments của lesson
const lessonComments = comments.filter(
  (c) => c.type === "lesson" && c.targetId === "1-1-1"
);

// Lấy comments của exercise
const exerciseComments = comments.filter(
  (c) => c.type === "exercise" && c.targetId === "ex-1-1"
);
```

---

### 5. **reviews.json** - Đánh giá khóa học

```
{
  "reviews": [
    {
      "id": "rv-1",
      "courseId": 1,
      "userId": 5,
      "userName": "Nguyễn Văn D",
      "userAvatar": "...",
      "rating": 5,
      "title": "Khóa học tuyệt vời!",
      "content": "...",
      "helpful": 45,
      "notHelpful": 2,
      "createdAt": "...",
      "verified": true
    }
  ]
}
```

**Use cases:**

- Hiển thị reviews trên trang chi tiết khóa học
- Tính rating trung bình
- Filter reviews theo rating

**Cách lọc:**

```javascript
// Lấy reviews của course
const courseReviews = reviews.filter((r) => r.courseId === 1);

// Tính rating trung bình
const avgRating =
  courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length;

// Filter 5 sao
const fiveStarReviews = courseReviews.filter((r) => r.rating === 5);
```

---

### 6. **users.json** - Dữ liệu người dùng

```
{
  "users": [
    {
      "id": 1,
      "email": "admin@codelearn.io",
      "password": "admin123",
      "role": "admin|instructor|student",
      "name": "Admin User",
      "avatar": "...",
      "bio": "...",
      "joinedDate": "...",

      // Cho student:
      "enrolledCourses": [1, 2],
      "completedCourses": [],
      "totalPoints": 125,
      "completedExercises": ["ex-1-1", "ex-1-2"],

      // Cho instructor:
      "coursesTeaching": [1],
      "totalStudents": 1245,
      "averageRating": 4.8,

      "isActive": true
    }
  ]
}
```

**Use cases:**

- Authentication & Authorization
- User profile
- Track progress học tập
- Instructor dashboard

**Accounts để test:**

```
Admin:
- Email: admin@codelearn.io
- Password: admin123

Instructor:
- Email: nguyenvana@codelearn.io (dạy khóa 1)
- Email: tranthib@codelearn.io (dạy khóa 2)
- Email: phamvanc@codelearn.io (dạy khóa 7)
- Password: instructor123

Student:
- Email: nguyenvand@example.com
- Password: user123
(và nhiều tài khoản student khác)
```

---

## Relationships giữa các entities

```
courses (1) ----< lessons (many)
courses (1) ----< exercises (many)
courses (1) ----< reviews (many)
courses (many) >---- users (instructor) (1)
courses (many) >----< users (students) (many)

lessons (1) ----< exercises (many)
lessons (1) ----< comments (many)

exercises (1) ----< comments (many)

users (1) ----< comments (many)
users (1) ----< reviews (many)
```

## Ví dụ sử dụng trong React

### 1. Hiển thị danh sách khóa học

```jsx
import coursesData from "./data/courses.json";

function CourseList() {
  const courses = coursesData.courses;

  return (
    <div>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}
```

### 2. Trang chi tiết khóa học

```jsx
import coursesData from "./data/courses.json";
import lessonsData from "./data/lessons.json";
import reviewsData from "./data/reviews.json";

function CourseDetail({ courseId }) {
  const course = coursesData.courses.find((c) => c.id === courseId);
  const lessons = lessonsData.lessons.filter((l) => l.courseId === courseId);
  const reviews = reviewsData.reviews.filter((r) => r.courseId === courseId);

  return (
    <div>
      <h1>{course.title}</h1>
      <Curriculum lessons={lessons} />
      <Reviews reviews={reviews} />
    </div>
  );
}
```

### 3. Trang học bài với Code Editor

```jsx
import lessonsData from "./data/lessons.json";
import exercisesData from "./data/exercises.json";
import commentsData from "./data/comments.json";

function CourseLearn({ lessonId }) {
  const lesson = lessonsData.lessons.find((l) => l.id === lessonId);
  const exercises = exercisesData.exercises.filter(
    (e) => e.lessonId === lessonId
  );
  const comments = commentsData.comments.filter(
    (c) => c.type === "lesson" && c.targetId === lessonId
  );

  return (
    <div>
      {lesson.type === "video" && <VideoPlayer url={lesson.videoUrl} />}
      {lesson.type === "exercise" && <CodeEditor exercises={exercises} />}
      <Comments comments={comments} />
    </div>
  );
}
```

### 4. Redux Store (nếu dùng Redux)

```javascript
// store/coursesSlice.js
import coursesData from "../data/courses.json";
import lessonsData from "../data/lessons.json";
import exercisesData from "../data/exercises.json";

const initialState = {
  courses: coursesData.courses,
  lessons: lessonsData.lessons,
  exercises: exercisesData.exercises,
};
```

## Tips

1. **Performance**: Với dữ liệu lớn, nên dùng `useMemo` để cache filtered data
2. **Search**: Implement search với `filter()` và `toLowerCase()`
3. **Pagination**: Dùng `slice()` để phân trang
4. **Sort**: Dùng `sort()` với custom comparator

## Mở rộng

Để thêm dữ liệu mới:

1. Mở file JSON tương ứng
2. Thêm object mới vào array với các fields bắt buộc
3. Đảm bảo `id` unique
4. Đảm bảo relationships đúng (courseId, lessonId, userId...)

## Lưu ý

- Tất cả `id` đều là unique trong từng entity
- `courseId`, `lessonId`, `userId` dùng để liên kết giữa entities
- Dates theo format ISO 8601: `2025-10-20T10:30:00Z`
- Password lưu plain text (chỉ cho demo, production phải hash)
- Avatar URLs dùng pravatar.cc (random avatars)
- Thumbnail URLs dùng unsplash.com (stock photos)

---

**Created by:** CodeLearn Team  
**Last updated:** November 8, 2025
