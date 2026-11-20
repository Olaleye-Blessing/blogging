import { Router } from "express";
import * as csrfController from "../controllers/csrf";

export const csrfRoute = Router();

csrfRoute.get("/", csrfController.createCsrf);
