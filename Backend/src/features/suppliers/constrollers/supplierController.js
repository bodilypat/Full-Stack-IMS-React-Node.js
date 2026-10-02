/* *************************************************************** */
/* File: #src/features/suppliers/controllers/supplierController.js */
/* *************************************************************** */

import * as supplierService from "../services/supplierService.js";

const sendSuccess = (res, statusCode, data, message = null) => {
  const response = {
    success: true,
  };

  if (message) response.message = message;
  if (data !== undefined) response.data = data;

  return res.status(statusCode).json(response);
};

const handleControllerError = (next, error) => {
  if (next) return next(error);
  throw error;
};

export const getSuppliers = async (req, res, next) => {
  try {
    const result = await supplierService.getSuppliers(req.query || {});

    return sendSuccess(res, 200, result);
  } catch (error) {
    return handleControllerError(next, error);
  }
};

export const getSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await supplierService.getSupplier(id);

    return sendSuccess(res, 200, supplier);
  } catch (error) {
    return handleControllerError(next, error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await supplierService.createSupplier(req.body || {});

    return sendSuccess(res, 201, supplier, "Supplier created successfully");
  } catch (error) {
    return handleControllerError(next, error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await supplierService.updateSupplier(id, req.body || {});

    return sendSuccess(res, 200, supplier, "Supplier updated successfully");
  } catch (error) {
    return handleControllerError(next, error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    await supplierService.deleteSupplier(id);

    return sendSuccess(res, 200, null, "Supplier deleted successfully");
  } catch (error) {
    return handleControllerError(next, error);
  }
};

