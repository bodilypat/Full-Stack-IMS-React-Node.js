/*
 * File: #src/features/sales/controllers/saleItemController.js
 * Handles operations involving individual sale items in the Inventory Management System.
 */

const getSaleItemService = (req) => {
  return req?.app?.locals?.saleItemService || null;
};

const sendError = (res, statusCode, message, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};

const normalizeSaleItemPayload = (body = {}) => {
  const payload = { ...body };

  if (payload.quantity !== undefined && payload.quantity !== null) {
    payload.quantity = Number(payload.quantity);
  }

  if (payload.unitPrice !== undefined && payload.unitPrice !== null) {
    payload.unitPrice = Number(payload.unitPrice);
  }

  if (payload.totalPrice !== undefined && payload.totalPrice !== null) {
    payload.totalPrice = Number(payload.totalPrice);
  }

  return payload;
};

const saleItemController = {
  getAllSaleItems: async (req, res, next) => {
    try {
      const service = getSaleItemService(req);

      if (!service || typeof service.getAllSaleItems !== 'function') {
        return sendError(res, 503, 'Sale item service is not available.');
      }

      const saleItems = await service.getAllSaleItems(req.query || {});

      return res.status(200).json({
        success: true,
        data: saleItems,
      });
    } catch (error) {
      next(error);
    }
  },

  getSaleItemById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const service = getSaleItemService(req);

      if (!service || typeof service.getSaleItemById !== 'function') {
        return sendError(res, 503, 'Sale item service is not available.');
      }

      const saleItem = await service.getSaleItemById(id);

      if (!saleItem) {
        return sendError(res, 404, 'Sale item not found.');
      }

      return res.status(200).json({
        success: true,
        data: saleItem,
      });
    } catch (error) {
      next(error);
    }
  },

  createSaleItem: async (req, res, next) => {
    try {
      const payload = normalizeSaleItemPayload(req.body);
      const service = getSaleItemService(req);

      if (!service || typeof service.createSaleItem !== 'function') {
        return sendError(res, 503, 'Sale item service is not available.');
      }

      if (!payload.productId || !payload.saleId) {
        return sendError(res, 400, 'Product ID and sale ID are required.');
      }

      if (Number(payload.quantity) <= 0) {
        return sendError(res, 400, 'Quantity must be greater than zero.');
      }

      const saleItem = await service.createSaleItem(payload);

      return res.status(201).json({
        success: true,
        message: 'Sale item created successfully.',
        data: saleItem,
      });
    } catch (error) {
      next(error);
    }
  },

  updateSaleItem: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payload = normalizeSaleItemPayload(req.body);
      const service = getSaleItemService(req);

      if (!service || typeof service.updateSaleItem !== 'function') {
        return sendError(res, 503, 'Sale item service is not available.');
      }

      if (payload.quantity !== undefined && Number(payload.quantity) <= 0) {
        return sendError(res, 400, 'Quantity must be greater than zero.');
      }

      const updatedSaleItem = await service.updateSaleItem(id, payload);

      if (!updatedSaleItem) {
        return sendError(res, 404, 'Sale item not found.');
      }

      return res.status(200).json({
        success: true,
        message: 'Sale item updated successfully.',
        data: updatedSaleItem,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteSaleItem: async (req, res, next) => {
    try {
      const { id } = req.params;
      const service = getSaleItemService(req);

      if (!service || typeof service.deleteSaleItem !== 'function') {
        return sendError(res, 503, 'Sale item service is not available.');
      }

      const deletedSaleItem = await service.deleteSaleItem(id);

      if (!deletedSaleItem) {
        return sendError(res, 404, 'Sale item not found.');
      }

      return res.status(200).json({
        success: true,
        message: 'Sale item deleted successfully.',
        data: deletedSaleItem,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = saleItemController;

