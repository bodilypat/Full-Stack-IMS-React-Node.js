/* File: #src/features/settings/controllers/notificationSettingsController.js */

const NotificationSettings = require('../models/notificationSettingsModel');

const DEFAULT_SETTINGS = {
	email: true,
	sms: false,
	push: true,
	lowStockAlerts: true,
	orderUpdates: true,
	expiryAlerts: true,
	dailyReports: false,
};

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);

function getUserId(req) {
	return req.user?._id || req.user?.id;
}

function getSettingsPayload(body = {}) {
	const settings = body.settings && typeof body.settings === 'object'
		? body.settings
		: body;
	return Object.fromEntries(
		SETTING_KEYS
			.filter((key) => typeof settings[key] === 'boolean')
			.map((key) => [key, settings[key]])
	);
}

function handleError(res, error) {
	return res.status(500).json({
		success: false,
		message: 'Unable to process notification settings.',
		error: process.env.NODE_ENV === 'development' ? error.message : undefined,
	});
}

async function getNotificationSettings(req, res) {
	const userId = getUserId(req);
	if (!userId) {
		return res.status(401).json({ success: false, message: 'Authentication required.' });
	}

	try {
		const settings = await NotificationSettings.findOne({ userId });
		return res.status(200).json({
			success: true,
			settings: { ...DEFAULT_SETTINGS, ...(settings?.toObject?.() || settings || {}) },
		});
	} catch (error) {
		return handleError(res, error);
	}
}

async function updateNotificationSettings(req, res) {
	const userId = getUserId(req);
	if (!userId) {
		return res.status(401).json({ success: false, message: 'Authentication required.' });
	}

	const updates = getSettingsPayload(req.body);
	if (Object.keys(updates).length === 0) {
		return res.status(400).json({
			success: false,
			message: 'Provide at least one valid boolean notification setting.',
		});
	}

	try {
		const settings = await NotificationSettings.findOneAndUpdate(
			{ userId },
			{ $set: updates, $setOnInsert: { userId } },
			{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
		);
		return res.status(200).json({ success: true, settings });
	} catch (error) {
		return handleError(res, error);
	}
}

module.exports = {
	getNotificationSettings,
	updateNotificationSettings,
};
