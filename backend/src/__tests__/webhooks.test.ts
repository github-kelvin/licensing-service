/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { handleStripeEvent } from '../routes/webhooks.handlers';
import prisma from '../prisma';

vi.mock('../prisma', () => ({ default: { payment: { create: vi.fn() } } }));

describe('webhook handlers', () => {
  it('handles a checkout.session.completed event', async () => {
    const evt = { type: 'checkout.session.completed', data: { object: { id: 'sess_1', amount_total: 3000, currency: 'usd', metadata: { orgId: 'org1' } } } };
    (prisma.payment.create as any).mockResolvedValue({ id: 'p1' });
    const r = await handleStripeEvent(evt as any);
    expect(prisma.payment.create).toHaveBeenCalled();
    expect(r).toEqual({ id: 'p1' });
  });
});