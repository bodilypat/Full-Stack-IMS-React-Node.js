/* ******************************************************************* */
/* File: #src/features/settings/controllers/salesSettingsController.js */
/* ******************************************************************* */

const salesSettingsService = require('../services/salesSettingsService');

const handleError = (res, error) => {
	const status = error.statusCode || error.status || 500;

	return res.status(status).json({
		success: false,
		message: status >= 500 ? 'An unexpected error occurred.' : error.message,
	});
};

const getSalesSettings = async (req, res) => {
	try {
		const settings = await salesSettingsService.getSalesSettings();

		if (!settings) {
			return res.status(404).json({ success: false, message: 'Sales settings not found.' });
		}

		return res.status(200).json({ success: true, data: settings });
	} catch (error) {
		return handleError(res, error);
	}
};

const updateSalesSettings = async (req, res) => {
	try {
		if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
			return res.status(400).json({ success: false, message: 'A settings object is required.' });
		}

		const settings = await salesSettingsService.updateSalesSettings(req.body);
		return res.status(200).json({
			success: true,
			message: 'Sales settings updated successfully.',
			data: settings,
		});
	} catch (error) {
		return handleError(res, error);
	}
};

module.exports = { getSalesSettings, updateSalesSettings };

