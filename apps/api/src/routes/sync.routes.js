const express = require('express');
const router = express.Router();
const syncController = require('../controllers/sync.controller');

router.post('/sync-grab-orders', syncController.syncGrabOrders);

module.exports = router;
