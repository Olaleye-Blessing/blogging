import { NextFunction, Request, Response } from "express";
import { TooManyRequestsError } from "./errors/app-error";

export const baseRateLimit = {
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
	handler: (_req: Request, _res: Response, next: NextFunction) =>
		next(new TooManyRequestsError()),
} as const;
