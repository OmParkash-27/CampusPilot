const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { registerUser, loginUser, logoutUser, getProfile } = require('../controllers/authController');
const verifyToken  = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', upload.single('profilePic'), registerUser);

// @route   POST /api/auth/login
router.post('/login',upload.none(), loginUser);

// @route   POST /api/auth/logout
router.post('/logout', logoutUser); // GET requests can be triggered by malicious links or image tags unintentionally. so used post req

router.get('/profile', verifyToken, getProfile);

module.exports = router;
