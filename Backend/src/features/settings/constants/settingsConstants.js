/* *************************************************** */
/* File: #src/features/settings/constants/settingsConstants.js */
/* *************************************************** */

const SETTINGS_CONSTANTS = Object.freeze({
  DEFAULT_APP_NAME: 'Inventory Management System',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_LOCALE: 'en-US',
  DEFAULT_TIMEZONE: 'UTC',
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_CURRENCY_SYMBOL: '$',
  DEFAULT_TAX_RATE: 0,
  DEFAULT_LOW_STOCK_THRESHOLD: 10,
  DEFAULT_INVENTORY_PRECISION: 2,
  DEFAULT_ALLOW_NEGATIVE_STOCK: false,
  DEFAULT_AUTO_GENERATE_SKU: true,
  DEFAULT_REQUIRE_APPROVAL_FOR_SALE: false,
  DEFAULT_DEFAULT_WAREHOUSE_ID: null,
  DEFAULT_AUTO_SAVE_INTERVAL: 30,
});

module.exports = SETTINGS_CONSTANTS;
