import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ApiKeyList from "../components/ApiKeys/List";
import { AuthProvider } from "../context/AuthProvider";
import api from "../api";

vi.mock("../api");
const mockedApi = api as any;

describe('API Keys UI', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test.token');
    mockedApi.get.mockReset();
    mockedApi.post.mockReset();
  });

  afterEach(() => {
    localStorage.removeItem('token');
  });

  it('lists and copies api keys', async () => {
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/api/auth/me') return Promise.resolve({ data: { user: { id: 'u1', email: 'a@b.com', memberships: [{ orgId: 'org1', role: 'owner' }] } } });
      if (url === '/api/apikeys') return Promise.resolve({ data: { keys: [{ id: 'k1', name: 'K1', key: 'API-AAA' }] } });
      return Promise.resolve({ data: {} });
    });
    (navigator as any).clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/apikeys"]}>
          <Routes>
            <Route path="/apikeys" element={<ApiKeyList />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/api/apikeys'));
    await screen.findByText(/API-AAA/);
    fireEvent.click(screen.getByLabelText('copy-api-k1'));
    await waitFor(() => expect((navigator as any).clipboard.writeText).toHaveBeenCalledWith('API-AAA'));
  });

  it('creates and revokes api keys', async () => {
    // initial load: no keys
    mockedApi.get.mockImplementation((url: string) => {
      if (url === '/api/auth/me') return Promise.resolve({ data: { user: { id: 'u1', email: 'a@b.com', memberships: [{ orgId: 'org1', role: 'owner' }] } } });
      if (url === '/api/apikeys') return Promise.resolve({ data: { keys: [] } });
      return Promise.resolve({ data: {} });
    });
    mockedApi.post.mockResolvedValueOnce({ data: { apiKey: { id: 'k2', name: 'K2', key: 'API-BBB' } } });
    // after creation, load returns the new key
    mockedApi.get.mockResolvedValueOnce({ data: { keys: [{ id: 'k2', name: 'K2', key: 'API-BBB' }] } });

    vi.spyOn(window, 'prompt').mockImplementation(() => 'K2');
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/apikeys"]}>
          <Routes>
            <Route path="/apikeys" element={<ApiKeyList />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    // create (wait for auth to finish)
    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledWith('/api/auth/me'));
    fireEvent.click(screen.getByText(/Create API Key/));
    await waitFor(() => expect(mockedApi.post).toHaveBeenCalledWith('/api/apikeys', { name: 'K2' }));

    // wait for the new key to appear
    await screen.findByLabelText('revoke-api-k2');

    // revoke
    mockedApi.get.mockResolvedValueOnce({ data: { keys: [{ id: 'k2', name: 'K2', key: 'API-BBB', revoked: true }] } });
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    fireEvent.click(screen.getByLabelText('revoke-api-k2'));
    await waitFor(() => expect(mockedApi.post).toHaveBeenCalledWith('/api/apikeys/k2/revoke'));
  });
});
