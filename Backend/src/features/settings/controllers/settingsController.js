/* ************************************************************** */
/* File: #src/features/settings/controllers/settingsController.js */
/* ************************************************************** */

import Settings from '../models/settingsModel.js';

const sendError = (res, error) => {
	const status = error.name === 'ValidationError' ? 400 : 500;
	return res.status(status).json({
		success: false,
		message: status === 400 ? error.message : 'An unexpected error occurred.',
	});
};

// Return a particular settings record, or the inventory settings record when no ID is supplied.
export const getSettings = async (req, res) => {
	try {
		const settings = req.params.id
			? await Settings.findById(req.params.id)
			: await Settings.findOne();

		if (!settings) {
			return res.status(404).json({ success: false, message: 'Settings not found.' });
		}

		return res.status(200).json({ success: true, data: settings });
	} catch (error) {
		return sendError(res, error);
	}
};

export const createSettings = async (req, res) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({ success: false, message: 'Settings data is required.' });
		}

		const settings = await Settings.create(req.body);
		return res.status(201).json({ success: true, data: settings });
	} catch (error) {
		return sendError(res, error);
	}
};

export const updateSettings = async (req, res) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({ success: false, message: 'Settings data is required.' });
		}

		const query = req.params.id ? { _id: req.params.id } : {};
		const settings = await Settings.findOneAndUpdate(query, req.body, {
			new: true,
			runValidators: true,
		});

		if (!settings) {
			return res.status(404).json({ success: false, message: 'Settings not found.' });
		}

		return res.status(200).json({ success: true, data: settings });
	} catch (error) {
		return sendError(res, error);
	}
};

export const deleteSettings = async (req, res) => {
	try {
		const settings = req.params.id
			? await Settings.findByIdAndDelete(req.params.id)
			: await Settings.findOneAndDelete();

		if (!settings) {
			return res.status(404).json({ success: false, message: 'Settings not found.' });
		}

		return res.status(200).json({ success: true, message: 'Settings deleted successfully.' });
	} catch (error) {
		return sendError(res, error);
	}
};

