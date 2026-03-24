import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import Register from "../pages/auth/Register";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}