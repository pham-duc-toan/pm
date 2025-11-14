import { createSlice } from "@reduxjs/toolkit";

// Sample enrollments for instructor courses (id: 3, 4, 8, 9)
const generateSampleEnrollments = () => {
  const existingEnrollments =
    JSON.parse(localStorage.getItem("enrolledCourses")) || [];

  // Nếu đã có dữ liệu mẫu, không tạo lại
  if (existingEnrollments.length > 5) return existingEnrollments;

  const sampleEnrollments = [
    // Khóa 3: Node.js (miễn phí) - 8 học viên
    {
      id: 1001,
      courseId: 3,
      userId: 5,
      enrolledAt: "2025-09-15T08:00:00Z",
      status: "active",
      progress: 85,
      paymentStatus: "free",
      completedLessons: [],
      currentModule: 4,
      currentLesson: 2,
      lastAccessedAt: "2025-11-13T14:30:00Z",
    },
    {
      id: 1002,
      courseId: 3,
      userId: 8,
      enrolledAt: "2025-09-20T10:00:00Z",
      status: "active",
      progress: 100,
      paymentStatus: "free",
      completedLessons: [],
      currentModule: 5,
      currentLesson: 8,
      lastAccessedAt: "2025-11-10T09:15:00Z",
    },
    {
      id: 1003,
      courseId: 3,
      userId: 12,
      enrolledAt: "2025-10-01T07:30:00Z",
      status: "active",
      progress: 65,
      paymentStatus: "free",
      completedLessons: [],
      currentModule: 3,
      currentLesson: 5,
      lastAccessedAt: "2025-11-14T08:00:00Z",
    },
    {
      id: 1004,
      courseId: 3,
      userId: 15,
      enrolledAt: "2025-10-10T12:00:00Z",
      status: "active",
      progress: 45,
      paymentStatus: "free",
      completedLessons: [],
      currentModule: 2,
      currentLesson: 3,
      lastAccessedAt: "2025-11-12T16:45:00Z",
    },
    {
      id: 1005,
      courseId: 3,
      userId: 18,
      enrolledAt: "2025-10-15T09:00:00Z",
      status: "active",
      progress: 30,
      paymentStatus: "free",
      completedLessons: [],
      currentModule: 1,
      currentLesson: 6,
      lastAccessedAt: "2025-11-11T11:20:00Z",
    },
    {
      id: 1006,
      courseId: 3,
      userId: 20,
      enrolledAt: "2025-10-20T14:00:00Z",
      status: "active",
      progress: 92,
      paymentStatus: "free",
      completedLessons: [],
      currentModule: 5,
      currentLesson: 3,
      lastAccessedAt: "2025-11-13T19:30:00Z",
    },
    {
      id: 1007,
      courseId: 3,
      userId: 22,
      enrolledAt: "2025-10-25T11:00:00Z",
      status: "active",
      progress: 100,
      paymentStatus: "free",
      completedLessons: [],
      currentModule: 5,
      currentLesson: 8,
      lastAccessedAt: "2025-11-09T15:00:00Z",
    },
    {
      id: 1008,
      courseId: 3,
      userId: 25,
      enrolledAt: "2025-11-01T08:30:00Z",
      status: "active",
      progress: 20,
      paymentStatus: "free",
      completedLessons: [],
      currentModule: 1,
      currentLesson: 2,
      lastAccessedAt: "2025-11-14T10:15:00Z",
    },

    // Khóa 4: TypeScript (1,299,000 VNĐ) - 7 học viên
    {
      id: 1009,
      courseId: 4,
      userId: 5,
      enrolledAt: "2025-08-10T09:00:00Z",
      status: "active",
      progress: 78,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 3,
      currentLesson: 7,
      lastAccessedAt: "2025-11-13T13:00:00Z",
    },
    {
      id: 1010,
      courseId: 4,
      userId: 8,
      enrolledAt: "2025-08-15T10:30:00Z",
      status: "active",
      progress: 100,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 4,
      currentLesson: 10,
      lastAccessedAt: "2025-11-08T18:20:00Z",
    },
    {
      id: 1011,
      courseId: 4,
      userId: 12,
      enrolledAt: "2025-09-01T08:00:00Z",
      status: "active",
      progress: 55,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 2,
      currentLesson: 8,
      lastAccessedAt: "2025-11-14T07:45:00Z",
    },
    {
      id: 1012,
      courseId: 4,
      userId: 15,
      enrolledAt: "2025-09-10T14:00:00Z",
      status: "active",
      progress: 88,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 4,
      currentLesson: 3,
      lastAccessedAt: "2025-11-12T20:30:00Z",
    },
    {
      id: 1013,
      courseId: 4,
      userId: 18,
      enrolledAt: "2025-09-20T11:00:00Z",
      status: "active",
      progress: 40,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 2,
      currentLesson: 1,
      lastAccessedAt: "2025-11-10T14:00:00Z",
    },
    {
      id: 1014,
      courseId: 4,
      userId: 20,
      enrolledAt: "2025-10-01T09:30:00Z",
      status: "active",
      progress: 100,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 4,
      currentLesson: 10,
      lastAccessedAt: "2025-11-07T16:45:00Z",
    },
    {
      id: 1015,
      courseId: 4,
      userId: 22,
      enrolledAt: "2025-10-15T13:00:00Z",
      status: "active",
      progress: 62,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 3,
      currentLesson: 2,
      lastAccessedAt: "2025-11-13T12:30:00Z",
    },

    // Khóa 8: MongoDB (999,000 VNĐ) - 6 học viên
    {
      id: 1016,
      courseId: 8,
      userId: 5,
      enrolledAt: "2025-10-05T10:00:00Z",
      status: "active",
      progress: 70,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 3,
      currentLesson: 4,
      lastAccessedAt: "2025-11-13T15:20:00Z",
    },
    {
      id: 1017,
      courseId: 8,
      userId: 8,
      enrolledAt: "2025-10-08T11:30:00Z",
      status: "active",
      progress: 95,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 4,
      currentLesson: 6,
      lastAccessedAt: "2025-11-12T17:00:00Z",
    },
    {
      id: 1018,
      courseId: 8,
      userId: 12,
      enrolledAt: "2025-10-12T09:00:00Z",
      status: "active",
      progress: 50,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 2,
      currentLesson: 5,
      lastAccessedAt: "2025-11-14T09:30:00Z",
    },
    {
      id: 1019,
      courseId: 8,
      userId: 15,
      enrolledAt: "2025-10-20T14:30:00Z",
      status: "active",
      progress: 100,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 5,
      currentLesson: 8,
      lastAccessedAt: "2025-11-11T13:45:00Z",
    },
    {
      id: 1020,
      courseId: 8,
      userId: 18,
      enrolledAt: "2025-11-01T08:00:00Z",
      status: "active",
      progress: 25,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 1,
      currentLesson: 3,
      lastAccessedAt: "2025-11-13T10:00:00Z",
    },
    {
      id: 1021,
      courseId: 8,
      userId: 20,
      enrolledAt: "2025-11-05T12:00:00Z",
      status: "active",
      progress: 35,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 1,
      currentLesson: 7,
      lastAccessedAt: "2025-11-14T11:30:00Z",
    },

    // Khóa 9: Vue.js (1,199,000 VNĐ) - 5 học viên
    {
      id: 1022,
      courseId: 9,
      userId: 5,
      enrolledAt: "2025-10-10T09:00:00Z",
      status: "active",
      progress: 100,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 4,
      currentLesson: 8,
      lastAccessedAt: "2025-11-06T14:00:00Z",
    },
    {
      id: 1023,
      courseId: 9,
      userId: 8,
      enrolledAt: "2025-10-15T10:00:00Z",
      status: "active",
      progress: 82,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 3,
      currentLesson: 9,
      lastAccessedAt: "2025-11-13T16:30:00Z",
    },
    {
      id: 1024,
      courseId: 9,
      userId: 12,
      enrolledAt: "2025-10-20T11:30:00Z",
      status: "active",
      progress: 60,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 2,
      currentLesson: 10,
      lastAccessedAt: "2025-11-14T08:45:00Z",
    },
    {
      id: 1025,
      courseId: 9,
      userId: 15,
      enrolledAt: "2025-11-01T08:30:00Z",
      status: "active",
      progress: 45,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 2,
      currentLesson: 2,
      lastAccessedAt: "2025-11-12T19:15:00Z",
    },
    {
      id: 1026,
      courseId: 9,
      userId: 18,
      enrolledAt: "2025-11-08T13:00:00Z",
      status: "active",
      progress: 15,
      paymentStatus: "paid",
      completedLessons: [],
      currentModule: 1,
      currentLesson: 1,
      lastAccessedAt: "2025-11-13T21:00:00Z",
    },
  ];

  return [...existingEnrollments, ...sampleEnrollments];
};

const initialState = {
  enrolledCourses: generateSampleEnrollments(),
  pendingPayments: JSON.parse(localStorage.getItem("pendingPayments")) || [],
  transactions: JSON.parse(localStorage.getItem("transactions")) || [],
};

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    enrollFreeCourse: (state, action) => {
      const { courseId, userId } = action.payload;
      const enrollment = {
        id: Date.now(),
        courseId,
        userId,
        enrolledAt: new Date().toISOString(),
        status: "active",
        progress: 0,
        paymentStatus: "free",
        completedLessons: [],
        currentModule: 0,
        currentLesson: 0,
        lastAccessedAt: new Date().toISOString(),
      };

      // Check if already enrolled
      const alreadyEnrolled = state.enrolledCourses.some(
        (e) => e.courseId === courseId && e.userId === userId
      );

      if (!alreadyEnrolled) {
        state.enrolledCourses.push(enrollment);
        localStorage.setItem(
          "enrolledCourses",
          JSON.stringify(state.enrolledCourses)
        );
      }
    },

    createPendingPayment: (state, action) => {
      const { courseId, userId, course, paymentMethod } = action.payload;
      const payment = {
        id: `PAY-${Date.now()}`,
        courseId,
        userId,
        courseName: course.title,
        amount: course.price,
        paymentMethod,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      state.pendingPayments.push(payment);
      localStorage.setItem(
        "pendingPayments",
        JSON.stringify(state.pendingPayments)
      );
    },

    completePaidEnrollment: (state, action) => {
      const { paymentId, transactionId } = action.payload;
      const payment = state.pendingPayments.find((p) => p.id === paymentId);

      if (payment) {
        // Create enrollment
        const enrollment = {
          id: Date.now(),
          courseId: payment.courseId,
          userId: payment.userId,
          enrolledAt: new Date().toISOString(),
          status: "active",
          progress: 0,
          paymentStatus: "paid",
          paymentId,
          transactionId,
          completedLessons: [],
          currentModule: 0,
          currentLesson: 0,
          lastAccessedAt: new Date().toISOString(),
        };

        state.enrolledCourses.push(enrollment);

        // Update payment status
        payment.status = "completed";
        payment.completedAt = new Date().toISOString();
        payment.transactionId = transactionId;

        // Create transaction record
        const transaction = {
          id: transactionId,
          paymentId,
          courseId: payment.courseId,
          userId: payment.userId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: "success",
          invoiceNumber: `INV-${Date.now()}`,
          createdAt: new Date().toISOString(),
          receipt: {
            courseName: payment.courseName,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            transactionId,
            date: new Date().toISOString(),
          },
        };

        state.transactions.push(transaction);

        // Save to localStorage
        localStorage.setItem(
          "enrolledCourses",
          JSON.stringify(state.enrolledCourses)
        );
        localStorage.setItem(
          "pendingPayments",
          JSON.stringify(state.pendingPayments)
        );
        localStorage.setItem(
          "transactions",
          JSON.stringify(state.transactions)
        );
      }
    },

    cancelPayment: (state, action) => {
      const { paymentId } = action.payload;
      const payment = state.pendingPayments.find((p) => p.id === paymentId);

      if (payment) {
        payment.status = "cancelled";
        payment.cancelledAt = new Date().toISOString();
        localStorage.setItem(
          "pendingPayments",
          JSON.stringify(state.pendingPayments)
        );
      }
    },

    failPayment: (state, action) => {
      const { paymentId, error } = action.payload;
      const payment = state.pendingPayments.find((p) => p.id === paymentId);

      if (payment) {
        payment.status = "failed";
        payment.failedAt = new Date().toISOString();
        payment.errorMessage = error;

        // Log transaction failure
        const transaction = {
          id: `TXN-FAIL-${Date.now()}`,
          paymentId,
          courseId: payment.courseId,
          userId: payment.userId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: "failed",
          errorMessage: error,
          createdAt: new Date().toISOString(),
        };

        state.transactions.push(transaction);

        localStorage.setItem(
          "pendingPayments",
          JSON.stringify(state.pendingPayments)
        );
        localStorage.setItem(
          "transactions",
          JSON.stringify(state.transactions)
        );
      }
    },

    getUserEnrolledCourses: (state, action) => {
      const { userId } = action.payload;
      return state.enrolledCourses.filter((e) => e.userId === userId);
    },

    updateProgress: (state, action) => {
      const { enrollmentId, moduleIndex, lessonIndex } = action.payload;
      const enrollment = state.enrolledCourses.find(
        (e) => e.id === enrollmentId
      );

      if (enrollment) {
        enrollment.currentModule = moduleIndex;
        enrollment.currentLesson = lessonIndex;
        enrollment.lastAccessedAt = new Date().toISOString();
        localStorage.setItem(
          "enrolledCourses",
          JSON.stringify(state.enrolledCourses)
        );
      }
    },

    completeLesson: (state, action) => {
      const { enrollmentId, lessonId, moduleIndex, lessonIndex } =
        action.payload;
      const enrollment = state.enrolledCourses.find(
        (e) => e.id === enrollmentId
      );

      if (enrollment && !enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
        enrollment.currentModule = moduleIndex;
        enrollment.currentLesson = lessonIndex;
        enrollment.lastAccessedAt = new Date().toISOString();

        // Calculate progress percentage (this will be calculated based on total lessons in the component)
        // Store it here for display purposes
        localStorage.setItem(
          "enrolledCourses",
          JSON.stringify(state.enrolledCourses)
        );
      }
    },

    updateCourseProgress: (state, action) => {
      const { enrollmentId, progress } = action.payload;
      const enrollment = state.enrolledCourses.find(
        (e) => e.id === enrollmentId
      );

      if (enrollment) {
        enrollment.progress = progress;
        localStorage.setItem(
          "enrolledCourses",
          JSON.stringify(state.enrolledCourses)
        );
      }
    },

    loadEnrollmentsFromStorage: (state) => {
      const stored = JSON.parse(localStorage.getItem("enrolledCourses")) || [];
      state.enrolledCourses =
        stored.length > 5 ? stored : generateSampleEnrollments();
      state.pendingPayments =
        JSON.parse(localStorage.getItem("pendingPayments")) || [];
      state.transactions =
        JSON.parse(localStorage.getItem("transactions")) || [];
    },

    saveSampleEnrollments: (state) => {
      localStorage.setItem(
        "enrolledCourses",
        JSON.stringify(state.enrolledCourses)
      );
    },
  },
});

export const {
  enrollFreeCourse,
  createPendingPayment,
  completePaidEnrollment,
  cancelPayment,
  failPayment,
  getUserEnrolledCourses,
  updateProgress,
  completeLesson,
  updateCourseProgress,
  loadEnrollmentsFromStorage,
  saveSampleEnrollments,
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
