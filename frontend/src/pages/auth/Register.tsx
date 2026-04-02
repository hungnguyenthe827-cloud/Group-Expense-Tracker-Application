import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">

      <div className="w-[380px] bg-white p-8 rounded-2xl shadow-xl">

        <h2 className="text-2xl font-semibold mb-6">Create Account</h2>

        <input className="input" placeholder="Full Name" />
        <input className="input" placeholder="Email Address" />
        <input type="password" className="input" placeholder="Password" />

        <button className="btn-primary">Create Account</button>

        <button
          onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
          className="w-full mt-3 border border-gray-300 py-3 rounded-lg"
        >
          Continue with Google
        </button>

        <p className="text-sm text-center mt-5">
          Already have account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-indigo-600 cursor-pointer font-medium"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}