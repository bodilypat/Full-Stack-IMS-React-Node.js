/* File: #src/features/reports/repositories/profitReportRepository.js */

const createProfitReportRepository = (db) => {
	if (!db || typeof db.query !== 'function') {
		throw new TypeError('A database client with a query method is required');
	}

	return {
		async getProfitReport() {
			const sql = `
				SELECT p.id AS product_id,
				       p.name AS product_name,
				       p.sku,
				       COALESCE(SUM(s.quantity * s.unit_price), 0) AS total_revenue,
				       COALESCE(SUM(s.quantity * p.cost), 0) AS total_cost,
				       COALESCE(SUM(s.quantity * (s.unit_price - p.cost)), 0) AS total_profit
				FROM products p
				LEFT JOIN sales s ON s.product_id = p.id
				GROUP BY p.id, p.name, p.sku, p.cost
				ORDER BY total_profit DESC
			`;
			return await db.query(sql);
		},
	};
};

module.exports = createProfitReportRepository;

