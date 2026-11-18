// Process-wide state shared by the readiness probe and the shutdown handler.
export const lifecycle = {
	shuttingDown: false,
};
