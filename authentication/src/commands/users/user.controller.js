import express from 'express';
import user from './user.service.js';

const router = express.Router();

router.post('/createuser', async (req, res, next) => {
  try {
    const result = await user.createUser(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default router;