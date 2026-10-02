/* *********************************************************** */
/* File: #src/features/products/validators/productValidator.js */
/* *********************************************************** */


const { body, param } = require('express-validator');

const validateProductId = [
	param('id').isMongoId().withMessage('Product ID must be a valid ID.'),
];

const validateCreateProduct = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Product name is required.')
		.isLength({ max: 150 })
		.withMessage('Product name must be 150 characters or fewer.'),
	body('sku')
		.trim()
		.notEmpty()
		.withMessage('SKU is required.')
		.isLength({ max: 80 })
		.withMessage('SKU must be 80 characters or fewer.'),
	body('description')
		.optional({ nullable: true })
		.isString()
		.withMessage('Description must be a string.'),
	body('category')
		.optional({ nullable: true })
		.isString()
		.withMessage('Category must be a string.'),
	body('price')
		.isFloat({ min: 0 })
		.withMessage('Price must be a non-negative number.')
		.toFloat(),
	body('quantity')
		.isInt({ min: 0 })
		.withMessage('Quantity must be a non-negative integer.')
		.toInt(),
	body('reorderLevel')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Reorder level must be a non-negative integer.')
		.toInt(),
];

const validateUpdateProduct = [
	...validateProductId,
	body('name')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Product name cannot be empty.')
		.isLength({ max: 150 })
		.withMessage('Product name must be 150 characters or fewer.'),
	body('sku')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('SKU cannot be empty.')
		.isLength({ max: 80 })
		.withMessage('SKU must be 80 characters or fewer.'),
	body('description')
		.optional({ nullable: true })
		.isString()
		.withMessage('Description must be a string.'),
	body('category')
		.optional({ nullable: true })
		.isString()
		.withMessage('Category must be a string.'),
	body('price')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Price must be a non-negative number.')
		.toFloat(),
	body('quantity')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Quantity must be a non-negative integer.')
		.toInt(),
	body('reorderLevel')
		.optional()
		.isInt({ min: 0 })
		.withMessage('Reorder level must be a non-negative integer.')
		.toInt(),
];

module.exports = {
	validateProductId,
	validateCreateProduct,
	validateUpdateProduct,
};
