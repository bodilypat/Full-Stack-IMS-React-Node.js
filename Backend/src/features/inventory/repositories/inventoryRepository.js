/* ***************************************************************** */
/* File: #src/features/inventory/repositories/inventoryRepository.js */ 
/* ***************************************************************** */

const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');

const inventoryRepository = {
	findInventory(filter = {}, options = {}) {
		return Inventory.find(filter)
			.populate(options.populate || ['product', 'location'])
			.sort(options.sort || { updatedAt: -1 })
			.skip(options.skip || 0)
			.limit(options.limit || 0)
			.lean();
	},

	findInventoryById(id, options = {}) {
		let query = Inventory.findById(id);
		if (options.populate !== false) query = query.populate(options.populate || ['product', 'location']);
		return query.lean();
	},

	findByProduct(productId, options = {}) {
		return Inventory.find({ product: productId, ...(options.filter || {}) })
			.populate(options.populate || ['product', 'location']).lean();
	},

	findByProductAndLocation(productId, locationId, options = {}) {
		return Inventory.findOne({ product: productId, location: locationId, ...(options.filter || {}) })
			.populate(options.populate || ['product', 'location']).lean();
	},

	async createInventoryRecord(data, options = {}) {
		const [record] = await Inventory.create([data], options);
		return record;
	},

	updateQuantity(id, quantity, options = {}) {
		return Inventory.findByIdAndUpdate(id, { $set: { quantity } }, {
			new: true, runValidators: true, ...(options.session ? { session: options.session } : {})
		});
	},

	executeStockIn(data, options = {}) {
		return this._changeQuantity({ ...data, type: 'stock-in' }, options);
	},

	executeStockOut(data, options = {}) {
		return this._changeQuantity({ ...data, quantity: -data.quantity, type: 'stock-out' }, options);
	},

	executeAdjustment(data, options = {}) {
		return this._changeQuantity({ ...data, type: 'adjustment' }, options);
	},

	async _changeQuantity({ product, location, quantity, user, reference, notes, type }, options = {}) {
		if (!Number.isFinite(quantity) || quantity === 0) throw new TypeError('Quantity must be a non-zero number');
		const session = options.session;
		const filter = { product, location };
		if (quantity < 0) filter.quantity = { $gte: -quantity };
		const inventory = await Inventory.findOneAndUpdate(filter, { $inc: { quantity } }, {
			new: true, runValidators: true, upsert: quantity > 0,
			setDefaultsOnInsert: true, ...(session ? { session } : {})
		});
		if (!inventory) throw new Error('Insufficient stock or inventory record not found');
		try {
			const transaction = await this.createTransaction({ product, location, quantity, user, reference, notes, type }, options);
			return { inventory, transaction };
		} catch (error) {
			if (!session) await Inventory.updateOne({ _id: inventory._id }, { $inc: { quantity: -quantity } });
			throw error;
		}
	},

	async executeTransfer({ product, fromLocation, toLocation, quantity, user, reference, notes }, options = {}) {
		if (!Number.isFinite(quantity) || quantity <= 0) throw new TypeError('Transfer quantity must be positive');
		const session = options.session;
		const queryOptions = session ? { session } : {};
		const source = await Inventory.findOneAndUpdate(
			{ product, location: fromLocation, quantity: { $gte: quantity } },
			{ $inc: { quantity: -quantity } }, { new: true, runValidators: true, ...queryOptions }
		);
		if (!source) throw new Error('Insufficient stock or source inventory record not found');
		try {
			const destination = await Inventory.findOneAndUpdate(
				{ product, location: toLocation }, { $inc: { quantity } },
				{ new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true, ...queryOptions }
			);
			await this.createTransaction({ product, location: fromLocation, quantity: -quantity, user, reference, notes, type: 'transfer-out' }, options);
			await this.createTransaction({ product, location: toLocation, quantity, user, reference, notes, type: 'transfer-in' }, options);
			return { source, destination };
		} catch (error) {
			if (!session) await Inventory.updateOne({ _id: source._id }, { $inc: { quantity } });
			throw error;
		}
	},

	async createTransaction(data, options = {}) {
		const [transaction] = await InventoryTransaction.create([data], options);
		return transaction;
	},

	findTransactions(filter = {}, options = {}) {
		return InventoryTransaction.find(filter)
			.populate(options.populate || ['product', 'location', 'user'])
			.sort(options.sort || { createdAt: -1 })
			.skip(options.skip || 0).limit(options.limit || 0).lean();
	},

	getLowStock(filter = {}) {
		return Inventory.find({ ...filter, $expr: { $lte: ['$quantity', '$reorderLevel'] } })
			.populate(['product', 'location']).lean();
	},

	getOutOfStock(filter = {}) {
		return Inventory.find({ ...filter, quantity: { $lte: 0 } })
			.populate(['product', 'location']).lean();
	},

	getInventoryValue(match = {}) {
		return Inventory.aggregate([
			{ $match: match },
			{ $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
			{ $unwind: '$product' },
			{ $group: { _id: null, totalValue: { $sum: { $multiply: ['$quantity', '$product.costPrice'] } } } }
		]);
	},

	getStockSummary(match = {}) {
		return Inventory.aggregate([
			{ $match: match },
			{ $group: { _id: '$location', inventoryRecords: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } },
			{ $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'location' } },
			{ $unwind: { path: '$location', preserveNullAndEmptyArrays: true } }
		]);
	}
};

module.exports = inventoryRepository;
