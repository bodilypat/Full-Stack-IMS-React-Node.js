/* Product controllers for inventory management.
 * Supports CRUD, SKU/barcode lookup, search and filtering, pagination/sorting,
 * low-stock reporting, and product data including pricing, tax, media, and suppliers.
 */

const asyncHandler = (handler) => (req, res, next) =>
	Promise.resolve(handler(req, res, next)).catch(next);

const createProductController = (Product) => {
	if (!Product) throw new TypeError('A Product model is required');

	const notFound = (res) => res.status(404).json({ message: 'Product not found' });

	return {
		create: asyncHandler(async (req, res) => {
			const product = await Product.create(req.body);
			res.status(201).json(product);
		}),

		list: asyncHandler(async (req, res) => {
			const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
			const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
			const filter = {};
			for (const field of ['category', 'brand', 'status']) {
				if (req.query[field]) filter[field] = req.query[field];
			}
			if (req.query.search) {
				const search = String(req.query.search).trim();
				filter.$or = ['name', 'sku', 'barcode', 'description'].map((field) => ({
					[field]: { $regex: search, $options: 'i' },
				}));
			}

			const allowedSortFields = ['name', 'sku', 'price', 'createdAt', 'updatedAt'];
			const sortBy = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
			const sort = { [sortBy]: req.query.sortOrder === 'asc' ? 1 : -1 };
			const [products, total] = await Promise.all([
				Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
				Product.countDocuments(filter),
			]);
			res.json({ products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
		}),

		getById: asyncHandler(async (req, res) => {
			const product = await Product.findById(req.params.id);
			if (!product) return notFound(res);
			res.json(product);
		}),

		update: asyncHandler(async (req, res) => {
			const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				runValidators: true,
			});
			if (!product) return notFound(res);
			res.json(product);
		}),

		remove: asyncHandler(async (req, res) => {
			const product = await Product.findByIdAndDelete(req.params.id);
			if (!product) return notFound(res);
			res.json({ message: 'Product deleted' });
		}),

		findBySku: asyncHandler(async (req, res) => {
			const product = await Product.findOne({ sku: req.params.sku });
			if (!product) return notFound(res);
			res.json(product);
		}),

		findByBarcode: asyncHandler(async (req, res) => {
			const product = await Product.findOne({ barcode: req.params.barcode });
			if (!product) return notFound(res);
			res.json(product);
		}),

		lowStock: asyncHandler(async (req, res) => {
			const products = await Product.find({
				$expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
			});
			res.json(products);
		}),
	};
};

module.exports = createProductController;
