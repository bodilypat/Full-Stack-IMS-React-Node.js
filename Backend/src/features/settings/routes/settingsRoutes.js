/* *************************************************** */
/* File: #src/features/settings/routes/settingsRoutes.js */
/* *************************************************** */

const express = require('express');
const settingsController = require('../controllers/settingsController');

const router = express.Router();

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

router.get('/company', settingsController.getCompanySettings);
router.put('/company', settingsController.updateCompanySettings);

router.get('/inventory', settingsController.getInventorySettings);
router.put('/inventory', settingsController.updateInventorySettings);

router.get('/sales', settingsController.getSalesSettings);
router.put('/sales', settingsController.updateSalesSettings);

router.get('/notifications', settingsController.getNotificationSettings);
router.put('/notifications', settingsController.updateNotificationSettings);

module.exports = router;



