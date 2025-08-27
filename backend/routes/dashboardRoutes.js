const express = require('express');
const { getAdminDashboardStats, geEditortDashboardStats } = require('../controllers/dashboardController');
const { isAdmin, isEditor } = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/admin',isAdmin , getAdminDashboardStats);
router.get('/editor', isEditor, geEditortDashboardStats)

module.exports = router;
