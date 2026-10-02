/* File: #src/features/sales/validators/saleValidator.js
** sale validator
** - customerId 
** - saleDate
** - items[]
**   -- productId
**   -- quantity
**   -- unitPrice
** - discount
** - paymentMethod
** - note
*/

const Joi = require("joi");

const itemSchema = Joi.object({
  productId: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
});

const saleSchema = Joi.object({
  customerId: Joi.string().trim().required(),
  saleDate: Joi.date().iso().required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  discount: Joi.number().min(0).max(100).default(0),
  paymentMethod: Joi.string()
    .trim()
    .valid("cash", "card", "bank_transfer", "credit", "mobile_money", "other")
    .required(),
  note: Joi.string().trim().allow("").max(500),
}).required();

const saleUpdateSchema = Joi.object({
  customerId: Joi.string().trim(),
  saleDate: Joi.date().iso(),
  items: Joi.array().items(itemSchema).min(1),
  discount: Joi.number().min(0).max(100),
  paymentMethod: Joi.string()
    .trim()
    .valid("cash", "card", "bank_transfer", "credit", "mobile_money", "other"),
  note: Joi.string().trim().allow("").max(500),
}).min(1);

const formatValidationErrors = (error) =>
  error.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message,
  }));

const validateSaleData = (data) => {
  const { error, value } = saleSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const validationError = new Error("Sale validation failed");
    validationError.details = formatValidationErrors(error);
    throw validationError;
  }

  return value;
};

const validateSale = (req, res, next) => {
  const { error, value } = saleSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: "Sale validation failed",
      errors: formatValidationErrors(error),
    });
  }

  req.body = value;
  next();
};

const validateSaleUpdate = (req, res, next) => {
  const { error, value } = saleUpdateSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: "Sale update validation failed",
      errors: formatValidationErrors(error),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  itemSchema,
  saleSchema,
  saleUpdateSchema,
  validateSaleData,
  validateSale,
  validateSaleUpdate,
};

