import { useNavigate } from "react-router-dom";
import { logoutSession } from "../../utils/authSession";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutSession();
    navigate("/");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-xl px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
    >
      Logout
    </button>
  );
}
