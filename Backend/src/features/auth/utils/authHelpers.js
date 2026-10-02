/* ********************************************* */
/* File: #src/features/auth/utils/authHelpers.js */
/* ********************************************* */ 

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const assertJwtSecret = () => {
	if (!JWT_SECRET) {
		throw new Error('JWT_SECRET is not configured');
	}
};

/** Hash a password before storing it in the database. */
const hashPassword = async (password) => {
	if (typeof password !== 'string' || password.length === 0) {
		throw new TypeError('A password is required');
	}

	return bcrypt.hash(password, SALT_ROUNDS);
};

/** Compare a plain-text password with its stored hash. */
const comparePassword = async (password, passwordHash) => {
	if (typeof password !== 'string' || typeof passwordHash !== 'string') {
		return false;
	}

	return bcrypt.compare(password, passwordHash);
};

/** Create an authentication token containing only the supplied user identity. */
const generateToken = (user) => {
	assertJwtSecret();

	if (!user || !user.id) {
		throw new TypeError('A user with an id is required');
	}

	return jwt.sign(
		{
			sub: String(user.id),
			role: user.role,
			email: user.email,
		},
		JWT_SECRET,
		{ expiresIn: JWT_EXPIRES_IN }
	);
};

/** Verify a token and return its decoded claims. */
const verifyToken = (token) => {
	assertJwtSecret();

	if (typeof token !== 'string' || token.trim() === '') {
		throw new TypeError('A token is required');
	}

	return jwt.verify(token, JWT_SECRET);
};

/** Read a Bearer token from an Authorization header. */
const extractBearerToken = (authorization) => {
	if (typeof authorization !== 'string') return null;

	const match = authorization.match(/^Bearer\s+(.+)$/i);
	return match ? match[1].trim() : null;
};

module.exports = {
	hashPassword,
	comparePassword,
	generateToken,
	verifyToken,
	extractBearerToken,
};

