/* ************************************************** */
/* File: #src/features/products/utils/productUtils.js */
/* ************************************************** */


const STOCK_STATUS = Object.freeze({
	OUT_OF_STOCK: 'out_of_stock',
	LOW_STOCK: 'low_stock',
	IN_STOCK: 'in_stock',
});

const toNumber = (value, fallback = 0) => {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
};

const toPositiveNumber = (value, fallback = 0) =>
	Math.max(0, toNumber(value, fallback));

const normalizeProduct = (product = {}) => ({
	...product,
	name: typeof product.name === 'string' ? product.name.trim() : product.name,
	sku: typeof product.sku === 'string' ? product.sku.trim().toUpperCase() : product.sku,
	description:
		typeof product.description === 'string' ? product.description.trim() : product.description,
	price: toPositiveNumber(product.price),
	costPrice: toPositiveNumber(product.costPrice),
	quantity: Math.floor(toPositiveNumber(product.quantity)),
	reorderLevel: Math.floor(toPositiveNumber(product.reorderLevel)),
});

const getStockStatus = (quantity, reorderLevel = 0) => {
	const stock = toNumber(quantity);
	const minimum = toNumber(reorderLevel);

	if (stock <= 0) return STOCK_STATUS.OUT_OF_STOCK;
	if (stock <= minimum) return STOCK_STATUS.LOW_STOCK;
	return STOCK_STATUS.IN_STOCK;
};

const isLowStock = (quantity, reorderLevel = 0) =>
	getStockStatus(quantity, reorderLevel) !== STOCK_STATUS.IN_STOCK;

const calculateStockValue = (quantity, unitCost) =>
	toPositiveNumber(quantity) * toPositiveNumber(unitCost);

const calculateProfit = (sellingPrice, costPrice, quantity = 1) =>
	(toPositiveNumber(sellingPrice) - toPositiveNumber(costPrice)) *
	toPositiveNumber(quantity);

const validateProduct = (product = {}) => {
	const errors = {};
	if (!String(product.name || '').trim()) errors.name = 'Product name is required';
	if (!String(product.sku || '').trim()) errors.sku = 'SKU is required';
	if (product.price === undefined || toNumber(product.price, -1) < 0) {
		errors.price = 'Price must be a non-negative number';
	}
	if (product.quantity !== undefined && toNumber(product.quantity, -1) < 0) {
		errors.quantity = 'Quantity must be a non-negative number';
	}

	return { isValid: Object.keys(errors).length === 0, errors };
};

const createSku = (name, prefix = 'PRD') => {
	const slug = String(name || 'PRODUCT')
		.trim()
		.replace(/[^a-zA-Z0-9]+/g, '')
		.toUpperCase()
		.slice(0, 6) || 'PRODUCT';
	return `${prefix.toUpperCase()}-${slug}-${Date.now().toString(36).toUpperCase()}`;
};

module.exports = {
	STOCK_STATUS,
	toNumber,
	toPositiveNumber,
	normalizeProduct,
	getStockStatus,
	isLowStock,
	calculateStockValue,
	calculateProfit,
	validateProduct,
	createSku,
};

