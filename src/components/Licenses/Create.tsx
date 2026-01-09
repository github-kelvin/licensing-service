import React, { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

export default function CreateLicense() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentMembership = user?.memberships?.[0];
  const role = currentMembership?.role;
  const allowed = role && ["owner","admin"].includes(role);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allowed) return setError('Insufficient role to create licenses');
    setError(null);
    try {
      await api.post("/api/licenses", { name });
      navigate("/licenses");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Create License</h2>
      <form onSubmit={submit}>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {error && <div style={{ color: "red" }}>{error}</div>}
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
