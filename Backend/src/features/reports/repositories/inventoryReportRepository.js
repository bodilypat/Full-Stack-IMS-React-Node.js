/* File: #src/features/reports/repositories/inventoryReportRepository.js */

const createInventoryReportRepository = (db) => {
	if (!db || typeof db.query !== 'function') {
		throw new TypeError('A database client with a query method is required');
	}

	return {
		async getInventoryReport() {
			const sql = `
				SELECT p.id AS product_id,
				       p.name AS product_name,
				       p.sku,
				       COALESCE(stock.current_stock, 0) AS current_stock
				FROM products p
				LEFT JOIN (
					SELECT product_id, SUM(quantity) AS current_stock
					FROM inventory
					GROUP BY product_id
				) stock ON stock.product_id = p.id
				ORDER BY p.name, p.id
			`;
			return db.query(sql);
		},
	};
};

module.exports = createInventoryReportRepository;

