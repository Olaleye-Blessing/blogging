import { RequestHandler } from "express";
import { z } from "zod";
import { parseData } from "../lib/validate";
import { sendResponse } from "../utils/response";
import {
	archiveDbPost,
	changeDbPostVisibilityAndOrCommentPolicy,
	createDbPost,
	deleteDbPost,
	getAllDbPosts,
	getUndeletedAuthorDbPostById,
	getUndeletedDbPostById,
} from "../respositories/post";
import { AppError, NotFoundError } from "../lib/errors/app-error";
import { paginationSchema } from "../utils/pagination";
import { requestAsync } from "../utils/request";

const postBaseSchema = z.object({
	title: z
		.string({ error: "Title is required" })
		.trim()
		.min(1, "Title is required!")
		.max(200, "Title can't exceed 200 characters"),
	body: z
		.string({ error: "Body is required!" })
		.trim()
		.min(1, "Body is required"),
	status: z.enum(["published", "archived", "deleted"]).default("published"),
	visibility: z.enum(["public", "followers-only"]).default("public"),
	comment_policy: z
		.enum(["public", "followers-only", "none"])
		.default("public"),
});

const createPostSchema = postBaseSchema.superRefine((data, ctx) => {
	if (data.visibility !== "public" && data.comment_policy === "public") {
		ctx.addIssue({
			code: "custom",
			path: ["comment_policy"],
			message:
				"Followers-only posts can only have 'followers-only' or 'none' comment policy",
		});
	}
});

const getPostsSchema = z
	.object({
		status: postBaseSchema.shape.status.unwrap().optional(),
		visibility: postBaseSchema.shape.visibility.unwrap().optional(),
		comment_policy: postBaseSchema.shape.comment_policy.unwrap().optional(),
		title: z.string().optional(),
		body: z.string().optional(),
	})
	.extend(paginationSchema.shape);

const visibilityCommentPolicySchema = z
	.object({
		visibility: postBaseSchema.shape.visibility.unwrap().optional(),
		comment_policy: postBaseSchema.shape.comment_policy.unwrap().optional(),
	})
	.superRefine(({ visibility, comment_policy }, ctx) => {
		if (visibility === undefined && comment_policy === undefined) {
			ctx.addIssue({
				code: "custom",
				message:
					"Provide at least one of 'visibility' or 'comment_policy'",
			});
			return;
		}

		if (
			visibility !== undefined &&
			comment_policy !== undefined &&
			visibility !== "public" &&
			comment_policy === "public"
		) {
			ctx.addIssue({
				code: "custom",
				path: ["comment_policy"],
				message:
					"Followers-only posts can only have 'followers-only' or 'none' comment policy",
			});
		}
	});

export const getAll: RequestHandler = requestAsync(async (req, res, next) => {
	const query = parseData(getPostsSchema, req.query);

	const { posts, total } = await getAllDbPosts(query);

	sendResponse({
		data: {
			posts,
			metadata: {
				page: query.page,
				perPage: query.perPage,
				count: posts.length,
				total,
			},
		},
		res,
	});
});

export const getOne: RequestHandler = requestAsync(async (req, res, next) => {
	const post = await getUndeletedDbPostById(req.params.id as string);

	if (!post) return next(new NotFoundError("Post"));

	sendResponse({
		data: { post },
		res,
	});
});

export const create: RequestHandler = requestAsync(async (req, res, next) => {
	const payload = {
		...parseData(createPostSchema, req.body || {}),
		author_id: req.user!.id,
	};

	const post = await createDbPost(payload);

	sendResponse({
		data: { post },
		res,
		status: 201,
	});
});

export const archive: RequestHandler = requestAsync(async (req, res, next) => {
	const postId = req.params.id as string;
	let post = await getUndeletedAuthorDbPostById(postId, req.user!.id);

	if (!post) return next(new NotFoundError("Post"));

	if (post.status === "archived")
		return next(new AppError(400, "bad_request", "Post has been archive"));

	post = await archiveDbPost({
		id: postId,
		author_id: req.user!.id,
	});

	if (!post) return next(new NotFoundError("Post"));

	sendResponse({
		data: { post },
		res,
	});
});

export const changeVisibilityCommentPolicy = requestAsync(
	async (req, res, next) => {
		const postId = req.params.id as string;
		const payload = parseData(visibilityCommentPolicySchema, req.body);

		const post = await changeDbPostVisibilityAndOrCommentPolicy({
			id: postId,
			author_id: req.user!.id,
			...payload,
			// comment_policy: "followers-only",
			// visibility: "followers-only",
		});

		if (!post) return next(new NotFoundError("Post"));

		sendResponse({
			data: { post },
			res,
		});
	},
);

export const deleteOne: RequestHandler = requestAsync(
	async (req, res, next) => {
		const postId = req.params.id as string;
		const author_id = req.user!.id;

		let post = await getUndeletedAuthorDbPostById(postId, author_id);

		if (!post) return next(new NotFoundError("Post"));

		post = await deleteDbPost({ id: postId, author_id });

		if (!post) return next(new NotFoundError("Post"));

		sendResponse({
			data: undefined,
			res,
			status: 204,
		});
	},
);
