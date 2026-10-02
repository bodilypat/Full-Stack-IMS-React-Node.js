/* File: #src/features/reports/services/purchaseReportService.js */

const toNumber = (value) => {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
};

const valueOf = (record, keys, fallback = undefined) => {
	for (const key of keys) {
		if (record?.[key] !== undefined && record[key] !== null) return record[key];
	}
	return fallback;
};

const getTotal = (purchase) => {
	const total = valueOf(purchase, ['grandTotal', 'totalAmount', 'total', 'amount']);
	if (total !== undefined) return toNumber(total);

	const items = purchase.items || purchase.purchaseItems || purchase.products || [];
	return items.reduce((sum, item) => {
		const quantity = toNumber(valueOf(item, ['quantity', 'qty']));
		const price = toNumber(valueOf(item, ['unitPrice', 'purchasePrice', 'price', 'costPrice']));
		return sum + toNumber(valueOf(item, ['lineTotal', 'total'], quantity * price));
	}, 0);
};

const normalizePurchase = (purchase) => {
	const row = typeof purchase?.toJSON === 'function' ? purchase.toJSON() : purchase;
	return {
		...row,
		purchaseDate: valueOf(row, ['purchaseDate', 'date', 'createdAt', 'created_at'], null),
		supplierName:
			valueOf(row, ['supplierName']) || valueOf(row.supplier, ['name', 'supplierName'], 'Unknown supplier'),
		totalAmount: getTotal(row),
	};
};

const matchesDateRange = (dateValue, startDate, endDate) => {
	if (!dateValue) return !startDate && !endDate;
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return false;

	if (startDate) {
		const start = new Date(startDate);
		if (Number.isNaN(start.getTime()) || date < start) return false;
	}
	if (endDate) {
		const end = new Date(endDate);
		if (Number.isNaN(end.getTime())) return false;
		end.setHours(23, 59, 59, 999);
		if (date > end) return false;
	}
	return true;
};

/** Generate a purchase report from records or from a model exposing findAll(). */
const generatePurchaseReport = async (options = {}) => {
	const {
		Purchase,
		purchases: suppliedPurchases,
		startDate,
		endDate,
		supplierId,
		status,
		search,
		page = 1,
		limit,
	} = options;

	let purchases = suppliedPurchases;
	if (!purchases && Purchase?.findAll) purchases = await Purchase.findAll();
	if (!Array.isArray(purchases)) {
		throw new TypeError('Provide purchases as an array or a Purchase model with findAll().');
	}

	const term = String(search || '').trim().toLowerCase();
	const filtered = purchases.map(normalizePurchase).filter((purchase) => {
		if (!matchesDateRange(purchase.purchaseDate, startDate, endDate)) return false;
		const purchaseSupplierId = valueOf(purchase, ['supplierId', 'supplier_id']);
		if (supplierId != null && String(purchaseSupplierId) !== String(supplierId)) return false;
		if (status && String(purchase.status || '').toLowerCase() !== String(status).toLowerCase()) return false;
		if (term) {
			const searchable = [purchase.id, purchase.purchaseNumber, purchase.invoiceNumber, purchase.supplierName, purchase.status]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			if (!searchable.includes(term)) return false;
		}
		return true;
	});

	filtered.sort((a, b) => new Date(b.purchaseDate || 0) - new Date(a.purchaseDate || 0));

	const byMonth = new Map();
	const bySupplier = new Map();
	const byStatus = new Map();
	let totalItems = 0;

	for (const purchase of filtered) {
		const amount = purchase.totalAmount;
		const month = purchase.purchaseDate && !Number.isNaN(new Date(purchase.purchaseDate).getTime())
			? new Date(purchase.purchaseDate).toISOString().slice(0, 7)
			: 'Unknown';
		const monthly = byMonth.get(month) || { month, purchaseCount: 0, totalAmount: 0 };
		monthly.purchaseCount += 1;
		monthly.totalAmount += amount;
		byMonth.set(month, monthly);

		const id = valueOf(purchase, ['supplierId', 'supplier_id'], null);
		const supplierKey = String(id ?? purchase.supplierName);
		const supplier = bySupplier.get(supplierKey) || {
			supplierId: id,
			supplierName: purchase.supplierName,
			purchaseCount: 0,
			totalAmount: 0,
		};
		supplier.purchaseCount += 1;
		supplier.totalAmount += amount;
		bySupplier.set(supplierKey, supplier);

		const purchaseStatus = purchase.status || 'Unknown';
		const statusSummary = byStatus.get(purchaseStatus) || { status: purchaseStatus, count: 0, totalAmount: 0 };
		statusSummary.count += 1;
		statusSummary.totalAmount += amount;
		byStatus.set(purchaseStatus, statusSummary);

		totalItems += (purchase.items || purchase.purchaseItems || []).reduce(
			(sum, item) => sum + toNumber(valueOf(item, ['quantity', 'qty'])),
			0,
		);
	}

	const totalAmount = filtered.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
	const pageNumber = Math.max(1, Math.floor(toNumber(page)));
	const pageSize = limit == null ? filtered.length : Math.max(1, Math.floor(toNumber(limit)));
	const offset = (pageNumber - 1) * pageSize;

	return {
		filters: { startDate: startDate || null, endDate: endDate || null, supplierId: supplierId ?? null, status: status || null },
		summary: {
			purchaseCount: filtered.length,
			totalAmount,
			averagePurchaseAmount: filtered.length ? totalAmount / filtered.length : 0,
			totalItems,
		},
		purchases: limit == null ? filtered : filtered.slice(offset, offset + pageSize),
		pagination: {
			page: pageNumber,
			limit: limit == null ? filtered.length : pageSize,
			total: filtered.length,
			pages: limit == null ? (filtered.length ? 1 : 0) : Math.ceil(filtered.length / pageSize),
		},
		breakdown: {
			byMonth: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)),
			bySupplier: [...bySupplier.values()].sort((a, b) => b.totalAmount - a.totalAmount),
			byStatus: [...byStatus.values()],
		},
	};
};

module.exports = { generatePurchaseReport };
