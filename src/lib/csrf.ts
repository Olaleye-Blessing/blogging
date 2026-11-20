import crypto from "node:crypto";

export const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");
