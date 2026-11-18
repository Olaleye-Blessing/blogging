import express from "express";
import { globalErrorHandler, routeNotFoundHandler } from "./lib/errors/handlers";
import { apiRoutes } from "./routes";
import { pinoHttp } from "pino-http";
import { logger } from "./lib/logger";
import { randomUUID } from "node:crypto";
import { lifecycle } from "./lib/lifecycle";

const REQUEST_ID = /^[\w-]{1,64}$/;
const app = express();

app.disable("x-powered-by");

app.use(
	pinoHttp({
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
	}),
);

app.use((_req, res, next) => {
	if (lifecycle.shuttingDown) res.set("Connection", "close");
	next();
});

app.use("/api", apiRoutes);

app.use(routeNotFoundHandler);
app.use(globalErrorHandler)

export { app };
