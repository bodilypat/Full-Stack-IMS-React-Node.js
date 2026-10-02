/* **************************************************** */
/* File: #src/features/products/routes/productRoutes.js */ 
/* **************************************************** */

const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Product collection routes
router
	.route('/')
	.get(productController.getProducts)
	.post(productController.createProduct);

// Product item routes
router
	.route('/:id')
	.get(productController.getProductById)
	.put(productController.updateProduct)
	.patch(productController.updateProduct)
	.delete(productController.deleteProduct);

// Inventory operations
router.patch('/:id/stock', productController.updateProductStock);

module.exports = router;

