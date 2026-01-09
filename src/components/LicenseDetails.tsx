import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./../api";

export default function LicenseDetails() {
  const { id } = useParams();
  const [license, setLicense] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const res = await api.get(`/api/licenses/${id}`);
      setLicense(res.data.license);
    }
    if (id) load();
  }, [id]);

  async function revoke() {
    if (!window.confirm("Revoke this license?")) return;
    await api.post(`/api/licenses/${id}/revoke`);
    navigate('/licenses');
  }

  if (!license) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>{license.name}</h2>
      <div style={{ fontFamily: "monospace", marginTop: 8 }}>Key: {license.key}</div>
      <div style={{ marginTop: 12 }}>Created by: {license.createdBy?.email || 'unknown'}</div>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => navigator.clipboard.writeText(license.key)}>Copy key</button>
        <button style={{ marginLeft: 8 }} onClick={revoke}>Revoke</button>
      </div>
      <div style={{ marginTop: 18 }}>
        <h3>Metadata</h3>
        <pre>{JSON.stringify(license.metadata || {}, null, 2)}</pre>
      </div>
    </div>
  );
}
