/*
** File: #src/features/reports/controllers/stockMovementReportController.js
** -- getStockMovementReport()
** -- generateStockMovementReport()
*/

const StockMovement = require('../../inventory/models/stockMovementModel');

const makeFilter = (query) => {
	const filter = {};
	const { startDate, endDate, productId, warehouseId, type } = query;

	if (startDate || endDate) {
		filter.createdAt = {};
		if (startDate) filter.createdAt.$gte = new Date(startDate);
		if (endDate) filter.createdAt.$lte = new Date(endDate);
		if (Number.isNaN(filter.createdAt.$gte?.getTime()) || Number.isNaN(filter.createdAt.$lte?.getTime())) {
			const error = new Error('Invalid startDate or endDate');
			error.statusCode = 400;
			throw error;
		}
		if (startDate && endDate && filter.createdAt.$gte > filter.createdAt.$lte) {
			const error = new Error('startDate must not be later than endDate');
			error.statusCode = 400;
			throw error;
		}
	}

	if (productId) filter.product = productId;
	if (warehouseId) filter.warehouse = warehouseId;
	if (type) filter.type = type;
	return filter;
};

const getStockMovementReport = async (req, res) => {
	try {
		const filter = makeFilter(req.query);
		const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
		const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 500);
		const [movements, total] = await Promise.all([
			StockMovement.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
			StockMovement.countDocuments(filter),
		]);

		return res.status(200).json({
			success: true,
			data: movements,
			pagination: { page, limit, total, pages: Math.ceil(total / limit) },
		});
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			success: false,
			message: error.statusCode ? error.message : 'Failed to retrieve stock movement report',
		});
	}
};

const generateStockMovementReport = async (req, res) => {
	try {
		const filter = makeFilter(req.query);
		const movements = await StockMovement.find(filter).sort({ createdAt: -1 });
		const summary = movements.reduce((result, movement) => {
			const movementType = movement.type || 'unknown';
			result.totalMovements += 1;
			result.quantityByType[movementType] =
				(result.quantityByType[movementType] || 0) + (Number(movement.quantity) || 0);
			return result;
		}, { totalMovements: 0, quantityByType: {} });

		return res.status(200).json({ success: true, summary, data: movements });
	} catch (error) {
		return res.status(error.statusCode || 500).json({
			success: false,
			message: error.statusCode ? error.message : 'Failed to generate stock movement report',
		});
	}
};

module.exports = { getStockMovementReport, generateStockMovementReport };


