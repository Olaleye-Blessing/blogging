import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as authController from "./../controllers/auth";
import { baseRateLimit } from "../lib/rate-limit";
import { ONE_HOUR, ONE_MINUTE } from "../utils/time-units";

export const authRoutes = Router();

const signupLimiter = rateLimit({
	...baseRateLimit,
	windowMs: ONE_HOUR,
	limit: 5,
});

const loginLimiter = rateLimit({
	...baseRateLimit,
	windowMs: 15 * ONE_MINUTE,
	limit: 10,
	skipSuccessfulRequests: true, // only failed logins count
});

authRoutes.post("/signup", signupLimiter, authController.signup);
authRoutes.post("/signin", loginLimiter, authController.signin);
authRoutes.post("/signout", authController.signout);
