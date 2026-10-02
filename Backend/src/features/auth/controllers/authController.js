/* 
** File: #src/features/auth/controllers/authController.js 
* Authentication controller. Business rules and persistence belong in the
* auth service, supplied as req.app.locals.authService.
*/

const getAuthService = (req) => {
	const service = req.app?.locals?.authService;
	if (!service) {
		const error = new Error('Authentication service is not configured');
		error.statusCode = 500;
		throw error;
	}
	return service;
};

const asyncHandler = (action) => async (req, res, next) => {
	try {
		const data = await action(getAuthService(req), req);
		return res.status(200).json({ success: true, data });
	} catch (error) {
		if (typeof next === 'function') return next(error);
		return res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || 'Internal server error',
		});
	}
};

const register = asyncHandler((auth, req) => auth.register(req.body));
const login = asyncHandler((auth, req) => auth.login(req.body));
const logout = asyncHandler((auth, req) => auth.logout(req.user, req.body));
const refreshToken = asyncHandler((auth, req) =>
	auth.refreshToken(req.body?.refreshToken)
);
const getCurrentUser = asyncHandler((auth, req) => auth.getCurrentUser(req.user));
const forgotPassword = asyncHandler((auth, req) => auth.forgotPassword(req.body));
const resetPassword = asyncHandler((auth, req) => auth.resetPassword(req.body));
const changePassword = asyncHandler((auth, req) =>
	auth.changePassword(req.user, req.body)
);

module.exports = {
	register,
	login,
	logout,
	refreshToken,
	getCurrentUser,
	forgotPassword,
	resetPassword,
	changePassword,
};
