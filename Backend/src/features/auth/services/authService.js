/* ****************************************************** */
/* File: #src/features/auth/services/createAuthService.js */ 
/* ****************************************************** */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 12;

/**
 * Create authentication operations around an injected user repository.
 * Repository contract: findByEmail(email), findById(id), create(user),
 * updatePassword(id, passwordHash). Optional stores support refresh-token
 * persistence/revocation and one-time password-reset tokens.
 */
function createAuthService({ users, tokenStore, passwordResetStore, config = {} }) {
	if (!users) throw new TypeError('users repository is required');
	const secret = config.jwtSecret || process.env.JWT_SECRET;
	const refreshSecret = config.refreshSecret || process.env.JWT_REFRESH_SECRET || secret;
	if (!secret) throw new Error('JWT_SECRET must be configured');

	const hashPassword = (password) => bcrypt.hash(password, config.saltRounds || SALT_ROUNDS);
	const userId = (user) => String(user.id ?? user._id);
	const publicUser = (user) => {
		const { passwordHash, ...safe } = user;
		return safe;
	};

	async function createTokens(user) {
		const id = userId(user);
		const accessToken = jwt.sign({ sub: id }, secret, { expiresIn: config.accessTokenTtl || '15m' });
		const refreshToken = jwt.sign({ sub: id, type: 'refresh' }, refreshSecret, {
			expiresIn: config.refreshTokenTtl || '7d',
		});
		if (tokenStore?.save) await tokenStore.save(id, refreshToken);
		return { accessToken, refreshToken };
	}

	async function registerUser({ name, email, password, ...profile }) {
		if (!email || !password) throw new TypeError('Email and password are required');
		if (password.length < 8) throw new TypeError('Password must be at least 8 characters');
		const normalizedEmail = email.trim().toLowerCase();
		if (await users.findByEmail(normalizedEmail)) {
			const error = new Error('Email is already registered');
			error.code = 'EMAIL_IN_USE';
			throw error;
		}
		const user = await users.create({
			...profile,
			name,
			email: normalizedEmail,
			passwordHash: await hashPassword(password),
		});
		return { user: publicUser(user), ...(await createTokens(user)) };
	}

	async function authenticateUser({ email, password }) {
		if (!email || !password) return null;
		const user = await users.findByEmail(email.trim().toLowerCase());
		if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
		return { user: publicUser(user), ...(await createTokens(user)) };
	}

	async function logoutUser(refreshToken) {
		if (!refreshToken) return false;
		try {
			const payload = jwt.verify(refreshToken, refreshSecret);
			if (payload.type !== 'refresh') return false;
			if (tokenStore?.revoke) await tokenStore.revoke(payload.sub, refreshToken);
			return true;
		} catch {
			return false;
		}
	}

	async function refreshAccessToken(refreshToken) {
		if (!refreshToken) return null;
		try {
			const payload = jwt.verify(refreshToken, refreshSecret);
			if (payload.type !== 'refresh') return null;
			if (tokenStore?.isValid && !(await tokenStore.isValid(payload.sub, refreshToken)) return null;
			const user = await users.findById(payload.sub);
			if (!user) return null;
			return {
				accessToken: jwt.sign({ sub: userId(user) }, secret, {
					expiresIn: config.accessTokenTtl || '15m',
				}),
			};
		} catch {
			return null;
		}
	}

	async function getCurrentUser(id) {
		if (!id) return null;
		const user = await users.findById(id);
		return user ? publicUser(user) : null;
	}

	async function requestPasswordReset(email) {
		if (!email) return null;
		const user = await users.findByEmail(email.trim().toLowerCase());
		if (!user) return null;
		if (!passwordResetStore?.save) throw new Error('passwordResetStore.save is required');
		const token = crypto.randomBytes(32).toString('hex');
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
		const expiresAt = new Date(Date.now() + (config.resetTokenTtlMs || 3600000));
		await passwordResetStore.save(userId(user), tokenHash, expiresAt);
		return { token, expiresAt };
	}

	async function resetPassword({ token, password }) {
		if (!token || !password) throw new TypeError('Reset token and password are required');
		if (password.length < 8) throw new TypeError('Password must be at least 8 characters');
		if (!passwordResetStore?.consume) throw new Error('passwordResetStore.consume is required');
		const hash = crypto.createHash('sha256').update(token).digest('hex');
		const reset = await passwordResetStore.consume(hash, new Date());
		if (!reset) return false;
		const user = await users.findById(reset.userId);
		if (!user) return false;
		await users.updatePassword(reset.userId, await hashPassword(password));
		if (tokenStore?.revokeAll) await tokenStore.revokeAll(String(reset.userId));
		return true;
	}

	async function changePassword(id, currentPassword, newPassword) {
		if (!id || !currentPassword || !newPassword) {
			throw new TypeError('User ID and both passwords are required');
		}
		if (newPassword.length < 8) throw new TypeError('Password must be at least 8 characters');
		const user = await users.findById(id);
		if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) return false;
		await users.updatePassword(id, await hashPassword(newPassword));
		if (tokenStore?.revokeAll) await tokenStore.revokeAll(String(id));
		return true;
	}

	return {
		registerUser,
		authenticateUser,
		logoutUser,
		refreshAccessToken,
		getCurrentUser,
		requestPasswordReset,
		resetPassword,
		changePassword,
	};
}

module.exports = { createAuthService };
