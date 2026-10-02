/* ******************************************************* */
/* File: #src/features/products/services/productService.js */ 
/* ******************************************************* */

/** Product database operations. Expects a PostgreSQL-compatible pool/client. */
const PRODUCT_FIELDS = [
	'name', 'description', 'sku', 'barcode', 'category_id', 'supplier_id',
	'quantity', 'unit_price', 'reorder_level',
];

function createProductRepository(db) {
	if (!db || typeof db.query !== 'function') {
		throw new TypeError('A database client with a query() method is required');
	}

	async function findProducts({ limit = 50, offset = 0 } = {}) {
		const { rows } = await db.query('SELECT * FROM products ORDER BY id LIMIT $1 OFFSET $2', [limit, offset]);
		return rows;
	}

	async function findProductById(id) {
		const { rows } = await db.query('SELECT * FROM products WHERE id = $1', [id]);
		return rows[0] || null;
	}

	async function findBySku(sku) {
		const { rows } = await db.query('SELECT * FROM products WHERE sku = $1', [sku]);
		return rows[0] || null;
	}

	async function findByBarcode(barcode) {
		const { rows } = await db.query('SELECT * FROM products WHERE barcode = $1', [barcode]);
		return rows[0] || null;
	}

	async function createProduct(product) {
		const fields = PRODUCT_FIELDS.filter((field) => product[field] !== undefined);
		if (!fields.length) throw new TypeError('At least one product field is required');
		const values = fields.map((field) => product[field]);
		const columns = fields.join(', ');
		const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
		const { rows } = await db.query(
			`INSERT INTO products (${columns}) VALUES (${placeholders}) RETURNING *`, values,
		);
		return rows[0];
	}

	async function updateProduct(id, updates) {
		const fields = PRODUCT_FIELDS.filter((field) => updates[field] !== undefined);
		if (!fields.length) return findProductById(id);
		const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
		const values = fields.map((field) => updates[field]);
		values.push(id);
		const { rows } = await db.query(
			`UPDATE products SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
			values,
		);
		return rows[0] || null;
	}

	async function deleteProduct(id) {
		const { rows } = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
		return rows[0] || null;
	}

	async function findByCategory(categoryId, options = {}) {
		return findByForeignKey('category_id', categoryId, options);
	}

	async function findBySupplier(supplierId, options = {}) {
		return findByForeignKey('supplier_id', supplierId, options);
	}

	async function findByForeignKey(field, value, { limit = 50, offset = 0 } = {}) {
		const { rows } = await db.query(
			`SELECT * FROM products WHERE ${field} = $1 ORDER BY id LIMIT $2 OFFSET $3`,
			[value, limit, offset],
		);
		return rows;
	}

	async function searchProducts(term, { limit = 50, offset = 0 } = {}) {
		const { rows } = await db.query(
			'SELECT * FROM products WHERE name ILIKE $1 OR sku ILIKE $1 OR barcode ILIKE $1 OR description ILIKE $1 ORDER BY id LIMIT $2 OFFSET $3',
			[`%${term}%`, limit, offset],
		);
		return rows;
	}

	async function countProducts() {
		const { rows } = await db.query('SELECT COUNT(*) AS count FROM products');
		return Number(rows[0].count);
	}

	return {
		findProducts, findProductById, findBySku, findByBarcode, createProduct,
		updateProduct, deleteProduct, findByCategory, findBySupplier,
		searchProducts, countProducts,
	};
}

module.exports = createProductRepository;
