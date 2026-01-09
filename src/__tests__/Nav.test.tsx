import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

async function loadNavWithMock(user: any) {
  vi.resetModules();
  vi.doMock('../context/AuthProvider', () => ({ useAuth: () => ({ user }) }));
  const mod = await import('../App');
  return mod.Nav as React.FC;
}

describe('Nav', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('shows login and signup when unauthenticated', async () => {
    const Nav = await loadNavWithMock(null);
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });

  it('hides login and signup when authenticated', async () => {
    const Nav = await loadNavWithMock({ id: '1' });
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    );
    expect(screen.queryByText(/Login/i)).toBeNull();
    expect(screen.queryByText(/Sign up/i)).toBeNull();
  });
});