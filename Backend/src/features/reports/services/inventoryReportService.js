/* File: #src/features/reports/services/inventoryReportService.js */

const asNumber = (value, fallback = 0) => {
	if (value === null || value === undefined || value === '') return fallback;
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
};

const quantityOf = (item = {}) => asNumber(item.quantity ?? item.stock ?? item.currentStock);
const costOf = (item = {}) => asNumber(item.unitCost ?? item.costPrice ?? item.purchasePrice);
const reorderLevelOf = (item = {}) => asNumber(item.reorderLevel ?? item.minimumStock ?? item.minStock);

const categoryOf = (item = {}) => {
	const category = item.category;
	if (category && typeof category === 'object') {
		return String(category.name ?? category.title ?? category._id ?? 'Uncategorized');
	}
	return String(category || 'Uncategorized');
};

const stockStatusOf = (item) => {
	const quantity = quantityOf(item);
	if (quantity <= 0) return 'out_of_stock';
	return quantity <= reorderLevelOf(item) ? 'low_stock' : 'in_stock';
};

const filterInventory = (items = [], filters = {}) => {
	const categoryFilter = filters.category == null ? '' : String(filters.category).toLowerCase();
	const statusFilter = filters.status == null ? '' : String(filters.status).toLowerCase();
	const search = String(filters.search ?? '').trim().toLowerCase();

	return items.filter((item) => {
		if (categoryFilter && categoryOf(item).toLowerCase() !== categoryFilter) return false;
		if (statusFilter && stockStatusOf(item) !== statusFilter) return false;
		if (search) {
			const text = [item.name, item.sku, item.code, item.description]
				.filter((value) => value != null)
				.join(' ')
				.toLowerCase();
			if (!text.includes(search)) return false;
		}
		return true;
	});
};

const getInventorySummary = (items = []) => items.reduce((summary, item) => {
	const quantity = quantityOf(item);
	const status = stockStatusOf(item);
	summary.productCount += 1;
	summary.totalUnits += quantity;
	summary.totalValue += quantity * costOf(item);
	if (status === 'in_stock') summary.inStockCount += 1;
	else if (status === 'low_stock') summary.lowStockCount += 1;
	else summary.outOfStockCount += 1;
	return summary;
}, {
	productCount: 0,
	totalUnits: 0,
	totalValue: 0,
	inStockCount: 0,
	lowStockCount: 0,
	outOfStockCount: 0,
});

const getValuationReport = (items = [], filters = {}) => filterInventory(items, filters)
	.map((item) => ({
		item,
		quantity: quantityOf(item),
		unitCost: costOf(item),
		stockValue: quantityOf(item) * costOf(item),
	}))
	.sort((left, right) => right.stockValue - left.stockValue);

const getLowStockReport = (items = []) => items
	.filter((item) => stockStatusOf(item) !== 'in_stock')
	.map((item) => ({
		item,
		quantity: quantityOf(item),
		reorderLevel: reorderLevelOf(item),
		shortage: Math.max(0, reorderLevelOf(item) - quantityOf(item)),
		status: stockStatusOf(item),
	}))
	.sort((left, right) => left.quantity - right.quantity);

const getCategoryReport = (items = []) => {
	const categories = new Map();
	for (const item of items) {
		const category = categoryOf(item);
		const row = categories.get(category) || {
			category,
			productCount: 0,
			totalUnits: 0,
			totalValue: 0,
			lowStockCount: 0,
			outOfStockCount: 0,
		};
		const status = stockStatusOf(item);
		const quantity = quantityOf(item);
		row.productCount += 1;
		row.totalUnits += quantity;
		row.totalValue += quantity * costOf(item);
		if (status === 'low_stock') row.lowStockCount += 1;
		if (status === 'out_of_stock') row.outOfStockCount += 1;
		categories.set(category, row);
	}
	return Array.from(categories.values()).sort((a, b) => a.category.localeCompare(b.category));
};

const getStockMovementReport = (movements = [], filters = {}) => {
	const startDate = filters.startDate ? new Date(filters.startDate) : null;
	const endDate = filters.endDate ? new Date(filters.endDate) : null;
	const report = { movementCount: 0, stockIn: 0, stockOut: 0, netChange: 0 };

	for (const movement of movements) {
		const rawDate = movement.date ?? movement.createdAt;
		const date = rawDate ? new Date(rawDate) : null;
		if (startDate && (!date || !Number.isFinite(date.getTime()) || date < startDate)) continue;
		if (endDate && (!date || !Number.isFinite(date.getTime()) || date > endDate)) continue;

		const type = String(movement.type ?? movement.action ?? '').toLowerCase();
		const amount = Math.abs(asNumber(movement.quantity ?? movement.amount));
		if (['in', 'stock_in', 'purchase', 'return', 'adjustment_in'].includes(type)) {
			report.stockIn += amount;
		} else if (['out', 'stock_out', 'sale', 'issue', 'adjustment_out'].includes(type)) {
			report.stockOut += amount;
		}
		report.movementCount += 1;
	}

	report.netChange = report.stockIn - report.stockOut;
	return report;
};

const generateInventoryReport = (items = [], filters = {}) => {
	const filteredItems = filterInventory(items, filters);
	return {
		generatedAt: new Date().toISOString(),
		summary: getInventorySummary(filteredItems),
		valuation: getValuationReport(filteredItems),
		lowStock: getLowStockReport(filteredItems),
		categories: getCategoryReport(filteredItems),
	};
};

module.exports = {
	generateInventoryReport,
	getInventorySummary,
	getValuationReport,
	getLowStockReport,
	getCategoryReport,
	getStockMovementReport,
};
