import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Budget from "./pages/Budget";
import Profile from "./pages/Profile";
import SavingsGoals from "./pages/SavingsGoals";
import CalendarPage from "./pages/Calendar";
import SplitExpenses from "./pages/SplitExpenses";
import Security from "./pages/Security";
import AiAdvisor from "./pages/AiAdvisor";

import Sidebar from "./components/common/Sidebar";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import PageTransition from "./components/common/PageTransition";

import "./styles/layout.css";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function AppLayout({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isMobileOpen} close={() => setIsMobileOpen(false)} />
      <div className="main-area">
        <Navbar toggleSidebar={() => setIsMobileOpen(true)} />
        <div className="main-content">
          <PageTransition>{children}</PageTransition>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/dashboard" element={
          <PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>
        } />
        <Route path="/transactions" element={
          <PrivateRoute><AppLayout><Transactions /></AppLayout></PrivateRoute>
        } />
        <Route path="/reports" element={
          <PrivateRoute><AppLayout><Reports /></AppLayout></PrivateRoute>
        } />
        <Route path="/ai-advisor" element={
          <PrivateRoute><AppLayout><AiAdvisor /></AppLayout></PrivateRoute>
        } />
        <Route path="/budget" element={
          <PrivateRoute><AppLayout><Budget /></AppLayout></PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>
        } />
        <Route path="/savings" element={
          <PrivateRoute><AppLayout><SavingsGoals /></AppLayout></PrivateRoute>
        } />
        <Route path="/calendar" element={
          <PrivateRoute><AppLayout><CalendarPage /></AppLayout></PrivateRoute>
        } />
        <Route path="/split" element={
          <PrivateRoute><AppLayout><SplitExpenses /></AppLayout></PrivateRoute>
        } />
        <Route path="/security" element={
          <PrivateRoute><AppLayout><Security /></AppLayout></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
