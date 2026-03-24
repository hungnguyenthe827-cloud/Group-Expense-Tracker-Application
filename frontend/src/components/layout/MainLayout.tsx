import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: Props) {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div>
      <header
        style={{
          padding: "10px",
          background: "#eee",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>Expense Tracker</div>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <main style={{ padding: "20px" }}>{children}</main>
    </div>
  );
}