import api from "./api";

export const getTransactionsAPI = async () => {
  const res = await api.get("/transactions");
  return res.data;
};

export const addTransactionAPI = async (data) => {
  const res = await api.post("/transactions", data);
  return res.data;
};

export const deleteTransactionAPI = async (id) => {
  const res = await api.delete(`/transactions/${id}`);
  return res.data;
};
