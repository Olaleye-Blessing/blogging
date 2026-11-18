import { pool } from "../configs/pg";
import { withTimeout } from "../utils/with-timeout";

export const checkDatabase = async (timeoutMs = 1000) => {
	const started = performance.now();

	await withTimeout(
		pool.query("SELECT 1"),
		timeoutMs,
		`Database did not answer within ${timeoutMs} ms`,
	);

	return {
		latencyMs: Math.round(performance.now() - started),
		pool: {
			total: pool.totalCount,
			idle: pool.idleCount,
			waiting: pool.waitingCount,
		},
	};
};
