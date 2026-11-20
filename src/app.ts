import express from "express";
import {
	globalErrorHandler,
	routeNotFoundHandler,
} from "./lib/errors/handlers";
import { apiRoutes } from "./routes";
import { lifecycle } from "./lib/lifecycle";
import { httpLogger } from "./middlewares/logger";
import { envData } from "./lib/env";
import { appCors } from "./middlewares/cors";

const app = express();

if (envData.NODE_ENV === "production") app.set("trust proxy", 1);

app.disable("x-powered-by");

app.use(httpLogger);

app.use((_req, res, next) => {
	if (lifecycle.shuttingDown) res.set("Connection", "close");
	next();
});

app.use(appCors);

app.use("/api", apiRoutes);

app.use(routeNotFoundHandler);
app.use(globalErrorHandler);

export { app };
