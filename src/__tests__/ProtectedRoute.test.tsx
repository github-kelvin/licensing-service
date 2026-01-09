import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthProvider } from "../context/AuthProvider";

it("redirects unauthenticated to login", () => {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<ProtectedRoute><div>Protected</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
  expect(screen.queryByText(/login page/i)).toBeInTheDocument();
});
