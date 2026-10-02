/* File: #src/features/reports/repositories/stockMovementReportRepository.js */

const createStockMovementReportRepository = (db) => {
	if (!db || typeof db.query !== 'function') {
		throw new TypeError('A database client with a query method is required');
	}

	return {
		async getStockMovementReport() {
			const sql = `
				SELECT i.id AS inventory_id,
				       p.name AS product_name,
				       i.quantity,
				       i.date
				FROM inventory i
				JOIN products p ON p.id = i.product_id
				ORDER BY i.date DESC
			`;
			return await db.query(sql);
		},
	};
};

module.exports = createStockMovementReportRepository;

