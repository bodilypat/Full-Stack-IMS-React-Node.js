/* **************************************************************** */
/* File: #src/features/auth/constants/authConstants/authContants.js */ 
/* **************************************************************** */

const AUTH_CONSTANTS = Object.freeze({
	TOKEN_TYPES: Object.freeze({
		ACCESS: 'access',
		REFRESH: 'refresh',
	}),
	TOKEN_DEFAULTS: Object.freeze({
		ACCESS_EXPIRES_IN: '15m',
		REFRESH_EXPIRES_IN: '7d',
	}),
	PASSWORD: Object.freeze({
		MIN_LENGTH: 8,
		MAX_LENGTH: 128,
		SALT_ROUNDS: 12,
	}),
	ROLES: Object.freeze({
		ADMIN: 'admin',
		MANAGER: 'manager',
		STAFF: 'staff',
	}),
	ERRORS: Object.freeze({
		INVALID_CREDENTIALS: 'Invalid email or password',
		ACCOUNT_NOT_FOUND: 'Account not found',
		ACCOUNT_DISABLED: 'Account is disabled',
		EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
		TOKEN_REQUIRED: 'Authentication token is required',
		TOKEN_INVALID: 'Invalid or expired authentication token',
		FORBIDDEN: 'Insufficient permissions',
	}),
});

module.exports = AUTH_CONSTANTS;
