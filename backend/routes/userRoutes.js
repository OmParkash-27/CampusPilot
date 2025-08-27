const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { updateUserRole, getAllUsers, updateUser, updateUserStatus, getUser, deleteUser, addUser } = require('../controllers/userController');

router.post('/', upload.single('profilePic'), verifyToken, isAdmin, addUser)
router.put('/update-role/:id',upload.none(), verifyToken, isAdmin, updateUserRole);
router.get('/', verifyToken, isAdmin, getAllUsers);
router.get('/:id', verifyToken, getUser);
router.put('/:id', upload.single('profilePic'), verifyToken, isAdmin, updateUser);
router.put('/update-status/:id',upload.none(), verifyToken, updateUserStatus);
router.delete('/:id', verifyToken, deleteUser);

module.exports = router;
