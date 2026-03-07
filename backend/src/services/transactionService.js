import Transaction from "../models/Transaction.js";

export const getTransactionsService = async (userId) => {
  return await Transaction.find({ userId }).sort({ date: -1 });
};

export const addTransactionService = async (userId, body) => {
  const { title, amount, type, category, date } = body;

  if (!title || !amount || !type || !category || !date) {
    throw new Error("All fields required");
  }

  const tx = await Transaction.create({
    userId,
    title,
    amount,
    type,
    category,
    date,
  });

  return tx;
};

export const deleteTransactionService = async (userId, id) => {
  const tx = await Transaction.findById(id);
  if (!tx) throw new Error("Transaction not found");

  if (tx.userId.toString() !== userId.toString()) {
    throw new Error("Not authorized");
  }

  await tx.deleteOne();
  return true;
};
