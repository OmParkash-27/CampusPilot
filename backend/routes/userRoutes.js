const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { updateUserRole, getAllUsers, updateUser, updateUserStatus } = require('../controllers/userController');

// @route PUT /api/users/:id/role
router.put('/update-role/:id', verifyToken, isAdmin, updateUserRole);
router.get('/', verifyToken, isAdmin, getAllUsers);
router.put('/:id', upload.single('profilePic'), verifyToken, isAdmin, updateUser);
router.patch('/update-status/:id', verifyToken, updateUserStatus);

module.exports = router;
