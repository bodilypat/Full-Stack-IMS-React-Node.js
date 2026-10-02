/* File: #src/features/purchases/controllers/purchaseItemController.js */

const PurchaseItem = require('../models/PurchaseItem');

const asyncHandler = (handler) => (req, res, next) =>
	Promise.resolve(handler(req, res, next)).catch(next);

const getItemId = (req) => req.params.id || req.params.purchaseItemId;

const respondWithError = (res, status, message) =>
	res.status(status).json({ success: false, message });

const validateItem = (item) => {
	if (!item || typeof item !== 'object' || Array.isArray(item)) {
		return 'A purchase item object is required.';
	}

	const quantity = Number(item.quantity);
	const unitPrice = Number(item.unitPrice);

	if (!item.purchaseId) return 'purchaseId is required.';
	if (!item.productId) return 'productId is required.';
	if (!Number.isFinite(quantity) || quantity <= 0) {
		return 'quantity must be a positive number.';
	}
	if (!Number.isFinite(unitPrice) || unitPrice < 0) {
		return 'unitPrice must be a non-negative number.';
	}

	return null;
};

exports.createPurchaseItem = asyncHandler(async (req, res) => {
	const validationError = validateItem(req.body);
	if (validationError) return respondWithError(res, 400, validationError);

	const item = await PurchaseItem.create({
		purchaseId: req.body.purchaseId,
		productId: req.body.productId,
		quantity: Number(req.body.quantity),
		unitPrice: Number(req.body.unitPrice),
		...(req.body.description !== undefined && { description: req.body.description }),
	});

	return res.status(201).json({ success: true, data: item });
});

exports.getPurchaseItems = asyncHandler(async (req, res) => {
	const filter = {};
	if (req.query.purchaseId) filter.purchaseId = req.query.purchaseId;
	if (req.query.productId) filter.productId = req.query.productId;

	const items = await PurchaseItem.find(filter).sort({ createdAt: -1 });
	return res.status(200).json({ success: true, count: items.length, data: items });
});

exports.getPurchaseItemById = asyncHandler(async (req, res) => {
	const item = await PurchaseItem.findById(getItemId(req));
	if (!item) return respondWithError(res, 404, 'Purchase item not found.');

	return res.status(200).json({ success: true, data: item });
});

exports.updatePurchaseItem = asyncHandler(async (req, res) => {
	const allowedFields = ['purchaseId', 'productId', 'quantity', 'unitPrice', 'description'];
	const updates = {};

	for (const field of allowedFields) {
		if (req.body[field] !== undefined) updates[field] = req.body[field];
	}

	if ('quantity' in updates) {
		updates.quantity = Number(updates.quantity);
		if (!Number.isFinite(updates.quantity) || updates.quantity <= 0) {
			return respondWithError(res, 400, 'quantity must be a positive number.');
		}
	}
	if ('unitPrice' in updates) {
		updates.unitPrice = Number(updates.unitPrice);
		if (!Number.isFinite(updates.unitPrice) || updates.unitPrice < 0) {
			return respondWithError(res, 400, 'unitPrice must be a non-negative number.');
		}
	}
	if (Object.keys(updates).length === 0) {
		return respondWithError(res, 400, 'At least one valid field must be provided.');
	}

	const item = await PurchaseItem.findByIdAndUpdate(getItemId(req), updates, {
		new: true,
		runValidators: true,
	});
	if (!item) return respondWithError(res, 404, 'Purchase item not found.');

	return res.status(200).json({ success: true, data: item });
});

exports.deletePurchaseItem = asyncHandler(async (req, res) => {
	const item = await PurchaseItem.findByIdAndDelete(getItemId(req));
	if (!item) return respondWithError(res, 404, 'Purchase item not found.');

	return res.status(200).json({ success: true, message: 'Purchase item deleted.', data: item });
});
