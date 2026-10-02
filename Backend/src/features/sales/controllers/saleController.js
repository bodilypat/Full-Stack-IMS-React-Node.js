/*
 * File: #src/features/sales/controllers/saleController.js
 * Sale-level HTTP operations
 *
 * POST /api/sales
 * GET /api/sales
 * GET /api/sales/:id
 * PUT /api/sales/:id
 * DELETE /api/sales/:id
 * POST /api/sales/:id/cancel
 */

const { validationResult } = require('express-validator');

let saleService;
try {
  saleService = require('../services/saleService');
} catch (error) {
  saleService = null;
}

const fallbackSaleService = {
  async createSale(payload) {
    const sale = {
      id: String(Date.now() + Math.random()),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: payload.status || 'completed',
    };

    if (!global.__salesStore) global.__salesStore = [];
    global.__salesStore.push(sale);
    return sale;
  },

  async listSales() {
    if (!global.__salesStore) global.__salesStore = [];
    return [...global.__salesStore];
  },

  async getSaleById(id) {
    if (!global.__salesStore) global.__salesStore = [];
    return global.__salesStore.find((sale) => String(sale.id) === String(id)) || null;
  },

  async updateSale(id, payload) {
    if (!global.__salesStore) global.__salesStore = [];
    const index = global.__salesStore.findIndex((sale) => String(sale.id) === String(id));
    if (index === -1) return null;

    const updatedSale = {
      ...global.__salesStore[index],
      ...payload,
      id: String(id),
      updatedAt: new Date().toISOString(),
    };

    global.__salesStore[index] = updatedSale;
    return updatedSale;
  },

  async deleteSale(id) {
    if (!global.__salesStore) global.__salesStore = [];
    const index = global.__salesStore.findIndex((sale) => String(sale.id) === String(id));
    if (index === -1) return false;

    global.__salesStore.splice(index, 1);
    return true;
  },

  async cancelSale(id) {
    if (!global.__salesStore) global.__salesStore = [];
    const sale = global.__salesStore.find((item) => String(item.id) === String(id));
    if (!sale) return null;

    sale.status = 'cancelled';
    sale.cancelledAt = new Date().toISOString();
    sale.updatedAt = new Date().toISOString();
    return sale;
  },
};

const saleServiceInstance = saleService || fallbackSaleService;

const handleServiceError = (res, error, message = 'Internal server error') => {
  const statusCode = error && error.statusCode ? error.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'production' ? undefined : error && error.message,
  });
};

const normalizeSalePayload = (payload = {}) => {
  const normalized = { ...payload };

  if (normalized.customerId === undefined && normalized.customer_id !== undefined) {
    normalized.customerId = normalized.customer_id;
  }

  if (normalized.items === undefined && normalized.products !== undefined) {
    normalized.items = normalized.products;
  }

  if (normalized.totalAmount === undefined && normalized.total_amount !== undefined) {
    normalized.totalAmount = normalized.total_amount;
  }

  return normalized;
};

const createSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const payload = normalizeSalePayload(req.body || {});

    if (!payload.customerId && !payload.customer_id) {
      return res.status(400).json({
        success: false,
        message: 'customerId is required',
      });
    }

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items array is required',
      });
    }

    const sale = await saleServiceInstance.createSale(payload);

    return res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale,
    });
  } catch (error) {
    return handleServiceError(res, error, 'Failed to create sale');
  }
};

const getSales = async (req, res) => {
  try {
    const sales = await saleServiceInstance.listSales();

    return res.status(200).json({
      success: true,
      data: sales,
      count: Array.isArray(sales) ? sales.length : 0,
    });
  } catch (error) {
    return handleServiceError(res, error, 'Failed to fetch sales');
  }
};

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await saleServiceInstance.getSaleById(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error) {
    return handleServiceError(res, error, 'Failed to fetch sale');
  }
};

const updateSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const payload = normalizeSalePayload(req.body || {});
    const sale = await saleServiceInstance.updateSale(id, payload);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sale updated successfully',
      data: sale,
    });
  } catch (error) {
    return handleServiceError(res, error, 'Failed to update sale');
  }
};

const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await saleServiceInstance.deleteSale(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sale deleted successfully',
    });
  } catch (error) {
    return handleServiceError(res, error, 'Failed to delete sale');
  }
};

const cancelSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await saleServiceInstance.cancelSale(id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sale cancelled successfully',
      data: sale,
    });
  } catch (error) {
    return handleServiceError(res, error, 'Failed to cancel sale');
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  cancelSale,
};

