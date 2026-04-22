import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

import Dashboard from "./pages/dashboard/Dashboard";

import CreateGroup from "./pages/group/Creategroup";
import GroupDetail from "./pages/group/GroupDetail";
import AddExpense from "./pages/group/AddExpense";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* MAIN */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* GROUP */}
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/group/:id" element={<GroupDetail />} />

        {/* 🔥 QUAN TRỌNG */}
        <Route path="/group/:id/add-expense" element={<AddExpense />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;