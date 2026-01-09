import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthProvider";
import LicenseList from "../components/Licenses/List";
import CreateLicense from "../components/Licenses/Create";
import api from "../api";

vi.mock("../api");
const mockedApi = api as any;

describe("Licenses UI", () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test.token');
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  it("lists licenses and shows full keys", async () => {
    // mock auth me and licenses by URL
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/api/auth/me') return Promise.resolve({ data: { user: { id: 'u1', email: 'a@b.com', memberships: [{ orgId: 'org1', role: 'owner', org: { id: 'org1', name: 'Org1' } }] } } });
      if (url === '/api/licenses') return Promise.resolve({ data: { licenses: [{ id: "l1", name: "L1", key: "LIC-AAA" }] } });
      return Promise.resolve({ data: {} });
    });
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/licenses"]}>
          <Routes>
            <Route path="/licenses" element={<LicenseList />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith("/api/licenses"));
    expect(screen.getByText(/LIC-AAA/)).toBeInTheDocument();
    expect(screen.getByLabelText('copy-l1')).toBeInTheDocument();
    expect(screen.getByLabelText('revoke-l1')).toBeInTheDocument();
  });

  it("copies a license key to clipboard", async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/api/auth/me') return Promise.resolve({ data: { user: { id: 'u1', email: 'a@b.com', memberships: [{ orgId: 'org1', role: 'owner' }] } } });
      if (url === '/api/licenses') return Promise.resolve({ data: { licenses: [{ id: "l1", name: "L1", key: "LIC-AAA" }] } });
      return Promise.resolve({ data: {} });
    });
    (navigator as any).clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/licenses"]}>
          <Routes>
            <Route path="/licenses" element={<LicenseList />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());
    fireEvent.click(screen.getByLabelText('copy-l1'));

    await waitFor(() => expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith('LIC-AAA'));
    expect(screen.getByText(/Copied!/)).toBeInTheDocument();
  });

  it("revokes a license after confirmation", async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/api/auth/me') return Promise.resolve({ data: { user: { id: 'u1', email: 'a@b.com', memberships: [{ orgId: 'org1', role: 'owner' }] } } });
      if (url === '/api/licenses') return Promise.resolve({ data: { licenses: [{ id: "l1", name: "L1", key: "LIC-AAA" }] } });
      return Promise.resolve({ data: {} });
    });
    mockedApi.post.mockResolvedValueOnce({ data: { license: { id: "l1", revoked: true } } });
    // After revoke, the list is re-fetched - adjust implementation for sequential call
    mockedApi.get.mockImplementationOnce((url: string) => {
      if (url === '/api/licenses') return Promise.resolve({ data: { licenses: [{ id: "l1", name: "L1", key: "LIC-AAA", revoked: true }] } });
      return Promise.resolve({ data: {} });
    });

    vi.spyOn(window, 'confirm').mockImplementation(() => true);

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/licenses"]}>
          <Routes>
            <Route path="/licenses" element={<LicenseList />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalled());
    fireEvent.click(screen.getByLabelText('revoke-l1'));

    await waitFor(() => expect(mockedApi.post).toHaveBeenCalledWith('/api/licenses/l1/revoke'));
    // Ensure the list was re-fetched
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/api/licenses'));
    await screen.findByText(/revoked/i);
  });

  it("creates a license", async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/api/auth/me') return Promise.resolve({ data: { user: { id: 'u1', email: 'a@b.com', memberships: [{ orgId: 'org1', role: 'owner' }] } } });
      return Promise.resolve({ data: {} });
    });
    mockedApi.post.mockResolvedValueOnce({ data: { license: { id: "l2", name: "L2", key: "LIC-BBB" } } });
    const { container } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/licenses/new"]}>
          <Routes>
            <Route path="/licenses/new" element={<CreateLicense />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    fireEvent.change(container.querySelector('input')!, { target: { value: 'L2' } });
    // wait for auth to be fetched and role available
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/api/auth/me'));
    fireEvent.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => expect(mockedApi.post).toHaveBeenCalledWith('/api/licenses', { name: 'L2' }));
  });
});
