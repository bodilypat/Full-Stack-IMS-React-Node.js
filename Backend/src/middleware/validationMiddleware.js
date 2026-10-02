/* ********************************************* */
/* File: #src/middleware/validationMiddleware.js 
** products 
** inventory 
** purchases 
** sales 
** reports 
** settings 
*/
/* ********************************************* */

const isEmpty = (value) => value === undefined || value === null || value === '';

const formatField = (parent, field) => (parent ? `${parent}.${field}` : field);

const validateArray = (fieldPath, value, rule, errors) => {
  if (!Array.isArray(value)) {
    errors.push({ field: fieldPath, message: `${fieldPath} must be an array` });
    return;
  }

  const { min, max, itemType, itemRule } = rule;

  if (typeof min === 'number' && value.length < min) {
    errors.push({ field: fieldPath, message: `${fieldPath} must contain at least ${min} item(s)` });
  }

  if (typeof max === 'number' && value.length > max) {
    errors.push({ field: fieldPath, message: `${fieldPath} cannot contain more than ${max} item(s)` });
  }

  if (itemType || itemRule) {
    value.forEach((item, index) => {
      const itemField = `${fieldPath}[${index}]`;

      if (itemType && typeof item !== itemType) {
        errors.push({ field: itemField, message: `${itemField} must be of type ${itemType}` });
      }

      if (itemRule && typeof itemRule === 'object' && !Array.isArray(itemRule)) {
        const nested = validateSchema(itemRule, item, itemField);
        errors.push(...nested);
      }
    });
  }
};

const validateValue = (fieldPath, value, rule = {}) => {
  const errors = [];
  const {
    type,
    required = false,
    enum: allowedValues,
    min,
    max,
    minLength,
    maxLength,
    regex,
    custom,
    message,
  } = rule;

  if (isEmpty(value)) {
    if (required) {
      errors.push({ field: fieldPath, message: message || `${fieldPath} is required` });
    }
    return errors;
  }

  if (type) {
    if (type === 'string' && typeof value !== 'string') {
      errors.push({ field: fieldPath, message: `${fieldPath} must be a string` });
      return errors;
    }

    if (type === 'number' && (typeof value !== 'number' || Number.isNaN(value))) {
      errors.push({ field: fieldPath, message: `${fieldPath} must be a number` });
      return errors;
    }

    if (type === 'boolean' && typeof value !== 'boolean') {
      errors.push({ field: fieldPath, message: `${fieldPath} must be a boolean` });
      return errors;
    }

    if (type === 'array' && !Array.isArray(value)) {
      errors.push({ field: fieldPath, message: `${fieldPath} must be an array` });
      return errors;
    }

    if (type === 'object' && (typeof value !== 'object' || Array.isArray(value) || value === null)) {
      errors.push({ field: fieldPath, message: `${fieldPath} must be an object` });
      return errors;
    }
  }

  if (Array.isArray(value)) {
    validateArray(fieldPath, value, rule, errors);
  }

  if (typeof value === 'string') {
    if (typeof minLength === 'number' && value.length < minLength) {
      errors.push({ field: fieldPath, message: `${fieldPath} must be at least ${minLength} characters long` });
    }

    if (typeof maxLength === 'number' && value.length > maxLength) {
      errors.push({ field: fieldPath, message: `${fieldPath} cannot be longer than ${maxLength} characters` });
    }

    if (regex) {
      const pattern = regex instanceof RegExp ? regex : new RegExp(regex);
      if (!pattern.test(value)) {
        errors.push({ field: fieldPath, message: message || `${fieldPath} format is invalid` });
      }
    }
  }

  if (typeof value === 'number') {
    if (typeof min === 'number' && value < min) {
      errors.push({ field: fieldPath, message: `${fieldPath} must be greater than or equal to ${min}` });
    }

    if (typeof max === 'number' && value > max) {
      errors.push({ field: fieldPath, message: `${fieldPath} must be less than or equal to ${max}` });
    }
  }

  if ((typeof value === 'string' || typeof value === 'number') && Array.isArray(allowedValues) && !allowedValues.includes(value)) {
    errors.push({ field: fieldPath, message: `${fieldPath} is invalid` });
  }

  if (typeof custom === 'function') {
    const result = custom(value, fieldPath);

    if (result === false) {
      errors.push({ field: fieldPath, message: message || `${fieldPath} is invalid` });
    }

    if (typeof result === 'string') {
      errors.push({ field: fieldPath, message: result });
    }
  }

  return errors;
};

const validateSchema = (schema, payload = {}, parent = '') => {
  const errors = [];

  if (!schema || typeof schema !== 'object' || Array.isArray(schema)) {
    return errors;
  }

  Object.entries(schema).forEach(([field, rule]) => {
    const fieldPath = formatField(parent, field);
    const value = payload?.[field];

    if (rule === true) {
      if (isEmpty(value)) {
        errors.push({ field: fieldPath, message: `${fieldPath} is required` });
      }
      return;
    }

    if (typeof rule === 'string') {
      errors.push(...validateValue(fieldPath, value, { type: rule, required: true }));
      return;
    }

    if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
      return;
    }

    const isNestedObject = !('type' in rule)
      && !('required' in rule)
      && !('enum' in rule)
      && !('min' in rule)
      && !('max' in rule)
      && !('minLength' in rule)
      && !('maxLength' in rule)
      && !('regex' in rule)
      && !('custom' in rule)
      && !('message' in rule)
      && !('itemType' in rule)
      && !('itemRule' in rule);

    if (isNestedObject) {
      if (!isEmpty(value)) {
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          errors.push({ field: fieldPath, message: `${fieldPath} must be an object` });
          return;
        }

        errors.push(...validateSchema(rule, value, fieldPath));
      }
      return;
    }

    errors.push(...validateValue(fieldPath, value, rule));
  });

  return errors;
};

const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const target = source === 'params' ? req.params : source === 'query' ? req.query : req.body;
    const errors = validateSchema(schema, target);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
};

const validationMiddleware = (schema, source = 'body') => {
  if (!schema || typeof schema !== 'object') {
    return (req, res, next) => next();
  }

  return (req, res, next) => {
    const target = source === 'params' ? req.params : source === 'query' ? req.query : req.body;
    const errors = validateSchema(schema, target);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    next();
  };
};

module.exports = validationMiddleware;
module.exports.validateRequest = validateRequest;
module.exports.validateSchema = validateSchema;
module.exports.validationMiddleware = validationMiddleware;



