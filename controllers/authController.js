import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Product from '../models/Product.js'; // For population if needed

// Register User
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: email === 'admin@gmail.com' ? 'admin' : 'user',
    });

    res.status(201).json({
      message: 'Registered successfully',
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        mobile: user.mobile || '',
        gender: user.gender || '',
        address: user.address || '',
        wishlist: user.wishlist || [],
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, password, profileImage, mobile, gender, address } = req.body;

    const user = await User.findById(userId);

    if (name) user.name = name;
    if (profileImage) user.profileImage = profileImage;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    if (mobile) user.mobile = mobile;
    if (gender) user.gender = gender;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || '',
        mobile: user.mobile || '',
        gender: user.gender || '',
        address: user.address || '',
        wishlist: user.wishlist || [],
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete Account Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to Wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const user = await User.findById(userId);
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.status(200).json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Add Wishlist Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove from Wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params; // ✅ FIXED: using URL param instead of req.body

    if (!productId) {
      return res.status(400).json({ message: 'Product ID missing' });
    }

    const user = await User.findById(userId);

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId.toString()
    );

    await user.save();

    res.status(200).json({
      message: 'Removed from wishlist',
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error('Remove Wishlist Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get Wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate('wishlist');
    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    console.error('Get Wishlist Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
