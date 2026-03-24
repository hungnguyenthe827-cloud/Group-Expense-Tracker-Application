import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({ children }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}