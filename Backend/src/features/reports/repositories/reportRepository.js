/* File: #src/features/reports/repositories/reportRepository.js */

const createReportRepository = (database) => {
	if (!database || (typeof database.query !== 'function' && typeof database.execute !== 'function')) {
		throw new TypeError('A database client with query() or execute() is required');
	}

	const query = async (sql, params = []) => {
		const result = typeof database.execute === 'function'
			? await database.execute(sql, params)
			: await database.query(sql, params);

		// mysql2 returns [rows, fields]; PostgreSQL clients return { rows }.
		if (result && Array.isArray(result.rows)) return result.rows;
		if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
		return result;
	};

	return {
		async getInventorySummary() {
			const rows = await query(`
				SELECT COUNT(*) AS product_count,
							 COALESCE(SUM(quantity), 0) AS total_units,
							 COALESCE(SUM(quantity * unit_price), 0) AS inventory_value,
							 COALESCE(SUM(CASE WHEN quantity <= minimum_stock THEN 1 ELSE 0 END), 0) AS low_stock_count,
							 COALESCE(SUM(CASE WHEN quantity = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock_count
				FROM products
			`);
			return rows[0] || {};
		},

		async getStockByCategory() {
			return query(`
				SELECT c.id AS category_id, c.name AS category_name,
							 COUNT(p.id) AS product_count,
							 COALESCE(SUM(p.quantity), 0) AS total_units,
							 COALESCE(SUM(p.quantity * p.unit_price), 0) AS inventory_value
				FROM categories c
				LEFT JOIN products p ON p.category_id = c.id
				GROUP BY c.id, c.name
				ORDER BY c.name
			`);
		},

		async getLowStock({ categoryId, limit = 100, offset = 0 } = {}) {
			const conditions = ['p.quantity <= p.minimum_stock'];
			const params = [];
			if (categoryId != null) {
				conditions.push('p.category_id = ?');
				params.push(categoryId);
			}
			params.push(limit, offset);

			return query(`
				SELECT p.id, p.name, p.sku, p.quantity, p.minimum_stock, p.unit_price,
							 c.name AS category_name
				FROM products p
				LEFT JOIN categories c ON c.id = p.category_id
				WHERE ${conditions.join(' AND ')}
				ORDER BY p.quantity ASC, p.name ASC
				LIMIT ? OFFSET ?
			`, params);
		},

		async getInventoryValuation({ categoryId } = {}) {
			const params = [];
			const where = categoryId == null ? '' : 'WHERE p.category_id = ?';
			if (categoryId != null) params.push(categoryId);

			return query(`
				SELECT p.id, p.name, p.sku, p.quantity, p.unit_price,
							 (p.quantity * p.unit_price) AS stock_value,
							 c.name AS category_name
				FROM products p
				LEFT JOIN categories c ON c.id = p.category_id
				${where}
				ORDER BY stock_value DESC, p.name ASC
			`, params);
		},

		async getStockMovements({ startDate, endDate, productId, movementType, limit = 100, offset = 0 } = {}) {
			const conditions = [];
			const params = [];
			if (startDate) {
				conditions.push('sm.created_at >= ?');
				params.push(startDate);
			}
			if (endDate) {
				conditions.push('sm.created_at < ?');
				params.push(endDate);
			}
			if (productId != null) {
				conditions.push('sm.product_id = ?');
				params.push(productId);
			}
			if (movementType) {
				conditions.push('sm.movement_type = ?');
				params.push(movementType);
			}
			params.push(limit, offset);

			return query(`
				SELECT sm.id, sm.product_id, p.name AS product_name, p.sku,
							 sm.movement_type, sm.quantity, sm.created_at
				FROM stock_movements sm
				LEFT JOIN products p ON p.id = sm.product_id
				${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
				ORDER BY sm.created_at DESC, sm.id DESC
				LIMIT ? OFFSET ?
			`, params);
		},
	};
};

module.exports = createReportRepository;
