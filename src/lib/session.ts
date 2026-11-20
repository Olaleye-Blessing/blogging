import { type Request } from "express";

export const regenerateSession = (req: Request) =>
  new Promise<void>((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve())),
  );

export const saveSession = (req: Request) =>
  new Promise<void>((resolve, reject) =>
    req.session.save((err) => (err ? reject(err) : resolve())),
  );
