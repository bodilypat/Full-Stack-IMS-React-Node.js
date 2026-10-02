/* ***************************************************** */
/* File: #src/features/inventory/utils/inventoryUtils.js */
/* ***************************************************** */

const DEFAULT_LOW_STOCK_THRESHOLD = 10;

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clamp = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const safeTrim = (value) => (typeof value === 'string' ? value.trim() : '');

const getInventoryStatus = (quantity, minQuantity = 0, reorderLevel = minQuantity) => {
  const stock = toNumber(quantity, 0);
  const minimum = toNumber(minQuantity, 0);
  const reorder = toNumber(reorderLevel, minimum);

  if (stock <= 0) return 'out_of_stock';
  if (stock <= reorder) return 'low_stock';
  if (stock <= minimum + reorder) return 'medium_stock';
  return 'in_stock';
};

const normalizeInventoryItem = (item = {}) => {
  const quantity = toNumber(item.quantity, 0);
  const minQuantity = toNumber(item.minQuantity ?? item.minimumQuantity, 0);
  const reorderLevel = toNumber(item.reorderLevel ?? item.reorder_point, minQuantity);
  const unitPrice = toNumber(item.unitPrice ?? item.price, 0);
  const totalValue = toNumber(item.totalValue, quantity * unitPrice);

  return {
    id: item.id ?? item._id ?? null,
    name: safeTrim(item.name),
    sku: safeTrim(item.sku),
    category: safeTrim(item.category),
    description: safeTrim(item.description),
    quantity,
    minQuantity,
    reorderLevel,
    unitPrice,
    totalValue,
    location: safeTrim(item.location),
    supplier: safeTrim(item.supplier),
    status: getInventoryStatus(quantity, minQuantity, reorderLevel),
    lastUpdated: item.lastUpdated ?? item.updatedAt ?? new Date().toISOString(),
  };
};

const normalizeInventoryList = (items = []) => items.map(normalizeInventoryItem);

const calculateInventorySummary = (items = []) => {
  const normalizedItems = normalizeInventoryList(items);

  const summary = normalizedItems.reduce(
    (acc, item) => {
      acc.totalItems += 1;
      acc.totalQuantity += item.quantity;
      acc.totalValue += item.totalValue;
      acc.lowStock += item.status === 'low_stock' ? 1 : 0;
      acc.outOfStock += item.status === 'out_of_stock' ? 1 : 0;
      acc.inStock += item.status === 'in_stock' ? 1 : 0;
      return acc;
    },
    {
      totalItems: 0,
      totalQuantity: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0,
      inStock: 0,
    }
  );

  return {
    ...summary,
    averageUnitPrice: summary.totalItems ? summary.totalValue / summary.totalQuantity || 0 : 0,
  };
};

const updateStockQuantity = (item = {}, adjustment = 0) => {
  const normalized = normalizeInventoryItem(item);
  const delta = toNumber(adjustment, 0);
  const updatedQuantity = clamp(normalized.quantity + delta, 0);

  return {
    ...normalized,
    quantity: updatedQuantity,
    totalValue: updatedQuantity * normalized.unitPrice,
    status: getInventoryStatus(updatedQuantity, normalized.minQuantity, normalized.reorderLevel),
  };
};

const validateInventoryItem = (item = {}) => {
  const normalized = normalizeInventoryItem(item);
  const errors = {};

  if (!normalized.name) errors.name = 'Item name is required';
  if (!normalized.sku) errors.sku = 'SKU is required';
  if (normalized.quantity < 0) errors.quantity = 'Quantity cannot be negative';
  if (normalized.unitPrice < 0) errors.unitPrice = 'Unit price cannot be negative';
  if (normalized.minQuantity < 0) errors.minQuantity = 'Minimum quantity cannot be negative';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    item: normalized,
  };
};

const isLowStock = (item = {}, threshold = DEFAULT_LOW_STOCK_THRESHOLD) => {
  const normalized = normalizeInventoryItem(item);
  const stockThreshold = toNumber(threshold, DEFAULT_LOW_STOCK_THRESHOLD);
  return normalized.quantity <= stockThreshold || normalized.status === 'low_stock';
};

const createInventoryFilter = (query = {}) => {
  const filters = {};

  if (query.category) filters.category = safeTrim(query.category);
  if (query.location) filters.location = safeTrim(query.location);
  if (query.sku) filters.sku = safeTrim(query.sku);
  if (query.status) filters.status = safeTrim(query.status);

  if (typeof query.lowStock !== 'undefined') filters.lowStock = Boolean(query.lowStock);
  if (typeof query.outOfStock !== 'undefined') filters.outOfStock = Boolean(query.outOfStock);

  return filters;
};

const applyInventoryFilters = (items = [], filters = {}) => {
  const normalizedItems = normalizeInventoryList(items);
  const query = createInventoryFilter(filters);

  return normalizedItems.filter((item) => {
    if (query.category && item.category !== query.category) return false;
    if (query.location && item.location !== query.location) return false;
    if (query.sku && item.sku !== query.sku) return false;
    if (query.status && item.status !== query.status) return false;
    if (query.lowStock && !isLowStock(item)) return false;
    if (query.outOfStock && item.status !== 'out_of_stock') return false;
    return true;
  });
};

module.exports = {
  DEFAULT_LOW_STOCK_THRESHOLD,
  toNumber,
  clamp,
  safeTrim,
  getInventoryStatus,
  normalizeInventoryItem,
  normalizeInventoryList,
  calculateInventorySummary,
  updateStockQuantity,
  validateInventoryItem,
  isLowStock,
  createInventoryFilter,
  applyInventoryFilters,
};
 

