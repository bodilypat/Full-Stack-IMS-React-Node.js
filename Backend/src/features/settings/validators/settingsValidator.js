/* ************************************************************ */
/* File: #src/features/settings/validators/settingsValidator.js */
/* ************************************************************ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENCY_RE = /^[A-Z]{3}$/;

const RULES = {
	businessName: { type: 'string', max: 150 },
	companyName: { type: 'string', max: 150 },
	email: { type: 'email', max: 254 },
	phone: { type: 'string', max: 30 },
	address: { type: 'string', max: 500 },
	currency: { type: 'currency' },
	taxRate: { type: 'number', min: 0, max: 100 },
	lowStockThreshold: { type: 'integer', min: 0 },
	invoicePrefix: { type: 'string', max: 20 },
	timezone: { type: 'string', max: 100 },
	allowNegativeStock: { type: 'boolean' },
};

/** Return validation errors for a settings create/update payload. */
function validateSettingsPayload(payload) {
	if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
		return ['Settings must be an object.'];
	}

	const errors = [];
	const fields = Object.keys(payload);
	if (fields.length === 0) errors.push('At least one setting must be provided.');

	for (const field of fields) {
		const rule = RULES[field];
		const value = payload[field];

		if (!rule) {
			errors.push(`${field} is not a supported setting.`);
			continue;
		}
		if (value === null || value === undefined) {
			errors.push(`${field} is required.`);
			continue;
		}

		if (rule.type === 'string') {
			if (typeof value !== 'string' || value.trim() === '') {
				errors.push(`${field} must be a non-empty string.`);
			} else if (value.length > rule.max) {
				errors.push(`${field} must not exceed ${rule.max} characters.`);
			}
		} else if (rule.type === 'email') {
			if (typeof value !== 'string' || value.length > rule.max || !EMAIL_RE.test(value)) {
				errors.push(`${field} must be a valid email address.`);
			}
		} else if (rule.type === 'currency') {
			if (typeof value !== 'string' || !CURRENCY_RE.test(value)) {
				errors.push(`${field} must be a three-letter uppercase currency code.`);
			}
		} else if (rule.type === 'number' || rule.type === 'integer') {
			const isInteger = rule.type !== 'integer' || Number.isInteger(value);
			if (typeof value !== 'number' || !Number.isFinite(value) || !isInteger ||
					value < rule.min || (rule.max !== undefined && value > rule.max)) {
				errors.push(`${field} must be ${rule.type === 'integer' ? 'an integer' : 'a number'} between ${rule.min}${rule.max === undefined ? ' and infinity' : ` and ${rule.max}`}.`);
			}
		} else if (rule.type === 'boolean' && typeof value !== 'boolean') {
			errors.push(`${field} must be a boolean.`);
		}
	}

	return errors;
}

/** Express middleware that rejects invalid settings request bodies. */
function validateSettings(req, res, next) {
	const errors = validateSettingsPayload(req.body);
	if (errors.length) {
		return res.status(400).json({ success: false, message: 'Invalid settings.', errors });
	}
	return next();
}

module.exports = { validateSettings, validateSettingsPayload };
