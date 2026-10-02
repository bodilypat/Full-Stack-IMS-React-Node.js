/* ************************************************** */
/* File: #src/features/suppliers/supplierConstants.js */
/* ************************************************** */

const SUPPLIER_STATUS = Object.freeze({
	ACTIVE: 'active',
	INACTIVE: 'inactive',
});

const SUPPLIER_TYPES = Object.freeze({
	LOCAL: 'local',
	INTERNATIONAL: 'international',
});

const SUPPLIER_SORT_FIELDS = Object.freeze({
	NAME: 'name',
	CODE: 'code',
	CREATED_AT: 'createdAt',
	UPDATED_AT: 'updatedAt',
});

const SUPPLIER_DEFAULTS = Object.freeze({
	STATUS: SUPPLIER_STATUS.ACTIVE,
	PAGE: 1,
	LIMIT: 10,
	SORT_BY: SUPPLIER_SORT_FIELDS.CREATED_AT,
	SORT_ORDER: 'desc',
});

const SUPPLIER_MESSAGES = Object.freeze({
	CREATED: 'Supplier created successfully',
	UPDATED: 'Supplier updated successfully',
	DELETED: 'Supplier deleted successfully',
	NOT_FOUND: 'Supplier not found',
	CODE_EXISTS: 'Supplier code already exists',
});

module.exports = {
	SUPPLIER_STATUS,
	SUPPLIER_TYPES,
	SUPPLIER_SORT_FIELDS,
	SUPPLIER_DEFAULTS,
	SUPPLIER_MESSAGES,
};

