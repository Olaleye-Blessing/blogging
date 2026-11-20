import { RequestHandler } from "express";
import { UnAuthorizedError } from "../lib/errors/app-error";
import { getUserById } from "../respositories/auth";

export const authenticated: RequestHandler = async (req, _res, next) => {
  if (!req.session.userId) return next(new UnAuthorizedError());

  const user = await getUserById(req.session.userId);

  if (!user) {
    return req.session.destroy(() => next(new UnAuthorizedError()));
  }

  req.user = user;

  next();
}
