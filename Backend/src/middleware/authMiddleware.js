/* File: #src/middleware/authMiddleware.js
** Read authentication token 
** Verify JWT/session 
** Identify current user 
** Attach user information to the request object 
** Reject unauthorized requests 
*/

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
	const authorization = req.headers && req.headers.authorization;
	const match = authorization && authorization.match(/^Bearer\s+(.+)$/i);
	const token = (match && match[1]) ||
		(req.cookies && (req.cookies.accessToken || req.cookies.token));

	if (!token) {
		return res.status(401).json({ message: 'Authentication required' });
	}

	const secret = process.env.JWT_SECRET;
	if (!secret) {
		return res.status(500).json({ message: 'Authentication is not configured' });
	}

	jwt.verify(token, secret, (error, decoded) => {
		if (error) {
			return res.status(401).json({ message: 'Invalid or expired token' });
		}

		req.user = decoded;
		return next();
	});
}

module.exports = authMiddleware;


