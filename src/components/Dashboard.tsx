import React from "react";
import { useAuth } from "../context/AuthProvider";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <div>
        <strong>User:</strong> {user?.email}
      </div>
      <div style={{ marginTop: 12 }}>
        <strong>Organizations:</strong>
        <ul>
          {user?.memberships?.map((m: any) => (
            <li key={m.org.id}>{m.org.name}</li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => logout()}>Logout</button>
      </div>
    </div>
  );
}
