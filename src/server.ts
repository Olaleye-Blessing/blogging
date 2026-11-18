import { app } from "./app";
import { envData } from "./lib/env";
import { logger } from "./lib/logger";

const server = app.listen(envData.PORT, () => {
  logger.info(`Server listening on port ${envData.PORT}`);
})

process.on("unhandledRejection", (err) => {
  logger.error(err, "Unhandled rejection");

  server.close(() => {
    process.exit(1);
  })
})
