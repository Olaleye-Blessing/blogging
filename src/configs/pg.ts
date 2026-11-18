import PG from "pg";
import { envData } from "../lib/env";
import { logger } from "../lib/logger";

const pool = new PG.Pool({
  connectionString: envData.POSTGRES_URL,
  max: 15,
});

pool.on("connect", client => {
  // logger.info(client, "Postgres DB CLIENT connected");
})

pool.on("release", (_, client) => {
  // logger.info(client, "Postgres DB CLIENT released");
})


pool.on("error", client => {
  // logger.info(client, "Postgres DB CLIENT error");
})

export { pool };
