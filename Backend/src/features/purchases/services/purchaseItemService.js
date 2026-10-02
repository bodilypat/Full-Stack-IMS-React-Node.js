/* ************************************************************* */
/* File: #src/features/purchases/services/purchaseItemService.js */
/* ************************************************************* */

const httpError = (message, statusCode) => Object.assign(new Error(message), { statusCode });

const positiveNumber = (value, name, allowZero = false) => {
	const number = Number(value);
	if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
		throw httpError(`${name} must be a ${allowZero ? 'non-negative' : 'positive'} number`, 400);
	}
	return number;
};

/** Build purchase item operations using the application's injected models. */
const createPurchaseItemService = ({ PurchaseItem, Purchase, Product } = {}) => {
	if (!PurchaseItem || !Purchase) {
		throw new TypeError('PurchaseItem and Purchase models are required');
	}

	const getPurchase = async (id, transaction) => {
		const purchase = await Purchase.findByPk(id, { transaction });
		if (!purchase) throw httpError('Purchase not found', 404);
		const status = String(purchase.status || '').toLowerCase();
		if (['cancelled', 'canceled', 'received', 'completed'].includes(status)) {
			throw httpError('Purchase items cannot be changed in the current purchase status', 409);
		}
		return purchase;
	};

	const refreshPurchaseTotal = async (purchase, transaction) => {
		if (typeof PurchaseItem.findAll !== 'function') return;
		const items = await PurchaseItem.findAll({ where: { purchaseId: purchase.id }, transaction });
		const totalAmount = items.reduce((total, item) => {
			const quantity = Number(item.quantity);
			const unitCost = Number(item.unitCost);
			return total + Number(item.lineTotal ?? quantity * unitCost);
		}, 0);
		if (typeof purchase.update === 'function') {
			await purchase.update({ totalAmount }, { transaction });
		} else if (typeof Purchase.update === 'function') {
			await Purchase.update({ totalAmount }, { where: { id: purchase.id }, transaction });
		}
	};

	const getItem = async (id, transaction) => {
		const item = await PurchaseItem.findByPk(id, { transaction });
		if (!item) throw httpError('Purchase item not found', 404);
		return item;
	};

	return {
		async create(data = {}, { transaction } = {}) {
			if (!data.purchaseId || !data.productId) {
				throw httpError('purchaseId and productId are required', 400);
			}
			const quantity = positiveNumber(data.quantity, 'quantity');
			const unitCost = positiveNumber(data.unitCost, 'unitCost', true);
			const purchase = await getPurchase(data.purchaseId, transaction);

			if (Product) {
				const product = await Product.findByPk(data.productId, { transaction });
				if (!product) throw httpError('Product not found', 404);
			}

			const item = await PurchaseItem.create({
				purchaseId: data.purchaseId,
				productId: data.productId,
				quantity,
				unitCost,
				lineTotal: quantity * unitCost,
				...(data.notes !== undefined ? { notes: data.notes } : {}),
			}, { transaction });
			await refreshPurchaseTotal(purchase, transaction);
			return item;
		},

		async getById(id, options = {}) {
			return getItem(id, options.transaction);
		},

		async listByPurchase(purchaseId, options = {}) {
			await getPurchase(purchaseId, options.transaction);
			return PurchaseItem.findAll({
				...options,
				where: { ...(options.where || {}), purchaseId },
			});
		},

		async update(id, changes = {}, { transaction } = {}) {
			const item = await getItem(id, transaction);
			const purchase = await getPurchase(item.purchaseId, transaction);
			const quantity = changes.quantity === undefined
				? positiveNumber(item.quantity, 'quantity')
				: positiveNumber(changes.quantity, 'quantity');
			const unitCost = changes.unitCost === undefined
				? positiveNumber(item.unitCost, 'unitCost', true)
				: positiveNumber(changes.unitCost, 'unitCost', true);
			const values = { quantity, unitCost, lineTotal: quantity * unitCost };
			if (changes.notes !== undefined) values.notes = changes.notes;

			if (typeof item.update === 'function') {
				await item.update(values, { transaction });
			} else {
				await PurchaseItem.update(values, { where: { id }, transaction });
				Object.assign(item, values);
			}
			await refreshPurchaseTotal(purchase, transaction);
			return item;
		},

		async remove(id, { transaction } = {}) {
			const item = await getItem(id, transaction);
			const purchase = await getPurchase(item.purchaseId, transaction);
			if (typeof item.destroy === 'function') {
				await item.destroy({ transaction });
			} else {
				await PurchaseItem.destroy({ where: { id }, transaction });
			}
			await refreshPurchaseTotal(purchase, transaction);
			return item;
		},
	};
};

module.exports = { createPurchaseItemService };

