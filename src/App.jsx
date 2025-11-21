import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CourseDetail from "./pages/CourseDetail";
import MyCourses from "./pages/MyCourses";
import CourseLearn from "./pages/CourseLearn";
import Payment from "./pages/Payment";
import PaymentGateway from "./pages/PaymentGateway";
import SearchResults from "./pages/SearchResults";
import UserManagement from "./pages/Admin/UserManagement";
import StaffManagement from "./pages/Admin/StaffManagement";
import SystemReport from "./pages/Admin/SystemReport";
import BannerManagement from "./pages/Admin/BannerManagement";
import CourseManagementAdmin from "./pages/Admin/CourseManagementAdmin";
import CommentManagement from "./pages/Admin/CommentManagement";
import EmailTemplates from "./pages/Admin/EmailTemplates";
import SystemSettings from "./pages/Admin/SystemSettings";
import FAQ from "./pages/FAQ";
import CourseManagement from "./pages/Instructor/CourseManagement";
import CourseStudents from "./pages/Instructor/CourseStudents";
import StudentDetailProgress from "./pages/Instructor/StudentDetailProgress";
import LessonManagement from "./pages/Instructor/LessonManagement";
import ExerciseManagement from "./pages/Instructor/ExerciseManagement";
import Statistics from "./pages/Instructor/Statistics";
import CommentModeration from "./pages/Moderator/CommentModeration";
import CourseReview from "./pages/Moderator/CourseReview";
import ReportsManagement from "./pages/Moderator/ReportsManagement";
import ModeratorStatistics from "./pages/Moderator/Statistics";
import SupportChat from "./pages/Support/SupportChat";
import TicketManagement from "./pages/Support/TicketManagement";
import EmailSupport from "./pages/Support/EmailSupport";
import Settings from "./pages/Settings";
import "./App.css";

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const hasSidebar = isAuthenticated && user?.role !== "student";

  return (
    <div className="App">
      <Header />
      <div className="app-layout">
        {hasSidebar && <Sidebar />}
        <main className={hasSidebar ? "with-sidebar" : ""}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/faq" element={<FAQ />} />
            <Route
              path="/settings"
              element={isAuthenticated ? <Settings /> : <Login />}
            />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Login />}
            />
            <Route
              path="/my-courses"
              element={isAuthenticated ? <MyCourses /> : <Login />}
            />
            <Route
              path="/learn/:id"
              element={isAuthenticated ? <CourseLearn /> : <Login />}
            />
            <Route
              path="/payment"
              element={isAuthenticated ? <Payment /> : <Login />}
            />
            <Route
              path="/payment-gateway"
              element={isAuthenticated ? <PaymentGateway /> : <Login />}
            />
            <Route
              path="/admin/user-management"
              element={isAuthenticated ? <UserManagement /> : <Login />}
            />
            <Route
              path="/admin/staff-management"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <StaffManagement />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/admin/system-report"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <SystemReport />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/admin/banners"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <BannerManagement />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/admin/courses"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <CourseManagementAdmin />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/admin/comments"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <CommentManagement />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/admin/email-templates"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <EmailTemplates />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/admin/settings"
              element={
                isAuthenticated && user?.role === "admin" ? (
                  <SystemSettings />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/instructor/courses"
              element={
                isAuthenticated && user?.role === "teacher" ? (
                  <CourseManagement />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/instructor/course/:courseId/students"
              element={
                isAuthenticated && user?.role === "teacher" ? (
                  <CourseStudents />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/instructor/course/:courseId/student/:userId/progress"
              element={
                isAuthenticated && user?.role === "teacher" ? (
                  <StudentDetailProgress />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/instructor/course/:courseId/lessons"
              element={
                isAuthenticated && user?.role === "teacher" ? (
                  <LessonManagement />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/instructor/exercises"
              element={
                isAuthenticated && user?.role === "teacher" ? (
                  <ExerciseManagement />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/instructor/statistics"
              element={
                isAuthenticated && user?.role === "teacher" ? (
                  <Statistics />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/moderator/comments"
              element={
                isAuthenticated && user?.role === "moderator" ? (
                  <CommentModeration />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/moderator/courses"
              element={
                isAuthenticated && user?.role === "moderator" ? (
                  <CourseReview />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/moderator/reports"
              element={
                isAuthenticated && user?.role === "moderator" ? (
                  <ReportsManagement />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/moderator/statistics"
              element={
                isAuthenticated && user?.role === "moderator" ? (
                  <ModeratorStatistics />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/support/chat"
              element={
                isAuthenticated && user?.role === "supporter" ? (
                  <SupportChat />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/support/email"
              element={
                isAuthenticated && user?.role === "supporter" ? (
                  <EmailSupport />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/support/tickets"
              element={
                isAuthenticated && user?.role === "supporter" ? (
                  <TicketManagement />
                ) : (
                  <Login />
                )
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
