import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthProvider";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import LicenseList from "./components/Licenses/List";
import CreateLicense from "./components/Licenses/Create";
import LicenseDetails from "./components/LicenseDetails";
import ApiKeyList from "./components/ApiKeys/List";

export function Nav() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  return (
    <div style={{ padding: 12, borderBottom: "1px solid #eee" }}>
      <Link to="/">Home</Link>
      {' | '}
      {!isLoggedIn && (
        <>
          <Link to="/login">Login</Link> | <Link to="/signup">Sign up</Link> | 
        </>
      )}
      <Link to="/licenses">Licenses</Link> | <Link to="/apikeys">API Keys</Link>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<div style={{ padding: 24 }}><h1>Licensing Service Dashboard (MVP)</h1><p>Use the links to sign up or login.</p></div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/licenses" element={<ProtectedRoute><LicenseList /></ProtectedRoute>} />
          <Route path="/licenses/new" element={<ProtectedRoute><CreateLicense /></ProtectedRoute>} />
          <Route path="/licenses/:id" element={<ProtectedRoute><LicenseDetails /></ProtectedRoute>} />
          <Route path="/apikeys" element={<ProtectedRoute><ApiKeyList /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
