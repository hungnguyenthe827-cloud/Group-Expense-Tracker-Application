// src/services/authService.ts
import api from "./api";

export const loginApi = (username: string, password: string) => {
  // Đổi email -> username để khớp với Backend
  return api.post("/auth/login", { username, password });
};

export const registerApi = (data: {
  fullName: string; // Khớp với "fullName" bạn dùng trong Postman
  username: string; // Khớp với "username" (là email của bạn)
  password: string;
}) => {
  return api.post("/auth/register", data);
};