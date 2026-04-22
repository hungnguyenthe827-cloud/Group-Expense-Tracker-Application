import { loginApi } from "../../services/authService";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google"; // Dùng Component thay vì Hook
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both Email and Password");
      return;
    }

    try {
      const response = await loginApi(email, password);
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard");
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Invalid email or password";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* LEFT SIDE - FORM */}
        <div className="p-10 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-indigo-600">PAYSHARE</h1>
            <p className="text-gray-500 text-sm">Smart Group Spending</p>
          </div>

          <h2 className="text-2xl font-semibold mb-6">Welcome back</h2>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="mb-4 relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6 relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition mb-4"
          >
            Login
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* GOOGLE LOGIN COMPONENT - Đã sửa lỗi gửi Token */}
          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  // credentialResponse.credential chính là ID Token mà Backend đang đợi
                  const response = await axios.post("http://localhost:8080/api/auth/google", {
                    idToken: credentialResponse.credential, 
                  });

                  if (response.data && response.data.token) {
                    localStorage.setItem("token", response.data.token);
                    navigate("/dashboard");
                  }
                } catch (err: any) {
                  console.error("Backend Error:", err.response?.data);
                  setError("Google authentication failed at Server.");
                }
              }}
              onError={() => {
                setError("Google Login failed");
              }}
              theme="outline"
              size="large"
              width="100%"
            />
          </div>

          <p className="text-sm text-center mt-6">
            Chưa có tài khoản?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-indigo-600 cursor-pointer hover:underline"
            >
              Sign up
            </span>
          </p>
        </div>

        {/* RIGHT SIDE - BANNER */}
        <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white p-10">
          <p className="text-xs tracking-widest mb-2 opacity-80">SMART SPLITTING</p>
          <h2 className="text-3xl font-bold text-center leading-snug">
            Effortless <br /> Shared Finances.
          </h2>
        </div>
      </div>
    </div>
  );
}