import api from "./api";

export const getExpenses = () => {
  return api.get("/expenses");
};

export const createExpense = (data: any) => {
  return api.post("/expenses", data);
};