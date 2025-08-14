import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FindPassword from "./pages/FindPassword";

import ReservationStatusPage from "./pages/ReservationAdmin/ReservationStatusPage";
import ClassroomInfoPage from "./pages/ReservationAdmin/ClassroomInfoPage";
import ClassInfoPage from "./pages/ReservationAdmin/ClassInfoPage";
import NoticePage from "./pages/NoticeAdmin/NoticePage";

import ProtectedRoute from "./components/route/ProtectedRoute";
import PublicOnlyRoute from "./components/route/PublicOnlyRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* 비로그인 사용자만 접근 가능 */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/find-password"
          element={
            <PublicOnlyRoute>
              <FindPassword />
            </PublicOnlyRoute>
          }
        />

        {/* 로그인한 사용자만 접근 가능 */}
        <Route
          path="/reservation"
          element={
            <ProtectedRoute>
              <ReservationStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classroom"
          element={
            <ProtectedRoute>
              <ClassroomInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/class"
          element={
            <ProtectedRoute>
              <ClassInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notice"
          element={
            <ProtectedRoute>
              <NoticePage />
            </ProtectedRoute>
          }
        />

        {/* 잘못된 경로 → 로그인 페이지로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
