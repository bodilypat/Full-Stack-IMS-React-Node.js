/* ***************************************************************
** File: #src/features/reports/controllers/saleReportController.js
** Controller for handling sale report generation requests.
**  -- getSalesReport()
**  -- getSalesSummary()
**  -- getSalesTrends()
**  -- getSalesAnalysis()
**  -- getSalesPerformance()
**  -- getSalesComparison(
****************************************************************** */

const REPORT_METHODS = {
	getSalesReport: 'getSalesReport',
	getSalesSummary: 'getSalesSummary',
	getSalesTrends: 'getSalesTrends',
	getSalesAnalysis: 'getSalesAnalysis',
	getSalesPerformance: 'getSalesPerformance',
	getSalesComparison: 'getSalesComparison',
};

const getFilters = (query = {}) => {
	const filters = { ...query };

	for (const key of ['startDate', 'endDate']) {
		if (filters[key]) {
			const date = new Date(filters[key]);
			if (Number.isNaN(date.getTime())) {
				const error = new Error(`Invalid ${key}`);
				error.statusCode = 400;
				throw error;
			}
			filters[key] = date;
		}
	}

	if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
		const error = new Error('startDate must be before or equal to endDate');
		error.statusCode = 400;
		throw error;
	}

	if (filters.page !== undefined) {
		filters.page = Number(filters.page);
		if (!Number.isInteger(filters.page) || filters.page < 1) {
			const error = new Error('page must be a positive integer');
			error.statusCode = 400;
			throw error;
		}
	}

	if (filters.limit !== undefined) {
		filters.limit = Number(filters.limit);
		if (!Number.isInteger(filters.limit) || filters.limit < 1 || filters.limit > 500) {
			const error = new Error('limit must be an integer between 1 and 500');
			error.statusCode = 400;
			throw error;
		}
	}

	return filters;
};

const createReportController = (method) => async (req, res, next) => {
	try {
		const service = req.salesReportService || req.app?.locals?.salesReportService;
		if (!service || typeof service[method] !== 'function') {
			return res.status(503).json({
				success: false,
				message: 'Sales report service is unavailable',
			});
		}

		const data = await service[method](getFilters(req.query), req);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		if (error.statusCode === 400) {
			return res.status(400).json({ success: false, message: error.message });
		}
		if (typeof next === 'function') return next(error);
		return res.status(500).json({ success: false, message: 'Unable to generate sales report' });
	}
};

const salesReportController = Object.fromEntries(
	Object.entries(REPORT_METHODS).map(([handler, method]) => [handler, createReportController(method)]),
);

module.exports = salesReportController;



