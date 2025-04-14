import express from 'express';
import login from './login.service.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const result = await login.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const result = await login.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/token', async (req, res, next) => {
  try {
    const result = await login.token(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/verify', async (req, res, next) => {
  try {
    const result = await login.verifyToken(req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
export default router;