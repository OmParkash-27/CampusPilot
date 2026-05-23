const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { registerUser, loginUser, logoutUser, getProfile, changePassword, getLoggedInDevices,
    logoutAllDevices, logoutSpecificDevice } = require('../controllers/authController');
const verifyToken  = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
router.post('/register', upload.single('profilePic'), registerUser);

// @route   POST /api/auth/login
router.post('/login',upload.none(), loginUser);
// @route   POST /api/auth/login
router.put('/change-password', verifyToken, upload.none(), changePassword);

// logout user
router.post('/logout', logoutUser); // GET requests can be triggered by malicious links or image tags unintentionally. so used post req

//get Profile
router.get('/profile', verifyToken, getProfile);

//logout all devices
router.get('/devices', verifyToken, getLoggedInDevices);

//logout specific device
router.post('/logout-device', verifyToken, logoutSpecificDevice);

//logout all devices
router.post('/logout-devices', verifyToken, logoutAllDevices);

module.exports = router;
