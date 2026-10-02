/* File: #src/features/sales/validators/paymentValidator.js 
** payment validator
** - customerId
** - paymentDate
** - amount
** - paymentMethod
** - note
*/

const paymentSchema = Joi.object({
  customerId: Joi.string().trim().required(),
  paymentDate: Joi.date().iso().required(),
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string()
    .trim()
    .valid("cash", "card", "bank_transfer", "credit", "mobile_money", "other")
    .required(),
  note: Joi.string().trim().allow("").max(500),
}).required();

const formatValidationErrors = (error) =>
  error.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message,
  }));

const validatePaymentData = (data) => {
  const { error, value } = paymentSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const validationError = new Error("Payment validation failed");
    validationError.details = formatValidationErrors(error);
    throw validationError;
  }

  return value;
};

module.exports = {
  paymentSchema,
  validatePaymentData,
};

