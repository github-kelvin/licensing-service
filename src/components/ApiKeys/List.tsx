import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthProvider";

export default function ApiKeyList() {
  const [keys, setKeys] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    const res = await api.get("/api/apikeys");
    setKeys(res.data.keys || []);
  }

  useEffect(() => { load(); }, []);

  const { user } = useAuth();
  const currentMembership = user?.memberships?.[0];
  const role = currentMembership?.role;
  const allowed = role && ["owner","admin"].includes(role);

  async function create() {
    if (!allowed) return alert('Insufficient role');
    const name = prompt("API key name") || `key-${Date.now()}`;
    const res = await api.post('/api/apikeys', { name });
    alert(`Created: ${res.data.apiKey.key}`);
    // optimistically add the created key (avoid duplicates)
    setKeys((prev) => {
      if (prev.find((p) => p.id === res.data.apiKey.id)) return prev;
      return [...prev, res.data.apiKey];
    });
  }

  async function revoke(id: string) {
    if (!window.confirm("Revoke this API key?")) return;
    await api.post(`/api/apikeys/${id}/revoke`);
    await load();
  }

  async function copyKey(key: string, id: string) {
    await navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>API Keys</h2>
      <div style={{ marginBottom: 8 }}>
        <button onClick={create}>Create API Key</button>
      </div>
      <ul>
        {keys.map(k => (
          <li key={k.id} style={{ marginBottom: 8 }}>
            <div><strong>{k.name}</strong> {k.revoked ? '(revoked)' : ''}</div>
            <div style={{ fontFamily: 'monospace' }}>{k.key}
              <button aria-label={`copy-api-${k.id}`} onClick={() => copyKey(k.key, k.id)} style={{ marginLeft: 8 }}>Copy</button>
              {allowed && <button aria-label={`revoke-api-${k.id}`} onClick={() => revoke(k.id)} style={{ marginLeft: 8 }}>Revoke</button>}
              {copiedId === k.id && <span style={{ marginLeft: 8, color: 'green' }}>Copied!</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
