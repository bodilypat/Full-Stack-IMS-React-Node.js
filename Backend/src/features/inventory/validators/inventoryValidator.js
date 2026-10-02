/* ************************************************************** */
/* File: #src/features/inventory/validators/inventoryValidator.js */ 
/* ************************************************************** */

const Joi = require('joi');

const inventoryFields = {
	name: Joi.string().trim().min(2).max(150),
	sku: Joi.string().trim().max(50),
	description: Joi.string().trim().max(1000).allow('', null),
	category: Joi.string().trim().max(100),
	supplier: Joi.string().trim().max(150).allow('', null),
	quantity: Joi.number().integer().min(0),
	reorderLevel: Joi.number().integer().min(0).default(0),
	unitPrice: Joi.number().precision(2).min(0),
	location: Joi.string().trim().max(150).allow('', null),
	status: Joi.string().valid('active', 'inactive', 'discontinued').default('active'),
	isActive: Joi.boolean().default(true)
};

const inventorySchema = Joi.object({
	...inventoryFields,
	name: inventoryFields.name.required(),
	sku: inventoryFields.sku.required(),
	category: inventoryFields.category.required(),
	quantity: inventoryFields.quantity.required(),
	unitPrice: inventoryFields.unitPrice.required()
}).options({ abortEarly: false, stripUnknown: true });

const updateInventorySchema = Joi.object(inventoryFields)
	.min(1)
	.options({ abortEarly: false, stripUnknown: true });

const validate = schema => (req, res, next) => {
	const { error, value } = schema.validate(req.body);

	if (error) {
		return res.status(400).json({
			success: false,
			message: 'Validation failed',
			errors: error.details.map(detail => ({
				field: detail.path.join('.'),
				message: detail.message
			}))
		});
	}

	req.body = value;
	return next();
};

module.exports = {
	inventorySchema,
	updateInventorySchema,
	validateInventory: validate(inventorySchema),
	validateInventoryUpdate: validate(updateInventorySchema)
};
