/* **************************************************************** */
/* File: #src/features/suppliers/repositories/supplierRepository.js */ 
/* **************************************************************** */

const { Op, fn, col } = require('sequelize');
const Supplier = require('../models/supplierModel');

const supplierRepository = {
	findSuppliers(options = {}) {
		const { page = 1, limit = 20, ...query } = options;
		const safePage = Math.max(Number(page) || 1, 1);
		const safeLimit = Math.max(Number(limit) || 20, 1);
		return Supplier.findAndCountAll({
			where: query,
			limit: safeLimit,
			offset: (safePage - 1) * safeLimit,
			order: [['createdAt', 'DESC']],
		});
	},

	findSupplierById(id, options = {}) {
		return Supplier.findByPk(id, options);
	},

	findByEmail(email) {
		return Supplier.findOne({ where: { email } });
	},

	findByCode(code) {
		return Supplier.findOne({ where: { code } });
	},

	createSupplier(data, options = {}) {
		return Supplier.create(data, options);
	},

	async updateSupplier(id, data, options = {}) {
		const supplier = await Supplier.findByPk(id, options);
		if (!supplier) return null;
		return supplier.update(data, options);
	},

	async deleteSupplier(id, options = {}) {
		const supplier = await Supplier.findByPk(id, options);
		if (!supplier) return null;
		await supplier.destroy(options);
		return supplier;
	},

	searchSuppliers(searchTerm, options = {}) {
		const term = String(searchTerm || '').trim();
		if (!term) return this.findSuppliers(options);
		const { page = 1, limit = 20, ...filters } = options;
		const safePage = Math.max(Number(page) || 1, 1);
		const safeLimit = Math.max(Number(limit) || 20, 1);
		return Supplier.findAndCountAll({
			where: {
				...filters,
				[Op.or]: ['name', 'email', 'code', 'phone'].map((field) => ({
					[field]: { [Op.like]: `%${term}%` },
				})),
			},
			limit: safeLimit,
			offset: (safePage - 1) * safeLimit,
			order: [['createdAt', 'DESC']],
		});
	},

	findSupplierProducts(supplierId, options = {}) {
		return Supplier.findByPk(supplierId, {
			...options,
			include: [...(options.include || []), { association: 'products', required: false }],
		});
	},

	findPurchaseHistory(supplierId, options = {}) {
		return Supplier.findByPk(supplierId, {
			...options,
			include: [...(options.include || []), { association: 'purchases', required: false }],
		});
	},

	getSupplierPurchaseSummary() {
		return Supplier.findAll({
			attributes: ['id', 'name', [fn('COUNT', col('purchases.id')), 'purchaseCount'], [fn('SUM', col('purchases.totalAmount')), 'purchaseTotal']],
			include: [{ association: 'purchases', attributes: [], required: false }],
			group: ['Supplier.id'],
			subQuery: false,
		});
	},

	getSupplierPaymentSummary() {
		return Supplier.findAll({
			attributes: ['id', 'name', [fn('SUM', col('payments.amount')), 'paymentTotal']],
			include: [{ association: 'payments', attributes: [], required: false }],
			group: ['Supplier.id'],
			subQuery: false,
		});
	},

	countSuppliers(where = {}) {
		return Supplier.count({ where });
	},
};

module.exports = supplierRepository;
