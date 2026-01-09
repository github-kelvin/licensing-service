/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { requireOrgRole } from '../middleware/roles';

function mockReq(membership: any, orgId?: string) {
  return { user: { memberships: [membership] }, tokenPayload: { orgId } } as any;
}

function mockRes() {
  return { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
}

describe('requireOrgRole middleware', () => {
  it('allows when role matches', () => {
    const mw = requireOrgRole(['owner', 'admin']);
    const req = mockReq({ orgId: 'o1', role: 'owner' }, 'o1');
    const res = mockRes();
    let called = false;
    mw(req, res, () => { called = true; });
    expect(called).toBe(true);
  });

  it('forbids when role missing', () => {
    const mw = requireOrgRole(['owner']);
    const req = mockReq({ orgId: 'o1', role: 'member' }, 'o1');
    const res = mockRes();
    mw(req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(403);
  });
});