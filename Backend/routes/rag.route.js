const express = require('express');
const router = express.Router();
const ragController = require('../controllers/rag.controller');

// Route 1: Tạo embedding cho câu hỏi người dùng
router.post('/embedding', ragController.embedding);

// Route 2: Truy xuất sản phẩm liên quan với câu hỏi người dùng
router.post('/retrieve', ragController.retrieve);

module.exports = router;
