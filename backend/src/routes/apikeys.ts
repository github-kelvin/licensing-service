import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import prisma from "../prisma";
import { generateApiKey } from "../utils/license";
import { requireOrgRole } from "../middleware/roles";

const router = Router();

// List api keys for org (members can view)
router.get("/", requireAuth, async (req, res) => {
  try {
    const raw = req.tokenPayload?.orgId ?? req.query.orgId ?? req.body?.orgId;
    const orgId = typeof raw === 'string' ? raw : Array.isArray(raw) ? String(raw[0]) : undefined;
    if (!orgId) return res.status(400).json({ error: "orgId required" });
    const keys = await prisma.apiKey.findMany({ where: { orgId } });
    res.json({ keys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal" });
  }
});

// Create api key (owner/admin only)
router.post("/", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
  try {
    const { name } = req.body;
    const orgId = req.tokenPayload?.orgId || req.body.orgId;
    const key = generateApiKey();
    const apiKey = await prisma.apiKey.create({ data: { name, key, orgId, createdById: req.user!.id } });
    res.status(201).json({ apiKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal" });
  }
});

// Revoke api key (owner/admin only)
router.post("/:id/revoke", requireAuth, requireOrgRole(["owner", "admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const apiKey = await prisma.apiKey.findUnique({ where: { id } });
    if (!apiKey) return res.status(404).json({ error: "Not found" });
    const updated = await prisma.apiKey.update({ where: { id }, data: { revoked: true } });
    res.json({ apiKey: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal" });
  }
});

export default router;