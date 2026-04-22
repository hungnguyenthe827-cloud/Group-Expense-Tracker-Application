import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault(); // Ngăn trang bị reload khi nhấn submit
    setError("");
   const nameRegex = /^[A-ZÀ-Ỹ][a-zà-ỹ]*(\s[A-ZÀ-Ỹ][a-zà-ỹ]*)+$/;
     if (!nameRegex.test(fullname)) {
     setError("Full name must have at least 2 words and start with uppercase letters (e.g., John Doe).");
      return;
  }
   const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passRegex.test(password)) {
     setError("Password must be at least 8 characters, including uppercase, lowercase, number, and special character.");
     return;
  }
    // Kiểm tra mật khẩu khớp nhau
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

   try {
    const response = await axios.post("http://localhost:8080/api/auth/register", {
      fullName: fullname,
      email: email,
      password: password,
    });

    if (response.status === 200 || response.status === 201) {
      // 1. Hiển thị thông báo thành công
      alert("Registration successful! Redirecting to login page...");

      // 2. Điều hướng về trang đăng nhập thay vì dashboard
      navigate("/"); 
    }
  } catch (err: any) {
    const message = err.response?.data?.message || "Registration failed. Try again.";
    setError(message);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* LEFT - FORM */}
        <div className="p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-indigo-600">PAYSHARE</h1>
            <p className="text-gray-500 text-sm">Smart Group Spending</p>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Create Account 🚀</h2>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          {/* Sử dụng thẻ form để bắt sự kiện onSubmit */}
          <form onSubmit={handleSignup}>
            {/* FULLNAME */}
            <div className="mb-4 relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                required
                type="text"
                placeholder="Full name"
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>

            {/* EMAIL */}
            <div className="mb-4 relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                required
                type="email"
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-4 relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                required
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="mb-6 relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                required
                type="password"
                placeholder="Confirm password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition mb-4"
            >
              Create Account
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* GOOGLE SIGNUP */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const response = await axios.post("http://localhost:8080/api/auth/google", {
                    idToken: credentialResponse.credential,
                  });
                  if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                    navigate("/dashboard");
                  }
                } catch (err) {
                  setError("Google Signup failed.");
                }
              }}
              onError={() => setError("Google Signup failed")}
            />
          </div>

          <p className="text-sm text-center mt-6">
            Đã có tài khoản?{" "}
            <span
              onClick={() => navigate("/")}
              className="text-indigo-600 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>

        {/* RIGHT - BANNER */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-10">
          <p className="text-xs tracking-widest mb-2 opacity-80">SMART SPLITTING</p>
          <h2 className="text-3xl font-bold text-center leading-snug">
            Join & Manage <br /> Group Expenses Easily.
          </h2>
        </div>
      </div>
    </div>
  );
}