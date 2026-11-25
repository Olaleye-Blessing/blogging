import { pool } from "../configs/pg";
import { Pagination } from "../utils/pagination";
import { UserDB } from "./auth";

export interface PostDb {
	id: string;
	title: string;
	body: string;
	author_id: string;
	created_at: string;
	updated_at: string;
	archived_at: string | null;
	deleted_at: string | null;
	status: "published" | "archived" | "deleted";
	visibility: "public" | "followers-only";
	comment_policy: "none" | "public" | "followers-only";
}

export interface PostDbWithAuthorDetail extends Omit<PostDb, "author_id"> {
	author: Pick<UserDB, "id" | "first_name" | "last_name">;
}

type Filter = Partial<
	Pick<
		PostDb,
		| "title"
		| "body"
		| "author_id"
		| "status"
		| "visibility"
		| "comment_policy"
	>
>;

const buildWhere = (filter: Filter) => {
	// TODO: Update the visibility when there is an endpoint to follow authors
	const where = ["posts.status = 'published'", "posts.visibility = 'public'"];
	const params: unknown[] = [];

	if (filter?.title) {
		params.push(`%${filter.title}%`);
		where.push(`posts.title ILIKE $${params.length}`);
	}

	if (filter?.body) {
		params.push(`%${filter.body}%`);
		where.push(`posts.body ILIKE $${params.length}`);
	}

	if (filter?.comment_policy) {
		params.push(filter.comment_policy);
		where.push(`posts.comment_policy = $${params.length}`);
	}

	if (filter?.status) {
		params.push(filter.status);
		where.push(`posts.status = $${params.length}`);
	}

	if (filter?.visibility) {
		params.push(filter.visibility);
		where.push(`posts.visibility = $${params.length}`);
	}

	if (filter?.author_id) {
		params.push(filter.author_id);
		where.push(`posts.author_id = $${params.length}`);
	}

	return {
		where: where.join(" AND "),
		params,
	};
};

export const createDbPost = async (
	post: Pick<
		PostDb,
		| "title"
		| "body"
		| "author_id"
		| "status"
		| "comment_policy"
		| "visibility"
	>,
): Promise<PostDb | null> => {
	const { rows } = await pool.query<PostDb>(
		`
    INSERT INTO posts (title,body,author_id,status,comment_policy,visibility)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
    `,
		[
			post.title,
			post.body,
			post.author_id,
			post.status,
			post.comment_policy,
			post.visibility,
		],
	);

	return rows?.[0] || null;
};

export const getAllDbPosts = async ({
	page,
	perPage,
	...filter
}: Filter & Pagination) => {
	const builder = buildWhere(filter);

	const [rows, counts] = await Promise.all([
		pool.query<PostDbWithAuthorDetail>(
			`
    SELECT
			posts.id,
			posts.title,
			posts.body,
			posts.status,
			posts.comment_policy,
			posts.visibility,
			posts.created_at,
			posts.updated_at,
			posts.archived_at,
			json_build_object(
				'id', users.id,
				'first_name', users.first_name,
				'last_name', users.last_name
			) AS author
    FROM posts
		LEFT JOIN users
		ON posts.author_id = users.id
    WHERE ${builder.where}
    ORDER BY posts.created_at, posts.id DESC
    LIMIT $${builder.params.length + 1}
    OFFSET $${builder.params.length + 2}
    `,
			[...builder.params, perPage, (page - 1) * perPage],
		),
		pool.query(
			`
      SELECT COUNT(*) AS total
      FROM posts
      WHERE ${builder.where}
      `,
			builder.params,
		),
	]);

	return {
		posts: rows.rows,
		total: Number(counts.rows[0].total),
	};
};

export const getUndeletedDbPostById = async (
	postId: string,
): Promise<PostDb | null> => {
	const result = await pool.query<PostDb>(
		`
    SELECT
			posts.title,
			posts.body,
			posts.status,
			posts.comment_policy,
			posts.visibility,
			posts.created_at,
			posts.updated_at,
			posts.archived_at,
			json_build_object(
				'id', users.id,
				'first_name', users.first_name,
				'last_name', users.last_name
			) AS author
    FROM posts
		LEFT JOIN users
		ON posts.author_id = users.id
    WHERE posts.status <> 'deleted' AND posts.id = $1
    `,
		[postId],
	);

	return result.rows?.[0] || null;
};

export const getUndeletedAuthorDbPostById = async (
	postId: string,
	authorId: string,
): Promise<Omit<PostDb, "deleted_at"> | null> => {
	const { rows } = await pool.query<PostDb>(
		`
    SELECT title, body, author_id, status, comment_policy, visibility, created_at, updated_at, archived_at
    FROM posts
    WHERE status <> 'deleted' AND id = $1 AND author_id = $2
    `,
		[postId, authorId],
	);

	return rows?.[0] || null;
};

export const archiveDbPost = async (
	payload: Pick<PostDb, "id" | "author_id">,
): Promise<PostDb | null> => {
	const result = await pool.query<PostDb>(
		`
    UPDATE posts
    SET status = 'archived',
        updated_at = NOW(),
        archived_at = NOW()
    WHERE status <> 'deleted' AND id = $1 AND author_id = $2
    RETURNING *
    `,
		[payload.id, payload.author_id],
	);

	return result.rows?.[0] || null;
};

export const changeDbPostVisibilityAndOrCommentPolicy = async (
	payload: Pick<PostDb, "id" | "author_id"> &
		Partial<Pick<PostDb, "visibility" | "comment_policy">>,
): Promise<PostDb | null> => {
	const result = await pool.query<PostDb>(
		`
    UPDATE posts
    SET visibility = COALESCE($3, visibility),
        comment_policy = COALESCE($4, comment_policy),
        updated_at = NOW()
    WHERE status <> 'deleted' AND id = $1 AND author_id = $2
    RETURNING *
    `,
		[
			payload.id,
			payload.author_id,
			payload.visibility,
			payload.comment_policy,
		],
	);

	return result.rows[0] || null;
};

export const deleteDbPost = async (
	payload: Pick<PostDb, "id" | "author_id">,
): Promise<PostDb | null> => {
	const result = await pool.query<PostDb>(
		`
    UPDATE posts
    SET status = 'deleted',
        updated_at = NOW(),
        deleted_at = NOW()
    WHERE status <> 'deleted' AND id = $1 AND author_id = $2
    RETURNING *
    `,
		[payload.id, payload.author_id],
	);

	return result.rows?.[0] || null;
};
