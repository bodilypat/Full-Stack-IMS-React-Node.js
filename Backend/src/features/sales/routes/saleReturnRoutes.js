/* 
** File: #src/features/sales/routes/saleReturnRoutes.js 
** Sale return routes. Mount under /sales to expose /:id/returns. 
*/

const express = require('express');
const saleReturnController = require('../controllers/saleReturnController');

const router = express.Router();

router
	.route('/:id/returns')
	.post(saleReturnController.createSaleReturn)
	.get(saleReturnController.getSaleReturns)
	.put(saleReturnController.updateSaleReturn)
	.delete(saleReturnController.deleteSaleReturn);

module.exports = router;



