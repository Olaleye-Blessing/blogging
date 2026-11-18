import { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../logger";
import { AppError, NotFoundError } from "./app-error";

export const routeNotFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route, ${req.path}, `, "not_found"));
}

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let statusCode = 500;
	let message = "Internal server error";

  if (err instanceof AppError) {
    statusCode = err.status;
    message = err.message;
  }

  logger.error(err, "Global error");

  res.status(statusCode).json({
    status: "fail",
    message,
  })
}
