/* File: #src/features/reports/routes/reportRoutes.js */

const express = require('express');
const reportController = require('../controllers/reportController');

const router = express.Router();

router.get('/summary', reportController.getSummaryReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/sales', reportController.getSalesReport);
router.get('/purchases', reportController.getPurchaseReport);
router.get('/stock-movements', reportController.getStockMovementReport);
router.get('/low-stock', reportController.getLowStockReport);

module.exports = router;




