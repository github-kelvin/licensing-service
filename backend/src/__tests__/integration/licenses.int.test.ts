// Ensure DATABASE_URL is set before importing Prisma/app
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/licensing';

import request from 'supertest';
import app from '../../index';
import prisma from '../../prisma';
import { beforeEach, afterAll, describe, it, expect } from 'vitest';

describe('Integration: Licenses', () => {
  beforeEach(async () => {
    // Clean relevant tables in safe order
    await prisma.license.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('signup -> create license -> list licenses', async () => {
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'int@example.com', password: 'password', name: 'Integration', orgName: 'IntOrg' })
      .expect(201);

    expect(signupRes.body.token).toBeTruthy();
    const token = signupRes.body.token;

    const createRes = await request(app)
      .post('/api/licenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'IntLic' })
      .expect(201);

    expect(createRes.body.license).toHaveProperty('id');
    expect(createRes.body.license).toHaveProperty('key');

    const listRes = await request(app)
      .get('/api/licenses')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(listRes.body.licenses)).toBe(true);
    type License = import('@prisma/client').License;
    expect((listRes.body.licenses as License[]).some((l) => l.name === 'IntLic')).toBe(true);
  });
});
