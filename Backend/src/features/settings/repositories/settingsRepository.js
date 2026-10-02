/* *************************************************************** */
/* File: #src/features/settings/repositories/settingsRepository.js 
** getSettings()
** updateSettings()
** getCompanySettings()
** updateCompanySettings()
** getInvoiceSettings()
** updateInvoiceSettings()
** getSalesSettings()
** updateSalesSettings()
** getNotificationSettings()
** updateNotificationSettings()
/* *************************************************************** */

const TABLE_NAME = 'settings';

const serializeValue = (value) =>
	typeof value === 'string' ? value : JSON.stringify(value);

/** Create settings database operations using a mysql2/promise connection or pool. */
const createSettingsRepository = (database) => {
	if (!database || typeof database.execute !== 'function') {
		throw new TypeError('A database connection with an execute() method is required');
	}

	const findAll = async () => {
		const [rows] = await database.execute(
			`SELECT id, setting_key, setting_value, description, created_at, updated_at
			 FROM ${TABLE_NAME}
			 ORDER BY setting_key ASC`
		);
		return rows;
	};

	const findByKey = async (key) => {
		if (!key) throw new TypeError('Setting key is required');
		const [rows] = await database.execute(
			`SELECT id, setting_key, setting_value, description, created_at, updated_at
			 FROM ${TABLE_NAME}
			 WHERE setting_key = ?
			 LIMIT 1`,
			[key]
		);
		return rows[0] || null;
	};

	const create = async ({ key, value, description = null }) => {
		if (!key || value === undefined) {
			throw new TypeError('Setting key and value are required');
		}
		await database.execute(
			`INSERT INTO ${TABLE_NAME} (setting_key, setting_value, description)
			 VALUES (?, ?, ?)`,
			[key, serializeValue(value), description]
		);
		return findByKey(key);
	};

	const update = async (key, changes = {}) => {
		if (!key) throw new TypeError('Setting key is required');
		if (changes.value === undefined && changes.description === undefined) {
			throw new TypeError('A value or description must be provided');
		}

		const fields = [];
		const values = [];
		if (changes.value !== undefined) {
			fields.push('setting_value = ?');
			values.push(serializeValue(changes.value));
		}
		if (changes.description !== undefined) {
			fields.push('description = ?');
			values.push(changes.description);
		}
		values.push(key);

		const [result] = await database.execute(
			`UPDATE ${TABLE_NAME} SET ${fields.join(', ')} WHERE setting_key = ?`,
			values
		);
		return result.affectedRows ? findByKey(key) : null;
	};

	const upsert = async ({ key, value, description = null }) => {
		if (!key || value === undefined) {
			throw new TypeError('Setting key and value are required');
		}
		await database.execute(
			`INSERT INTO ${TABLE_NAME} (setting_key, setting_value, description)
			 VALUES (?, ?, ?)
			 ON DUPLICATE KEY UPDATE
				 setting_value = VALUES(setting_value),
				 description = VALUES(description),
				 updated_at = CURRENT_TIMESTAMP`,
			[key, serializeValue(value), description]
		);
		return findByKey(key);
	};

	const remove = async (key) => {
		if (!key) throw new TypeError('Setting key is required');
		const [result] = await database.execute(
			`DELETE FROM ${TABLE_NAME} WHERE setting_key = ?`,
			[key]
		);
		return result.affectedRows > 0;
	};

	const deserializeValue = (value) => {
		if (value === null || value === undefined || typeof value !== 'string') {
			return value;
		}
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	};

	const parseRow = (row) => {
		if (!row) return row;
		return {
			...row,
			setting_value: deserializeValue(row.setting_value),
		};
	};

	const findByPrefix = async (prefix, { parse = true } = {}) => {
		if (!prefix) throw new TypeError('Setting prefix is required');
		const [rows] = await database.execute(
			`SELECT id, setting_key, setting_value, description, created_at, updated_at
			 FROM ${TABLE_NAME}
			 WHERE setting_key LIKE ?
			 ORDER BY setting_key ASC`,
			[`${prefix}%`]
		);
		return parse ? rows.map(parseRow) : rows;
	};

	const getSettings = async (key = null) => {
		if (key) {
			const row = await findByKey(key);
			return parseRow(row);
		}
		const rows = await findAll();
		return rows.map(parseRow);
	};

	const updateSettings = async (key, value, description = null) => {
		if (typeof key === 'object' && key !== null) {
			const { key: settingKey, value: settingValue, description: settingDescription } = key;
			return upsert({
				key: settingKey,
				value: settingValue,
				description: settingDescription ?? description ?? null,
			});
		}
		return upsert({ key, value, description });
	};

	const getSettingsByCategory = async (prefix) => {
		const rows = await findByPrefix(prefix, { parse: true });
		return rows.reduce((acc, row) => {
			const settingKey = row.setting_key.startsWith(`${prefix}.`)
				? row.setting_key.slice(prefix.length + 1)
				: row.setting_key;
			acc[settingKey] = row.setting_value;
			return acc;
		}, {});
	};

	const updateSettingsByCategory = async (prefix, settings = {}) => {
		if (!settings || typeof settings !== 'object') {
			throw new TypeError('Settings payload must be an object');
		}
		const results = {};
		for (const [field, value] of Object.entries(settings)) {
			const settingKey = `${prefix}.${field}`;
			const row = await upsert({ key: settingKey, value });
			results[field] = row ? row.setting_value : null;
		}
		return results;
	};

	const getCompanySettings = async () => getSettingsByCategory('company');
	const updateCompanySettings = async (settings = {}) => updateSettingsByCategory('company', settings);

	const getInvoiceSettings = async () => getSettingsByCategory('invoice');
	const updateInvoiceSettings = async (settings = {}) => updateSettingsByCategory('invoice', settings);

	const getSalesSettings = async () => getSettingsByCategory('sales');
	const updateSalesSettings = async (settings = {}) => updateSettingsByCategory('sales', settings);

	const getNotificationSettings = async () => getSettingsByCategory('notification');
	const updateNotificationSettings = async (settings = {}) => updateSettingsByCategory('notification', settings);

	return {
		findAll,
		findByKey,
		create,
		update,
		upsert,
		remove,
		getSettings,
		updateSettings,
		getCompanySettings,
		updateCompanySettings,
		getInvoiceSettings,
		updateInvoiceSettings,
		getSalesSettings,
		updateSalesSettings,
		getNotificationSettings,
		updateNotificationSettings,
	};
};

module.exports = createSettingsRepository;


