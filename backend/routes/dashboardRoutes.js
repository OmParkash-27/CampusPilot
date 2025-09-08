const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { getAdminDashboardStats, getCommonDashboardStats, getStudentDashboardStats } = require('../controllers/dashboardController');
const { isAdmin, isEditor, isTeacher } = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/admin', verifyToken, isAdmin , getAdminDashboardStats);
router.get('/editor',verifyToken, isEditor, getCommonDashboardStats);
router.get('/teacher',verifyToken, isTeacher, getCommonDashboardStats);
router.get('/student',verifyToken, getStudentDashboardStats);


module.exports = router;
