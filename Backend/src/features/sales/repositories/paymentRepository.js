/* File: #src/features/sales/repositories/paymentRepository.js
**  database operations for payments
**  - create()
**  - findAll()
**  - findById()
**  - update()
**  - delete()
*/

const db = require('../../../config/db');

const paymentRepository = {
	async create(payment) {
		const { sale_id, amount, payment_method, payment_date, reference } = payment;
		const [result] = await db.query(
			`INSERT INTO payments (sale_id, amount, payment_method, payment_date, reference)
			 VALUES (?, ?, ?, ?, ?)`,
			[sale_id, amount, payment_method, payment_date, reference ?? null]
		);

		return { payment_id: result.insertId, ...payment };
	},

	async findAll() {
		const [rows] = await db.query(
			'SELECT * FROM payments ORDER BY payment_date DESC'
		);
		return rows;
	},

	async findById(id) {
		const [rows] = await db.query(
			'SELECT * FROM payments WHERE payment_id = ? LIMIT 1',
			[id]
		);
		return rows[0] || null;
	},

	async update(id, payment) {
		const allowedFields = ['sale_id', 'amount', 'payment_method', 'payment_date', 'reference'];
		const fields = allowedFields.filter((field) => payment[field] !== undefined);
		if (fields.length === 0) return false;

		const assignments = fields.map((field) => `${field} = ?`).join(', ');
		const values = fields.map((field) => payment[field]);
		const [result] = await db.query(
			`UPDATE payments SET ${assignments} WHERE payment_id = ?`,
			[...values, id]
		);
		return result.affectedRows > 0;
	},

	async delete(id) {
		const [result] = await db.query(
			'DELETE FROM payments WHERE payment_id = ?',
			[id]
		);
		return result.affectedRows > 0;
	},
};

module.exports = paymentRepository;
    


