import { Router } from "express";
import prisma from "../prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

// List orgs for authenticated user
router.get("/", requireAuth, async (req, res) => {
  type MembershipWithOrg = import('@prisma/client').Membership & { org?: import('@prisma/client').Organization };
  const orgs = (req.user!.memberships || []) as MembershipWithOrg[];
  res.json({ orgs: orgs.map((m) => m.org) });
});

// Create org and add current user as owner
router.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;
  const org = await prisma.organization.create({ data: { name, memberships: { create: { userId: req.user!.id, role: "owner" } } } });
  res.status(201).json(org);
});

export default router;
