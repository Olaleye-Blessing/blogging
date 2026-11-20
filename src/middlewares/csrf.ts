import crypto from "node:crypto";
import { RequestHandler } from "express";
import { CORS_ALLOWED_ORIGIN } from "../lib/cors";
import { BadOriginError, CsrfError } from "../lib/errors/app-error";

const SAFE = new Set(["GET", "HEAD", "OPTIONS"]);

export const requireCsrf: RequestHandler = (req, _res, next) => {
	if (SAFE.has(req.method)) return next();

	const origin = req.headers.origin || req.get("origin");

	if (origin && !CORS_ALLOWED_ORIGIN.includes(origin)) {
		return next(new BadOriginError());
	}

	const sentToken = req.get("x-csrf-token");
	const expectedToken = req.session.csrfToken;

	if (!sentToken || typeof sentToken !== "string" || !expectedToken) {
		return next(new CsrfError("CRSF token is missing"));
	}

	const a = Buffer.from(sentToken);
	const b = Buffer.from(expectedToken);

	if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
		return next(new CsrfError());
	}

	next();
};
