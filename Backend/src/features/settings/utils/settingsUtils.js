/* *************************************************** */
/* File: #src/features/settings/utils/settingsUtils.js */
/* *************************************************** */

const DEFAULT_SETTINGS = Object.freeze({
  appName: 'Inventory Management System',
  language: 'en',
  locale: 'en-US',
  timezone: 'UTC',
  currency: 'USD',
  currencySymbol: '$',
  taxRate: 0,
  lowStockThreshold: 10,
  inventoryPrecision: 2,
  allowNegativeStock: false,
  autoGenerateSku: true,
  requireApprovalForSale: false,
  defaultWarehouseId: null,
  autoSaveInterval: 30,
});

const SETTINGS_KEYS = Object.freeze(Object.keys(DEFAULT_SETTINGS));

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const defaultValue = (value, fallback) => (value === undefined ? fallback : value);

const sanitizeString = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const clampNumber = (value, min, max, fallback) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(value, min), max);
};

const toBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  }
  return fallback;
};

const getNestedValue = (source, path, fallbackValue) => {
  if (!source || typeof path !== 'string' || path.length === 0) {
    return fallbackValue;
  }

  const segments = path.split('.');
  let current = source;

  for (const segment of segments) {
    if (current === null || current === undefined || !Object.prototype.hasOwnProperty.call(current, segment)) {
      return fallbackValue;
    }
    current = current[segment];
  }

  return current === undefined ? fallbackValue : current;
};

const setNestedValue = (source, path, value) => {
  if (!source || typeof path !== 'string' || path.length === 0) {
    return source;
  }

  const segments = path.split('.');
  let current = source;

  for (let index = 0; index < segments.length - 1; index += 1) {
    const segment = segments[index];
    if (!current[segment] || typeof current[segment] !== 'object') {
      current[segment] = {};
    }
    current = current[segment];
  }

  current[segments[segments.length - 1]] = value;
  return source;
};

const normalizeSettings = (rawSettings = {}) => {
  const source = isPlainObject(rawSettings) ? rawSettings : {};
  const settings = { ...DEFAULT_SETTINGS };

  for (const key of SETTINGS_KEYS) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      settings[key] = source[key];
    }
  }

  settings.appName = sanitizeString(settings.appName, DEFAULT_SETTINGS.appName);
  settings.language = sanitizeString(settings.language, DEFAULT_SETTINGS.language);
  settings.locale = sanitizeString(settings.locale, DEFAULT_SETTINGS.locale);
  settings.timezone = sanitizeString(settings.timezone, DEFAULT_SETTINGS.timezone);
  settings.currency = sanitizeString(settings.currency, DEFAULT_SETTINGS.currency).toUpperCase();
  settings.currencySymbol = sanitizeString(
    settings.currencySymbol,
    settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : settings.currency === 'GBP' ? '£' : DEFAULT_SETTINGS.currencySymbol,
  );
  settings.taxRate = clampNumber(Number(settings.taxRate), 0, 100, DEFAULT_SETTINGS.taxRate);
  settings.lowStockThreshold = clampNumber(
    Number(settings.lowStockThreshold),
    0,
    Number.MAX_SAFE_INTEGER,
    DEFAULT_SETTINGS.lowStockThreshold,
  );
  settings.inventoryPrecision = clampNumber(
    Number(settings.inventoryPrecision),
    0,
    6,
    DEFAULT_SETTINGS.inventoryPrecision,
  );
  settings.allowNegativeStock = toBoolean(settings.allowNegativeStock, DEFAULT_SETTINGS.allowNegativeStock);
  settings.autoGenerateSku = toBoolean(settings.autoGenerateSku, DEFAULT_SETTINGS.autoGenerateSku);
  settings.requireApprovalForSale = toBoolean(
    settings.requireApprovalForSale,
    DEFAULT_SETTINGS.requireApprovalForSale,
  );
  settings.defaultWarehouseId = settings.defaultWarehouseId ?? DEFAULT_SETTINGS.defaultWarehouseId;
  settings.autoSaveInterval = clampNumber(
    Number(settings.autoSaveInterval),
    5,
    3600,
    DEFAULT_SETTINGS.autoSaveInterval,
  );

  return settings;
};

const getSetting = (settings, key, fallbackValue) => {
  const normalizedSettings = normalizeSettings(settings);
  const value = getNestedValue(normalizedSettings, key, fallbackValue);
  return value === undefined ? fallbackValue : value;
};

const setSetting = (settings, key, value) => {
  const normalizedSettings = normalizeSettings(settings);
  setNestedValue(normalizedSettings, key, value);
  return normalizeSettings(normalizedSettings);
};

const updateSettings = (settings, updates = {}) => {
  const normalizedSettings = normalizeSettings(settings);
  const source = isPlainObject(updates) ? updates : {};

  const merged = { ...normalizedSettings };

  for (const key of Object.keys(source)) {
    if (Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, key)) {
      merged[key] = source[key];
    }
  }

  return normalizeSettings(merged);
};

const formatCurrency = (amount, settings = {}) => {
  const normalizedSettings = normalizeSettings(settings);
  const numericAmount = Number(amount) || 0;
  const currency = normalizedSettings.currency || DEFAULT_SETTINGS.currency;
  const symbol = normalizedSettings.currencySymbol || DEFAULT_SETTINGS.currencySymbol;
  const decimals = Number(normalizedSettings.inventoryPrecision) || DEFAULT_SETTINGS.inventoryPrecision;

  const formattedValue = numericAmount.toLocaleString(normalizedSettings.locale || DEFAULT_SETTINGS.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formattedValue} ${currency}`.trim();
};

const getDefaultSettings = () => ({ ...DEFAULT_SETTINGS });

module.exports = {
  DEFAULT_SETTINGS,
  SETTINGS_KEYS,
  normalizeSettings,
  getSetting,
  setSetting,
  updateSettings,
  formatCurrency,
  getDefaultSettings,
  isPlainObject,
};
