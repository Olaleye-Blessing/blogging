import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "../configs/pg";
import { envData } from "../lib/env";
import { ONE_HOUR, ONE_MINUTE } from "../utils/time-units";

const PgStore = connectPgSimple(session);

export const USER_SESSION_COOKIE_NAME = "sid";

export const authSession = session({
	store: new PgStore({
		pool,
		createTableIfMissing: true,
		tableName: "user_login_sessions",
		pruneSessionInterval: 5 * 60, // 5 mins
	}),
	name: USER_SESSION_COOKIE_NAME,
	secret: envData.LOGIN_SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	rolling: true,
	cookie(_req) {
		return {
			httpOnly: true,
			secure: envData.NODE_ENV === "production",
			maxAge:
				envData.NODE_ENV === "production"
					? 2 * ONE_HOUR
					: 10 * ONE_MINUTE,
			sameSite: "lax",
		};
	},
});
