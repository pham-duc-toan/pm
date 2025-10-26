import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  enrolledCourses: JSON.parse(localStorage.getItem("enrolledCourses")) || [],
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
      state.enrolledCourses =
        JSON.parse(localStorage.getItem("enrolledCourses")) || [];
      state.pendingPayments =
        JSON.parse(localStorage.getItem("pendingPayments")) || [];
      state.transactions =
        JSON.parse(localStorage.getItem("transactions")) || [];
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
} = enrollmentSlice.actions;

export default enrollmentSlice.reducer;
