import { useAuthStore } from "../../store/useAuthStore";

export default function Dashboard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome: {user?.name}</p>
    </div>
  );
}