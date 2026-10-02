/* **************************************************** */
/* File: #src/features/suppliers/utils/supplierUtils.js */ 
/* **************************************************** */


const normalizeSupplier = (supplier = {}) => ({
	...supplier,
	name: typeof supplier.name === 'string' ? supplier.name.trim() : supplier.name,
	email: typeof supplier.email === 'string' ? supplier.email.trim().toLowerCase() : supplier.email,
	phone: typeof supplier.phone === 'string' ? supplier.phone.trim() : supplier.phone,
	address: typeof supplier.address === 'string' ? supplier.address.trim() : supplier.address,
});

const validateSupplier = (supplier = {}) => {
	const errors = {};
	const normalized = normalizeSupplier(supplier);

	if (!normalized.name) errors.name = 'Supplier name is required';
	if (normalized.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
		errors.email = 'A valid email address is required';
	}

	return {
		isValid: Object.keys(errors).length === 0,
		errors,
		supplier: normalized,
	};
};

const getSupplierId = (supplier) => supplier && (supplier._id || supplier.id);

const sanitizeSupplier = (supplier = {}) => {
	const sanitized = { ...supplier };
	delete sanitized.password;
	delete sanitized.__v;
	return sanitized;
};

const buildSupplierSearchQuery = (search) => {
	if (!search || typeof search !== 'string' || !search.trim()) return {};

	const value = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return {
		$or: [
			{ name: { $regex: value, $options: 'i' } },
			{ email: { $regex: value, $options: 'i' } },
			{ phone: { $regex: value, $options: 'i' } },
		],
	};
};

module.exports = {
	normalizeSupplier,
	validateSupplier,
	getSupplierId,
	sanitizeSupplier,
	buildSupplierSearchQuery,
};
