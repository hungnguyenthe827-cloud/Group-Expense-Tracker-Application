import api from "../services/api";

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const logoutSession = async () => {
  const token = localStorage.getItem("token");

  try {
    if (token) {
      await api.post("/auth/logout");
    }
  } catch {
    // Even if backend logout fails, we still clear the local session.
  } finally {
    clearAuthSession();
  }
};
