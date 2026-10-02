/* *************************************************************** */
/* File: #src/features/settings/services/companySettingsService.js */
/* *************************************************************** */

const DEFAULT_SETTINGS = Object.freeze({
	company: Object.freeze({
		name: '',
		email: '',
		phone: '',
		address: '',
		taxNumber: '',
		logo: '',
	}),
	currency: 'USD',
	timezone: 'UTC',
	tax: Object.freeze({ enabled: false, rate: 0, inclusive: false }),
	inventory: Object.freeze({ lowStockThreshold: 10, allowNegativeStock: false }),
	invoice: Object.freeze({ prefix: 'INV', nextNumber: 1, footer: '' }),
});

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS);

function isObject(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cloneDefaults() {
	return {
		company: { ...DEFAULT_SETTINGS.company },
		currency: DEFAULT_SETTINGS.currency,
		timezone: DEFAULT_SETTINGS.timezone,
		tax: { ...DEFAULT_SETTINGS.tax },
		inventory: { ...DEFAULT_SETTINGS.inventory },
		invoice: { ...DEFAULT_SETTINGS.invoice },
	};
}

function normalizeSettings(record, companyId) {
	const source = typeof record.toJSON === 'function' ? record.toJSON() : record;
	const settings = cloneDefaults();

	for (const key of SETTING_KEYS) {
		const value = source[key];
		if (isObject(settings[key])) {
			if (isObject(value)) settings[key] = { ...settings[key], ...value };
		} else if (value !== undefined && value !== null) {
			settings[key] = value;
		}
	}

	return { companyId, ...settings };
}

function validateSettings(settings) {
	for (const [field, value] of Object.entries(settings.company)) {
		if (typeof value !== 'string') throw new TypeError(`company.${field} must be a string.`);
	}
	if (settings.company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.company.email)) {
		throw new TypeError('company.email must be a valid email address.');
	}
	if (typeof settings.currency !== 'string' || !/^[A-Za-z]{3}$/.test(settings.currency)) {
		throw new TypeError('currency must be a three-letter code.');
	}
	if (typeof settings.timezone !== 'string' || !settings.timezone.trim()) {
		throw new TypeError('timezone is required.');
	}
	if (typeof settings.tax.enabled !== 'boolean' || typeof settings.tax.inclusive !== 'boolean') {
		throw new TypeError('tax.enabled and tax.inclusive must be booleans.');
	}
	if (!Number.isFinite(settings.tax.rate) || settings.tax.rate < 0 || settings.tax.rate > 100) {
		throw new RangeError('tax.rate must be between 0 and 100.');
	}
	if (!Number.isInteger(settings.inventory.lowStockThreshold) || settings.inventory.lowStockThreshold < 0) {
		throw new RangeError('inventory.lowStockThreshold must be a non-negative integer.');
	}
	if (typeof settings.inventory.allowNegativeStock !== 'boolean') {
		throw new TypeError('inventory.allowNegativeStock must be a boolean.');
	}
	if (typeof settings.invoice.prefix !== 'string' || !settings.invoice.prefix.trim()) {
		throw new TypeError('invoice.prefix is required.');
	}
	if (!Number.isInteger(settings.invoice.nextNumber) || settings.invoice.nextNumber < 1) {
		throw new RangeError('invoice.nextNumber must be a positive integer.');
	}
	if (typeof settings.invoice.footer !== 'string') {
		throw new TypeError('invoice.footer must be a string.');
	}
}

function mergeSettings(current, updates) {
	if (!isObject(updates)) throw new TypeError('Settings updates must be an object.');

	const unknownKeys = Object.keys(updates).filter((key) => key !== 'companyId' && !SETTING_KEYS.includes(key));
	if (unknownKeys.length) throw new TypeError(`Unknown setting: ${unknownKeys[0]}.`);

	const next = { ...current };
	for (const key of SETTING_KEYS) {
		if (!Object.prototype.hasOwnProperty.call(updates, key)) continue;
		if (isObject(DEFAULT_SETTINGS[key])) {
			if (!isObject(updates[key])) throw new TypeError(`${key} settings must be an object.`);
			const unknownFields = Object.keys(updates[key]).filter(
				(field) => !Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS[key], field),
			);
			if (unknownFields.length) throw new TypeError(`Unknown setting: ${key}.${unknownFields[0]}.`);
			next[key] = { ...current[key], ...updates[key] };
		} else {
			next[key] = updates[key];
		}
	}

	validateSettings(next);
	return next;
}

function createCompanySettingsService(CompanySettings) {
	if (!CompanySettings || typeof CompanySettings.findOne !== 'function') {
		throw new TypeError('CompanySettings must provide a findOne method.');
	}

	async function getOrCreate(companyId) {
		if (companyId === undefined || companyId === null || companyId === '') {
			throw new TypeError('companyId is required.');
		}

		let record = await CompanySettings.findOne({ where: { companyId } });
		if (!record) {
			if (typeof CompanySettings.create !== 'function') {
				throw new TypeError('CompanySettings must provide a create method.');
			}
			try {
				record = await CompanySettings.create({ companyId, ...cloneDefaults() });
			} catch (error) {
				// A concurrent request may have created the settings row first.
				record = await CompanySettings.findOne({ where: { companyId } });
				if (!record) throw error;
			}
		}
		return record;
	}

	async function getSettings(companyId) {
		const record = await getOrCreate(companyId);
		return normalizeSettings(record, companyId);
	}

	async function updateSettings(companyId, updates) {
		const record = await getOrCreate(companyId);
		const next = mergeSettings(normalizeSettings(record, companyId), updates);
		const values = Object.fromEntries(SETTING_KEYS.map((key) => [key, next[key]]));

		if (typeof record.update === 'function') {
			await record.update(values);
		} else {
			Object.assign(record, values);
			if (typeof record.save !== 'function') throw new TypeError('Settings record must provide update or save.');
			await record.save();
		}

		return normalizeSettings(record, companyId);
	}

	return { getSettings, updateSettings };
}

module.exports = { createCompanySettingsService, DEFAULT_SETTINGS };
