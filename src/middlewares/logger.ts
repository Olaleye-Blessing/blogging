import { pinoHttp } from "pino-http";
import { randomUUID } from "node:crypto";
import { logger } from "../lib/logger";

const REQUEST_ID = /^[\w-]{1,64}$/;

export const httpLogger = pinoHttp({
	logger,
	genReqId: (req, res) => {
		const incoming = req.headers["x-request-id"];
		const id =
			typeof incoming === "string" && REQUEST_ID.test(incoming)
				? incoming
				: randomUUID();

		res.setHeader("X-Request-Id", id);

		return id;
	},
	customLogLevel: (_req, res, err) =>
		err || res.statusCode >= 500
			? "error"
			: res.statusCode >= 400
				? "warn"
				: "info",
	autoLogging: {
		ignore: (req) => req.url?.startsWith("/health") ?? false,
	},
});
