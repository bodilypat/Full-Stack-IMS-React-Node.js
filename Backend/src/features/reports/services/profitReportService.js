/* File: #src/features/reports/services/profitReportService.js */

'use strict';

const EXCLUDED_STATUSES = new Set(['cancelled', 'canceled', 'void', 'refunded']);

function toNumber(value) {
	const result = Number(value);
	return Number.isFinite(result) ? result : 0;
}

function pick(...values) {
	return values.find((value) => value !== undefined && value !== null);
}

function money(value) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Aggregate sales into a gross-profit report.
 * Sale items may use quantity/qty, unitPrice/price, and unitCost/costPrice;
 * product details can also be supplied under item.product.
 */
function generateProfitReport({ sales = [], startDate, endDate } = {}) {
	if (!Array.isArray(sales)) throw new TypeError('sales must be an array');

	const start = startDate == null ? null : new Date(startDate);
	const end = endDate == null ? null : new Date(endDate);
	if (start && Number.isNaN(start.getTime())) throw new TypeError('Invalid startDate');
	if (end && Number.isNaN(end.getTime())) throw new TypeError('Invalid endDate');
	if (start && end && start > end) throw new RangeError('startDate must not be after endDate');

	const summary = {
		salesCount: 0,
		unitsSold: 0,
		revenue: 0,
		costOfGoodsSold: 0,
		grossProfit: 0,
		profitMargin: 0,
		missingCostLines: 0,
	};
	const daily = new Map();
	const products = new Map();

	for (const sale of sales) {
		if (!sale || EXCLUDED_STATUSES.has(String(sale.status || '').toLowerCase())) continue;
		const rawDate = pick(sale.date, sale.saleDate, sale.createdAt);
		const date = rawDate == null ? null : new Date(rawDate);
		if (!date || Number.isNaN(date.getTime())) continue;
		if (start && date < start) continue;
		if (end && date > end) continue;

		const items = pick(sale.items, sale.saleItems, sale.lines, []);
		if (!Array.isArray(items)) continue;
		const lines = items.map((item) => {
			const product = item.product || {};
			const quantity = toNumber(pick(item.quantity, item.qty, 0));
			const unitPrice = toNumber(pick(item.unitPrice, item.sellingPrice, item.price, product.sellingPrice, product.price, 0));
			const rawCost = pick(item.unitCost, item.costPrice, item.purchasePrice, product.costPrice, product.purchasePrice);
			const gross = quantity * unitPrice;
			return {
				item,
				product,
				quantity,
				gross,
				net: Math.max(0, gross - toNumber(pick(item.discountAmount, item.discount, 0))),
				unitCost: toNumber(rawCost),
				hasCost: rawCost != null,
			};
		}).filter((line) => line.quantity > 0);
		if (lines.length === 0) continue;

		const grossTotal = lines.reduce((total, line) => total + line.gross, 0);
		const saleDiscount = Math.max(0, toNumber(pick(sale.discountAmount, sale.discount, 0)));
		const discountRate = grossTotal > 0 ? Math.min(saleDiscount, grossTotal) / grossTotal : 0;
		const dayKey = date.toISOString().slice(0, 10);
		const day = daily.get(dayKey) || {
			date: dayKey, salesCount: 0, unitsSold: 0, revenue: 0,
			costOfGoodsSold: 0, grossProfit: 0,
		};
		summary.salesCount += 1;
		day.salesCount += 1;

		for (const line of lines) {
			const revenue = Math.max(0, line.net - line.gross * discountRate);
			const cost = line.quantity * line.unitCost;
			const profit = revenue - cost;
			const productId = pick(line.item.productId, line.product.id, line.product._id, line.item.sku, line.product.sku, 'unknown');
			const productName = pick(line.item.productName, line.product.name, line.product.title, 'Unknown product');
			const key = String(productId);
			const productRow = products.get(key) || {
				productId, productName, unitsSold: 0, revenue: 0,
				costOfGoodsSold: 0, grossProfit: 0, profitMargin: 0,
			};

			summary.unitsSold += line.quantity;
			summary.revenue += revenue;
			summary.costOfGoodsSold += cost;
			summary.grossProfit += profit;
			if (!line.hasCost) summary.missingCostLines += 1;

			day.unitsSold += line.quantity;
			day.revenue += revenue;
			day.costOfGoodsSold += cost;
			day.grossProfit += profit;
			productRow.unitsSold += line.quantity;
			productRow.revenue += revenue;
			productRow.costOfGoodsSold += cost;
			productRow.grossProfit += profit;
			products.set(key, productRow);
		}
		daily.set(dayKey, day);
	}

	for (const row of [summary, ...daily.values(), ...products.values()]) {
		row.revenue = money(row.revenue);
		row.costOfGoodsSold = money(row.costOfGoodsSold);
		row.grossProfit = money(row.grossProfit);
		if (Object.prototype.hasOwnProperty.call(row, 'profitMargin')) {
			row.profitMargin = row.revenue ? money((row.grossProfit / row.revenue) * 100) : 0;
		}
	}

	return {
		period: {
			startDate: start ? start.toISOString() : null,
			endDate: end ? end.toISOString() : null,
		},
		summary,
		daily: [...daily.values()].sort((a, b) => a.date.localeCompare(b.date)),
		products: [...products.values()].sort((a, b) => b.grossProfit - a.grossProfit),
	};
}

module.exports = { generateProfitReport };
