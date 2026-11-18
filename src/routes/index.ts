import express, { Router } from "express";
import { sendResponse } from "../utils/response";
import { healthRoutes } from "./health";

export const apiRoutes = Router();

apiRoutes.use("/health", healthRoutes);

apiRoutes.use(express.json());
apiRoutes.use(express.urlencoded({ extended: true }));
