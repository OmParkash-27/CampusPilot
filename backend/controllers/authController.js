const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { deleteFromCloudinary, uploadProfilePic } = require('../utils/cloudinaryHelper');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokenHelper');
const crypto = require('crypto');
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.status) {
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

    await user.save();

    // Send token via cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 15 * 60 * 1000
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
        secure: true,
        sameSite: 'none',
      maxAge: 30 * 60 * 1000
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
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
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.json({ message: "Logged out from current device" });

  } catch (err) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

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
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.json({ message: "Logged out from ALL devices" });

  } catch (err) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
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
  const { deviceId } = req.body;

  const user = await User.findById(req.user.id);

  user.refreshTokens = user.refreshTokens.filter(
    t => t._id.toString() !== deviceId
  );

  await user.save();

  res.json({ message: "Device logged out" });
};