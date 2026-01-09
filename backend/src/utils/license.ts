import crypto from "crypto";

export function generateLicenseKey(): string {
  // Example: LIC-4f3b2a1c
  return `LIC-${crypto.randomBytes(4).toString("hex")}`.toUpperCase();
}

export function generateApiKey(): string {
  // Example: API-<hex-12>
  return `API-${crypto.randomBytes(12).toString("hex")}`;
}