const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { isAdmin } = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/dashboard',isAdmin , getDashboardStats);

module.exports = router;
