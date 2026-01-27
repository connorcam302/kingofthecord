import pino from 'pino';

export const logger = pino({
	level: process.env.LOG_LEVEL || 'info',
	transport: {
		target: 'pino/file',
		options: { destination: 1 }
	},
	formatters: {
		level: (label) => {
			return { level: label };
		}
	},
	timestamp: pino.stdTimeFunctions.isoTime
});

export const createLogger = (name: string) => {
	return logger.child({ name });
};
