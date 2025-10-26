import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CourseDetail from "./pages/CourseDetail";
import UserManagement from "./pages/Admin/UserManagement";
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
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route
              path="/profile"
              element={isAuthenticated ? <Profile /> : <Login />}
            />
            <Route
              path="/admin/user-management"
              element={isAuthenticated ? <UserManagement /> : <Login />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
