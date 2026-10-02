/* File: #src/features/reports/services/productPerformanceReportService.js */

const getValue = (object, ...keys) => {
	for (const key of keys) {
		if (object?.[key] !== undefined && object[key] !== null) return object[key];
	}
	return undefined;
};

const toNumber = (value) => {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
};

const getId = (value) => {
	if (value && typeof value === 'object') {
		return getValue(value, 'id', '_id', 'productId', 'saleId');
	}
	return value;
};

const toDate = (value, name) => {
	if (value == null || value === '') return null;
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) throw new TypeError(`${name} must be a valid date`);
	return date;
};

const getPeriod = (startDate, endDate) => {
	const start = toDate(startDate, 'startDate');
	const end = toDate(endDate, 'endDate');
	if (start && end && start > end) {
		throw new RangeError('startDate must be before or equal to endDate');
	}
	return { start, end };
};

const isWithinPeriod = (value, start, end) => {
	if (!start && !end) return true;
	if (!value) return false;
	const date = new Date(value);
	return !Number.isNaN(date.getTime()) && (!start || date >= start) && (!end || date <= end);
};

const isCancelled = (sale) => {
	const status = String(getValue(sale, 'status', 'state') || '').toLowerCase();
	return ['cancelled', 'canceled', 'void', 'refunded'].includes(status);
};

/** Build a product-performance report from products, sales, and sale line items. */
function buildProductPerformanceReport({
	products = [],
	sales = [],
	saleItems = [],
	startDate,
	endDate,
	sortBy = 'revenue',
	order = 'desc',
	limit,
} = {}) {
	if (!Array.isArray(products) || !Array.isArray(sales) || !Array.isArray(saleItems)) {
		throw new TypeError('products, sales, and saleItems must be arrays');
	}
	const { start, end } = getPeriod(startDate, endDate);
	const salesById = new Map(sales.map((sale) => [String(getId(sale)), sale]));
	const metrics = new Map();

	for (const product of products) {
		const id = getId(product);
		if (id == null) continue;
		metrics.set(String(id), {
			productId: id,
			name: getValue(product, 'name', 'productName', 'title') || 'Unnamed product',
			sku: getValue(product, 'sku', 'SKU') || null,
			category: getValue(product, 'categoryName', 'category') || null,
			stockOnHand: toNumber(getValue(product, 'stockOnHand', 'quantityInStock', 'stock', 'quantity')),
			unitsSold: 0,
			orderCount: 0,
			revenue: 0,
			cost: 0,
			profit: 0,
		});
	}

	const countedOrders = new Map();
	for (const item of saleItems) {
		const saleId = getId(getValue(item, 'sale', 'order', 'saleId', 'orderId'));
		const sale = salesById.get(String(saleId)) || getValue(item, 'sale', 'order') || item;
		if (isCancelled(sale)) continue;
		const date = getValue(sale, 'createdAt', 'date', 'saleDate', 'transactionDate') ??
			getValue(item, 'createdAt', 'date', 'saleDate', 'transactionDate');
		if (!isWithinPeriod(date, start, end)) continue;

		const productRef = getValue(item, 'product', 'productId');
		const productId = getId(productRef);
		if (productId == null) continue;
		const key = String(productId);
		if (!metrics.has(key)) {
			const product = productRef && typeof productRef === 'object' ? productRef : {};
			metrics.set(key, {
				productId,
				name: getValue(product, 'name', 'productName', 'title') || 'Unnamed product',
				sku: getValue(product, 'sku', 'SKU') || null,
				category: getValue(product, 'categoryName', 'category') || null,
				stockOnHand: toNumber(getValue(product, 'stockOnHand', 'quantityInStock', 'stock', 'quantity')),
				unitsSold: 0,
				orderCount: 0,
				revenue: 0,
				cost: 0,
				profit: 0,
			});
		}

		const row = metrics.get(key);
		const quantity = toNumber(getValue(item, 'quantity', 'qty'));
		const unitPrice = toNumber(getValue(item, 'unitPrice', 'sellingPrice', 'price'));
		const explicitRevenue = getValue(item, 'total', 'lineTotal', 'subtotal', 'totalAmount');
		const revenue = explicitRevenue == null ? quantity * unitPrice : toNumber(explicitRevenue);
		const unitCost = toNumber(getValue(item, 'unitCost', 'costPrice', 'purchasePrice'));
		const explicitCost = getValue(item, 'cost', 'lineCost');
		const cost = explicitCost == null ? quantity * unitCost : toNumber(explicitCost);

		row.unitsSold += quantity;
		row.revenue += revenue;
		row.cost += cost;
		row.profit += revenue - cost;
		const orderKey = saleId == null ? null : `${key}:${saleId}`;
		if (orderKey && !countedOrders.has(orderKey)) {
			countedOrders.set(orderKey, true);
			row.orderCount += 1;
		}
	}

	const rows = Array.from(metrics.values(), (row) => ({
		...row,
		averageSellingPrice: row.unitsSold ? row.revenue / row.unitsSold : 0,
		profitMargin: row.revenue ? (row.profit / row.revenue) * 100 : 0,
		inventoryValue: row.stockOnHand * (row.unitsSold ? row.cost / row.unitsSold : 0),
	}));
	const allowedSorts = new Set([
		'name', 'sku', 'category', 'stockOnHand', 'unitsSold', 'orderCount',
		'revenue', 'cost', 'profit', 'profitMargin', 'averageSellingPrice',
	]);
	const sortField = allowedSorts.has(sortBy) ? sortBy : 'revenue';
	const direction = String(order).toLowerCase() === 'asc' ? 1 : -1;
	rows.sort((a, b) => {
		const left = a[sortField];
		const right = b[sortField];
		if (typeof left === 'string' || typeof right === 'string') {
			return String(left || '').localeCompare(String(right || '')) * direction;
		}
		return (toNumber(left) - toNumber(right)) * direction;
	});

	const safeLimit = Number.isInteger(Number(limit)) && Number(limit) >= 0 ? Number(limit) : null;
	const resultRows = safeLimit == null ? rows : rows.slice(0, safeLimit);
	const totals = rows.reduce((total, row) => {
		total.products += 1;
		total.unitsSold += row.unitsSold;
		total.orderCount += row.orderCount;
		total.revenue += row.revenue;
		total.cost += row.cost;
		total.profit += row.profit;
		return total;
	}, { products: 0, unitsSold: 0, orderCount: 0, revenue: 0, cost: 0, profit: 0 });
	totals.profitMargin = totals.revenue ? (totals.profit / totals.revenue) * 100 : 0;

	return {
		period: { startDate: start, endDate: end },
		summary: totals,
		products: resultRows,
	};
}

/** Create a report service using a repository with getProductPerformanceData(). */
function createProductPerformanceReportService(repository) {
	return {
		async getProductPerformanceReport(options = {}) {
			if (!repository || typeof repository.getProductPerformanceData !== 'function') {
				throw new TypeError('A repository with getProductPerformanceData() is required');
			}
			const data = await repository.getProductPerformanceData({
				startDate: options.startDate,
				endDate: options.endDate,
			});
			return buildProductPerformanceReport({ ...data, ...options });
		},
	};
}

module.exports = {
	buildProductPerformanceReport,
	createProductPerformanceReportService,
};

