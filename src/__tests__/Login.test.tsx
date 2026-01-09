import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import { AuthProvider } from "../context/AuthProvider";
import api from "../api";

vi.mock("../api");
const mockedApi = api as any;

describe("Login flow", () => {
  beforeEach(() => {
    mockedApi.post.mockReset();
    mockedApi.get.mockReset();
  });

  it("logs in and navigates to dashboard", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { token: "test-token" } });
    mockedApi.get.mockResolvedValueOnce({ data: { user: { id: "u1", email: "a@b.com", memberships: [] } } });

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pass" } });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith("/api/auth/login", { email: "a@b.com", password: "pass" });
    });
  });
});
