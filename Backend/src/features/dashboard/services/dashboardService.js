/* ********************************************************** */
/* File: #src/features/dashboard/services/dashboardService.js */ 
/* *********************************************************** */

const DEFAULT_LOW_STOCK_THRESHOLD = 10;

const countRecords = async (model) => {
	if (!model || typeof model.count !== 'function') return 0;
	return model.count();
};

const getRecentRecords = async (model, limit) => {
	if (!model || typeof model.findAll !== 'function') return [];
	return model.findAll({ order: [['createdAt', 'DESC']], limit });
};

/** Build the inventory dashboard summary from the configured data models. */
const getDashboardData = async (models, options = {}) => {
	if (!models) throw new TypeError('Dashboard models are required');

	const lowStockThreshold = options.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
	const recentLimit = options.recentLimit ?? 5;
	const orderModel = models.Order || models.Sale;

	const [
		totalProducts,
		totalCategories,
		totalSuppliers,
		totalCustomers,
		totalOrders,
		totalUsers,
		products,
		recentOrders,
		recentStockMovements,
	] = await Promise.all([
		countRecords(models.Product),
		countRecords(models.Category),
		countRecords(models.Supplier),
		countRecords(models.Customer),
		countRecords(orderModel),
		countRecords(models.User),
		models.Product && typeof models.Product.findAll === 'function'
			? models.Product.findAll({ attributes: ['id', 'name', 'quantity', 'stock', 'price'] })
			: [],
		getRecentRecords(orderModel, recentLimit),
		getRecentRecords(models.StockMovement, recentLimit),
	]);

	const lowStockProducts = products.filter((product) =>
		Number(product.quantity ?? product.stock ?? 0) <= lowStockThreshold,
	);
	const inventoryValue = products.reduce((total, product) => {
		const quantity = Number(product.quantity ?? product.stock ?? 0);
		return total + quantity * Number(product.price ?? 0);
	}, 0);

	return {
		summary: {
			totalProducts,
			totalCategories,
			totalSuppliers,
			totalCustomers,
			totalOrders,
			totalUsers,
			lowStockCount: lowStockProducts.length,
			inventoryValue,
		},
		lowStockProducts,
		recentOrders,
		recentStockMovements,
	};
};

module.exports = { getDashboardData };
