export const withTimeout = async <T>(
	promise: Promise<T>,
	ms: number,
	message: string,
) => {
	let timer: NodeJS.Timeout | undefined;

	const timeout = new Promise((_resolve, reject) => {
		timer = setTimeout(() => reject(new Error(message)), ms);
	});

	return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};
