import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";

import CreateGroup from "../pages/group/Creategroup";
import JoinGroup from "../pages/group/JoinGroup";
import GroupDetail from "../pages/group/GroupDetail";
import AddExpense from "../pages/group/AddExpense";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
      <Route path="/join-group" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
      <Route path="/group/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
      <Route path="/group/:id/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
    </Routes>
  );
}