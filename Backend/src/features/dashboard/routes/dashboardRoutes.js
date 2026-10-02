/* File: #src/features/dashboard/routes/dashboardRoutes.js */ 

const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Dashboard overview and inventory metrics.
router.get('/', dashboardController.getDashboard);
router.get('/summary', dashboardController.getSummary);
router.get('/stats', dashboardController.getStats);
router.get('/low-stock', dashboardController.getLowStock);
router.get('/recent-activity', dashboardController.getRecentActivity);

module.exports = router;
