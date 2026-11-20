import cors from "cors";
import { CORS_ALLOWED_ORIGIN } from "../lib/cors";

export const appCors = cors({
	origin: (origin, cb) =>
		cb(null, !origin || CORS_ALLOWED_ORIGIN.includes(origin)),
	credentials: true,
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
	allowedHeaders: ["Content-Type", "X-CSRF-Token"],
});
