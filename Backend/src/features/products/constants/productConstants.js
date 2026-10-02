/* ********************************************************** */
/* File: #src/features/products/constants/productConstants.js */
/* ********************************************************** */

const PRODUCT_STATUS = Object.freeze({
	ACTIVE: 'active',
	INACTIVE: 'inactive',
	DISCONTINUED: 'discontinued',
});

const PRODUCT_CATEGORIES = Object.freeze({
	GENERAL: 'general',
	ELECTRONICS: 'electronics',
	CLOTHING: 'clothing',
	FOOD: 'food',
	FURNITURE: 'furniture',
	OTHER: 'other',
});

const STOCK_STATUS = Object.freeze({
	IN_STOCK: 'in_stock',
	LOW_STOCK: 'low_stock',
	OUT_OF_STOCK: 'out_of_stock',
});

const DEFAULT_PRODUCT_VALUES = Object.freeze({
	status: PRODUCT_STATUS.ACTIVE,
	category: PRODUCT_CATEGORIES.GENERAL,
	minimumStockLevel: 0,
	reorderLevel: 0,
	quantity: 0,
});

const PRODUCT_SORT_FIELDS = Object.freeze([
	'name',
	'sku',
	'category',
	'price',
	'quantity',
	'createdAt',
	'updatedAt',
]);

module.exports = {
	PRODUCT_STATUS,
	PRODUCT_CATEGORIES,
	STOCK_STATUS,
	DEFAULT_PRODUCT_VALUES,
	PRODUCT_SORT_FIELDS,
};
