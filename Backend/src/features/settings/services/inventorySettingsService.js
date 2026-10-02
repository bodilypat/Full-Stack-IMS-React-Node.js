/* *************************************************************** */
/* File: #src/features/settings/services/inventorySettingsService.js */
/* *************************************************************** */

const DEFAULT_SETTINGS = Object.freeze({
  lowStockThreshold: 10,
  reorderPoint: 25,
  stockAlertEnabled: true,
  autoReorderEnabled: false,
  negativeStockAllowed: false,
  defaultCurrency: 'USD',
  decimalPrecision: 2,
  inventoryAuditTrail: true,
  perishableTracking: false,
  warehouseMode: 'single',
  timezone: 'UTC',
  updatedAt: null,
});

const VALID_WAREHOUSE_MODES = ['single', 'multi'];
const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR'];

function sanitizeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normalizeSettings(settings = {}) {
  const normalized = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  normalized.lowStockThreshold = sanitizeNumber(normalized.lowStockThreshold, DEFAULT_SETTINGS.lowStockThreshold);
  normalized.reorderPoint = sanitizeNumber(normalized.reorderPoint, DEFAULT_SETTINGS.reorderPoint);
  normalized.decimalPrecision = Number.isInteger(Number(normalized.decimalPrecision))
    ? Number(normalized.decimalPrecision)
    : DEFAULT_SETTINGS.decimalPrecision;

  if (normalized.decimalPrecision < 0) {
    normalized.decimalPrecision = DEFAULT_SETTINGS.decimalPrecision;
  }

  if (typeof normalized.defaultCurrency === 'string') {
    normalized.defaultCurrency = normalized.defaultCurrency.toUpperCase();
  }

  if (typeof normalized.timezone !== 'string' || !normalized.timezone.trim()) {
    normalized.timezone = DEFAULT_SETTINGS.timezone;
  }

  normalized.stockAlertEnabled = Boolean(normalized.stockAlertEnabled);
  normalized.autoReorderEnabled = Boolean(normalized.autoReorderEnabled);
  normalized.negativeStockAllowed = Boolean(normalized.negativeStockAllowed);
  normalized.inventoryAuditTrail = Boolean(normalized.inventoryAuditTrail);
  normalized.perishableTracking = Boolean(normalized.perishableTracking);

  if (typeof normalized.warehouseMode === 'string') {
    normalized.warehouseMode = normalized.warehouseMode.toLowerCase();
  }

  if (!VALID_WAREHOUSE_MODES.includes(normalized.warehouseMode)) {
    normalized.warehouseMode = DEFAULT_SETTINGS.warehouseMode;
  }

  if (!VALID_CURRENCIES.includes(normalized.defaultCurrency)) {
    normalized.defaultCurrency = DEFAULT_SETTINGS.defaultCurrency;
  }

  normalized.updatedAt = new Date();
  return normalized;
}

function validateInventorySettings(settings) {
  const errors = [];
  const lowStockThreshold = sanitizeNumber(settings.lowStockThreshold, DEFAULT_SETTINGS.lowStockThreshold);
  const reorderPoint = sanitizeNumber(settings.reorderPoint, DEFAULT_SETTINGS.reorderPoint);

  if (lowStockThreshold < 0) {
    errors.push('lowStockThreshold cannot be less than 0');
  }

  if (reorderPoint < 0) {
    errors.push('reorderPoint cannot be less than 0');
  }

  if (reorderPoint < lowStockThreshold) {
    errors.push('reorderPoint must be greater than or equal to lowStockThreshold');
  }

  if (!VALID_WAREHOUSE_MODES.includes(settings.warehouseMode)) {
    errors.push('warehouseMode is invalid');
  }

  if (!VALID_CURRENCIES.includes(settings.defaultCurrency)) {
    errors.push('defaultCurrency is invalid');
  }

  if (!Number.isInteger(Number(settings.decimalPrecision)) || Number(settings.decimalPrecision) < 0) {
    errors.push('decimalPrecision must be a non-negative integer');
  }

  if (errors.length > 0) {
    const error = new Error('Invalid inventory settings');
    error.details = errors;
    throw error;
  }

  return settings;
}

function createInventorySettingsService({ settingsStore } = {}) {
  const store = settingsStore || {
    data: null,
    async findOne() {
      return this.data;
    },
    async create(payload) {
      this.data = payload;
      return payload;
    },
    async updateOne(filter, update) {
      const merged = { ...(this.data || {}), ...(update.$set || {}) };
      this.data = merged;
      return { value: merged };
    },
  };

  async function getInventorySettings(filters = {}) {
    const current = await store.findOne(filters);
    if (!current) {
      return normalizeSettings(DEFAULT_SETTINGS);
    }

    return normalizeSettings(current);
  }

  async function createInventorySettings(payload = {}) {
    const normalized = normalizeSettings(payload);
    validateInventorySettings(normalized);

    const created = await store.create(normalized);
    return created || normalized;
  }

  async function updateInventorySettings(filters = {}, updates = {}) {
    const current = await getInventorySettings(filters);
    const merged = normalizeSettings({ ...current, ...updates });
    validateInventorySettings(merged);

    if (typeof store.updateOne === 'function') {
      const result = await store.updateOne(filters, { $set: merged });
      if (result && result.value) {
        return result.value;
      }
      if (result && result.updatedDocument) {
        return result.updatedDocument;
      }
    }

    return merged;
  }

  async function resetInventorySettings(filters = {}) {
    const reset = normalizeSettings(DEFAULT_SETTINGS);
    validateInventorySettings(reset);

    if (typeof store.updateOne === 'function') {
      const result = await store.updateOne(filters, { $set: reset });
      if (result && result.value) {
        return result.value;
      }
      if (result && result.updatedDocument) {
        return result.updatedDocument;
      }
    }

    return reset;
  }

  async function deleteInventorySettings(filters = {}) {
    if (typeof store.deleteOne === 'function') {
      return store.deleteOne(filters);
    }

    store.data = null;
    return true;
  }

  return {
    DEFAULT_SETTINGS,
    normalizeSettings,
    validateInventorySettings,
    getInventorySettings,
    createInventorySettings,
    updateInventorySettings,
    resetInventorySettings,
    deleteInventorySettings,
  };
}

const inventorySettingsService = createInventorySettingsService();

module.exports = inventorySettingsService;
module.exports.createInventorySettingsService = createInventorySettingsService;
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
module.exports.normalizeSettings = normalizeSettings;
module.exports.validateInventorySettings = validateInventorySettings;
