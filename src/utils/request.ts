import { NextFunction, Request, Response } from "express";

type Fn = (
	req: Request,
	res: Response,
	next: NextFunction,
) => Promise<Response | void>;

export const requestAsync = (fn: Fn) => {
	return (req: Request, res: Response, next: NextFunction) =>
		fn(req, res, next).catch(next);
};
