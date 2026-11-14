const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { deleteFromCloudinary, uploadProfilePic } = require('../utils/cloudinaryHelper');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenHelper');
const crypto = require('crypto');
const mongoose = require('mongoose');

const TEMP_LOCK_MINUTES = 5;

function getLockUntil(attempts) {
  if ([3, 6, 9].includes(attempts)) {
    return new Date(Date.now() + TEMP_LOCK_MINUTES * 60 * 1000);
  }
  return null;
}

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none',
}

// Register a new user
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  let profilePicUrl = await uploadProfilePic(req.file);
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, profilePic: profilePicUrl });

    res.status(201).json({ message: 'Successfull ! You can login after admin approval' });
  } catch (err) {
    if(profilePicUrl) await deleteFromCloudinary([profilePicUrl]);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Permanent block check
    if (user.permanentlyBlocked) {
      return res.status(403).json({
        message: 'Account permanently blocked. Contact admin.'
      });
    }

    // Temporary lock check
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil - new Date()) / (1000 * 60)
      );

      return res.status(429).json({
        message: `Account temporarily locked. Try again after ${minutesLeft} minute(s).`
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    //wrong password
    if (!isMatch) {
      user.loginAttempts += 1;

      // 10+ attempts = permanent block
      if (user.loginAttempts >= 10) {
        user.permanentlyBlocked = true;
        user.lockUntil = null;

        await user.save();

        return res.status(403).json({
          message:
            'Account permanently blocked due to multiple failed login attempts. Contact admin.'
        });
      }

       // Lock on 3, 6, 9 attempts
      const lockUntil = getLockUntil(user.loginAttempts);

      if (lockUntil) {
        user.lockUntil = lockUntil;
      }

      await user.save();

      return res.status(401).json({
        message: lockUntil
          ? `Too many failed attempts. Account locked for ${TEMP_LOCK_MINUTES} minutes.`
          : 'Invalid credentials'
      });
    }

    // Reset attempts after successful password
    user.loginAttempts = 0;
    user.lockUntil = null;

    if (!user.status) {
      await user.save();
      return res.status(403).json({ message: "Account is inactive. Contact to admin." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // hash refresh token before storing
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    // expiry 
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    
    const decoded = jwt.decode(refreshToken);
    user.refreshTokens.push({
      token: hashedToken,
      userAgent: req.headers['user-agent'],
      expiresAt,
      ip: req.ip,
      jti: decoded.jti
    });

    user.loginAttempts = 0;
    await user.save();

    // Send token via cookie
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 60 * 1000
    });

    // Only a session-presence indicator, NOT an authentication token
    res.cookie('hasSession', 'true', {
      ...cookieOptions,
      httpOnly: false,
    });

    return res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Logout user in current browser
exports.logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // If no token → just clear cookies (cannot clean DB)
    if (!refreshToken) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.clearCookie('hasSession', {
        secure: true,
        sameSite: 'none',
      });
      return res.json({ message: "Logged out (no active session found)" });
    }

    // decode to get user id (do NOT verify here)
    const decoded = jwt.decode(refreshToken);

    if (decoded?.id) {
      const user = await User.findById(decoded.id);

      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          t => t.jti !== decoded.jti
        );
        await user.save();
      }
    }

    // clear cookies ALWAYS
    res.clearCookie('accessToken', {
      ...cookieOptions,
    });

    res.clearCookie('refreshToken', {
      ...cookieOptions,
    });

    res.clearCookie('hasSession', {
      secure: true,
      sameSite: 'none',
    });

    res.json({ message: "Logged out from current device" });

  } catch (err) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('hasSession', {
      secure: true,
      sameSite: 'none'
    });

    res.status(500).json({ message: "Logout failed" });
  }
};

//logout from all devices
exports.logoutAllDevices = async (req, res) => {
  try {
    // Use req.user if available, else fallback to cookie
    let userId = req.user?.id;

    if (!userId) {
      const refreshToken = req.cookies.refreshToken;
      const decoded = jwt.decode(refreshToken);
      userId = decoded?.id;
    }

    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] }
      });
    }

    // clear cookies ALWAYS
    res.clearCookie('accessToken', {
      ...cookieOptions,
    });

    res.clearCookie('refreshToken', {
      ...cookieOptions,
    });

    res.clearCookie('hasSession', {
      secure: true,
      sameSite: 'none',
    });

    res.json({ message: "Logged out from ALL devices" });

  } catch (err) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('hasSession', {
      secure: true,
      sameSite: 'none'
    });
    res.status(500).json({ message: "Logout all failed" });
  }
};

// Get User profile excluding password
exports.getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: user missing" });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken middleware
    const { oldPassword, newPassword } = req.body;

    // 1. Validate input
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new password are required' });
    }

    // 2. Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 3. Password length should be 6
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // 4. Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    //  Prevent same password reuse (optional but recommended)
    // const isSame = await bcrypt.compare(newPassword, user.password);
    // if (isSame) {
    //   return res.status(400).json({ message: 'New password must be different from old password' });
    // }

    // 5. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 6. Update password
    user.password = hashedPassword;
    await user.save();

    // 7. Invalidate old tokens → force re-login
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('hasSession', {
      secure: true,
      sameSite: 'none'
    });

    res.status(200).json({ message: 'Password updated successfully. Please login again.' });

  } catch (error) {
    res.status(500).json({ message: 'Password update failed', error: error.message });
  }
};

exports.getLoggedInDevices = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentToken = req.cookies.refreshToken;
    const user = await User.findById(userId).select('refreshTokens');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const decoded = jwt.decode(currentToken);
    const devices = user.refreshTokens.map((t) => ({
      id: t._id,
      userAgent: t.userAgent,
      ip: t.ip,
      createdAt: t.createdAt,
      expiresAt: t.expiresAt,
      isCurrent: decoded?.jti === t.jti
    }));

    res.json({ devices, message: "Get All Devices Successfull" });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch devices" });
  }
};

exports.logoutSpecificDevice = async (req, res) => {
  try {
    const { deviceId } = req.body;
    const userId = req.user.id;

    // Validate device ID
    if (!mongoose.isValidObjectId(deviceId)) {
      return res.status(400).json({
        message: 'Invalid device ID'
      });
    }

    // Find user and selected device session
    const user = await User.findOne({
      _id: userId,
      'refreshTokens._id': deviceId
    }).select('refreshTokens');

    if (!user) {
      return res.status(404).json({
        message: 'Device session not found'
      });
    }

    // Find selected session
    const targetSession = user.refreshTokens.id(deviceId);

    // Identify whether selected device is current device
    const currentRefreshToken = req.cookies.refreshToken;
    const decodedCurrent = currentRefreshToken
      ? jwt.decode(currentRefreshToken)
      : null;

    const isCurrentDevice =
      decodedCurrent?.jti === targetSession.jti;

    // Revoke selected device's refresh token from database
    const result = await User.updateOne(
      {
        _id: userId,
        'refreshTokens._id': deviceId
      },
      {
        $pull: {
          refreshTokens: { _id: deviceId }
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: 'Device session already removed'
      });
    }

    // Clear cookies ONLY if current device was selected
    if (isCurrentDevice) {
      res.clearCookie('accessToken', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);
      res.clearCookie('hasSession', {
        secure: true,
        sameSite: 'none'
      });
    }

    return res.status(200).json({
      success: true,
      message: isCurrentDevice
        ? 'Logged out from current device'
        : 'Selected device logged out successfully'
    });

  } catch (err) {
    console.error('Logout specific device error:', err);

    return res.status(500).json({
      message: 'Failed to logout device'
    });
  }
};