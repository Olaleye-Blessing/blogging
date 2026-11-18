import { Router } from "express";
import { sendResponse } from "../utils/response";
import { checkDatabase } from "../db/health";
import { AppError } from "../lib/errors/app-error";

export const healthRoutes = Router();

healthRoutes.use('/', (_, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

healthRoutes.get("/live", async (_, res) => {
	sendResponse({ data: "Ok", res, status: 200 });
});

healthRoutes.get("/ready", async (_req, res, next) => {
  try {
    const checks = await checkDatabase();

    sendResponse({
      data: { checks },
      res,
    })
  } catch (error) {
    next(new AppError(503, "unavailable", "Unavailable"));
  }
})
