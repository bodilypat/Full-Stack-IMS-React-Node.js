/* File: #src/features/sales/routes/saleRoutes.js
** sale routes
** - GET /sales
** - GET /sales/:id
** - POST /sales
** - PUT /sales/:id
** - DELETE /sales/:id
*/

const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

router.get('/', saleController.getSales);
router.get('/:id', saleController.getSaleById);
router.post('/', saleController.createSale);
router.put('/:id', saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

module.exports = router;


