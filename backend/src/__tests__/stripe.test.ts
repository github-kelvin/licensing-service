/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { processStripeEvent } from '../services/stripe';
import prisma from '../prisma';

vi.mock('../prisma', () => ({ default: { payment: { create: vi.fn() } } }));

describe('processStripeEvent', () => {
  it('creates a payment record for checkout.session.completed', async () => {
    const evt = { type: 'checkout.session.completed', data: { object: { id: 'sess_1', amount_total: 5000, currency: 'USD', metadata: { orgId: 'org1' } } } };
    (prisma.payment.create as any).mockResolvedValue({ id: 'p1' });
    const res = await processStripeEvent(evt as any);
    expect(prisma.payment.create).toHaveBeenCalled();
    expect(res).toEqual({ id: 'p1' });
  });

  it('returns null for unhandled event types', async () => {
    const evt = { type: 'customer.created', data: { object: {} } };
    const res = await processStripeEvent(evt as any);
    expect(res).toBeNull();
  });
});