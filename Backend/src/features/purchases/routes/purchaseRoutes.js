/* File: #src/features/purchases/routes/purchaseRoutes.js */

const express = require('express');
const purchaseController = require('../controllers/purchaseController');

const router = express.Router();

router
	.route('/')
	.get(purchaseController.getPurchases)
	.post(purchaseController.createPurchase);

router
	.route('/:id')
	.get(purchaseController.getPurchaseById)
	.put(purchaseController.updatePurchase)
	.delete(purchaseController.deletePurchase);

module.exports = router;
