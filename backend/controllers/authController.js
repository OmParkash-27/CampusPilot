  const User = require('../models/User');
  const jwt = require('jsonwebtoken');
  const bcrypt = require('bcryptjs');
  const {deleteFromCloudinary, uploadProfilePic} = require('../utils/cloudinaryHelper');
  // Generate JWT Token
  const generateToken = (user) => {
    return jwt.sign(
      { id: user._id, name: user.name, role: user.role, email:user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
  };

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
      const token = generateToken(newUser);

      // Send token via cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
      });
      res.status(201).json({ message: 'User registered successfully' });
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

      const token = generateToken(user);

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.status(200).json({ message: 'Login successful' });
    } catch (err) {
      res.status(500).json({ message: 'Login failed', error: err.message });
    }
  };

  // Logout user
  exports.logoutUser = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  };

  // Get User profile excluding password
  exports.getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };