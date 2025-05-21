const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');

router.get('/', promotionController.getAll);
router.get('/deleted', promotionController.getDeleted);
router.get('/active', promotionController.getActivePromotions);
router.get('/code/:code', promotionController.getByCode);
router.get('/:id', promotionController.getById);
router.post('/', promotionController.add);
router.put('/:id', promotionController.update);
router.delete('/:id', promotionController.delete);
router.post('/:id/restore', promotionController.restore);

module.exports = router; 