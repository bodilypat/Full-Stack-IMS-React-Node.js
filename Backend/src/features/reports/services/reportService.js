/* 
** File: #src/features/reports/services/reportService.js
** -- Validate Report Filters
** -- Call salesReportRepository
** -- Calculate totals
** -- Calculate trend analysis
** -- Calculate percentage 
** -- Format response
*/

const toNumber = (value) => {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
};

const validateFilters = (filters = {}) => {
	const { startDate, endDate } = filters;

	if (startDate && Number.isNaN(Date.parse(startDate))) {
		throw new TypeError('startDate must be a valid date');
	}
	if (endDate && Number.isNaN(Date.parse(endDate))) {
		throw new TypeError('endDate must be a valid date');
	}
	if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
		throw new RangeError('startDate must be before or equal to endDate');
	}

	return { ...filters };
};

const calculatePercentage = (current, previous) => {
	if (previous === 0) return current === 0 ? 0 : 100;
	return Number((((current - previous) / Math.abs(previous)) * 100).toFixed(2));
};

const calculateTotals = (rows) => rows.reduce((totals, row) => {
	totals.revenue += toNumber(row.totalAmount ?? row.total ?? row.revenue);
	totals.quantitySold += toNumber(row.quantitySold ?? row.quantity);
	totals.orders += 1;
	return totals;
}, { revenue: 0, quantitySold: 0, orders: 0 });

const calculateTrend = (rows) => {
	const dailyTotals = new Map();

	rows.forEach((row) => {
		const rawDate = row.date ?? row.saleDate ?? row.createdAt;
		if (!rawDate) return;

		const date = new Date(rawDate);
		if (Number.isNaN(date.getTime())) return;

		const key = date.toISOString().slice(0, 10);
		const day = dailyTotals.get(key) || { date: key, revenue: 0, quantitySold: 0, orders: 0 };
		day.revenue += toNumber(row.totalAmount ?? row.total ?? row.revenue);
		day.quantitySold += toNumber(row.quantitySold ?? row.quantity);
		day.orders += 1;
		dailyTotals.set(key, day);
	});

	const trend = [...dailyTotals.values()].sort((a, b) => a.date.localeCompare(b.date));
	return trend.map((day, index) => ({
		...day,
		revenueChange: index === 0
			? 0
			: calculatePercentage(day.revenue, trend[index - 1].revenue),
	}));
};

const formatResponse = (rows, filters = {}) => {
	const totals = calculateTotals(rows);
	return {
		filters,
		totals: {
			...totals,
			averageOrderValue: totals.orders
				? Number((totals.revenue / totals.orders).toFixed(2))
				: 0,
		},
		trend: calculateTrend(rows),
		recordCount: rows.length,
	};
};

const createReportService = (salesReportRepository) => ({
	async generateReport(filters = {}) {
		const validatedFilters = validateFilters(filters);
		if (!salesReportRepository || typeof salesReportRepository.getSalesReport !== 'function') {
			throw new TypeError('salesReportRepository.getSalesReport must be provided');
		}

		const result = await salesReportRepository.getSalesReport(validatedFilters);
		const rows = Array.isArray(result) ? result : result?.rows;
		if (!Array.isArray(rows)) {
			throw new TypeError('Sales report repository must return an array of rows');
		}

		return formatResponse(rows, validatedFilters);
	},
});

module.exports = {
	createReportService,
	validateFilters,
	calculateTotals,
	calculateTrend,
	calculatePercentage,
	formatResponse,
};

