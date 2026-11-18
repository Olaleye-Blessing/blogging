interface AppErrorOptions {
  details?: unknown;
  retryAfterSeconds?: number;
  cause?: unknown;
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
