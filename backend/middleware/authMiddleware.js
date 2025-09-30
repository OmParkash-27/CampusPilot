const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenHelper');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  // 1. Verify Refresh Token (always required)
  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decodedRefresh) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }

    // Issue new Refresh Token (sliding expiration)
    const newRefreshToken = generateRefreshToken({ _id: decodedRefresh.id });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge:  30 * 60 * 1000, //30 minutes
    });

    // 2. Verify Access Token
    if (accessToken) {
      jwt.verify(accessToken, process.env.JWT_SECRET, (err2, decodedAccess) => {
        if (!err2) {
          req.user = decodedAccess; // already has full details
          return next();
        }
        if (err2.name === "TokenExpiredError") {
          // Access token expired → fetch user from DB using refresh token id
          User.findById(decodedRefresh.id)
            .select("-password") // exclude password
            .then((user) => {
              if (!user) {
                return res.status(404).json({ message: "User not found" });
              }

              const newAccessToken = generateAccessToken(user);
              res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 15 * 60 * 1000, // 15 min
              });

              req.user = {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email,
              };
              return next();
            })
            .catch(() => res.status(500).json({ message: "Server error" }));
        } else {
          return res.status(403).json({ message: "Invalid access token" });
        }
      });
    } else {
      // 3. No access token at all → create new one from refresh
      try {
        const user = await User.findById(decodedRefresh.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

        const newAccessToken = generateAccessToken(user);
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 15 * 60 * 1000,
        });

        req.user = {
          id: user._id,
          name: user.name,
          role: user.role,
          email: user.email,
        };
        next();
      } catch (err) {
        return res.status(500).json({ message: "Server error" });
      }
    }
  });
};

module.exports = verifyToken;
