import pino from "pino";
import { envData } from "./env";

const isDev = envData.NODE_ENV === "development";

export const logger = pino({
	level: envData.PINO_LOG_LEVEL,
	redact: ["req.headers.authorization", "req.headers.cookie", "*.password"],
	...(isDev && {
		transport: {
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "SYS:standard",
				ignore: "pid,hostname",
			},
		},
	}),
});
