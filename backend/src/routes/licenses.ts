import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import prisma from "../prisma";
import { generateLicenseKey } from "../utils/license";

const router = Router();

// List licenses for org
router.get("/", requireAuth, async (req, res) => {
  try {
    const raw = req.tokenPayload?.orgId ?? req.query.orgId ?? req.body?.orgId;
    const orgId = typeof raw === 'string' ? raw : Array.isArray(raw) ? String(raw[0]) : undefined;
    if (!orgId) return res.status(400).json({ error: "orgId required" });
    const licenses = await prisma.license.findMany({ where: { orgId } });
    res.json({ licenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal" });
  }
});

// Create license
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, metadata, orgId: bodyOrgId } = req.body;
    const orgId = req.tokenPayload?.orgId || bodyOrgId;
    if (!orgId) return res.status(400).json({ error: "orgId required" });
    // Authorization: user must belong to org
    const membership = req.user!.memberships!.find((m) => m.orgId === orgId);
    if (!membership) return res.status(403).json({ error: "Forbidden" });

    const key = generateLicenseKey();
    const license = await prisma.license.create({ data: { name, key, metadata: metadata || {}, orgId, createdById: req.user!.id } });
    res.status(201).json({ license });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal" });
  }
});

// Revoke license
router.post("/:id/revoke", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const license = await prisma.license.findUnique({ where: { id }, include: { org: true } });
    if (!license) return res.status(404).json({ error: "Not found" });
    const orgId = license.orgId;
    const membership = req.user!.memberships!.find((m) => m.orgId === orgId);
    if (!membership) return res.status(403).json({ error: "Forbidden" });
    // Only owner/admin can revoke
    if (!["owner", "admin"].includes(membership.role)) return res.status(403).json({ error: "Insufficient role" });
    const updated = await prisma.license.update({ where: { id }, data: { revoked: true } });
    res.json({ license: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal" });
  }
});

// Validate license key
router.post("/validate", async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ valid: false });
    const lic = await prisma.license.findUnique({ where: { key } });
    if (!lic || lic.revoked) return res.json({ valid: false });
    res.json({ valid: true, license: lic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false });
  }
});

// License details
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const lic = await prisma.license.findUnique({ where: { id }, include: { createdBy: true, org: true } });
    if (!lic) return res.status(404).json({ error: "Not found" });
    res.json({ license: lic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal" });
  }
});

export default router;
