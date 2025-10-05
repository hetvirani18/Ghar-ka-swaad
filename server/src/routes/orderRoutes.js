const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  createMultipleOrders,
  rateOrder, 
  getOrdersByUserId, 
  getOrdersByCookId,
  updateOrderStatus
} = require('../controllers/orderController');

router.post('/', createOrder);
router.post('/batch', createMultipleOrders);
router.post('/:id/rate', rateOrder);
router.post('/:id/status', updateOrderStatus);
router.get('/user/:userId', getOrdersByUserId);
router.get('/cook/:cookId', getOrdersByCookId);

module.exports = router;