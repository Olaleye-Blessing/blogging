import express, { Router } from "express";
import { sendResponse } from "../utils/response";
import { healthRoutes } from "./health";
import { authRoutes } from "./auth";
import { csrfRoute } from "./csrf";
import { authSession } from "../middlewares/session";
import { authenticated } from "../middlewares/auth";
import { requireCsrf } from "../middlewares/csrf";
import rateLimit from "express-rate-limit";
import { baseRateLimit } from "../lib/rate-limit";
import { ONE_MINUTE } from "../utils/time-units";
import { postRoutes } from "./post";

const csrfLimiter = rateLimit({
	...baseRateLimit,
	windowMs: ONE_MINUTE,
	limit: 30,
});

export const apiRoutes = Router();

apiRoutes.use("/health", healthRoutes);

apiRoutes.use(express.json());
// apiRoutes.use(express.urlencoded({ extended: true }));

apiRoutes.use("/csrf-token", csrfLimiter, authSession, csrfRoute);

apiRoutes.use(authSession);
apiRoutes.use(requireCsrf);

apiRoutes.use("/auth", authRoutes);

apiRoutes.use("/posts", postRoutes);
