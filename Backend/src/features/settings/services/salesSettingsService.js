/* *************************************************************** */
/* File: #src/features/settings/services/salesSettingsService.js */
/* *************************************************************** */

const DEFAULT_SALES_SETTINGS = Object.freeze({
  id: 'default-sales-settings',
  businessName: '',
  currency: 'USD',
  taxRate: 0,
  discountRate: 0,
  invoicePrefix: 'INV',
  invoiceStartNumber: 1,
  dueDays: 0,
  defaultPaymentTerm: 'Cash',
  autoGenerateInvoice: true,
  allowNegativeStock: false,
  roundTotalsToNearest: 0.01,
  minimumOrderValue: 0,
  allowMixedDiscounts: true,
  status: 'active',
  createdAt: null,
  updatedAt: null,
});

class SalesSettingsService {
  constructor() {
    this.settingsStore = new Map();
    this.seedDefaultSettings();
  }

  seedDefaultSettings() {
    const now = new Date().toISOString();
    const defaultSettings = {
      ...DEFAULT_SALES_SETTINGS,
      createdAt: now,
      updatedAt: now,
    };

    this.settingsStore.set(defaultSettings.id, defaultSettings);
  }

  getDefaultSalesSettings() {
    return this._clone(DEFAULT_SALES_SETTINGS);
  }

  getSalesSettings(id = 'default-sales-settings') {
    const settings = this.settingsStore.get(id);
    if (!settings) {
      return null;
    }

    return this._clone(settings);
  }

  listSalesSettings() {
    return Array.from(this.settingsStore.values()).map((settings) => this._clone(settings));
  }

  validateSalesSettings(payload = {}) {
    const errors = {};
    const data = { ...payload };

    if (typeof data.businessName === 'string' && data.businessName.trim() === '') {
      errors.businessName = 'Business name is required.';
    }

    if (data.currency && !/^[A-Z]{3}$/.test(String(data.currency).toUpperCase())) {
      errors.currency = 'Currency must be a valid ISO 4217 code (e.g. USD, EUR, NGN).';
    }

    if (data.taxRate !== undefined && (Number.isNaN(Number(data.taxRate)) || Number(data.taxRate) < 0 || Number(data.taxRate) > 100)) {
      errors.taxRate = 'Tax rate must be between 0 and 100.';
    }

    if (data.discountRate !== undefined && (Number.isNaN(Number(data.discountRate)) || Number(data.discountRate) < 0 || Number(data.discountRate) > 100)) {
      errors.discountRate = 'Discount rate must be between 0 and 100.';
    }

    if (data.invoicePrefix !== undefined) {
      const prefix = String(data.invoicePrefix).trim();
      if (prefix.length < 2 || prefix.length > 10) {
        errors.invoicePrefix = 'Invoice prefix must be between 2 and 10 characters.';
      }
    }

    if (data.invoiceStartNumber !== undefined) {
      const value = Number(data.invoiceStartNumber);
      if (!Number.isInteger(value) || value < 1) {
        errors.invoiceStartNumber = 'Invoice start number must be an integer greater than or equal to 1.';
      }
    }

    if (data.dueDays !== undefined) {
      const value = Number(data.dueDays);
      if (!Number.isInteger(value) || value < 0) {
        errors.dueDays = 'Due days must be a non-negative integer.';
      }
    }

    if (data.defaultPaymentTerm && !['Cash', 'Credit', 'Bank Transfer', 'Cheque', 'Mobile Money'].includes(data.defaultPaymentTerm)) {
      errors.defaultPaymentTerm = 'Default payment term is invalid.';
    }

    if (data.roundTotalsToNearest !== undefined) {
      const value = Number(data.roundTotalsToNearest);
      if (Number.isNaN(value) || value <= 0) {
        errors.roundTotalsToNearest = 'Total rounding precision must be greater than 0.';
      }
    }

    if (data.minimumOrderValue !== undefined) {
      const value = Number(data.minimumOrderValue);
      if (Number.isNaN(value) || value < 0) {
        errors.minimumOrderValue = 'Minimum order value must be zero or greater.';
      }
    }

    if (data.status && !['active', 'inactive', 'archived'].includes(String(data.status).toLowerCase())) {
      errors.status = 'Status must be active, inactive, or archived.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      value: data,
    };
  }

  buildSalesSettings(payload = {}) {
    const validation = this.validateSalesSettings(payload);
    if (!validation.isValid) {
      const error = new Error('Invalid sales settings payload.');
      error.details = validation.errors;
      throw error;
    }

    const now = new Date().toISOString();
    return {
      ...this.getDefaultSalesSettings(),
      ...validation.value,
      id: payload.id || 'default-sales-settings',
      createdAt: payload.createdAt || now,
      updatedAt: now,
    };
  }

  createSalesSettings(payload = {}) {
    const settings = this.buildSalesSettings(payload);
    if (this.settingsStore.has(settings.id)) {
      const error = new Error('Sales settings already exist for this id.');
      error.details = { id: settings.id };
      throw error;
    }

    this.settingsStore.set(settings.id, settings);
    return this._clone(settings);
  }

  updateSalesSettings(id, updates = {}) {
    const existing = this.settingsStore.get(id);
    if (!existing) {
      const error = new Error('Sales settings not found.');
      error.details = { id };
      throw error;
    }

    const merged = this.buildSalesSettings({
      ...existing,
      ...updates,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    this.settingsStore.set(id, merged);
    return this._clone(merged);
  }

  deleteSalesSettings(id) {
    if (!this.settingsStore.has(id)) {
      const error = new Error('Sales settings not found.');
      error.details = { id };
      throw error;
    }

    const removed = this._clone(this.settingsStore.get(id));
    this.settingsStore.delete(id);
    return removed;
  }

  calculateTaxAmount(subtotal, taxRate = this.getSalesSettings()?.taxRate ?? 0) {
    const parsedSubtotal = Number(subtotal || 0);
    const parsedRate = Number(taxRate || 0);

    if (Number.isNaN(parsedSubtotal) || Number.isNaN(parsedRate)) {
      return 0;
    }

    return Number(((parsedSubtotal * parsedRate) / 100).toFixed(2));
  }

  calculateDiscountAmount(subtotal, discountRate = this.getSalesSettings()?.discountRate ?? 0) {
    const parsedSubtotal = Number(subtotal || 0);
    const parsedRate = Number(discountRate || 0);

    if (Number.isNaN(parsedSubtotal) || Number.isNaN(parsedRate)) {
      return 0;
    }

    return Number(((parsedSubtotal * parsedRate) / 100).toFixed(2));
  }

  calculateFinalAmount({ subtotal = 0, taxRate, discountRate, roundingPrecision = 0.01 }) {
    const baseSubtotal = Number(subtotal || 0);
    const rate = Number(taxRate ?? 0);
    const discount = Number(discountRate ?? 0);

    const taxAmount = this.calculateTaxAmount(baseSubtotal, rate);
    const discountAmount = this.calculateDiscountAmount(baseSubtotal, discount);
    const amountAfterDiscount = Math.max(baseSubtotal - discountAmount, 0);
    const total = amountAfterDiscount + taxAmount;

    const precision = Number(roundingPrecision || 0.01);
    return Number((Math.round(total / precision) * precision).toFixed(2));
  }

  canProcessSale({ items = [], stockMap = {}, allowNegativeStock = false }) {
    if (!Array.isArray(items) || items.length === 0) {
      return {
        ok: false,
        reason: 'No items provided for sale.',
      };
    }

    for (const item of items) {
      const requestedQty = Number(item.quantity || 0);
      const availableQty = Number(stockMap[item.productId] ?? 0);

      if (requestedQty <= 0) {
        return {
          ok: false,
          reason: `Invalid quantity for product ${item.productId}.`,
        };
      }

      if (!allowNegativeStock && requestedQty > availableQty) {
        return {
          ok: false,
          reason: `Insufficient stock for product ${item.productId}. Available: ${availableQty}. Requested: ${requestedQty}.`,
        };
      }
    }

    return { ok: true };
  }

  getInvoiceNumber(prefix = 'INV', startNumber = 1) {
    const normalizedPrefix = String(prefix || 'INV').trim() || 'INV';
    const nextNumber = Number(startNumber || 1);
    return `${normalizedPrefix}-${nextNumber}`;
  }

  _clone(value) {
    return JSON.parse(JSON.stringify(value));
  }
}

const salesSettingsService = new SalesSettingsService();

module.exports = salesSettingsService;
module.exports.SalesSettingsService = SalesSettingsService;
module.exports.DEFAULT_SALES_SETTINGS = DEFAULT_SALES_SETTINGS;

