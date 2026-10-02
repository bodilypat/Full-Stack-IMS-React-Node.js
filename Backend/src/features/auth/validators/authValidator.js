/* **************************************************** */
/* File: #src/features/auth/validators/authValidator.js */
/* **************************************************** */

const Joi = require('joi');

const password = Joi.string().min(8).max(128).required();

const registerSchema = Joi.object({
	name: Joi.string().trim().min(2).max(100).required(),
	email: Joi.string().trim().lowercase().email().required(),
	password,
	confirmPassword: Joi.any().valid(Joi.ref('password')).required()
		.messages({ 'any.only': 'Passwords do not match' }),
	role: Joi.string().valid('admin', 'manager', 'staff').default('staff')
}).options({ abortEarly: false });

const loginSchema = Joi.object({
	email: Joi.string().trim().lowercase().email().required(),
	password
}).options({ abortEarly: false });

const forgotPasswordSchema = Joi.object({
	email: Joi.string().trim().lowercase().email().required()
}).options({ abortEarly: false });

const resetPasswordSchema = Joi.object({
	token: Joi.string().trim().required(),
	password,
	confirmPassword: Joi.any().valid(Joi.ref('password')).required()
		.messages({ 'any.only': 'Passwords do not match' })
}).options({ abortEarly: false });

const changePasswordSchema = Joi.object({
	currentPassword: password,
	newPassword: password,
	confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required()
		.messages({ 'any.only': 'Passwords do not match' })
}).custom((value, helpers) => {
	if (value.currentPassword === value.newPassword) {
		return helpers.error('any.invalid');
	}
	return value;
}).messages({ 'any.invalid': 'New password must differ from current password' })
	.options({ abortEarly: false });

const refreshTokenSchema = Joi.object({
	refreshToken: Joi.string().trim().required()
}).options({ abortEarly: false });

module.exports = {
	registerSchema,
	// Backward-compatible alias for the original spelling.
	registorSchema: registerSchema,
	loginSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	changePasswordSchema,
	refreshTokenSchema
};
