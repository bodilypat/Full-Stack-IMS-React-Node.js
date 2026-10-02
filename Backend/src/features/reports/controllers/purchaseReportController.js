/******************************************************************
** File: #src/features/reports/controllers/purchaseReportController.js
** Controller for handling purchase report generation requests.
**  -- getPurchaseReport()
**  -- getPurchaseSummary()
**  -- getPurchaseTrends()
**  -- getPurchaseAnalysis()
**  -- getPurchasePerformance()
**  -- getPurchaseComparison()
****************************************************************** */

const Purchase = require('../../purchases/models/Purchase');

const amountExpression = {
	$ifNull: ['$totalAmount', { $ifNull: ['$grandTotal', { $ifNull: ['$amount', 0] }] }],
};

function parseDate(value, field) {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		const error = new Error(`Invalid ${field}`);
		error.statusCode = 400;
		throw error;
	}
	return date;
}

function buildMatch(query = {}) {
	const match = {};
	if (query.status) match.status = query.status;
	if (query.supplierId) match.supplier = query.supplierId;
	if (query.categoryId) match.category = query.categoryId;

	const startDate = parseDate(query.startDate, 'startDate');
	const endDate = parseDate(query.endDate, 'endDate');
	if (startDate || endDate) {
		const range = {};
		if (startDate) range.$gte = startDate;
		if (endDate) range.$lte = endDate;
		match.$or = [{ purchaseDate: range }, { createdAt: range }];
	}
	return match;
}

function sendError(res, error) {
	return res.status(error.statusCode || 500).json({
		success: false,
		message: error.statusCode ? error.message : 'Unable to generate purchase report',
	});
}

async function getSummary(match) {
	const [summary] = await Purchase.aggregate([
		{ $match: match },
		{ $project: { amount: amountExpression } },
		{
			$group: {
				_id: null,
				purchaseCount: { $sum: 1 },
				totalAmount: { $sum: '$amount' },
				averageAmount: { $avg: '$amount' },
			},
		},
	]);
	return summary || { purchaseCount: 0, totalAmount: 0, averageAmount: 0 };
}

// GET /reports/purchases
exports.getPurchaseReport = async (req, res) => {
	try {
		const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
		const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
		const match = buildMatch(req.query);
		const [purchases, total] = await Promise.all([
			Purchase.find(match)
				.sort({ purchaseDate: -1, createdAt: -1 })
				.skip((page - 1) * limit)
				.limit(limit)
				.lean(),
			Purchase.countDocuments(match),
		]);
		return res.status(200).json({
			success: true,
			data: purchases,
			pagination: { page, limit, total, pages: Math.ceil(total / limit) },
		});
	} catch (error) {
		return sendError(res, error);
	}
};

// GET /reports/purchases/summary
exports.getPurchaseSummary = async (req, res) => {
	try {
		return res.status(200).json({ success: true, data: await getSummary(buildMatch(req.query)) });
	} catch (error) {
		return sendError(res, error);
	}
};

// GET /reports/purchases/trends?groupBy=day|week|month|year
exports.getPurchaseTrends = async (req, res) => {
	try {
		const units = ['day', 'week', 'month', 'year'];
		const unit = units.includes(req.query.groupBy) ? req.query.groupBy : 'month';
		const data = await Purchase.aggregate([
			{ $match: buildMatch(req.query) },
			{ $project: { date: { $ifNull: ['$purchaseDate', '$createdAt'] }, amount: amountExpression } },
			{
				$group: {
					_id: { $dateTrunc: { date: '$date', unit } },
					purchaseCount: { $sum: 1 },
					totalAmount: { $sum: '$amount' },
				},
			},
			{ $sort: { _id: 1 } },
			{ $project: { _id: 0, period: '$_id', purchaseCount: 1, totalAmount: 1 } },
		]);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return sendError(res, error);
	}
};

// GET /reports/purchases/analysis
exports.getPurchaseAnalysis = async (req, res) => {
	try {
		const match = buildMatch(req.query);
		const [byStatus, bySupplier, byCategory] = await Promise.all([
			Purchase.aggregate([
				{ $match: match },
				{ $project: { status: { $ifNull: ['$status', 'unknown'] }, amount: amountExpression } },
				{ $group: { _id: '$status', purchaseCount: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
				{ $sort: { totalAmount: -1 } },
			]),
			Purchase.aggregate([
				{ $match: match },
				{ $group: { _id: '$supplier', purchaseCount: { $sum: 1 }, totalAmount: { $sum: amountExpression } } },
				{ $sort: { totalAmount: -1 } },
			]),
			Purchase.aggregate([
				{ $match: match },
				{ $group: { _id: '$category', purchaseCount: { $sum: 1 }, totalAmount: { $sum: amountExpression } } },
				{ $sort: { totalAmount: -1 } },
			]),
		]);
		return res.status(200).json({ success: true, data: { byStatus, bySupplier, byCategory } });
	} catch (error) {
		return sendError(res, error);
	}
};

// GET /reports/purchases/performance
exports.getPurchasePerformance = async (req, res) => {
	try {
		const data = await Purchase.aggregate([
			{ $match: buildMatch(req.query) },
			{
				$group: {
					_id: '$supplier',
					purchaseCount: { $sum: 1 },
					totalAmount: { $sum: amountExpression },
					averageAmount: { $avg: amountExpression },
					latestPurchase: { $max: { $ifNull: ['$purchaseDate', '$createdAt'] } },
				},
			},
			{ $sort: { totalAmount: -1 } },
		]);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		return sendError(res, error);
	}
};

// GET /reports/purchases/comparison?compareStartDate=...&compareEndDate=...
exports.getPurchaseComparison = async (req, res) => {
	try {
		const current = await getSummary(buildMatch(req.query));
		const comparisonQuery = {
			...req.query,
			startDate: req.query.compareStartDate,
			endDate: req.query.compareEndDate,
		};
		delete comparisonQuery.compareStartDate;
		delete comparisonQuery.compareEndDate;
		const comparison = await getSummary(buildMatch(comparisonQuery));
		const change = current.totalAmount - comparison.totalAmount;
		const percentageChange = comparison.totalAmount ? (change / comparison.totalAmount) * 100 : null;
		return res.status(200).json({
			success: true,
			data: { current, comparison, change, percentageChange },
		});
	} catch (error) {
		return sendError(res, error);
	}
};



