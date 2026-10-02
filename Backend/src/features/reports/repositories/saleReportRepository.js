/* **************************************************************** */
/* File: #src/features/reports/repositories/saleReportRepository.js */
/* **************************************************************** */

/** Create sales-report queries using the application's mysql2 pool/connection. */
const createSaleReportRepository = (db) => {
	if (!db || typeof db.query !== 'function') {
		throw new TypeError('A database connection with a query() method is required');
	}

	const filtersToSql = (filters = {}) => {
		const clauses = [];
		const params = [];

		if (filters.startDate) {
			clauses.push('s.sale_date >= ?');
			params.push(filters.startDate);
		}
		if (filters.endDate) {
			// Exclusive next-day bound includes all times on the requested end date.
			clauses.push('s.sale_date < DATE_ADD(?, INTERVAL 1 DAY)');
			params.push(filters.endDate);
		}
		if (filters.customerId != null) {
			clauses.push('s.customer_id = ?');
			params.push(filters.customerId);
		}
		if (filters.paymentStatus) {
			clauses.push('s.payment_status = ?');
			params.push(filters.paymentStatus);
		}

		return {
			where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
			params,
		};
	};

	const queryRows = async (sql, params = []) => {
		const [result] = await db.query(sql, params);
		return result;
	};

	return {
		async findSales(filters = {}) {
			const { where, params } = filtersToSql(filters);
			const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
			const limit = Math.min(500, Math.max(1, Number.parseInt(filters.limit, 10) || 50));
			const offset = (page - 1) * limit;

			const [data, countRows] = await Promise.all([
				queryRows(
					`SELECT s.id, s.invoice_number, s.sale_date, s.customer_id,
									c.name AS customer_name, s.subtotal, s.discount, s.tax,
									s.total_amount, s.payment_status
					 FROM sales s
					 LEFT JOIN customers c ON c.id = s.customer_id
					 ${where}
					 ORDER BY s.sale_date DESC, s.id DESC
					 LIMIT ? OFFSET ?`,
					[...params, limit, offset],
				),
				queryRows(`SELECT COUNT(*) AS total FROM sales s ${where}`, params),
			]);

			return { data, total: Number(countRows[0]?.total || 0), page, limit };
		},

		async getSummary(filters = {}) {
			const { where, params } = filtersToSql(filters);
			const result = await queryRows(
				`SELECT COUNT(*) AS sale_count,
								COALESCE(SUM(s.subtotal), 0) AS subtotal,
								COALESCE(SUM(s.discount), 0) AS discount,
								COALESCE(SUM(s.tax), 0) AS tax,
								COALESCE(SUM(s.total_amount), 0) AS total_sales
				 FROM sales s
				 ${where}`,
				params,
			);
			return result[0];
		},

		async getSalesByProduct(filters = {}) {
			const { where, params } = filtersToSql(filters);
			return queryRows(
				`SELECT p.id AS product_id, p.name AS product_name, p.sku,
								COALESCE(SUM(si.quantity), 0) AS quantity_sold,
								COALESCE(SUM(si.quantity * si.unit_price), 0) AS gross_sales
				 FROM sales s
				 INNER JOIN sale_items si ON si.sale_id = s.id
				 INNER JOIN products p ON p.id = si.product_id
				 ${where}
				 GROUP BY p.id, p.name, p.sku
				 ORDER BY gross_sales DESC`,
				params,
			);
		},

		async getSalesByDay(filters = {}) {
			const { where, params } = filtersToSql(filters);
			return queryRows(
				`SELECT DATE(s.sale_date) AS sale_day,
								COUNT(*) AS sale_count,
								COALESCE(SUM(s.total_amount), 0) AS total_sales
				 FROM sales s
				 ${where}
				 GROUP BY DATE(s.sale_date)
				 ORDER BY sale_day ASC`,
				params,
			);
		},
	};
};

module.exports = createSaleReportRepository;


