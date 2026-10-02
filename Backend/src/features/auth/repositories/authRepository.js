/* File: #src/features/auth/repositories/authRepository.js 
 * Authentication data-access methods.
 * Expects Sequelize User and Session models at the paths below.
 */

const User = require('../models/User');
const Session = require('../models/Session');

const authRepository = {
    
	findUserByEmail(email) {
		return User.findOne({ where: { email } });
	},

	findUserById(id) {
		return User.findByPk(id);
	},

	createUser(userData) {
		return User.create(userData);
	},

	updatePassword(userId, passwordHash) {
		return User.update({ passwordHash }, { where: { id: userId } });
	},

	updateLastLogin(userId, lastLogin = new Date()) {
		return User.update({ lastLogin }, { where: { id: userId } });
	},

	createSession(sessionData) {
		return Session.create(sessionData);
	},

	findSession(sessionId) {
		return Session.findByPk(sessionId);
	},

	revokeSession(sessionId, revokedAt = new Date()) {
		return Session.update(
			{ revokedAt },
			{ where: { id: sessionId, revokedAt: null } }
		);
	},
};

module.exports = authRepository;
