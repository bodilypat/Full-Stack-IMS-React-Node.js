/* File: #src/features/sales/services/saleService.js
**  business logic for sale operations
**  - createSale()
**  - getSales()
**  - getSaleById()
**  - updateSale()
**  - deleteSale()
*/

const DEFAULT_PAGE_SIZE = 20;

const getSaleModel = () => {
  const candidates = [
    require('../models/Sale'),
    require('../models/saleModel'),
    require('../saleModel'),
    require('../../models/Sale'),
    require('../../models/saleModel'),
    require('../../../models/Sale'),
    require('../../../models/saleModel'),
    require('../Sale'),
    require('../sale'),
  ];

  return candidates.find(Boolean) || null;
};

const getInventoryModel = () => {
  const candidates = [
    require('../../inventory/models/Inventory'),
    require('../../inventory/models/inventoryModel'),
    require('../../inventory/inventoryModel'),
    require('../../features/inventory/models/Inventory'),
    require('../../features/inventory/models/inventoryModel'),
    require('../../features/inventory/inventoryModel'),
    require('../models/Inventory'),
    require('../models/inventoryModel'),
    require('../Inventory'),
    require('../inventoryModel'),
  ];

  return candidates.find(Boolean) || null;
};

const toNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const normalizeItem = (item, index) => {
  if (!item || typeof item !== 'object') {
    throw new Error(`Sale item at index ${index} is invalid`);
  }

  const productId = item.productId || item.product_id || item.product || item.id;
  const quantity = toNumber(item.quantity ?? item.qty ?? item.amount ?? 0, 0);
  const unitPrice = toNumber(item.unitPrice ?? item.unit_price ?? item.price ?? 0, 0);

  if (!productId) {
    throw new Error(`Sale item at index ${index} is missing a product reference`);
  }

  if (quantity <= 0) {
    throw new Error(`Sale item at index ${index} must have a quantity greater than zero`);
  }

  if (unitPrice < 0) {
    throw new Error(`Sale item at index ${index} has an invalid unit price`);
  }

  return {
    ...item,
    productId,
    quantity,
    unitPrice,
    subtotal: Number((quantity * unitPrice).toFixed(2)),
  };
};

const normalizeSalePayload = (payload = {}) => {
  const items = Array.isArray(payload.items) ? payload.items : [];

  if (!items.length) {
    throw new Error('Sale must contain at least one item');
  }

  const normalizedItems = items.map(normalizeItem);
  const totalAmount = normalizedItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);

  return {
    ...payload,
    customerId: payload.customerId || payload.customer_id || payload.customer || null,
    status: payload.status || 'completed',
    paymentMethod: payload.paymentMethod || payload.payment_method || 'cash',
    note: payload.note || '',
    items: normalizedItems,
    totalAmount: Number(totalAmount.toFixed(2)),
  };
};

const applyInventoryChange = async (InventoryModel, items = [], direction = -1) => {
  if (!InventoryModel || !Array.isArray(items) || !items.length) {
    return;
  }

  for (const item of items) {
    const productId = item.productId || item.product_id || item.product || item.id;
    const quantity = toNumber(item.quantity ?? item.qty ?? item.amount ?? 0, 0);

    if (!productId || quantity <= 0) {
      continue;
    }

    const inventoryRecord = await (typeof InventoryModel.findOne === 'function'
      ? InventoryModel.findOne({ productId })
      : InventoryModel.find({ productId }).limit(1));

    if (!inventoryRecord) {
      throw new Error(`Inventory record not found for product ${productId}`);
    }

    const currentStock = toNumber(inventoryRecord.stock ?? inventoryRecord.quantity ?? 0, 0);
    const nextStock = currentStock + (direction * quantity);

    if (direction < 0 && nextStock < 0) {
      throw new Error(`Insufficient stock for product ${productId}`);
    }

    if (typeof InventoryModel.updateOne === 'function') {
      await InventoryModel.updateOne(
        { _id: inventoryRecord._id || inventoryRecord.id },
        { $set: { stock: nextStock, quantity: nextStock } }
      );
    } else if (typeof inventoryRecord.save === 'function') {
      inventoryRecord.stock = nextStock;
      inventoryRecord.quantity = nextStock;
      await inventoryRecord.save();
    }
  }
};

const createSaleRecord = async (SaleModel, data) => {
  if (!SaleModel) {
    throw new Error('Sale model is not configured');
  }

  if (typeof SaleModel.create === 'function') {
    return SaleModel.create(data);
  }

  if (typeof SaleModel.prototype?.save === 'function') {
    const sale = new SaleModel(data);
    return sale.save();
  }

  throw new Error('Unsupported sale model implementation');
};

const findSaleById = async (SaleModel, saleId) => {
  if (!SaleModel) {
    throw new Error('Sale model is not configured');
  }

  if (typeof SaleModel.findById === 'function') {
    return SaleModel.findById(saleId);
  }

  if (typeof SaleModel.findOne === 'function') {
    return SaleModel.findOne({ _id: saleId });
  }

  return null;
};

const findSales = async (SaleModel, filters = {}, options = {}) => {
  if (!SaleModel) {
    throw new Error('Sale model is not configured');
  }

  const query = { ...filters };
  const page = Math.max(Number(options.page) || 1, 1);
  const limit = Math.max(Number(options.limit) || DEFAULT_PAGE_SIZE, 1);
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };

  if (typeof SaleModel.find === 'function') {
    const sales = await SaleModel.find(query).sort(sort).skip(skip).limit(limit);
    const total = SaleModel.countDocuments ? await SaleModel.countDocuments(query) : sales.length;

    return {
      data: sales,
      page,
      limit,
      total,
    };
  }

  return { data: [], page, limit, total: 0 };
};

const updateSaleRecord = async (SaleModel, saleId, updateData) => {
  if (!SaleModel) {
    throw new Error('Sale model is not configured');
  }

  if (typeof SaleModel.findByIdAndUpdate === 'function') {
    return SaleModel.findByIdAndUpdate(saleId, updateData, { new: true, runValidators: true });
  }

  if (typeof SaleModel.updateOne === 'function') {
    await SaleModel.updateOne({ _id: saleId }, updateData);
    return findSaleById(SaleModel, saleId);
  }

  throw new Error('Unsupported update strategy for sale model');
};

const deleteSaleRecord = async (SaleModel, saleId) => {
  if (!SaleModel) {
    throw new Error('Sale model is not configured');
  }

  if (typeof SaleModel.findByIdAndDelete === 'function') {
    return SaleModel.findByIdAndDelete(saleId);
  }

  if (typeof SaleModel.deleteOne === 'function') {
    return SaleModel.deleteOne({ _id: saleId });
  }

  throw new Error('Unsupported delete strategy for sale model');
};

async function createSale(saleData = {}, dependencies = {}) {
  const SaleModel = dependencies.SaleModel || getSaleModel();
  const InventoryModel = dependencies.InventoryModel || getInventoryModel();

  const normalizedSale = normalizeSalePayload(saleData);

  if (InventoryModel) {
    await applyInventoryChange(InventoryModel, normalizedSale.items, -1);
  }

  return createSaleRecord(SaleModel, normalizedSale);
}

async function getSales(filters = {}, options = {}, dependencies = {}) {
  const SaleModel = dependencies.SaleModel || getSaleModel();

  if (!SaleModel) {
    throw new Error('Sale model is not configured');
  }

  return findSales(SaleModel, filters, options);
}

async function getSaleById(saleId, dependencies = {}) {
  const SaleModel = dependencies.SaleModel || getSaleModel();

  if (!saleId) {
    throw new Error('Sale id is required');
  }

  const sale = await findSaleById(SaleModel, saleId);
  if (!sale) {
    throw new Error('Sale not found');
  }

  return sale;
}

async function updateSale(saleId, updateData = {}, dependencies = {}) {
  const SaleModel = dependencies.SaleModel || getSaleModel();
  const InventoryModel = dependencies.InventoryModel || getInventoryModel();

  if (!saleId) {
    throw new Error('Sale id is required');
  }

  const existingSale = await findSaleById(SaleModel, saleId);
  if (!existingSale) {
    throw new Error('Sale not found');
  }

  const currentSaleObject = existingSale.toObject ? existingSale.toObject() : existingSale;
  const nextSaleData = normalizeSalePayload({
    ...currentSaleObject,
    ...updateData,
    items: Array.isArray(updateData.items) ? updateData.items : currentSaleObject.items || [],
  });

  if (InventoryModel) {
    const previousItems = Array.isArray(currentSaleObject.items) ? currentSaleObject.items : [];
    await applyInventoryChange(InventoryModel, previousItems, 1);
    await applyInventoryChange(InventoryModel, nextSaleData.items, -1);
  }

  return updateSaleRecord(SaleModel, saleId, nextSaleData);
}

async function deleteSale(saleId, dependencies = {}) {
  const SaleModel = dependencies.SaleModel || getSaleModel();
  const InventoryModel = dependencies.InventoryModel || getInventoryModel();

  if (!saleId) {
    throw new Error('Sale id is required');
  }

  const sale = await findSaleById(SaleModel, saleId);
  if (!sale) {
    throw new Error('Sale not found');
  }

  if (InventoryModel && Array.isArray(sale.items)) {
    await applyInventoryChange(InventoryModel, sale.items, 1);
  }

  return deleteSaleRecord(SaleModel, saleId);
}

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
}; 
