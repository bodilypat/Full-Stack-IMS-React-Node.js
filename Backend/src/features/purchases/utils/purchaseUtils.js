/* File: #src/features/purchases/utils/purchaseUtils.js */

const safeNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeText = (value, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  return String(value).trim() || fallback;
};

const generatePurchaseReference = (prefix = "PO") => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `${prefix}-${year}${month}${day}-${random}`;
};

const calculateLineTotal = ({
  unitPrice = 0,
  quantity = 0,
  discountPercent = 0,
  taxPercent = 0,
}) => {
  const price = safeNumber(unitPrice, 0);
  const qty = safeNumber(quantity, 0);
  const discountRate = Math.max(0, safeNumber(discountPercent, 0));
  const taxRate = Math.max(0, safeNumber(taxPercent, 0));

  const subtotal = price * qty;
  const discountAmount = subtotal * (discountRate / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = discountedSubtotal * (taxRate / 100);

  return Number((discountedSubtotal + taxAmount).toFixed(2));
};

const calculatePurchaseTotals = (items = [], { taxPercent = 0 } = {}) => {
  const list = Array.isArray(items) ? items : [];

  const subtotal = list.reduce((total, item) => {
    const amount = calculateLineTotal({
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      discountPercent: item.discountPercent,
      taxPercent: item.taxPercent ?? taxPercent,
    });
    return total + amount;
  }, 0);

  const itemCount = list.reduce((count, item) => count + safeNumber(item.quantity, 0), 0);
  const taxRate = Math.max(0, safeNumber(taxPercent, 0));
  const tax = subtotal * (taxRate / 100);

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number((subtotal + tax).toFixed(2)),
    itemCount,
  };
};

const normalizePurchaseData = (payload = {}) => {
  const items = Array.isArray(payload.items) ? payload.items : [];

  const normalizedItems = items.map((item, index) => ({
    id: item.id || `${index + 1}`,
    productId: sanitizeText(item.productId, ""),
    productName: sanitizeText(item.productName, "Unknown product"),
    unitPrice: safeNumber(item.unitPrice, 0),
    quantity: Math.max(0, Math.trunc(safeNumber(item.quantity, 0))),
    discountPercent: Math.max(0, safeNumber(item.discountPercent, 0)),
    taxPercent: Math.max(0, safeNumber(item.taxPercent, 0)),
    total: calculateLineTotal({
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      discountPercent: item.discountPercent,
      taxPercent: item.taxPercent,
    }),
  }));

  const totals = calculatePurchaseTotals(normalizedItems, {
    taxPercent: safeNumber(payload.taxPercent, 0),
  });

  return {
    purchaseId: sanitizeText(payload.purchaseId, generatePurchaseReference("PO")),
    supplierId: sanitizeText(payload.supplierId, ""),
    supplierName: sanitizeText(payload.supplierName, ""),
    purchaseDate: payload.purchaseDate || new Date().toISOString(),
    status: sanitizeText(payload.status, "draft").toLowerCase(),
    notes: sanitizeText(payload.notes, ""),
    taxPercent: Math.max(0, safeNumber(payload.taxPercent, 0)),
    items: normalizedItems,
    subtotal: totals.subtotal,
    tax: totals.tax,
    total: totals.total,
    itemCount: totals.itemCount,
  };
};

const validatePurchaseItems = (items = []) => {
  const list = Array.isArray(items) ? items : [];

  if (!list.length) {
    return {
      isValid: false,
      message: "Purchase must contain at least one item.",
    };
  }

  for (const [index, item] of list.entries()) {
    const quantity = safeNumber(item.quantity, 0);
    const unitPrice = safeNumber(item.unitPrice, 0);

    if (!item.productId || !item.productName) {
      return {
        isValid: false,
        message: `Item ${index + 1} is missing product details.`,
      };
    }

    if (quantity <= 0) {
      return {
        isValid: false,
        message: `Item ${index + 1} quantity must be greater than zero.`,
      };
    }

    if (unitPrice < 0) {
      return {
        isValid: false,
        message: `Item ${index + 1} unit price cannot be negative.`,
      };
    }
  }

  return { isValid: true, message: "Purchase items are valid." };
};

const getPurchaseStatus = (receivedQuantity = 0, orderedQuantity = 0) => {
  const received = safeNumber(receivedQuantity, 0);
  const ordered = safeNumber(orderedQuantity, 0);

  if (ordered <= 0) return "draft";
  if (received <= 0) return "pending";
  if (received >= ordered) return "received";
  return "partial";
};

module.exports = {
  safeNumber,
  sanitizeText,
  generatePurchaseReference,
  calculateLineTotal,
  calculatePurchaseTotals,
  normalizePurchaseData,
  validatePurchaseItems,
  getPurchaseStatus,
}; 
