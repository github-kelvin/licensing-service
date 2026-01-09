import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface TokenPayload {
  userId: string;
  orgId?: string | null;
  iat?: number;
  exp?: number;
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { memberships: { include: { org: true } } } });
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
