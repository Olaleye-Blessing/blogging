import type { z } from "zod";
import { FieldError, ValidationError } from "./errors/app-error";

export function zodIssuesToFieldErrors(error: z.ZodError): FieldError[] {
	return error.issues.map((issue) => ({
		field: issue.path.join(".") || "(root)",
		message: issue.message,
	}));
}

export function parseData<S extends z.ZodType>(schema: S, data: unknown) {
	const result = schema.safeParse(data);

	if (!result.success) {
		throw new ValidationError(zodIssuesToFieldErrors(result.error));
	}

	return result.data;
}
