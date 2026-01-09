import React, { useEffect, useState } from "react";
import api from "../../api";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

export default function LicenseList() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    const res = await api.get("/api/licenses");
    setLicenses(res.data.licenses);
  }

  useEffect(() => { load(); }, []);

  async function revoke(id: string) {
    if (!window.confirm("Revoke this license? This cannot be undone.")) return;
    const res = await api.post(`/api/licenses/${id}/revoke`);
    // update local list optimistically
    setLicenses((prev) => prev.map((l) => (l.id === id ? { ...l, revoked: res.data.license?.revoked ?? true } : l)));
  }

  const { user, currentOrgId } = useAuth();
  const currentMembership = user?.memberships?.find((m:any) => m.orgId === currentOrgId) || user?.memberships?.[0];
  const userRole = currentMembership?.role;
  const canRevoke = userRole && ["owner","admin"].includes(userRole);

  async function copyKey(key: string, id: string) {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(key);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Licenses</h2>
      <Link to="/licenses/new">Create license</Link>
      <ul>
        {licenses.map((l) => (
          <li key={l.id} style={{ marginBottom: 8 }}>
            <div><strong><Link to={`/licenses/${l.id}`}>{l.name}</Link></strong> {l.revoked ? "(revoked)" : ""}</div>
            <div style={{ fontFamily: "monospace" }}>
              <span>{l.key}</span>
              <button aria-label={`copy-${l.id}`} onClick={() => copyKey(l.key, l.id)} style={{ marginLeft: 8 }}>Copy</button>
              {canRevoke && <button aria-label={`revoke-${l.id}`} onClick={() => revoke(l.id)} style={{ marginLeft: 8 }}>Revoke</button>}
              {copiedId === l.id && <span style={{ marginLeft: 8, color: "green" }}>Copied!</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
