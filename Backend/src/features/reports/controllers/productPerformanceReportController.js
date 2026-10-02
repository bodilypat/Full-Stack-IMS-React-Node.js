/* 
** File: #src/features/reports/controllers/productPerformanceReportController.js
** -- getProductPerformanceReport()
** -- getTopSellingProducts()
** -- generateProductPerformanceReport()
*/

const getReportService = (req) => {
	const locals = req.app?.locals || {};
	const service =
		locals.productPerformanceReportService ||
		locals.services?.productPerformanceReport;

	if (!service) {
		const error = new Error('Product performance report service is not configured');
		error.statusCode = 503;
		throw error;
	}

	return service;
};

const getReportFilters = (query = {}) => {
	const filters = {};

	for (const key of ['startDate', 'endDate']) {
		if (query[key] !== undefined) {
			const date = new Date(query[key]);
			if (Number.isNaN(date.getTime())) {
				const error = new Error(`${key} must be a valid date`);
				error.statusCode = 400;
				throw error;
			}
			filters[key] = date;
		}
	}

	if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
		const error = new Error('startDate must be earlier than or equal to endDate');
		error.statusCode = 400;
		throw error;
	}

	for (const key of ['productId', 'categoryId']) {
		if (query[key] !== undefined && query[key] !== '') filters[key] = query[key];
	}

	return filters;
};

const sendError = (res, error) =>
	res.status(error.statusCode || 500).json({
		success: false,
		message: error.statusCode ? error.message : 'Unable to retrieve product performance report',
	});

const getProductPerformanceReport = async (req, res) => {
	try {
		const report = await getReportService(req).getProductPerformanceReport(
			getReportFilters(req.query),
		);
		return res.status(200).json({ success: true, data: report });
	} catch (error) {
		return sendError(res, error);
	}
};

const getTopSellingProducts = async (req, res) => {
	try {
		const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
		if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
			return res.status(400).json({
				success: false,
				message: 'limit must be an integer between 1 and 100',
			});
		}

		const products = await getReportService(req).getTopSellingProducts({
			...getReportFilters(req.query),
			limit,
		});
		return res.status(200).json({ success: true, data: products });
	} catch (error) {
		return sendError(res, error);
	}
};

const generateProductPerformanceReport = async (req, res) => {
	try {
		const service = getReportService(req);
		const generate = service.generateProductPerformanceReport;
		if (typeof generate !== 'function') {
			const error = new Error('Report generation is not supported');
			error.statusCode = 501;
			throw error;
		}

		const report = await generate.call(service, {
			...getReportFilters(req.query),
			...(req.body && typeof req.body === 'object' ? req.body : {}),
		});
		return res.status(200).json({ success: true, data: report });
	} catch (error) {
		return sendError(res, error);
	}
};

module.exports = {
	getProductPerformanceReport,
	getTopSellingProducts,
	generateProductPerformanceReport,
};
