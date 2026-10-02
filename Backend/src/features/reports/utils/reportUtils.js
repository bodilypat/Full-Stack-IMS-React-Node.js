/* File: #src/features/reports/utils/reportUtils.js */

const toNumber = (value, fallback = 0) => {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
};

const roundTo = (value, decimals = 2) => {
	const factor = 10 ** decimals;
	return Math.round((toNumber(value) + Number.EPSILON) * factor) / factor;
};

const parseDate = (value) => {
	if (value === null || value === undefined || value === '') return null;
	const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
};

const getDateRange = (startDate, endDate) => {
	const start = parseDate(startDate);
	const end = parseDate(endDate);
	if (start) start.setHours(0, 0, 0, 0);
	if (end) end.setHours(23, 59, 59, 999);
	return { startDate: start, endDate: end };
};

const isWithinDateRange = (value, range = {}) => {
	const date = parseDate(value);
	if (!date) return false;
	const start = parseDate(range.startDate);
	const end = parseDate(range.endDate);
	return (!start || date >= start) && (!end || date <= end);
};

const filterByDateRange = (records = [], dateField = 'createdAt', range = {}) =>
	records.filter((record) => record && isWithinDateRange(record[dateField], range));

const groupBy = (records = [], keySelector) => {
	const groups = new Map();
	records.forEach((record) => {
		const key = typeof keySelector === 'function' ? keySelector(record) : record?.[keySelector];
		const groupKey = key === null || key === undefined ? 'Uncategorized' : key;
		if (!groups.has(groupKey)) groups.set(groupKey, []);
		groups.get(groupKey).push(record);
	});
	return Object.fromEntries(groups);
};

const getStock = (product = {}) =>
	toNumber(product.quantity ?? product.stock ?? product.currentStock);

const calculateInventorySummary = (products = []) => {
	const summary = products.reduce(
		(totals, product = {}) => {
			const stock = getStock(product);
			const reorderLevel = toNumber(product.reorderLevel ?? product.minStock);
			const unitCost = toNumber(product.costPrice ?? product.unitCost ?? product.purchasePrice);

			totals.totalProducts += 1;
			totals.totalUnits += stock;
			totals.totalInventoryValue += stock * unitCost;
			if (stock <= 0) totals.outOfStockItems += 1;
			else if (reorderLevel > 0 && stock <= reorderLevel) totals.lowStockItems += 1;
			return totals;
		},
		{
			totalProducts: 0,
			totalUnits: 0,
			totalInventoryValue: 0,
			lowStockItems: 0,
			outOfStockItems: 0,
		}
	);

	summary.totalInventoryValue = roundTo(summary.totalInventoryValue);
	return summary;
};

const calculateSalesSummary = (sales = []) => {
	const summary = sales.reduce(
		(totals, sale = {}) => {
			totals.totalSales += toNumber(sale.totalAmount ?? sale.total ?? sale.amount);
			const items = Array.isArray(sale.items) ? sale.items : [];
			totals.totalItems += items.length
				? items.reduce((count, item = {}) => count + toNumber(item.quantity), 0)
				: toNumber(sale.quantity);
			totals.orderCount += 1;
			return totals;
		},
		{ totalSales: 0, orderCount: 0, totalItems: 0, averageOrderValue: 0 }
	);

	summary.totalSales = roundTo(summary.totalSales);
	summary.averageOrderValue = summary.orderCount
		? roundTo(summary.totalSales / summary.orderCount)
		: 0;
	return summary;
};

module.exports = {
	toNumber,
	roundTo,
	parseDate,
	getDateRange,
	isWithinDateRange,
	filterByDateRange,
	groupBy,
	getStock,
	calculateInventorySummary,
	calculateSalesSummary,
};
