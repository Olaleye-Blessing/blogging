import { z } from "zod";
import { envData } from "../lib/env";

export const paginationSchema = z.object({
	page: z.coerce
		.number({ error: "Page must be a number" })
		.int()
		.min(1)
		.default(1),
	perPage: z.coerce
		.number({ error: "perPage must be a number" })
		.int("perPage must be an integer")
		.min(1, "perPage must be at least 1")
		.max(100, "perPage can't exceed 100")
		.default(envData.NODE_ENV === "production" ? 20 : 5),
});

export type Pagination = z.infer<typeof paginationSchema>;
