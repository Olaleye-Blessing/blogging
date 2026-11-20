import { envData } from "./env";

export const CORS_ALLOWED_ORIGIN = [envData.NODE_ENV === "production" ? "" : "http://localhost:5173"];
