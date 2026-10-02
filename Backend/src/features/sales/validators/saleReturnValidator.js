/* File: #src/features/sales/validators/saleReturnValidator.js
** sale return validator
** - customerId
** - returnDate
** - items[]
**   -- productId
**   -- quantity
**   -- unitPrice
** - note
*/

const itemSchema = Joi.object({
  productId: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().min(0).required(),
});

const saleReturnSchema = Joi.object({
  customerId: Joi.string().trim().required(),
  returnDate: Joi.date().iso().required(),
  items: Joi.array().items(itemSchema).min(1).required(),
  note: Joi.string().trim().allow("").max(500),
}).required();

const formatValidationErrors = (error) =>
  error.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message,
  }));

const validateSaleReturnData = (data) => {
  const { error, value } = saleReturnSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const validationError = new Error("Sale return validation failed");
    validationError.details = formatValidationErrors(error);
    throw validationError;
  }

  return value;
};

module.exports = {
  itemSchema,
  saleReturnSchema,
  validateSaleReturnData,
};
