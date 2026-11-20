import { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../logger";
import { AppError, NotFoundError } from "./app-error";
import pg from "pg";
import { parsePgError, PG_ERROR_MAP } from "./parse-pg-error";

export const routeNotFoundHandler: RequestHandler = (req, _res, next) => {
	next(new NotFoundError(`Route, ${req.path}, `, "not_found"));
};

export const globalErrorHandler: ErrorRequestHandler = (
	err,
	_req,
	res,
	_next,
) => {
	let statusCode = 500;
	let message = "Internal server error";
	let details;
	let code;

	if (err instanceof pg.DatabaseError && err.code && PG_ERROR_MAP[err.code]) {
		err = parsePgError(err);
	}

	if (err instanceof AppError) {
		statusCode = err.status;
		message = err.message;
		details = err.details;
		code = err.code;
	}

	logger.error(err, "Global error");

	res.status(statusCode).json({
		status: "fail",
		message,
		details,
		code,
	});
};
