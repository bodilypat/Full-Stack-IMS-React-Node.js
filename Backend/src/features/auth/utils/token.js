/* *************************************** */
/* File: #src/features/auth/utils/token.js */
/* *************************************** */

const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || 'inventory_access_secret_key';
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || 'inventory_refresh_secret_key';

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const signToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

const generateAccessToken = (user) => {
  const payload = {
    id: user.id || user._id,
    email: user.email,
    role: user.role,
    username: user.username,
  };

  return signToken(payload, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES_IN);
};

const generateRefreshToken = (user) => {
  const payload = {
    id: user.id || user._id,
    email: user.email,
    type: 'refresh',
  };

  return signToken(payload, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN);
};

const generateTokenPair = (user) => ({
  accessToken: generateAccessToken(user),
  refreshToken: generateRefreshToken(user),
});

const decodeToken = (token) => {
  if (!token) return null;

  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

const getTokenFromHeader = (authorizationHeader) => {
  if (!authorizationHeader) return null;

  const [type, token] = authorizationHeader.split(' ');

  if (type && type.toLowerCase() === 'bearer' && token) {
    return token;
  }

  return null;
};

const verifyAccessToken = (token) => {
  return verifyToken(token, ACCESS_TOKEN_SECRET);
};

const verifyRefreshToken = (token) => {
  return verifyToken(token, REFRESH_TOKEN_SECRET);
};

module.exports = {
  signToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  decodeToken,
  getTokenFromHeader,
  verifyAccessToken,
  verifyRefreshToken,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
};


