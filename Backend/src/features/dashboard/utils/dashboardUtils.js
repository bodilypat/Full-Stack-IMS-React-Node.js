/* ***************************************************** */
/* File: #src/features/dashboard/utils/dashboardUtils.js */
/* ***************************************************** */

const asArray = (value) => (Array.isArray(value) ? value : []);
const number = (value) => Number(value) || 0;

const getStockValue = (item) =>
	number(item.stock ?? item.quantity ?? item.currentStock) *
	number(item.costPrice ?? item.purchasePrice ?? item.price);

/** Build the main inventory figures used by the dashboard. */
const getInventorySummary = (products, options = {}) => {
	const lowStockAt = number(options.lowStockAt || 10);
	const items = asArray(products);

	const summary = items.reduce(
		(result, item) => {
			const stock = number(item.stock ?? item.quantity ?? item.currentStock);
			result.totalProducts += 1;
			result.totalUnits += stock;
			result.totalValue += getStockValue(item);
			if (stock <= 0) result.outOfStock += 1;
			else if (stock <= lowStockAt) result.lowStock += 1;
			return result;
		},
		{ totalProducts: 0, totalUnits: 0, totalValue: 0, lowStock: 0, outOfStock: 0 }
	);

	return summary;
};

/** Aggregate sales, regardless of whether records use total or amount. */
const getSalesSummary = (sales) =>
	asArray(sales).reduce(
		(result, sale) => {
			const total = number(sale.total ?? sale.amount ?? sale.totalAmount);
			result.totalSales += total;
			result.totalOrders += 1;
			result.totalItems += number(sale.quantity ?? sale.itemsCount);
			if (String(sale.status).toLowerCase() === 'cancelled') result.cancelledOrders += 1;
			return result;
		},
		{ totalSales: 0, totalOrders: 0, totalItems: 0, cancelledOrders: 0 }
	);

const getLowStockItems = (products, threshold = 10) =>
	asArray(products)
		.filter((item) => number(item.stock ?? item.quantity ?? item.currentStock) <= number(threshold))
		.sort((a, b) =>
			number(a.stock ?? a.quantity ?? a.currentStock) -
			number(b.stock ?? b.quantity ?? b.currentStock)
		);

const getCategoryBreakdown = (products) => {
	const categories = {};
	asArray(products).forEach((item) => {
		const name = item.category?.name ?? item.category ?? 'Uncategorized';
		if (!categories[name]) categories[name] = { category: name, products: 0, units: 0, value: 0 };
		categories[name].products += 1;
		categories[name].units += number(item.stock ?? item.quantity ?? item.currentStock);
		categories[name].value += getStockValue(item);
	});
	return Object.values(categories);
};

module.exports = {
	getInventorySummary,
	getSalesSummary,
	getLowStockItems,
	getCategoryBreakdown,
};
