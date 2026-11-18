import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	PORT: z.coerce.number().int().positive().default(3000),
	PINO_LOG_LEVEL: z
		// .enum(["debug", "error", "fatal", "info", "silent", "trace", "warn"])
		.enum(["debug", "info"])
		.default("debug"),
	POSTGRES_URL: z.url()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("❌❌Invalid environment variables:❌❌");
	console.error(z.prettifyError(parsed.error));
	process.exit(1);
}

export const envData = parsed.data;
