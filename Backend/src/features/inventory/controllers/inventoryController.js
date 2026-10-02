/* **************************************************************** */
/* File: #src/features/inventory/controllers/inventoryController.js */ 
/* **************************************************************** */

import * as inventoryService from "../services/inventoryService.js";

const respond = (res, data, status = 200) =>
  res.status(status).json({
    success: true,
    data,
  });

const withUser = (req) => ({
  ...req.body,
  userId: req.user?.id,
});

export const getInventory = async (req, res, next) => {
  try {
    const result = await inventoryService.getInventory(req.query);
    return respond(res, result);
  } catch (error) {
    return next(error);
  }
};

export const getInventoryItem = async (req, res, next) => {
  try {
    const item = await inventoryService.getInventoryItem(req.params.id);
    return respond(res, item);
  } catch (error) {
    return next(error);
  }
};

export const stockIn = async (req, res, next) => {
  try {
    const transaction = await inventoryService.stockIn(withUser(req));
    return respond(res, transaction, 201);
  } catch (error) {
    return next(error);
  }
};

export const stockOut = async (req, res, next) => {
  try {
    const transaction = await inventoryService.stockOut(withUser(req));
    return respond(res, transaction, 201);
  } catch (error) {
    return next(error);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const transaction = await inventoryService.adjustStock(withUser(req));
    return respond(res, transaction, 201);
  } catch (error) {
    return next(error);
  }
};

export const transferStock = async (req, res, next) => {
  try {
    const transaction = await inventoryService.transferStock(withUser(req));
    return respond(res, transaction, 201);
  } catch (error) {
    return next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const result = await inventoryService.getTransactions(req.query);
    return respond(res, result);
  } catch (error) {
    return next(error);
  }
};
