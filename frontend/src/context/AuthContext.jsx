import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const googleLogin = async (credential) => {
    const res = await api.post("/auth/google", { credential });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data));
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = async (data) => {
    const res = await api.put("/auth/profile", data);
    const updated = { ...user, ...res.data, token: user.token };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await api.post("/auth/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const updated = { ...user, avatar: res.data.avatar, token: user.token };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    return updated;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put("/auth/change-password", { currentPassword, newPassword });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, updateUser, uploadAvatar, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
