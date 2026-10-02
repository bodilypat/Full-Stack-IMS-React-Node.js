/**********************************************************************
 * File: #src/features/reports/controllers/profitReportController.js
 ** -- getProfitReport()
 ** -- getProfitTrends()
 ** -- getProfitAnalysis()
 ** -- getProfitPerformance()
 ** -- getProfitComparison()
 ** -- getProfitSummary()   
 ********************************************************************* */

const getSalesModel = (req) =>
	req.app?.locals?.models?.Sale ||
	req.app?.locals?.Sale ||
	req.models?.Sale;

const getDateRange = (query = {}) => {
	const start = query.startDate || query.from;
	const end = query.endDate || query.to;
	const range = {};

	if (start && !Number.isNaN(Date.parse(start))) range.$gte = new Date(start);
	if (end && !Number.isNaN(Date.parse(end))) {
		const endDate = new Date(end);
		endDate.setHours(23, 59, 59, 999);
		range.$lte = endDate;
	}

	return Object.keys(range).length ? range : null;
};

const getSaleDate = (sale) =>
	sale.date || sale.saleDate || sale.createdAt || sale.updatedAt;

const getLineItems = (sale) =>
	sale.items || sale.products || sale.orderItems || sale.saleItems || [];

const numericValue = (...values) => {
	const value = values.find((item) => item !== undefined && item !== null && item !== '');
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
};

const getSaleMetrics = (sale) => {
	const items = getLineItems(sale);
	let revenue = 0;
	let cost = 0;

	if (Array.isArray(items) && items.length) {
		items.forEach((item) => {
			const quantity = numericValue(item.quantity, item.qty, 1);
			const unitPrice = numericValue(item.sellingPrice, item.salePrice, item.price, item.unitPrice);
			const unitCost = numericValue(
				item.costPrice,
				item.purchasePrice,
				item.unitCost,
				item.product?.costPrice,
				item.product?.purchasePrice
			);
			revenue += numericValue(item.total, item.lineTotal, item.subtotal) || unitPrice * quantity;
			cost += unitCost * quantity;
		});
	} else {
		revenue = numericValue(sale.totalAmount, sale.total, sale.grandTotal, sale.amount);
		cost = numericValue(sale.totalCost, sale.costAmount, sale.cost);
	}

	return { revenue, cost, profit: revenue - cost };
};

const loadSales = async (req, query = {}) => {
	const Sale = getSalesModel(req);
	if (!Sale || typeof Sale.find !== 'function') {
		const error = new Error('Sale model is not configured');
		error.status = 500;
		throw error;
	}

	const dateRange = getDateRange(query);
	const filter = {};
	if (dateRange) {
		filter.$or = [
			{ date: dateRange },
			{ saleDate: dateRange },
			{ createdAt: dateRange }
		];
	}

	let salesQuery = Sale.find(filter);
	if (salesQuery && typeof salesQuery.lean === 'function') salesQuery = salesQuery.lean();
	return salesQuery;
};

const sendReport = (res, data) => res.status(200).json({ success: true, data });

const handleError = (res, error) => {
	const status = error.status || 500;
	return res.status(status).json({
		success: false,
		message: status === 500 ? 'Unable to generate profit report' : error.message
	});
};

const getProfitReport = async (req, res) => {
	try {
		const sales = await loadSales(req, req.query);
		const rows = sales.map((sale) => ({
			saleId: sale._id,
			date: getSaleDate(sale),
			...getSaleMetrics(sale)
		}));
		const totals = rows.reduce((result, row) => ({
			revenue: result.revenue + row.revenue,
			cost: result.cost + row.cost,
			profit: result.profit + row.profit
		}), { revenue: 0, cost: 0, profit: 0 });

		return sendReport(res, { rows, totals, count: rows.length });
	} catch (error) {
		return handleError(res, error);
	}
};

const getProfitTrends = async (req, res) => {
	try {
		const sales = await loadSales(req, req.query);
		const period = req.query.period === 'month' ? 'month' : 'day';
		const buckets = new Map();

		sales.forEach((sale) => {
			const date = new Date(getSaleDate(sale));
			if (Number.isNaN(date.getTime())) return;
			if (period === 'month') date.setDate(1);
			const key = period === 'month'
				? date.toISOString().slice(0, 7)
				: date.toISOString().slice(0, 10);
			const metrics = getSaleMetrics(sale);
			const bucket = buckets.get(key) || { period: key, revenue: 0, cost: 0, profit: 0 };
			bucket.revenue += metrics.revenue;
			bucket.cost += metrics.cost;
			bucket.profit += metrics.profit;
			buckets.set(key, bucket);
		});

		return sendReport(res, Array.from(buckets.values()).sort((a, b) => a.period.localeCompare(b.period)));
	} catch (error) {
		return handleError(res, error);
	}
};

const getProfitAnalysis = async (req, res) => {
	try {
		const sales = await loadSales(req, req.query);
		const products = new Map();

		sales.forEach((sale) => getLineItems(sale).forEach((item) => {
			const product = item.product || {};
			const id = String(item.productId || product._id || item._id || item.name || 'Unspecified');
			const name = item.productName || product.name || item.name || 'Unspecified';
			const bucket = products.get(id) || { productId: id, name, revenue: 0, cost: 0, profit: 0, quantity: 0 };
			const quantity = numericValue(item.quantity, item.qty, 1);
			const metrics = getSaleMetrics({ items: [item] });
			bucket.revenue += metrics.revenue;
			bucket.cost += metrics.cost;
			bucket.profit += metrics.profit;
			bucket.quantity += quantity;
			products.set(id, bucket);
		}));

		const analysis = Array.from(products.values()).sort((a, b) => b.profit - a.profit);
		return sendReport(res, analysis);
	} catch (error) {
		return handleError(res, error);
	}
};

const getProfitPerformance = async (req, res) => {
	try {
		const sales = await loadSales(req, req.query);
		const totals = sales.reduce((result, sale) => {
			const metrics = getSaleMetrics(sale);
			result.revenue += metrics.revenue;
			result.cost += metrics.cost;
			result.profit += metrics.profit;
			return result;
		}, { revenue: 0, cost: 0, profit: 0 });

		const margin = totals.revenue ? (totals.profit / totals.revenue) * 100 : 0;
		return sendReport(res, { ...totals, margin: Number(margin.toFixed(2)), salesCount: sales.length });
	} catch (error) {
		return handleError(res, error);
	}
};

const getProfitComparison = async (req, res) => {
	try {
		const currentStart = new Date(req.query.startDate || req.query.from);
		const currentEnd = new Date(req.query.endDate || req.query.to);
		if (Number.isNaN(currentStart.getTime()) || Number.isNaN(currentEnd.getTime())) {
			return res.status(400).json({ success: false, message: 'Valid startDate and endDate are required' });
		}

		const duration = currentEnd.getTime() - currentStart.getTime();
		const previousStart = new Date(currentStart.getTime() - duration - 1);
		const previousEnd = new Date(currentStart.getTime() - 1);
		const [currentSales, previousSales] = await Promise.all([
			loadSales(req, { startDate: currentStart, endDate: currentEnd }),
			loadSales(req, { startDate: previousStart, endDate: previousEnd })
		]);
		const summarize = (sales) => sales.reduce((result, sale) => {
			const metrics = getSaleMetrics(sale);
			result.revenue += metrics.revenue;
			result.cost += metrics.cost;
			result.profit += metrics.profit;
			return result;
		}, { revenue: 0, cost: 0, profit: 0 });
		const current = summarize(currentSales);
		const previous = summarize(previousSales);
		const change = (value, baseline) => baseline ? ((value - baseline) / Math.abs(baseline)) * 100 : null;

		return sendReport(res, {
			current,
			previous,
			change: {
				revenue: change(current.revenue, previous.revenue),
				cost: change(current.cost, previous.cost),
				profit: change(current.profit, previous.profit)
			}
		});
	} catch (error) {
		return handleError(res, error);
	}
};

const getProfitSummary = async (req, res) => {
	try {
		const sales = await loadSales(req, req.query);
		const totals = sales.reduce((result, sale) => {
			const metrics = getSaleMetrics(sale);
			result.revenue += metrics.revenue;
			result.cost += metrics.cost;
			result.profit += metrics.profit;
			return result;
		}, { revenue: 0, cost: 0, profit: 0 });

		return sendReport(res, {
			...totals,
			margin: totals.revenue ? Number(((totals.profit / totals.revenue) * 100).toFixed(2)) : 0,
			salesCount: sales.length
		});
	} catch (error) {
		return handleError(res, error);
	}
};

module.exports = {
	getProfitReport,
	getProfitTrends,
	getProfitAnalysis,
	getProfitPerformance,
	getProfitComparison,
	getProfitSummary
};

