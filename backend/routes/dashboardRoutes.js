const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const { getAdminDashboardStats, getCommonDashboardStats, getStudentDashboardStats, getStudentDashboardStatsById } = require('../controllers/dashboardController');
const { isAdmin, isEditor, isTeacher } = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/admin', verifyToken, isAdmin , getAdminDashboardStats);
router.get('/editor',verifyToken, isEditor, getCommonDashboardStats);
router.get('/teacher',verifyToken, isTeacher, getCommonDashboardStats);
router.get('/student',verifyToken, getStudentDashboardStats);

// Admin-only: view a specific student's dashboard by Student _id
router.get('/student/:studentId', verifyToken, isAdmin, getStudentDashboardStatsById);

module.exports = router;
