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
import FAQ from "./pages/FAQ";
import CourseManagement from "./pages/Instructor/CourseManagement";
import CourseStudents from "./pages/Instructor/CourseStudents";
import LessonManagement from "./pages/Instructor/LessonManagement";
import ExerciseManagement from "./pages/Instructor/ExerciseManagement";
import Statistics from "./pages/Instructor/Statistics";
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
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
