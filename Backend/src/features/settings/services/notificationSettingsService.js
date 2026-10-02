/* *************************************************************** */
/* File: #src/features/settings/services/notificationSettingsService.js */
/* *************************************************************** */

const NotificationSettings = require('../models/notificationSettingsModel');

const DEFAULT_SETTINGS = Object.freeze({
	lowStock: Object.freeze({ email: true, inApp: true }),
	outOfStock: Object.freeze({ email: true, inApp: true }),
	purchaseOrders: Object.freeze({ email: true, inApp: true }),
	sales: Object.freeze({ email: false, inApp: true }),
	expiry: Object.freeze({ email: true, inApp: true }),
});

const ALLOWED_CATEGORIES = Object.keys(DEFAULT_SETTINGS);
const ALLOWED_CHANNELS = ['email', 'inApp'];

function createError(message, statusCode = 400) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

function validateUserId(userId) {
	if (userId === undefined || userId === null || userId === '') {
		throw createError('A user ID is required.');
	}
}

function normalizeSettings(settings = {}) {
	const result = {};

	for (const category of ALLOWED_CATEGORIES) {
		const supplied = settings[category] || {};
		result[category] = {};
		for (const channel of ALLOWED_CHANNELS) {
			result[category][channel] = typeof supplied[channel] === 'boolean'
				? supplied[channel]
				: DEFAULT_SETTINGS[category][channel];
		}
	}

	return result;
}

function validateUpdate(updates) {
	if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
		throw createError('Notification settings must be an object.');
	}

	for (const [category, channels] of Object.entries(updates)) {
		if (!ALLOWED_CATEGORIES.includes(category)) {
			throw createError(`Unknown notification category: ${category}.`);
		}
		if (!channels || typeof channels !== 'object' || Array.isArray(channels)) {
			throw createError(`Settings for ${category} must be an object.`);
		}
		for (const [channel, enabled] of Object.entries(channels)) {
			if (!ALLOWED_CHANNELS.includes(channel)) {
				throw createError(`Unknown notification channel: ${channel}.`);
			}
			if (typeof enabled !== 'boolean') {
				throw createError(`${category}.${channel} must be a boolean.`);
			}
		}
	}
}

async function getNotificationSettings(userId) {
	validateUserId(userId);
	const record = await NotificationSettings.findOne({ userId });
	return {
		userId,
		settings: normalizeSettings(record && record.settings),
	};
}

async function updateNotificationSettings(userId, updates) {
	validateUserId(userId);
	validateUpdate(updates);

	const current = await NotificationSettings.findOne({ userId });
	const settings = normalizeSettings(current && current.settings);

	for (const [category, channels] of Object.entries(updates)) {
		Object.assign(settings[category], channels);
	}

	const record = await NotificationSettings.findOneAndUpdate(
		{ userId },
		{ $set: { settings } },
		{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
	);

	return {
		userId,
		settings: normalizeSettings(record && record.settings ? record.settings : settings),
	};
}

async function resetNotificationSettings(userId) {
	validateUserId(userId);
	const settings = normalizeSettings();
	const record = await NotificationSettings.findOneAndUpdate(
		{ userId },
		{ $set: { settings } },
		{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
	);

	return {
		userId,
		settings: normalizeSettings(record && record.settings ? record.settings : settings),
	};
}

module.exports = {
	DEFAULT_SETTINGS: normalizeSettings(),
	getNotificationSettings,
	updateNotificationSettings,
	resetNotificationSettings,
};

