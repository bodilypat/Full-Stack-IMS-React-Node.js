/* ***************************************************************** */
/* File: #src/features/dashboard/repositories/DashboardRepository.js */ 
/* ***************************************************************** */

class DashboardRepository {
	constructor({ Sale, Purchase, Product, Inventory, Transaction } = {}) {
		this.Sale = Sale;
		this.Purchase = Purchase;
		this.Product = Product;
		this.Inventory = Inventory;
		this.Transaction = Transaction;
	}

	_dateMatch(from, to) {
		const createdAt = {};
		if (from) createdAt.$gte = new Date(from);
		if (to) createdAt.$lte = new Date(to);
		return Object.keys(createdAt).length ? { createdAt } : {};
	}

	async _summary(Model, from, to) {
		if (!Model) return { count: 0, total: 0 };
		const [result] = await Model.aggregate([
			{ $match: this._dateMatch(from, to) },
			{ $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$total' } } },
		]);
		return { count: result?.count || 0, total: result?.total || 0 };
	}

	getSalesSummary(options = {}) {
		return this._summary(this.Sale, options.from, options.to);
	}

	getPurchaseSummary(options = {}) {
		return this._summary(this.Purchase, options.from, options.to);
	}

	async getInventorySummary() {
		const Model = this.Inventory || this.Product;
		if (!Model) return { products: 0, units: 0, value: 0 };
		const [result] = await Model.aggregate([
			{ $group: { _id: null, products: { $sum: 1 }, units: { $sum: { $ifNull: ['$quantity', 0] } }, value: { $sum: { $multiply: [{ $ifNull: ['$quantity', 0] }, { $ifNull: ['$costPrice', '$price'] }] } } } },
		]);
		return { products: result?.products || 0, units: result?.units || 0, value: result?.value || 0 };
	}

	async getProductSummary() {
		if (!this.Product) return { total: 0, active: 0, lowStock: 0 };
		const [result] = await this.Product.aggregate([
			{ $group: { _id: null, total: { $sum: 1 }, active: { $sum: { $cond: [{ $ne: ['$status', 'inactive'] }, 1, 0] } }, lowStock: { $sum: { $cond: [{ $lte: ['$quantity', '$reorderLevel'] }, 1, 0] } } } },
		]);
		return result || { total: 0, active: 0, lowStock: 0 };
	}

	_overview(Model, field, days = 30) {
		if (!Model) return Promise.resolve([]);
		const since = new Date();
		since.setDate(since.getDate() - days);
		return Model.aggregate([
			{ $match: { [field]: { $gte: since } } },
			{ $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: `$${field}` } }, count: { $sum: 1 }, total: { $sum: '$total' } } },
			{ $sort: { _id: 1 } },
		]);
	}

	getSalesOverview(options = {}) { return this._overview(this.Sale, 'createdAt', options.days || 30); }
	getInventoryOverview(options = {}) { return this._overview(this.Inventory || this.Product, 'updatedAt', options.days || 30); }

	getRecentTransactions(limit = 10) {
		const Model = this.Transaction || this.Sale;
		return Model ? Model.find({}).sort({ createdAt: -1 }).limit(limit).lean() : Promise.resolve([]);
	}

	getTopProducts(limit = 10) {
		return this.Sale ? this.Sale.aggregate([{ $unwind: '$items' }, { $group: { _id: '$items.product', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } }, { $sort: { revenue: -1 } }, { $limit: limit }]) : Promise.resolve([]);
	}

	getLowStockProducts(limit = 10) {
		return this.Product ? this.Product.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }).sort({ quantity: 1 }).limit(limit).lean() : Promise.resolve([]);
	}

	getPendingPurchases(limit = 10) {
		return this.Purchase ? this.Purchase.find({ status: { $regex: /^pending$/i } }).sort({ createdAt: -1 }).limit(limit).lean() : Promise.resolve([]);
	}
}

module.exports = DashboardRepository;
 
