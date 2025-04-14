import express from 'express';
import orderService from './order.service.js';

const router = express.Router();

router.post('/orders', async (req, res, next) => {
  try {
    const { userid, items } = req.body;
    const result = await orderService.createOrder(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});


export default router;
