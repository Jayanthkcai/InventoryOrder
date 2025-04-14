import express from 'express';
import inventoryService from './inventory.service.js';

const router = express.Router();

router.post('/inventory', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const result = await inventoryService.updateStock(productId, quantity);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
