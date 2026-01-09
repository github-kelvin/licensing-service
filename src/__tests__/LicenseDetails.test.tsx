import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LicenseDetails from "../components/LicenseDetails";
import { AuthProvider } from "../context/AuthProvider";
import api from "../api";

vi.mock("../api");
const mockedApi = api as any;

test("shows license details and allows copy and revoke", async () => {
  localStorage.setItem('token', 'test.token');
  mockedApi.get.mockImplementation((url: string) => {
    if (url === '/api/auth/me') return Promise.resolve({ data: { user: { id: 'u1', email: 'a@b.com', memberships: [{ orgId: 'org1', role: 'owner' }] } } });
    if (url === '/api/licenses/l1') return Promise.resolve({ data: { license: { id: 'l1', name: 'L1', key: 'LIC-XYZ', metadata: {}, createdBy: { email: 'a@b.com' } } } });
    return Promise.resolve({ data: {} });
  });
  mockedApi.post.mockResolvedValueOnce({ data: { license: { id: 'l1', revoked: true } } });
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
  (navigator as any).clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };

  render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/licenses/l1"]}>
        <Routes>
          <Route path="/licenses/:id" element={<LicenseDetails />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

  await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/api/licenses/l1'));
  expect(screen.getByText(/L1/)).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Copy key/i));
  await waitFor(() => expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith('LIC-XYZ'));

  fireEvent.click(screen.getByText(/Revoke/i));
  await waitFor(() => expect(mockedApi.post).toHaveBeenCalledWith('/api/licenses/l1/revoke'));
  localStorage.removeItem('token');
});
