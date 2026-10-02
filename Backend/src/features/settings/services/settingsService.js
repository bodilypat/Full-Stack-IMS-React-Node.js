/* ******************************************************** /
/* File: #src/features/settings/services/settingsService.js */
/* ******************************************************** */

const DEFAULT_SETTINGS = Object.freeze({
	general: Object.freeze({ companyName: '', currency: 'USD', timezone: 'UTC' }),
	inventory: Object.freeze({
		lowStockThreshold: 10,
		defaultReorderQuantity: 20,
		allowNegativeStock: false,
		trackBatchNumbers: false,
		trackExpiryDates: false,
	}),
	notifications: Object.freeze({ lowStock: true, expiringItems: true }),
});

const copyDefaults = () => ({
	general: { ...DEFAULT_SETTINGS.general },
	inventory: { ...DEFAULT_SETTINGS.inventory },
	notifications: { ...DEFAULT_SETTINGS.notifications },
});

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const blockedKeys = new Set(['__proto__', 'constructor', 'prototype']);

function mergeSettings(current, updates) {
	const merged = { ...current };

	for (const [key, value] of Object.entries(updates)) {
		if (blockedKeys.has(key)) continue;
		if (!(key in current)) throw new TypeError(`Unknown setting: ${key}`);

		if (isObject(value)) {
			if (!isObject(current[key])) throw new TypeError(`Invalid settings section: ${key}`);
			merged[key] = mergeSettings(current[key], value);
		} else {
			merged[key] = value;
		}
	}

	return merged;
}

function validateSettings(settings) {
	const { general, inventory, notifications } = settings;

	if (typeof general.companyName !== 'string' || general.companyName.length > 150) {
		throw new TypeError('companyName must be a string of at most 150 characters');
	}
	if (typeof general.currency !== 'string' || !/^[A-Z]{3}$/.test(general.currency)) {
		throw new TypeError('currency must be a three-letter uppercase code');
	}
	if (typeof general.timezone !== 'string' || !general.timezone.trim()) {
		throw new TypeError('timezone must be a non-empty string');
	}
	for (const key of ['lowStockThreshold', 'defaultReorderQuantity']) {
		if (!Number.isInteger(inventory[key]) || inventory[key] < 0) {
			throw new TypeError(`${key} must be a non-negative integer`);
		}
	}
	for (const [sectionName, section] of Object.entries({ inventory, notifications })) {
		for (const [key, value] of Object.entries(section)) {
			if (key !== 'lowStockThreshold' && key !== 'defaultReorderQuantity' && typeof value !== 'boolean') {
				throw new TypeError(`${sectionName}.${key} must be a boolean`);
			}
		}
	}

	return settings;
}

function normalizeDocument(document) {
	const value = document && typeof document.toObject === 'function' ? document.toObject() : document;
	if (!value) return copyDefaults();

	const stored = {};
	for (const section of Object.keys(DEFAULT_SETTINGS)) {
		stored[section] = isObject(value[section]) ? value[section] : {};
	}
	return mergeSettings(copyDefaults(), stored);
}

/**
 * Creates settings operations for a model/repository implementing findOne and
 * findOneAndUpdate (e.g. a Mongoose model). The empty filter keeps one global
 * settings document for the inventory application.
 */
function createSettingsService(repository) {
	if (!repository || typeof repository.findOne !== 'function' ||
			typeof repository.findOneAndUpdate !== 'function') {
		throw new TypeError('Settings repository must implement findOne and findOneAndUpdate');
	}

	async function getSettings() {
		return normalizeDocument(await repository.findOne({}));
	}

	async function updateSettings(updates) {
		if (!isObject(updates) || Object.keys(updates).length === 0) {
			throw new TypeError('Settings updates must be a non-empty object');
		}

		const settings = validateSettings(mergeSettings(await getSettings(), updates));
		const saved = await repository.findOneAndUpdate(
			{},
			{ $set: settings },
			{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
		);
		return saved ? normalizeDocument(saved) : settings;
	}

	async function resetSettings() {
		const defaults = copyDefaults();
		const saved = await repository.findOneAndUpdate(
			{},
			{ $set: defaults },
			{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
		);
		return saved ? normalizeDocument(saved) : defaults;
	}

	return { getSettings, updateSettings, resetSettings };
}

module.exports = { DEFAULT_SETTINGS, createSettingsService, validateSettings };
