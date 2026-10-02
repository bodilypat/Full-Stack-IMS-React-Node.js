/* ************************************************************** */
/* File: #src/features/dashboard/controllers/dashboardController.js */ 
/* ************************************************************** */


const asyncHandler = require('express-async-handler');

// Adjust these model paths and field names to match the project's schemas.
const Product = require('../products/productModel');
const Sale = require('../sales/saleModel');
const Purchase = require('../purchases/purchaseModel');
const Customer = require('../customers/customerModel');
const Supplier = require('../suppliers/supplierModel');
const InventoryTransaction = require('../inventory/inventoryTransactionModel');

const total = async (Model, field) => {
	const [result] = await Model.aggregate([
		{ $group: { _id: null, value: { $sum: `$${field}` } } },
	]);
	return result?.value || 0;
};

const getDashboardSummary = asyncHandler(async (req, res) => {
	const [sales, purchases, inventoryValue, products, customers, suppliers] = await Promise.all([
		total(Sale, 'totalAmount'),
		total(Purchase, 'totalAmount'),
		Product.aggregate([
			{ $group: { _id: null, value: { $sum: { $multiply: ['$stock', '$costPrice'] } } } },
		]).then(([result]) => result?.value || 0),
		Product.countDocuments(),
		Customer.countDocuments(),
		Supplier.countDocuments(),
	]);

	res.json({
		totals: {
			sales,
			purchases,
			revenue: sales,
			grossProfit: sales - purchases,
			inventoryValue,
			products,
			customers,
			suppliers,
		},
	});
});

const getSalesAnalytics = asyncHandler(async (req, res) => {
	const days = Math.min(Math.max(Number.parseInt(req.query.days, 10) || 30, 1), 365);
	const from = new Date();
	from.setDate(from.getDate() - days);

	const sales = await Sale.aggregate([
		{ $match: { createdAt: { $gte: from } } },
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
				total: { $sum: '$totalAmount' },
				orders: { $sum: 1 },
			},
		},
		{ $sort: { _id: 1 } },
	]);

	res.json({ days, sales });
});

const getPurchaseOverview = asyncHandler(async (req, res) => {
	const [recentPurchases, pendingPurchases, supplierSpending] = await Promise.all([
		Purchase.find().sort({ createdAt: -1 }).limit(10).lean(),
		Purchase.countDocuments({ status: 'pending' }),
		Purchase.aggregate([
			{ $group: { _id: '$supplier', total: { $sum: '$totalAmount' } } },
			{ $sort: { total: -1 } },
		]),
	]);

	res.json({ recentPurchases, pendingPurchases, supplierSpending });
});

const getProductPerformance = asyncHandler(async (req, res) => {
	const [topSellingProducts, slowMovingProducts] = await Promise.all([
		Sale.aggregate([
			{ $unwind: '$items' },
			{
				$group: {
					_id: '$items.product',
					quantitySold: { $sum: '$items.quantity' },
					revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
				},
			},
			{ $sort: { quantitySold: -1 } },
			{ $limit: 10 },
		]),
		Product.find({ stock: { $gt: 0 } }).sort({ updatedAt: 1 }).limit(10).lean(),
	]);

	res.json({ topSellingProducts, slowMovingProducts });
});

const getAlerts = asyncHandler(async (req, res) => {
	const [lowStock, outOfStock, pendingPurchases] = await Promise.all([
		Product.find({ stock: { $gt: 0, $lte: 10 } }).lean(),
		Product.find({ stock: 0 }).lean(),
		Purchase.find({ status: 'pending' }).sort({ createdAt: -1 }).limit(10).lean(),
	]);

	res.json({ lowStock, outOfStock, pendingPurchases });
});

const getRecentActivity = asyncHandler(async (req, res) => {
	const [sales, purchases, inventoryTransactions] = await Promise.all([
		Sale.find().sort({ createdAt: -1 }).limit(10).lean(),
		Purchase.find().sort({ createdAt: -1 }).limit(10).lean(),
		InventoryTransaction.find().sort({ createdAt: -1 }).limit(10).lean(),
	]);

	res.json({ sales, purchases, inventoryTransactions });
});

module.exports = {
	getDashboardSummary,
	getSalesAnalytics,
	getPurchaseOverview,
	getProductPerformance,
	getAlerts,
	getRecentActivity,
};
