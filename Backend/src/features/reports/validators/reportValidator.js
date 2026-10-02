/* File: #src/features/reports/validators/reportValidator.js */

const ALLOWED_FORMATS = new Set(['json', 'csv', 'xlsx', 'pdf']);
const MAX_LIMIT = 100;

function isValidDate(value) {
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	const date = new Date(`${value}T00:00:00.000Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validateReportQuery(req, res, next) {
	const query = req.query || {};
	const errors = [];
	const filters = {};

	for (const field of ['startDate', 'endDate']) {
		if (query[field] !== undefined) {
			if (!isValidDate(query[field])) {
				errors.push(`${field} must be a valid date in YYYY-MM-DD format`);
			} else {
				filters[field] = query[field];
			}
		}
	}

	if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
		errors.push('startDate must be on or before endDate');
	}

	for (const field of ['page', 'limit']) {
		if (query[field] === undefined) continue;

		const value = Number(query[field]);
		const maximum = field === 'limit' ? MAX_LIMIT : Number.MAX_SAFE_INTEGER;
		if (!Number.isInteger(value) || value < 1 || value > maximum) {
			errors.push(field === 'limit'
				? `limit must be an integer between 1 and ${MAX_LIMIT}`
				: 'page must be a positive integer');
		} else {
			filters[field] = value;
		}
	}

	if (query.format !== undefined) {
		if (typeof query.format !== 'string' || !ALLOWED_FORMATS.has(query.format.toLowerCase())) {
			errors.push(`format must be one of: ${Array.from(ALLOWED_FORMATS).join(', ')}`);
		} else {
			filters.format = query.format.toLowerCase();
		}
	}

	if (errors.length) {
		return res.status(400).json({
			success: false,
			message: 'Invalid report query parameters',
			errors,
		});
	}

	req.reportFilters = filters;
	return next();
}

module.exports = { validateReportQuery };

    