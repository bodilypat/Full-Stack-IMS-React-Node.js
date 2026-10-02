/*
** File: #src/features/sales/services/saleItemService.js
** Business logic for sale items.
*/

/**
 * Build sale-item operations around the application's persistence models.
 * Injecting models keeps this service independent of project-specific paths.
 */
function createSaleItemService({
	SaleItem,
	Product,
	Sale,
	sequelize,
	stockField = 'stockQuantity',
	priceField = 'unitPrice',
}) {
	if (!SaleItem || !Product) {
		throw new TypeError('SaleItem and Product models are required');
	}

	const error = (message, statusCode = 400) =>
		Object.assign(new Error(message), { statusCode });

	const transaction = (callback) =>
		sequelize?.transaction ? sequelize.transaction(callback) : callback(undefined);

	const quantityValue = (value) => {
		const quantity = Number(value);
		if (!Number.isInteger(quantity) || quantity <= 0) {
			throw error('Quantity must be a positive integer');
		}
		return quantity;
	};

	async function getProduct(id, tx) {
		const product = await Product.findByPk(id, {
			transaction: tx,
			...(tx ? { lock: tx.LOCK?.UPDATE || true } : {}),
		});
		if (!product) throw error('Product not found', 404);
		return product;
	}

	async function changeStock(product, change, tx) {
		const currentStock = Number(product[stockField]);
		if (!Number.isFinite(currentStock) || currentStock + change < 0) {
			throw error('Insufficient inventory');
		}
		product[stockField] = currentStock + change;
		await product.save({ transaction: tx });
	}

	async function create(data) {
		const quantity = quantityValue(data.quantity);
		return transaction(async (tx) => {
			if (Sale && !(await Sale.findByPk(data.saleId, { transaction: tx }))) {
				throw error('Sale not found', 404);
			}
			const product = await getProduct(data.productId, tx);
			const unitPrice = Number(data[priceField] ?? product[priceField]);
			if (!Number.isFinite(unitPrice) || unitPrice < 0) {
				throw error('Unit price must be a non-negative number');
			}

			await changeStock(product, -quantity, tx);
			return SaleItem.create({
				saleId: data.saleId,
				productId: data.productId,
				quantity,
				[priceField]: unitPrice,
				total: quantity * unitPrice,
			}, { transaction: tx });
		});
	}

	async function update(id, changes) {
		return transaction(async (tx) => {
			const item = await SaleItem.findByPk(id, {
				transaction: tx,
				...(tx ? { lock: tx.LOCK?.UPDATE || true } : {}),
			});
			if (!item) throw error('Sale item not found', 404);

			const previousQuantity = Number(item.quantity);
			const quantity = changes.quantity === undefined
				? quantityValue(previousQuantity)
				: quantityValue(changes.quantity);
			const productId = changes.productId ?? item.productId;
			const unitPrice = Number(changes[priceField] ?? item[priceField]);
			if (!Number.isFinite(unitPrice) || unitPrice < 0) {
				throw error('Unit price must be a non-negative number');
			}

			if (String(productId) === String(item.productId)) {
				const product = await getProduct(item.productId, tx);
				await changeStock(product, previousQuantity - quantity, tx);
			} else {
				const oldProduct = await getProduct(item.productId, tx);
				const newProduct = await getProduct(productId, tx);
				await changeStock(oldProduct, previousQuantity, tx);
				await changeStock(newProduct, -quantity, tx);
			}

			await item.update({
				productId,
				quantity,
				[priceField]: unitPrice,
				total: quantity * unitPrice,
			}, { transaction: tx });
			return item;
		});
	}

	async function remove(id) {
		return transaction(async (tx) => {
			const item = await SaleItem.findByPk(id, { transaction: tx });
			if (!item) throw error('Sale item not found', 404);
			const product = await getProduct(item.productId, tx);
			await changeStock(product, Number(item.quantity), tx);
			await item.destroy({ transaction: tx });
			return item;
		});
	}

	async function getById(id) {
		const item = await SaleItem.findByPk(id);
		if (!item) throw error('Sale item not found', 404);
		return item;
	}

	async function list(filters = {}) {
		const where = {};
		if (filters.saleId !== undefined) where.saleId = filters.saleId;
		if (filters.productId !== undefined) where.productId = filters.productId;
		return SaleItem.findAll({ where, order: [['createdAt', 'DESC']] });
	}

	return { create, update, remove, getById, list };
}

module.exports = { createSaleItemService };
