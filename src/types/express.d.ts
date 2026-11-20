import "express-session";
import { UserDB } from "../respositories/auth";

declare module "express-session" {
	interface SessionData {
		userId: string;
		csrfToken: string;
	}
}

declare global {
	namespace Express {
		interface Request {
			user?: UserDB;
		}
	}
}
