import "express";

declare module "express-serve-static-core" {
  interface Request {
    // Prisma User with memberships included in queries
    user?: import('@prisma/client').User & { memberships?: import('@prisma/client').Membership[] };
    tokenPayload?: { userId: string; orgId?: string | null; iat?: number; exp?: number };
  }
}
