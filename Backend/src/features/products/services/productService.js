/* File: #src/features/products/services/productService.js */ 

class ProductService {
	constructor(productRepository) {
		if (!productRepository) throw new Error('Product repository is required');
		this.repository = productRepository;
	}

	async create(data) {
		return this.repository.create(this.validate(data));
	}

	async getById(id) {
		if (!id) throw new Error('Product id is required');
		const product = await this.repository.findById(id);
		if (!product) throw new Error('Product not found');
		return product;
	}

	async list(filters = {}) {
		return this.repository.findAll(filters);
	}

	async update(id, data) {
		if (!id) throw new Error('Product id is required');
		const product = await this.repository.update(id, this.validate(data, true));
		if (!product) throw new Error('Product not found');
		return product;
	}

	async remove(id) {
		if (!id) throw new Error('Product id is required');
		const product = await this.repository.delete(id);
		if (!product) throw new Error('Product not found');
		return product;
	}

	async adjustStock(id, amount) {
		if (!Number.isInteger(amount)) throw new Error('Stock amount must be an integer');
		const product = await this.getById(id);
		const stock = Number(product.stock ?? product.quantity ?? 0) + amount;
		if (stock < 0) throw new Error('Insufficient stock');
		return this.repository.update(id, { stock, quantity: stock });
	}

	validate(data = {}, partial = false) {
		if (!data || typeof data !== 'object') throw new Error('Product data must be an object');
		const product = { ...data };

		if (!partial || data.name !== undefined) {
			if (typeof data.name !== 'string' || !data.name.trim()) throw new Error('Product name is required');
			product.name = data.name.trim();
		}
		if (!partial || data.price !== undefined) {
			product.price = Number(data.price);
			if (!Number.isFinite(product.price) || product.price < 0) throw new Error('Product price must be non-negative');
		}
		if (data.stock !== undefined || data.quantity !== undefined) {
			const stock = Number(data.stock ?? data.quantity);
			if (!Number.isInteger(stock) || stock < 0) throw new Error('Product stock must be a non-negative integer');
			product.stock = stock;
			product.quantity = stock;
		}
		return product;
	}
}

module.exports = ProductService;
module.exports.ProductService = ProductService;

