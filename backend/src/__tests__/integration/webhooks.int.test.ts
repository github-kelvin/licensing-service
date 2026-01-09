process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/licensing';
process.env.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_key';

import request from 'supertest';
import app from '../../index';
import prisma from '../../prisma';
import crypto from 'crypto';
import { beforeEach, afterAll, describe, it, expect } from 'vitest';

function stripeSignature(payload: string, secret: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signed = `${timestamp}.${payload}`;
  const sig = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  return `t=${timestamp},v1=${sig}`;
}

describe('Integration: Webhooks (Stripe)', () => {
  beforeEach(async () => {
    await prisma.payment.deleteMany();
    await prisma.license.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('processes checkout.session.completed and creates a payment', async () => {
    // create org via signup
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'stripe@example.com', password: 'password', name: 'Stripe User', orgName: 'StripeOrg' })
      .expect(201);

    // find org
    const org = await prisma.organization.findFirst({ where: { name: 'StripeOrg' } });
    expect(org).toBeTruthy();

    const evt = {
      id: 'evt_test_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_1',
          amount_total: 1234,
          currency: 'usd',
          metadata: { orgId: org!.id }
        }
      }
    };

    const payload = JSON.stringify(evt);
    const sig = stripeSignature(payload, process.env.STRIPE_WEBHOOK_SECRET!);

    await request(app)
      .post('/api/webhooks/stripe')
      .set('stripe-signature', sig)
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(200);

    const payment = await prisma.payment.findFirst({ where: { providerId: 'cs_test_1' } });
    expect(payment).toBeTruthy();
    expect(payment?.amount).toBe(1234);
    expect(payment?.orgId).toBe(org!.id);
  });
});
