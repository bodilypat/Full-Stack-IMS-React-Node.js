/* File: #src/features/reports/constants/reportConstants.js */

const REPORT_TYPES = Object.freeze({
  INVENTORY_SUMMARY: 'inventory_summary',
  STOCK_MOVEMENT: 'stock_movement',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  PRODUCT_WISE_STOCK: 'product_wise_stock',
  PURCHASE_REPORT: 'purchase_report',
  SALES_REPORT: 'sales_report',
  RETURN_REPORT: 'return_report',
  EXPIRY_REPORT: 'expiry_report',
  FINANCIAL_SUMMARY: 'financial_summary',
  WAREHOUSE_REPORT: 'warehouse_report',
  CATEGORY_REPORT: 'category_report',
});

const REPORT_STATUS = Object.freeze({
  PENDING: 'pending',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
});

const REPORT_FORMATS = Object.freeze({
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json',
  XLSX: 'xlsx',
});

const REPORT_FREQUENCIES = Object.freeze({
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom',
});

const REPORT_FILTERS = Object.freeze({
  CATEGORY: 'category',
  SUPPLIER: 'supplier',
  WAREHOUSE: 'warehouse',
  PRODUCT: 'product',
  DATE_RANGE: 'date_range',
  STATUS: 'status',
  STOCK_LEVEL: 'stock_level',
});

const REPORT_MESSAGE = Object.freeze({
  CREATED: 'Report generated successfully.',
  FAILED: 'Unable to generate report.',
  NOT_FOUND: 'Report not found.',
  INVALID_TYPE: 'Invalid report type.',
  INVALID_FORMAT: 'Invalid report format.',
  INVALID_STATUS: 'Invalid report status.',
});

module.exports = {
  REPORT_TYPES,
  REPORT_STATUS,
  REPORT_FORMATS,
  REPORT_FREQUENCIES,
  REPORT_FILTERS,
  REPORT_MESSAGE,
};
