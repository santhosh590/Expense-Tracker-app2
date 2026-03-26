import { useState, useEffect } from "react";
import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { Trash2, ShieldAlert, Edit2, Check, X } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user? All their data will be permanently lost.")) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(u => u._id !== id));
      } catch (err) {
        alert(err.response?.data?.message || "Error deleting user");
      }
    }
  };

  const startEdit = (u) => {
    setEditingRow(u._id);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const saveEdit = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}`, editForm);
      setUsers(users.map(u => u._id === id ? res.data : u));
      setEditingRow(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error updating user");
    }
  };

  if (user?.role !== "admin") return <Navigate to="/dashboard" />;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage all users across the platform.</p>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title"><ShieldAlert size={20}/> User Management</h3>
        {loading ? <p>Loading users...</p> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: 12, color: "var(--text-muted)", fontWeight: 600 }}>Name</th>
                  <th style={{ padding: 12, color: "var(--text-muted)", fontWeight: 600 }}>Email</th>
                  <th style={{ padding: 12, color: "var(--text-muted)", fontWeight: 600 }}>Role</th>
                  <th style={{ padding: 12, color: "var(--text-muted)", fontWeight: 600 }}>Joined</th>
                  <th style={{ padding: 12, textAlign: "right", color: "var(--text-muted)", fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const isEditing = editingRow === u._id;
                  return (
                    <tr key={u._id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: 12, fontWeight: 700, color: "var(--text-main)" }}>
                        {isEditing ? (
                          <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-dark)", width: "100%", color: "var(--text-main)" }}/>
                        ) : u.name}
                      </td>
                      <td style={{ padding: 12, color: "var(--text-main)" }}>
                        {isEditing ? (
                          <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-dark)", width: "100%", color: "var(--text-main)" }}/>
                        ) : u.email}
                      </td>
                      <td style={{ padding: 12 }}>
                        {isEditing ? (
                          <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} style={{ padding: 6, borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-dark)", color: "var(--text-main)" }}>
                            <option value="user">USER</option>
                            <option value="admin">ADMIN</option>
                          </select>
                        ) : (
                          <span style={{ 
                            padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, 
                            background: u.role === "admin" ? "rgba(168,85,247,0.15)" : "rgba(59,130,246,0.15)",
                            color: u.role === "admin" ? "#a855f7" : "#3b82f6" 
                          }}>{u.role.toUpperCase()}</span>
                        )}
                      </td>
                      <td style={{ padding: 12, color: "var(--text-muted)" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: 12, textAlign: "right" }}>
                        {isEditing ? (
                          <div style={{ display: "inline-flex", gap: 8 }}>
                            <button onClick={() => saveEdit(u._id)} style={{ background: "rgba(34,197,94,0.1)", border: "none", color: "#22c55e", padding: "8px 12px", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                              <Check size={16} /> Save
                            </button>
                            <button onClick={() => setEditingRow(null)} style={{ background: "var(--glass)", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "6px 10px", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "inline-flex", gap: 8 }}>
                            <button onClick={() => startEdit(u)} style={{ background: "rgba(59,130,246,0.1)", border: "none", color: "#3b82f6", padding: "8px 12px", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                              <Edit2 size={16} /> Edit
                            </button>
                            {u.role !== "admin" && (
                              <button onClick={() => handleDelete(u._id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", color: "#ef4444", padding: "8px 12px", borderRadius: 8, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                                <Trash2 size={16} /> Delete
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
