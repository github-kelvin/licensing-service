import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await auth.signup(email, password, name, orgName);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "32px auto", padding: 20, border: "1px solid #eee", borderRadius: 6 }}>
      <h2>Sign up</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="name">Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="orgName">Organization name</label>
          <input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="password">Password</label>
          <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: "100%" }} />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <button type="submit">Create account</button>
      </form>
      <div style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}
