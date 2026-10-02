/* File: #src/features/reports/repositories/purchaseReportRepository.js */

const createPurchaseReportRepository = (db) => {
	if (!db || typeof db.query !== 'function') {
		throw new TypeError('A database client with a query method is required');
	}

	const filtersToSql = ({ startDate, endDate, supplierId, status } = {}) => {
		const clauses = [];
		const params = [];

		if (startDate) {
			clauses.push('p.purchase_date >= ?');
			params.push(startDate);
		}
		if (endDate) {
			clauses.push('p.purchase_date < DATE_ADD(?, INTERVAL 1 DAY)');
			params.push(endDate);
		}
		if (supplierId !== undefined && supplierId !== null && supplierId !== '') {
			clauses.push('p.supplier_id = ?');
			params.push(supplierId);
		}
		if (status) {
			clauses.push('p.status = ?');
			params.push(status);
		}

		return {
			where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
			params,
		};
	};

	const rowsFrom = (result) =>
		Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;

	return {
		async getPurchaseReport(filters = {}) {
			const { where, params } = filtersToSql(filters);
			const sql = `
				SELECT p.id AS purchase_id, p.purchase_date, p.invoice_number, p.status,
							 p.supplier_id, s.name AS supplier_name,
							 COUNT(pi.id) AS item_count,
							 COALESCE(SUM(pi.quantity), 0) AS total_quantity,
							 COALESCE(SUM(pi.quantity * pi.unit_cost), 0) AS total_amount
				FROM purchases p
				LEFT JOIN suppliers s ON s.id = p.supplier_id
				LEFT JOIN purchase_items pi ON pi.purchase_id = p.id
				${where}
				GROUP BY p.id, p.purchase_date, p.invoice_number, p.status,
								 p.supplier_id, s.name
				ORDER BY p.purchase_date DESC, p.id DESC
			`;
			return rowsFrom(await db.query(sql, params));
		},

		async getPurchaseReportSummary(filters = {}) {
			const { where, params } = filtersToSql(filters);
			const sql = `
				SELECT COUNT(DISTINCT p.id) AS purchase_count,
							 COALESCE(SUM(pi.quantity), 0) AS total_quantity,
							 COALESCE(SUM(pi.quantity * pi.unit_cost), 0) AS total_amount
				FROM purchases p
				LEFT JOIN purchase_items pi ON pi.purchase_id = p.id
				${where}
			`;
			const rows = rowsFrom(await db.query(sql, params));
			return rows[0] || { purchase_count: 0, total_quantity: 0, total_amount: 0 };
		},

		async getPurchaseReportDetails(purchaseId) {
			const sql = `
				SELECT p.id AS purchase_id, p.purchase_date, p.invoice_number, p.status,
							 s.name AS supplier_name, pi.product_id, pr.name AS product_name,
							 pi.quantity, pi.unit_cost,
							 (pi.quantity * pi.unit_cost) AS line_total
				FROM purchases p
				LEFT JOIN suppliers s ON s.id = p.supplier_id
				INNER JOIN purchase_items pi ON pi.purchase_id = p.id
				LEFT JOIN products pr ON pr.id = pi.product_id
				WHERE p.id = ?
				ORDER BY pi.id
			`;
			return rowsFrom(await db.query(sql, [purchaseId]));
		},
	};
};

module.exports = createPurchaseReportRepository;
