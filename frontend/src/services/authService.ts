import api from "./api";

export const loginApi = (email: string, password: string) => {
  return api.post("/auth/login", { email, password });
};

export const registerApi = (data: {
  name: string;
  email: string;
  password: string;
}) => {
  return api.post("/auth/register", data);
};