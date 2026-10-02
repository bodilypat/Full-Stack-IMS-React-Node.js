/* ************************************************************* */
/* File: #src/features/suppliers/validators/supplierValidator.js */
/* ************************************************************* */

const { body, param, validationResult } = require('express-validator');

const supplierValidator = [
	body('name')
		.trim()
		.notEmpty()
		.withMessage('Supplier name is required')
		.isLength({ max: 150 })
		.withMessage('Supplier name must not exceed 150 characters'),
	body('contactPerson')
		.optional({ checkFalsy: true })
		.trim()
		.isLength({ max: 150 })
		.withMessage('Contact person must not exceed 150 characters'),
	body('email')
		.optional({ checkFalsy: true })
		.trim()
		.isEmail()
		.withMessage('A valid supplier email is required')
		.normalizeEmail(),
	body('phone')
		.optional({ checkFalsy: true })
		.trim()
		.matches(/^[+\d][\d\s().-]{6,24}$/)
		.withMessage('A valid supplier phone number is required'),
	body('address')
		.optional({ checkFalsy: true })
		.trim()
		.isLength({ max: 500 })
		.withMessage('Address must not exceed 500 characters'),
	body('taxId')
		.optional({ checkFalsy: true })
		.trim()
		.isLength({ max: 100 })
		.withMessage('Tax ID must not exceed 100 characters'),
	body('status')
		.optional()
		.isIn(['active', 'inactive'])
		.withMessage('Status must be either active or inactive'),
];

const supplierIdValidator = [
	param('id').isMongoId().withMessage('A valid supplier ID is required'),
];

const validateSupplier = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
		});
	}
	return next();
};

module.exports = {
	supplierValidator,
	supplierIdValidator,
	validateSupplier,
};

