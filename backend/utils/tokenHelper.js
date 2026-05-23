const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // short expiry for safety
  );
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, jti: crypto.randomUUID() },
    process.env.JWT_SECRET,
    { expiresIn: '30m' } // longer expiry
  );
};

module.exports = {generateAccessToken, generateRefreshToken}