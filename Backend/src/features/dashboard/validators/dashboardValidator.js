/* File: #src/features/dashboard/validators/dashboardValidator.js */

const { query, validationResult } = require('express-validator');

// Validate filters and pagination used by inventory dashboard endpoints.
const dashboardQueryValidator = [
	query('startDate')
		.optional()
		.isISO8601()
		.withMessage('startDate must be a valid ISO 8601 date'),
	query('endDate')
		.optional()
		.isISO8601()
		.withMessage('endDate must be a valid ISO 8601 date')
		.custom((endDate, { req }) => {
			if (req.query.startDate && new Date(endDate) < new Date(req.query.startDate)) {
				throw new Error('endDate must be on or after startDate');
			}
			return true;
		}),
	query('period')
		.optional()
		.isIn(['day', 'week', 'month', 'year'])
		.withMessage('period must be day, week, month, or year'),
	query('categoryId')
		.optional()
		.isMongoId()
		.withMessage('categoryId must be a valid ID'),
	query('warehouseId')
		.optional()
		.isMongoId()
		.withMessage('warehouseId must be a valid ID'),
	query('lowStockThreshold')
		.optional()
		.isInt({ min: 0 })
		.withMessage('lowStockThreshold must be a non-negative integer'),
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('limit must be an integer between 1 and 100'),
];

const validateDashboardQuery = (req, res, next) => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		return res.status(400).json({
			success: false,
			message: 'Invalid dashboard query parameters',
			errors: result.array(),
		});
	}
	return next();
};

module.exports = { dashboardQueryValidator, validateDashboardQuery };

