import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "../prisma";
import { signToken } from "../utils/jwt";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Signup: create user, create org and membership (owner), return stateless JWT with userId and orgId
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, orgName } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "User already exists" });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name } });
    const org = await prisma.organization.create({ data: { name: orgName || `${name || email}'s org`, memberships: { create: { userId: user.id, role: "owner" } } } });
    const token = signToken({ userId: user.id, orgId: org.id });
    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// Login: verify credentials and return JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });
    const user = await prisma.user.findUnique({ where: { email }, include: { memberships: true } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });
    const firstOrgId = user.memberships[0]?.orgId;
    const token = signToken({ userId: user.id, orgId: firstOrgId });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error" });
  }
});

// Current user
router.get("/me", requireAuth, async (req, res) => {
  type MembershipWithOrg = import('@prisma/client').Membership & { org?: import('@prisma/client').Organization };
  type UserWithMemberships = import('@prisma/client').User & { memberships?: MembershipWithOrg[] };
  const user = req.user! as UserWithMemberships;
  // intentionally discard password before returning user object
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...rest } = user;
  const orgs = (user.memberships || []);
  res.json({ user: rest, orgs: orgs.map((m) => m.org) });
});

export default router;
