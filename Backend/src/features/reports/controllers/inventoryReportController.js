/**********************************************************************
 * File: #src/features/reports/controllers/inventoryReportController.js
 ** -- getInventoryReport()
 ** -- getInventoryTrends()
 ** -- getInventoryAnalysis()
 ** -- getInventoryPerformance()
 ** -- getInventoryComparison()
 ** -- getInventorySummary()
 ********************************************************************* */

import inventoryReportService from '../services/inventoryReportService';

const sendReport = (serviceMethod) => async (req, res, next) => {
	try {
		const filters = {
			...req.query,
			...req.params,
			...(req.body || {}),
		};
		const data = await inventoryReportService[serviceMethod](filters);

		return res.status(200).json({
			success: true,
			data,
		});
	} catch (error) {
		if (typeof next === 'function') return next(error);
		return res.status(500).json({
			success: false,
			message: 'Failed to generate inventory report.',
		});
	}
};

export const getInventoryReport = sendReport('getInventoryReport');
export const getInventorySummary = sendReport('getInventorySummary');
export const getInventoryTrends = sendReport('getInventoryTrends');
export const getInventoryAnalysis = sendReport('getInventoryAnalysis');
export const getInventoryPerformance = sendReport('getInventoryPerformance');
export const getInventoryComparison = sendReport('getInventoryComparison');


