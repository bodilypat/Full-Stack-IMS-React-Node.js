/***************************************************************** 
**  File: #src/features/purchases/validators/purchaseValidator.js 
**  Validates incoming purchase data. 
******************************************************************/

const { body, validationResult } = require('express-validator');

const purchaseValidator = [
	body('supplierId')
		.isString()
		.withMessage('Supplier ID must be text.')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('Supplier ID is required.'),
	body('items')
		.isArray({ min: 1 })
		.withMessage('At least one purchase item is required.'),
	body('items.*.productId')
		.isString()
		.withMessage('Product ID must be text.')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('Product ID is required.'),
	body('items.*.quantity')
		.isFloat({ gt: 0 })
		.withMessage('Quantity must be greater than zero.'),
	body('items.*.unitPrice')
		.isFloat({ min: 0 })
		.withMessage('Unit price must be zero or greater.'),
	body('discount')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Discount must be zero or greater.'),
	body('tax')
		.optional()
		.isFloat({ min: 0 })
		.withMessage('Tax must be zero or greater.'),
	body('notes')
		.optional()
		.isString()
		.withMessage('Notes must be text.'),
	body('userId')
		.isString()
		.withMessage('User ID must be text.')
		.bail()
		.trim()
		.notEmpty()
		.withMessage('User ID is required.'),
	(req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}
		return next();
	},
];

module.exports = purchaseValidator;

