import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await auth.login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 20, border: "1px solid #eee", borderRadius: 6 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: "100%" }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="password">Password</label>
          <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: "100%" }} />
        </div>
        {error && <div style={{ color: "red", marginBottom: 8 }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
      <div style={{ marginTop: 12 }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}
