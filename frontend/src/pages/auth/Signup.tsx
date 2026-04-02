import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    let newErrors = {
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    let isValid = true;

    if (!fullname.trim()) {
      newErrors.fullname = "Please enter your full name";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Please enter your email";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Please enter a password";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    alert("Sign up successful!");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">

      {/* BRANDING */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-600 tracking-wide">
          PAYSHARE
        </h1>
        <p className="text-sm text-gray-500">
          Smart Group Spending
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSignup}
        className="bg-white p-8 rounded-2xl shadow-md w-80"
      >
        <h2 className="text-lg font-semibold mb-4 text-center">Sign Up</h2>

        {/* FULLNAME */}
        <input
          type="text"
          placeholder="Full name"
          className={`w-full p-2 border rounded mb-1 ${
            errors.fullname ? "border-red-500" : ""
          }`}
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
        />

        {errors.fullname && (
          <p className="text-red-500 text-sm mb-2">{errors.fullname}</p>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          className={`w-full p-2 border rounded mb-1 ${
            errors.email ? "border-red-500" : ""
          }`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {errors.email && (
          <p className="text-red-500 text-sm mb-2">{errors.email}</p>
        )}

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          className={`w-full p-2 border rounded mb-1 ${
            errors.password ? "border-red-500" : ""
          }`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {errors.password && (
          <p className="text-red-500 text-sm mb-2">{errors.password}</p>
        )}

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          placeholder="Confirm password"
          className={`w-full p-2 border rounded mb-1 ${
            errors.confirmPassword ? "border-red-500" : ""
          }`}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mb-3">
            {errors.confirmPassword}
          </p>
        )}

        {/* BUTTON */}
        <button
          type="submit"
          className="w-full bg-indigo-500 text-white py-2 rounded mb-3"
        >
          Sign Up
        </button>

        {/* BACK */}
        <p className="text-sm text-center">
          Đã có tài khoản?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}