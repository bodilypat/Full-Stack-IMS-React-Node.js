/*
** File: #src/features/reports/services/salesReportService.js
*/

const IGNORED_STATUSES = new Set(['cancelled', 'canceled', 'void', 'refunded']);

const numberOrZero = (value) => {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
};

const getItems = (sale) =>
	Array.isArray(sale.items) ? sale.items : Array.isArray(sale.products) ? sale.products : [];

const getDate = (sale) => sale.saleDate || sale.createdAt || sale.date;

const getQuantity = (item) => numberOrZero(item.quantity ?? item.qty);

const getPrice = (item) =>
	numberOrZero(item.unitPrice ?? item.price ?? item.sellingPrice ?? item.rate);

const getProduct = (item) => {
	const nested = item.product && typeof item.product === 'object' ? item.product : {};
	const name = item.productName || nested.name || item.name || 'Unknown product';
	const id = item.productId ?? nested._id ?? nested.id ?? (typeof item.product === 'string' ? item.product : undefined);
	return { productId: String(id ?? name), productName: String(name) };
};

const getOrderTotal = (sale) => {
	const total = sale.totalAmount ?? sale.grandTotal ?? sale.total ?? sale.amount;
	return total == null
		? getItems(sale).reduce((sum, item) => sum + getQuantity(item) * getPrice(item), 0)
		: numberOrZero(total);
};

const inDateRange = (sale, options) => {
	const value = getDate(sale);
	const date = value ? new Date(value) : null;
	if (!date || Number.isNaN(date.getTime())) return !options.startDate && !options.endDate;
	if (options.startDate && date < new Date(options.startDate)) return false;
	if (options.endDate) {
		const end = new Date(options.endDate);
		if (!Number.isNaN(end.getTime())) {
			// Treat date-only end values as inclusive for the entire day.
			if (/^\d{4}-\d{2}-\d{2}$/.test(String(options.endDate))) end.setUTCHours(23, 59, 59, 999);
			if (date > end) return false;
		}
	}
	return true;
};

const matchesFilters = (sale, options) => {
	if (!inDateRange(sale, options)) return false;
	if (options.status && String(sale.status || '').toLowerCase() !== String(options.status).toLowerCase()) return false;
	if (options.paymentMethod && String(sale.paymentMethod || '').toLowerCase() !== String(options.paymentMethod).toLowerCase()) return false;
	if (options.customerId != null) {
		const customerId = sale.customerId?._id ?? sale.customerId ?? sale.customer?._id ?? sale.customer;
		if (String(customerId) !== String(options.customerId)) return false;
	}
	if (options.productId != null && !getItems(sale).some((item) => getProduct(item).productId === String(options.productId))) return false;
	return true;
};

/** Build a sales report from a list of sale documents or plain objects. */
const generateSalesReport = (sales = [], options = {}) => {
	const filteredSales = (Array.isArray(sales) ? sales : [])
		.filter((sale) => sale && !IGNORED_STATUSES.has(String(sale.status || '').toLowerCase()))
		.filter((sale) => matchesFilters(sale, options));

	const summary = { orderCount: 0, grossRevenue: 0, totalUnitsSold: 0, averageOrderValue: 0 };
	const dateGroups = new Map();
	const paymentGroups = new Map();
	const productGroups = new Map();

	for (const sale of filteredSales) {
		const total = getOrderTotal(sale);
		summary.orderCount += 1;
		summary.grossRevenue += total;

		const saleDate = getDate(sale);
		if (saleDate && !Number.isNaN(new Date(saleDate).getTime())) {
			const date = new Date(saleDate);
			const key = options.groupBy === 'month'
				? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
				: date.toISOString().slice(0, 10);
			const group = dateGroups.get(key) || { date: key, orderCount: 0, revenue: 0, unitsSold: 0 };
			group.orderCount += 1;
			group.revenue += total;
			dateGroups.set(key, group);
		}

		const method = String(sale.paymentMethod || 'unknown');
		const payment = paymentGroups.get(method) || { paymentMethod: method, orderCount: 0, revenue: 0 };
		payment.orderCount += 1;
		payment.revenue += total;
		paymentGroups.set(method, payment);

		for (const item of getItems(sale)) {
			const quantity = getQuantity(item);
			summary.totalUnitsSold += quantity;
			const { productId, productName } = getProduct(item);
			const product = productGroups.get(productId) || { productId, productName, quantitySold: 0, revenue: 0 };
			product.quantitySold += quantity;
			product.revenue += quantity * getPrice(item);
			productGroups.set(productId, product);

			if (saleDate && !Number.isNaN(new Date(saleDate).getTime())) {
				const date = new Date(saleDate);
				const key = options.groupBy === 'month'
					? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
					: date.toISOString().slice(0, 10);
				const group = dateGroups.get(key);
				if (group) group.unitsSold += quantity;
			}
		}
	}

	summary.averageOrderValue = summary.orderCount ? summary.grossRevenue / summary.orderCount : 0;
	const limit = Number.isInteger(Number(options.topProductsLimit)) && Number(options.topProductsLimit) > 0
		? Number(options.topProductsLimit)
		: 10;

	return {
		summary,
		salesByDate: [...dateGroups.values()].sort((a, b) => a.date.localeCompare(b.date)),
		salesByPaymentMethod: [...paymentGroups.values()].sort((a, b) => b.revenue - a.revenue),
		topProducts: [...productGroups.values()]
			.sort((a, b) => b.quantitySold - a.quantitySold)
			.slice(0, limit),
	};
};

/** Create a service backed by a Mongoose-compatible Sale model. */
const createSalesReportService = (SaleModel) => ({
	async getSalesReport(options = {}) {
		if (!SaleModel || typeof SaleModel.find !== 'function') {
			throw new TypeError('A sales model with a find() method is required.');
		}
		let query = SaleModel.find({});
		if (query && typeof query.lean === 'function') query = query.lean();
		const sales = await query;
		return generateSalesReport(sales, options);
	},
});

module.exports = { createSalesReportService, generateSalesReport };
