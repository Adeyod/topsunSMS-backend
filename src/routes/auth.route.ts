import express from 'express';
import {
  forgotPassword,
  loginUser,
  logoutUser,
  registerUser,
  requestAccessToken,
  resendEmailVerificationLink,
  resetPassword,
  verifyUserEmail,
} from '../controllers/auth.controller';
import { permission } from '../middleware/authorization';
import { verifyAccessToken } from '../middleware/jwtAuth';

const router = express.Router();

router.post('/login', loginUser);
router.post('/request-access-token', requestAccessToken);
router.get('/email-verification/:token', verifyUserEmail);
router.post('/resend-email-verification', resendEmailVerificationLink);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', logoutUser);

// router.post('/register', registerUser);

router.use(verifyAccessToken);
router.post('/register', permission(['admin', 'super_admin']), registerUser);

export default router;
