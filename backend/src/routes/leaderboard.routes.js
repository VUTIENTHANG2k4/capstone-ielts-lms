const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { getLeaderboard, getMyStats } = require('../controllers/leaderboard.controller');

router.get('/', auth, getLeaderboard);
router.get('/my-stats', auth, authorize('student'), getMyStats);

module.exports = router;
