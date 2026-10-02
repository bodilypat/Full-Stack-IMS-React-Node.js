/* ************************** */
/* File: src/config/logger.js */
/* ************************** */

/* Centralized application logger. */
'use strict';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
let activeLevel = levels[String(process.env.LOG_LEVEL || 'info').toLowerCase()];
if (activeLevel === undefined) activeLevel = levels.info;

function normalize(value) {
	if (value instanceof Error) {
		return { name: value.name, message: value.message, stack: value.stack };
	}
	return value;
}

function log(level, args) {
	if (levels[level] > activeLevel) return;

	const [message, ...details] = args;
	const record = {
		timestamp: new Date().toISOString(),
		level,
		message: message instanceof Error ? message.message : String(message == null ? '' : message),
	};

	if (message instanceof Error) record.error = normalize(message);
	if (details.length === 1 && details[0] && typeof details[0] === 'object' && !Array.isArray(details[0])) {
		Object.assign(record, normalize(details[0]));
	} else if (details.length) {
		record.details = details.map(normalize);
	}

	const stream = level === 'error' ? process.stderr : process.stdout;
	stream.write(`${JSON.stringify(record)}\n`);
}

const logger = {};
Object.keys(levels).forEach((level) => {
	logger[level] = (...args) => log(level, args);
});

logger.setLevel = (level) => {
	const normalized = String(level).toLowerCase();
	if (!Object.prototype.hasOwnProperty.call(levels, normalized)) {
		throw new RangeError(`Invalid log level: ${level}`);
	}
	activeLevel = levels[normalized];
};

module.exports = logger;

