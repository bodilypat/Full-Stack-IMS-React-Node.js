/* File: #src/features/settings/controllers/inventorySettingsController.js */

const InventorySettings = require("../models/inventorySettingsModel");

const listInventorySettings = async (req, res, next) => {
	try {
		const settings = await InventorySettings.find();
		return res.status(200).json({ success: true, data: settings });
	} catch (error) {
		return next(error);
	}
};

const getInventorySettings = async (req, res, next) => {
	try {
		const settings = await InventorySettings.findById(req.params.id);
		if (!settings) {
			return res.status(404).json({ success: false, message: "Inventory settings not found" });
		}
		return res.status(200).json({ success: true, data: settings });
	} catch (error) {
		return next(error);
	}
};

const createInventorySettings = async (req, res, next) => {
	try {
		const settings = await InventorySettings.create(req.body);
		return res.status(201).json({ success: true, data: settings });
	} catch (error) {
		return next(error);
	}
};

const updateInventorySettings = async (req, res, next) => {
	try {
		const settings = await InventorySettings.findByIdAndUpdate(
			req.params.id,
			{ $set: req.body },
			{ new: true, runValidators: true }
		);
		if (!settings) {
			return res.status(404).json({ success: false, message: "Inventory settings not found" });
		}
		return res.status(200).json({ success: true, data: settings });
	} catch (error) {
		return next(error);
	}
};

const deleteInventorySettings = async (req, res, next) => {
	try {
		const settings = await InventorySettings.findByIdAndDelete(req.params.id);
		if (!settings) {
			return res.status(404).json({ success: false, message: "Inventory settings not found" });
		}
		return res.status(200).json({ success: true, message: "Inventory settings deleted" });
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	listInventorySettings,
	getInventorySettings,
	createInventorySettings,
	updateInventorySettings,
	deleteInventorySettings,
};
