import bcrypt from 'bcryptjs';
import User from '../models/User.js';

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
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: 'Registered successfully',
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Placeholder Login User (to fix import crash)
export const loginUser = async (req, res) => {
  res.status(200).json({ message: 'Login endpoint working' });
};
