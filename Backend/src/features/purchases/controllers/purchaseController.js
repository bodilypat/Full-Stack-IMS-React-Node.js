/* File: #src/features/purchases/controllers/purchaseController.js
POST   /api/purchases
GET    /api/purchases
GET    /api/purchases/:id
PUT    /api/purchases/:id
DELETE /api/purchases/:id
POST   /api/purchases/:id/receive
 */

import * as purchaseService from "../services/purchaseService.js";

const sendSuccess = (res, statusCode, data) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

const getUserId = (req) => req.user?.id ?? null;

export const getPurchases = async (req, res, next) => {
  try {
    const result = await purchaseService.getPurchases(req.query);
    return sendSuccess(res, 200, result);
  } catch (error) {
    return next(error);
  }
};

export const getPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.getPurchase(req.params.id);
    return sendSuccess(res, 200, purchase);
  } catch (error) {
    return next(error);
  }
};

export const createPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.createPurchase({
      ...req.body,
      userId: getUserId(req),
    });

    return sendSuccess(res, 201, purchase);
  } catch (error) {
    return next(error);
  }
};

export const updatePurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.updatePurchase(
      req.params.id,
      req.body
    );

    return sendSuccess(res, 200, purchase);
  } catch (error) {
    return next(error);
  }
};

export const cancelPurchase = async (req, res, next) => {
  try {
    const purchase = await purchaseService.cancelPurchase(
      req.params.id,
      getUserId(req)
    );

    return sendSuccess(res, 200, purchase);
  } catch (error) {
    return next(error);
  }
};

export const receivePurchase = async (req, res, next) => {
  try {
    const result = await purchaseService.receivePurchase({
      ...req.body,
      purchaseId: req.params.id,
      userId: getUserId(req),
    });

    return sendSuccess(res, 200, result);
  } catch (error) {
    return next(error);
  }
};
