const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { updateUserRole, getAllUsers, updateUser, updateUserStatus } = require('../controllers/userController');

// @route PUT /api/users/:id/role
router.put('/:id/role', verifyToken, isAdmin, updateUserRole);
router.get('/', verifyToken, isAdmin, getAllUsers);
router.put('/update-user/:id', upload.single('profilePic'), verifyToken, isAdmin, updateUser);
router.patch('/:id/status', verifyToken, updateUserStatus);

module.exports = router;
