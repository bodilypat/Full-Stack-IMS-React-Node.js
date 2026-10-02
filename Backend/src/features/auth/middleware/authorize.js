/* ************************************************ */
/* File: #src/features/auth/middleware/authorize.js */ 
/* ************************************************ */

/** Ensure the authenticated user has at least one required role. */
const authorize = (...requiredRoles) => (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ success: false, message: 'Authentication required' });
	}

	const roles = Array.isArray(req.user.roles)
		? req.user.roles
		: req.user.role
			? [req.user.role]
			: [];

	if (!requiredRoles.length || !requiredRoles.some((role) => roles.includes(role))) {
		return res.status(403).json({ success: false, message: 'Insufficient permissions' });
	}

	return next();
};

module.exports = authorize;
