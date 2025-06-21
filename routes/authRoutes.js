import express from 'express';
import {
  registerUser,
  loginUser,
  updateProfile,
  deleteAccount,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/update-profile', authMiddleware, updateProfile);
router.delete('/delete-account', authMiddleware, deleteAccount);

export default router;
