import api from "./api";

export const registerUser = async (form) => {
  const res = await api.post("/auth/register", form);
  return res.data;
};

export const loginUser = async (form) => {
  const res = await api.post("/auth/login", form);
  return res.data;
};
