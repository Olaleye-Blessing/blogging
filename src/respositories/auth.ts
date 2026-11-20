import { pool } from "../configs/pg";

interface UserCreatePayload {
	email: string;
	password_hash: string;
	first_name: string;
	last_name: string;
}

export interface UserDB extends Omit<UserCreatePayload, "password_hash"> {
	id: string;
	created_at: string;
	updated_at: string;
}

interface UserDBWithPwd extends UserDB {
	password_hash: string;
}

export const createUser = async (user: UserCreatePayload) => {
	const { rows } = await pool.query<UserDB>(
		`
    INSERT INTO users (email, password_hash, first_name, last_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, first_name, last_name, created_at, updated_at
    `,
		[user.email, user.password_hash, user.first_name, user.last_name],
	);

	return rows[0];
};

export const getUserByEmail = async (
	email: string,
): Promise<UserDBWithPwd | null> => {
	const { rows } = await pool.query<UserDBWithPwd>(
		`
    SELECT *
    FROM users
    WHERE lower(email) = lower($1)
    LIMIT 1
    `,
		[email],
	);

	return rows[0] ?? null;
};

export const getUserById = async (
	id: string,
): Promise<UserDBWithPwd | null> => {
	const { rows } = await pool.query<UserDBWithPwd>(
		`
    SELECT *
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
		[id],
	);

	return rows[0] ?? null;
};
