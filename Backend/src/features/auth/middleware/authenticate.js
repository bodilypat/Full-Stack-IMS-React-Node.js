/* *************************************************** */
/* File: #src/features/auth/middleware/authenticate.js */ 
/* *************************************************** */

const jwt = require('jsonwebtoken');

/** Authenticate a request using a signed JWT bearer token. */
function authenticate(req, res, next) {
	const authorization = req.headers.authorization || '';
	const match = authorization.match(/^Bearer\s+(.+)$/i);

	if (!match) {
		return res.status(401).json({ success: false, message: 'Authentication required' });
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		return next(new Error('JWT_SECRET is not configured'));
	}

	try {
		const claims = jwt.verify(match[1], secret);
		if (!claims || typeof claims !== 'object') {
			return res.status(401).json({ success: false, message: 'Invalid access token' });
		}

		req.user = { ...claims, userId: claims.sub || claims.userId || claims.id };
		if (!req.user.userId) {
			return res.status(401).json({ success: false, message: 'Invalid access token' });
		}

		return next();
	} catch (error) {
		const message = error.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token';
		return res.status(401).json({ success: false, message });
	}
}

module.exports = authenticate;
