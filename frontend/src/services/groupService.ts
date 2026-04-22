import api from "./api";

export const getGroups = () => {
  return api.get("/groups");
};

export const createGroup = (name: string) => {
  return api.post("/groups", { name });
};