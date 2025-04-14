import express from 'express';
import forgot from './forgotpwd.service.js';

const router = express.Router();

router.post('/restpwdreq', async (req, res, next) => {
  try {
    const result = await forgot.forgotpasswordlink(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/restpwd', async (req, res, next) => {
    try {
      const result = await forgot.resetpassword(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

export default router;