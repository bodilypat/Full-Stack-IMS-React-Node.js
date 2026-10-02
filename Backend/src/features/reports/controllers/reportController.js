/* 
** File: #src/features/reports/controllers/reportController.js
** Controller handle HTTP requests for report generation 
** 
*/

const reportService = require('../services/reportService');

const sendReport = async (req, res, next, reportType) => {
	try {
		const filters = { ...req.query };
		delete filters.type;

		const report = await reportService.generateReport(
			reportType || req.params.reportType || req.query.type,
			filters
		);

		return res.status(200).json({ success: true, data: report });
	} catch (error) {
		if (typeof next === 'function') return next(error);

		return res.status(500).json({
			success: false,
			message: 'Failed to generate report.',
		});
	}
};

const reportHandler = (reportType) => (req, res, next) =>
	sendReport(req, res, next, reportType);

module.exports = {
	generateReport: (req, res, next) => sendReport(req, res, next),
	getInventoryReport: reportHandler('inventory'),
	getSalesReport: reportHandler('sales'),
	getPurchaseReport: reportHandler('purchases'),
	getLowStockReport: reportHandler('low-stock'),
};





