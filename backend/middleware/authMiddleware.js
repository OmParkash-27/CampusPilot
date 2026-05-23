const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenHelper');
const User = require('../models/User');
const crypto = require('crypto');
// const { none } = require('./uploadMiddleware');

const verifyToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;
  // Case 4: No refresh cookie
  if (!refreshToken) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(401).json({code: "NO_REFRESH_TOKEN", message: "Session expired. Please login again." });
  }

  let decodedRefresh;
  try {
    // 1. Verify refresh token
    decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (err) {
    // Case 3: Invalid/expired refresh token
    await cleanupTokenFromDB(refreshToken); // safe attempt
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(403).json({code: "INVALID_REFRESH_TOKEN", message: "Session expired. Please login again." });
  }
  const user = await User.findById(decodedRefresh.id);
  if (!user) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(404).json({ message: "User not found" });
  }

  // 2. Try to match token in DB

  let matchedTokenIndex = user.refreshTokens.findIndex(
    t => t.jti === decodedRefresh.jti
  );

  // 3. Fallback (IMPORTANT FIX)
  // if (matchedTokenIndex === -1) {
  //   // token not in DB → treat as invalid session
  //   res.clearCookie('accessToken');
  //   res.clearCookie('refreshToken');
  //   return res.status(401).json({code: "NO_REFRESH_TOKEN", message: "Session expired. Please login again." });
  // }
  if (matchedTokenIndex === -1) {
  for (let i = 0; i < user.refreshTokens.length; i++) {
    if (!user.refreshTokens[i].jti) {
      const ok = await bcrypt.compare(refreshToken, user.refreshTokens[i].token);
      if (ok) {
        matchedTokenIndex = i;
        // ✅ MIGRATE: add jti now
        user.refreshTokens[i].jti = decodedRefresh.jti;
        await user.save();

        break;
      }
    }
  }}

  // check if db does not have token (this will help when logout session by other device(that delete token from db))
  if (matchedTokenIndex === -1) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(401).json({
      code: "NO_REFRESH_TOKEN",
      message: "Session expired. Please login again."
    });
  }

  // 4. Check access token FIRST
  if (accessToken) {
    try {
      const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = decodedAccess;
      return next(); //  no refresh needed
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        return res.status(403).json({code: "INVALID_ACCESS_TOKEN", message: "Invalid access token" });
      }
    }
  }

  // 5. Access expired → refresh tokens
  const newAccessToken = generateAccessToken(user);

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 15 * 60 * 1000,
  });

  // Rotate refresh token (same device)
  const newRefreshToken = generateRefreshToken(user);
  const decodedNew = jwt.decode(newRefreshToken);
  const hashedNewToken = await bcrypt.hash(newRefreshToken, 10);

  user.refreshTokens[matchedTokenIndex].token = hashedNewToken;
  user.refreshTokens[matchedTokenIndex].createdAt = new Date();
  user.refreshTokens[matchedTokenIndex].userAgent = req.headers['user-agent'];
  user.refreshTokens[matchedTokenIndex].ip = req.ip;
  user.refreshTokens[matchedTokenIndex].expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  user.refreshTokens[matchedTokenIndex].jti = decodedNew.jti;

  await user.save();

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 60 * 1000,
  });

  // attach user
  req.user = {
    id: user._id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  next();
};

// 🔧 Safe cleanup helper (only when we HAVE the token)
async function cleanupTokenFromDB(refreshToken) {
  try {
    const decoded = jwt.decode(refreshToken); // no verify
    if (!decoded?.id) return;

    const user = await User.findById(decoded.id);
    if (!user) return;

    user.refreshTokens = user.refreshTokens.filter(
      t => t.jti !== decoded.jti
    );
    await user.save();
  } catch (e) {
    // swallow errors (cleanup best-effort)
  }
}

module.exports = verifyToken;