/* ********************************************************************* */
/* File: #src/features/settings/controllers/companySettingsController.js */
/* ********************************************************************* */

const CompanySettings = require('../models/companySettingsModel');

const sendError = (res, error) => {
	if (error.name === 'ValidationError' || error.name === 'CastError') {
		return res.status(400).json({ message: error.message });
	}

	return res.status(500).json({ message: 'Unable to process company settings.' });
};

const getCompanySettings = async (req, res) => {
	try {
		const settings = await CompanySettings.findOne().sort({ updatedAt: -1 });
		if (!settings) {
			return res.status(404).json({ message: 'Company settings not found.' });
		}

		return res.status(200).json({ data: settings });
	} catch (error) {
		return sendError(res, error);
	}
};

const createCompanySettings = async (req, res) => {
	try {
		const settings = await CompanySettings.create(req.body);
		return res.status(201).json({ message: 'Company settings created.', data: settings });
	} catch (error) {
		return sendError(res, error);
	}
};

const updateCompanySettings = async (req, res) => {
	try {
		const updates = { ...req.body };
		delete updates._id;
		delete updates.__v;

		const settings = await CompanySettings.findByIdAndUpdate(req.params.id, updates, {
			new: true,
			runValidators: true,
		});

		if (!settings) {
			return res.status(404).json({ message: 'Company settings not found.' });
		}

		return res.status(200).json({ message: 'Company settings updated.', data: settings });
	} catch (error) {
		return sendError(res, error);
	}
};

const deleteCompanySettings = async (req, res) => {
	try {
		const settings = await CompanySettings.findByIdAndDelete(req.params.id);
		if (!settings) {
			return res.status(404).json({ message: 'Company settings not found.' });
		}

		return res.status(200).json({ message: 'Company settings deleted.' });
	} catch (error) {
		return sendError(res, error);
	}
};

module.exports = {
	getCompanySettings,
	createCompanySettings,
	updateCompanySettings,
	deleteCompanySettings,
};
