interface AppErrorOptions {
  details?: unknown;
  retryAfterSeconds?: number;
  cause?: unknown;
}

export interface FieldError {
	field: string;
	message: string;
}

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: unknown;
  readonly retryAfterSeconds: number | undefined;

  constructor(status: number, code: string, message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.details = options.details;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, code = 'not_found') {
    super(404, code, `${resource} not found`);
  }
}

export class UnAuthorizedError extends AppError {
  constructor(message = "Authentication Required") {
    super(401, "unauthorized", message);
  }
}

export class ValidationError extends AppError {
	constructor(errors: FieldError[], message = "Request validation failed") {
		super(400, "validation_failed", message, { details: errors });
	}
}

export class TooManyRequestsError extends AppError {
	constructor(message = "Too many requests, please try again later.") {
		super(429, "too_many_requests", message);
	}
}

export class InternalServerError extends AppError {
	constructor(message = "Internal server error, please try again later.") {
		super(500, "unknown", message);
	}
}

export class CsrfError extends AppError {
  constructor(message = "CRSF token is invalid") {
    super(403, "invalid_csrf_token", message);
  }
}

export class BadOriginError extends AppError {
  constructor() {
    super(403, "bad_origin", "Origin not allowed");
  }
}
