/* Business logic for sale returns.
**  Business logic 
**  - createReturn()
**  - createReturn()
**  - getReturns()
**  - getReturnById()
**  - updateReturn()  
*/

const models = require('../../../models');

const { Sale, SaleItem, SaleReturn, SaleReturnItem, Product, sequelize } = models;

function createError(message, statusCode = 400) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

function assertModels() {
	if (!SaleReturn || !SaleReturnItem || !Product) {
		throw new Error('SaleReturn, SaleReturnItem, and Product models are required');
	}
}

function withTransaction(callback) {
	return sequelize && typeof sequelize.transaction === 'function'
		? sequelize.transaction(callback)
		: callback(undefined);
}

function normalizeItems(items) {
	if (!Array.isArray(items) || items.length === 0) {
		throw createError('A sale return must contain at least one item');
	}

	return items.map((item) => {
		const productId = item.productId || item.product_id;
		const quantity = Number(item.quantity);
		if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
			throw createError('Each return item requires a productId and a positive integer quantity');
		}
		return { productId, quantity };
	});
}

async function adjustInventory(productId, quantity, transaction) {
	const product = await Product.findByPk(productId, { transaction });
	if (!product) throw createError(`Product ${productId} was not found`, 404);

	const attributes = (product.constructor && product.constructor.rawAttributes) || {};
	const field = ['stock', 'quantity', 'stockQuantity', 'currentStock']
		.find((name) => Object.prototype.hasOwnProperty.call(attributes, name)) || 'stock';
	const current = Number(product[field]) || 0;
	if (current + quantity < 0) throw createError(`Insufficient stock for product ${productId}`);

	product[field] = current + quantity;
	await product.save({ transaction });
}

async function validateReturn(saleId, items, transaction, excludedReturnId) {
	if (!SaleItem) return;
	const soldItems = await SaleItem.findAll({ where: { saleId }, transaction });
	if (!soldItems.length) throw createError('No items were found for the sale');

	const previousReturns = await SaleReturnItem.findAll({ where: { saleId }, transaction });
	const sold = new Map();
	const returned = new Map();
	for (const item of soldItems) {
		const key = String(item.productId);
		sold.set(key, (sold.get(key) || 0) + Number(item.quantity));
	}
	for (const item of previousReturns) {
		if (excludedReturnId && String(item.saleReturnId) === String(excludedReturnId)) continue;
		const key = String(item.productId);
		returned.set(key, (returned.get(key) || 0) + Number(item.quantity));
	}
	for (const item of items) {
		const key = String(item.productId);
		const quantity = (items.filter((entry) => String(entry.productId) === key)
			.reduce((total, entry) => total + entry.quantity, 0));
		if (!sold.has(key)) throw createError(`Product ${item.productId} was not included in the sale`);
		if (quantity + (returned.get(key) || 0) > sold.get(key)) {
			throw createError(`Return quantity exceeds the quantity sold for product ${item.productId}`);
		}
	}
}

async function getReturnItems(returnId, transaction) {
	return SaleReturnItem.findAll({ where: { saleReturnId: returnId }, transaction });
}

async function createReturn(data) {
	assertModels();
	const saleId = data.saleId || data.sale_id;
	if (!saleId) throw createError('saleId is required');
	const items = normalizeItems(data.items);

	return withTransaction(async (transaction) => {
		if (Sale) {
			const sale = await Sale.findByPk(saleId, { transaction });
			if (!sale) throw createError('Sale was not found', 404);
		}
		await validateReturn(saleId, items, transaction);
		const { items: ignoredItems, ...returnData } = data;
		const saleReturn = await SaleReturn.create({ ...returnData, saleId }, { transaction });
		await SaleReturnItem.bulkCreate(items.map((item) => ({
			...item,
			saleId,
			saleReturnId: saleReturn.id,
		})), { transaction });
		for (const item of items) await adjustInventory(item.productId, item.quantity, transaction);
		return saleReturn;
	});
}

async function getReturns(options = {}) {
	assertModels();
	const returns = await SaleReturn.findAll(options);
	for (const saleReturn of returns) {
		saleReturn.dataValues.items = await getReturnItems(saleReturn.id);
	}
	return returns;
}

async function getReturnById(id) {
	assertModels();
	const saleReturn = await SaleReturn.findByPk(id);
	if (!saleReturn) throw createError('Sale return was not found', 404);
	saleReturn.dataValues.items = await getReturnItems(id);
	return saleReturn;
}

async function updateReturn(id, data) {
	assertModels();
	return withTransaction(async (transaction) => {
		const saleReturn = await SaleReturn.findByPk(id, { transaction });
		if (!saleReturn) throw createError('Sale return was not found', 404);
		const saleId = data.saleId || data.sale_id || saleReturn.saleId;

		if (data.items !== undefined) {
			const items = normalizeItems(data.items);
			if (Sale) {
				const sale = await Sale.findByPk(saleId, { transaction });
				if (!sale) throw createError('Sale was not found', 404);
			}
			await validateReturn(saleId, items, transaction, id);

			const oldItems = await getReturnItems(id, transaction);
			for (const item of oldItems) {
				await adjustInventory(item.productId, -Number(item.quantity), transaction);
			}
			await SaleReturnItem.destroy({ where: { saleReturnId: id }, transaction });
			await SaleReturnItem.bulkCreate(items.map((item) => ({
				...item,
				saleId,
				saleReturnId: id,
			})), { transaction });
			for (const item of items) await adjustInventory(item.productId, item.quantity, transaction);
		}

		const { items: ignoredItems, ...returnData } = data;
		await saleReturn.update({ ...returnData, saleId }, { transaction });
		return saleReturn;
	});
}

async function deleteReturn(id) {
	assertModels();
	return withTransaction(async (transaction) => {
		const saleReturn = await SaleReturn.findByPk(id, { transaction });
		if (!saleReturn) throw createError('Sale return was not found', 404);
		const items = await getReturnItems(id, transaction);
		for (const item of items) {
			await adjustInventory(item.productId, -Number(item.quantity), transaction);
		}
		await SaleReturnItem.destroy({ where: { saleReturnId: id }, transaction });
		await saleReturn.destroy({ transaction });
		return saleReturn;
	});
}

module.exports = { createReturn, getReturns, getReturnById, updateReturn, deleteReturn };

