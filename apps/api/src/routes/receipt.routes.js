const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receipt.controller');

router.post('/:orderCode/complete', receiptController.completeOrder);

module.exports = router;
