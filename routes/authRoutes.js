import express from 'express';
import {
  registerUser,
  loginUser,
  updateProfile,
  deleteAccount,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/account', authMiddleware, deleteAccount);

// Wishlist Routes
router.post('/wishlist/add', authMiddleware, addToWishlist);
router.delete('/wishlist/:productId', authMiddleware, removeFromWishlist); // ✅ fixed to use route param
router.get('/wishlist', authMiddleware, getWishlist);

export default router;
