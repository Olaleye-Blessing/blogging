import { RequestHandler } from "express";
import { sendResponse } from "../utils/response";
import { saveSession } from "../lib/session";
import { generateCsrfToken } from "../lib/csrf";

export const createCsrf: RequestHandler = async (req, res) => {
	let csrfToken = req.session.csrfToken;

	if (!csrfToken) {
		csrfToken = generateCsrfToken();
		req.session.csrfToken = csrfToken;

		await saveSession(req);
	}

	res.set("Cache-Control", "no-store");

	sendResponse({
		data: { csrfToken },
		res,
		status: 200,
	});
};
