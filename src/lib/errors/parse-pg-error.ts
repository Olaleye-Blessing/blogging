import pg from "pg";
import { logger } from "../logger";
import { AppError } from "./app-error";

export interface PgDBParsedError {
	status: number;
	code: string;
	message: string;
	retryAfterSeconds?: number;
}

export const PG_ERROR_MAP: Record<string, PgDBParsedError> = {
	"23505": {
		status: 409,
		code: "conflict",
		message: "A resource with these values already exists",
	},
};

export const parseUniqueViolationErr = (
	err: pg.DatabaseError,
): PgDBParsedError | null => {
	if (err?.code !== "23505" || !err.detail) return null;

	const match = err.detail.match(/Key \((.+?)\)=\((.+?)\) already exists\./);

	if (!match) return null;

	let fieldExpr = match[1].trim();
	const value = match[2].trim();

	fieldExpr = fieldExpr
		.replace(/^lower\((.+?)(?:::text)?\)$/i, "$1")
		.replace(/^\((.+)\)$/, "$1")
		.trim();

	return {
		status: 409,
		code: "conflict",
		message: `This ${fieldExpr}, ${value}, already exists.`,
	};
};

export const parsePgError = (err: any) => {
	logger.error("DATABASE ERROR");

	let pgdBParsedError: null | PgDBParsedError = null;

	if (err.code === "23505") {
		let dbErr = parseUniqueViolationErr(err);

		if (dbErr) {
			pgdBParsedError = { ...dbErr };
		}
	}

	if (!pgdBParsedError) {
		const pgError = PG_ERROR_MAP[err.code];

		pgdBParsedError = { ...pgError };
	}

	if (pgdBParsedError) {
		err = new AppError(
			pgdBParsedError.status,
			pgdBParsedError.code,
			pgdBParsedError.message,
			{
				retryAfterSeconds: pgdBParsedError.retryAfterSeconds,
			},
		);
	}

	return err;
};
