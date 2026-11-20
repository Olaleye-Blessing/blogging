import { Request, RequestHandler, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { sendResponse } from "../utils/response";
import { parseData } from "../lib/validate";
import { createUser, getUserByEmail, UserDB } from "../respositories/auth";
import { AppError, InternalServerError } from "../lib/errors/app-error";
import { USER_SESSION_COOKIE_NAME } from "../middlewares/session";
import { regenerateSession, saveSession } from "../lib/session";
import { generateCsrfToken } from "../lib/csrf";

const createUserBody = z.object({
	email: z
		.string({ error: "Email is required!" })
		.trim()
		.min(1, "Email is required!")
		.max(225, "Email should not exceed 225 characters!")
		.pipe(z.email({ error: "Enter a valid email address!" })),
	password: z
		.string()
		.min(8, "Should be at least 8 characters!")
		.refine((v) => /\S/.test(v), {
			error: "Should contain at least one non-whitespace character!",
		}),
	first_name: z
		.string()
		.trim()
		.min(1, "First name is required!")
		.max(30, "First name should not exceed 30 characters"),
	last_name: z
		.string()
		.trim()
		.min(1, "Last name is required!")
		.max(30, "Last name should not exceed 30 characters"),
});

const signinBody = createUserBody.pick({ email: true }).extend({
	password: z.string().min(1, "Password is required"),
});

const SALTS_ROUND = 10;

const auntenticateUser = async (
	req: Request,
	res: Response,
	user: UserDB,
	status: number,
) => {
	await regenerateSession(req);

	const csrfToken = generateCsrfToken();

	req.session.userId = user.id;
	req.session.csrfToken = csrfToken;

	// make sure the user id is saved in session
	await saveSession(req);

	sendResponse({
		data: { user, csrfToken },
		res,
		status,
	});
};

export const signup: RequestHandler = async (req, res) => {
	const { password, ...payload } = parseData(createUserBody, req.body || {});

	const user = await createUser({
		...payload,
		password_hash: await bcrypt.hash(password, SALTS_ROUND),
	});

	await auntenticateUser(req, res, user, 201);
};

export const signin: RequestHandler = async (req, res, next) => {
	const payload = parseData(signinBody, req.body || {});

	const dbUser = await getUserByEmail(payload.email);

	if (!dbUser) {
		return next(
			new AppError(400, "authentication", "Invalid email or password"),
		);
	}

	if (!(await bcrypt.compare(payload.password, dbUser.password_hash))) {
		return next(
			new AppError(400, "authentication", "Invalid email or password"),
		);
	}

	const { password_hash, ...user } = dbUser;

	await auntenticateUser(req, res, user, 200);
};

export const signout: RequestHandler = async (req, res, next) => {
	req.session.destroy((err) => {
		if (err) return next(new InternalServerError());

		res.clearCookie(USER_SESSION_COOKIE_NAME);

		sendResponse({
			data: null,
			res,
			status: 204,
		});
	});
};
