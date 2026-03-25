import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

import { AuthProvider } from "./context/AuthContext";
import { TransactionProvider } from "./context/TransactionContext";
import { BudgetProvider } from "./context/BudgetContext";
import { ToastProvider } from "./components/common/ToastNotification";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <TransactionProvider>
      <BudgetProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BudgetProvider>
    </TransactionProvider>
  </AuthProvider>
);
