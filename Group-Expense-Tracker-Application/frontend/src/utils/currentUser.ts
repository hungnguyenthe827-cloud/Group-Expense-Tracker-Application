export const getCurrentUser = () => localStorage.getItem("user") || "";

export const setCurrentUser = (user: string) => {
  localStorage.setItem("user", user);
};
