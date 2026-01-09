import { Request, Response, NextFunction } from "express";

// roles: array of allowed roles (e.g., ['owner','admin'])
export function requireOrgRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const orgId = req.tokenPayload?.orgId || req.body?.orgId || req.query?.orgId;
    if (!orgId) return res.status(400).json({ error: "orgId required" });
    const membership = req.user?.memberships?.find((m) => m.orgId === orgId);
    if (!membership) return res.status(403).json({ error: "Forbidden" });
    if (!roles.includes(membership.role)) return res.status(403).json({ error: "Insufficient role" });
    next();
  };
}
