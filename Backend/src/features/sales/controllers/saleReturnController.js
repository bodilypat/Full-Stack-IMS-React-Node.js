/* File: #src/features/sales/controllers/saleReturnController.js
 * POST /api/sales/:id/return
 * GET  /api/sales/returns
 * GET  /api/sales/returns/:id
 */

const Sale = require('../models/Sale');
const SaleReturn = require('../models/SaleReturn');
const Product = require('../../inventory/models/Product');
const StockMovement = require('../../inventory/models/StockMovement');

const sendError = (res, error) => res.status(error.status || 500).json({
	message: error.status ? error.message : 'Unable to process sale return.',
});

const createSaleReturn = async (req, res) => {
	const session = await Sale.startSession();
	try {
		const requestedItems = req.body.items;
		if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
			return res.status(400).json({ message: 'At least one return item is required.' });
		}

		let saleReturn;
		await session.withTransaction(async () => {
			const sale = await Sale.findById(req.params.id).session(session);
			if (!sale) {
				const error = new Error('Sale not found.');
				error.status = 404;
				throw error;
			}

			const previousReturns = await SaleReturn.find({ sale: sale._id }).session(session);
			const alreadyReturned = new Map();
			for (const record of previousReturns) {
				for (const item of record.items) {
					const id = String(item.product?._id || item.product);
					alreadyReturned.set(id, (alreadyReturned.get(id) || 0) + Number(item.quantity));
				}
			}

			const items = [];
			for (const requested of requestedItems) {
				const productId = requested.product || requested.productId;
				const quantity = Number(requested.quantity);
				if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
					const error = new Error('Each item must have a product and a positive quantity.');
					error.status = 400;
					throw error;
				}

				const soldItem = sale.items.find((item) =>
					String(item.product?._id || item.product) === String(productId));
				if (!soldItem) {
					const error = new Error('A returned product was not included in this sale.');
					error.status = 400;
					throw error;
				}

				const previousQuantity = alreadyReturned.get(String(productId)) || 0;
				if (previousQuantity + quantity > Number(soldItem.quantity)) {
					const error = new Error('Return quantity exceeds the quantity sold.');
					error.status = 400;
					throw error;
				}

				const product = await Product.findById(productId).session(session);
				if (!product) {
					const error = new Error('A returned product could not be found.');
					error.status = 404;
					throw error;
				}

				product.stock = Number(product.stock || 0) + quantity;
				await product.save({ session });
				await StockMovement.create([{
					product: product._id,
					type: 'IN',
					quantity,
					reason: 'SALE_RETURN',
					reference: sale._id,
					performedBy: req.user?._id,
				}], { session });

				items.push({
					product: product._id,
					quantity,
					unitPrice: Number(soldItem.unitPrice ?? soldItem.price ?? 0),
				});
				alreadyReturned.set(String(productId), previousQuantity + quantity);
			}

			[saleReturn] = await SaleReturn.create([{
				sale: sale._id,
				items,
				reason: req.body.reason,
				returnedBy: req.user?._id,
			}], { session });
		});

		return res.status(201).json({ message: 'Sale return recorded and stock updated.', data: saleReturn });
	} catch (error) {
		return sendError(res, error);
	} finally {
		await session.endSession();
	}
};

const getSaleReturns = async (req, res) => {
	try {
		const returns = await SaleReturn.find()
			.populate('sale')
			.populate('items.product')
			.sort({ createdAt: -1 });
		return res.status(200).json({ data: returns });
	} catch (error) {
		return sendError(res, error);
	}
};

const getSaleReturnById = async (req, res) => {
	try {
		const saleReturn = await SaleReturn.findById(req.params.id)
			.populate('sale')
			.populate('items.product');
		if (!saleReturn) return res.status(404).json({ message: 'Sale return not found.' });
		return res.status(200).json({ data: saleReturn });
	} catch (error) {
		return sendError(res, error);
	}
};

module.exports = { createSaleReturn, getSaleReturns, getSaleReturnById };

