import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// REGISTER USER CONTROLLER
export const registerUser = async (req, res) => {
  try {
    // Destructure input fields from request body
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists with the same email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password for secure storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save new user to database
    const user = await User.create({ name, email, password: hashedPassword });

    // Respond with success and basic user info
    res.status(201).json({
      message: 'Registered successfully',
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN USER CONTROLLER
export const loginUser = async (req, res) => {
  try {
    // Destructure email and password from request body
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare provided password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token valid for 1 day
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Respond with success and token
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
