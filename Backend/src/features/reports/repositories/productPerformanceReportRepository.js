/* File: #src/features/reports/repositories/productPerformanceReportRepository.js */

const createProductPerformanceReportRepository = (db) => {
	if (!db || typeof db.query !== 'function') {
		throw new TypeError('A database client with a query method is required');
	}

	return {
		async getProductPerformanceReport() {
			const sql = `
				SELECT p.id AS product_id,
				       p.name AS product_name,
				       p.sku,
				       COALESCE(SUM(s.quantity), 0) AS total_sales,
				       COALESCE(AVG(s.unit_price), 0) AS average_selling_price
				FROM products p
				LEFT JOIN sales s ON s.product_id = p.id
				GROUP BY p.id, p.name, p.sku
				ORDER BY total_sales DESC
			`;
			return await db.query(sql);
		},
	};
};

module.exports = createProductPerformanceReportRepository;


