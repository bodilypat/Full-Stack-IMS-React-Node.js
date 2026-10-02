/* File: #src/features/reports/services/stockMovementReportService.js */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

function badRequest(message) {
	const error = new Error(message);
	error.statusCode = 400;
	return error;
}

function parseDate(value, name, inclusiveEnd = false) {
	if (value === undefined || value === null || value === '') return undefined;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) throw badRequest(`${name} must be a valid date`);
	if (inclusiveEnd && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
		date.setHours(23, 59, 59, 999);
	}
	return date;
}

function positiveInteger(value, fallback, name) {
	if (value === undefined || value === null || value === '') return fallback;
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 1) {
		throw badRequest(`${name} must be a positive integer`);
	}
	return number;
}

/** Build the report service with the application's StockMovement model. */
function createStockMovementReportService({ StockMovement } = {}) {
	if (!StockMovement) throw new Error('StockMovement model is required');

	async function getStockMovementReport(options = {}) {
		const {
			startDate,
			endDate,
			productId,
			warehouseId,
			movementType,
			reference,
		} = options;
		const start = parseDate(startDate, 'startDate');
		const end = parseDate(endDate, 'endDate', true);
		if (start && end && start > end) {
			throw badRequest('startDate must be before or equal to endDate');
		}

		const page = positiveInteger(options.page, DEFAULT_PAGE, 'page');
		const limit = Math.min(positiveInteger(options.limit, DEFAULT_LIMIT, 'limit'), MAX_LIMIT);
		const filter = {};
		if (productId) filter.product = productId;
		if (warehouseId) filter.warehouse = warehouseId;
		if (movementType) filter.movementType = movementType;
		if (reference) filter.reference = reference;
		if (start || end) {
			filter.createdAt = {};
			if (start) filter.createdAt.$gte = start;
			if (end) filter.createdAt.$lte = end;
		}

		const query = StockMovement.find(filter).sort({ createdAt: -1, _id: -1 });
		if (typeof query.skip === 'function') query.skip((page - 1) * limit);
		if (typeof query.limit === 'function') query.limit(limit);
		if (typeof query.populate === 'function') {
			query.populate('product');
			query.populate('warehouse');
		}
		if (typeof query.lean === 'function') query.lean();

		const [movements, total, grouped] = await Promise.all([
			query,
			StockMovement.countDocuments(filter),
			StockMovement.aggregate([
				{ $match: filter },
				{
					$group: {
						_id: '$movementType',
						count: { $sum: 1 },
						quantity: { $sum: { $ifNull: ['$quantity', 0] } },
					},
				},
			]),
		]);

		const summary = { movementCount: 0, totalQuantity: 0, byMovementType: {} };
		for (const group of grouped) {
			const type = group._id || 'unspecified';
			summary.movementCount += group.count;
			summary.totalQuantity += group.quantity;
			summary.byMovementType[type] = { count: group.count, quantity: group.quantity };
		}

		return {
			movements,
			summary,
			pagination: { page, limit, total, pages: Math.ceil(total / limit) },
			filters: { startDate: start, endDate: end, productId, warehouseId, movementType, reference },
		};
	}

	return { getStockMovementReport };
}

module.exports = { createStockMovementReportService };
