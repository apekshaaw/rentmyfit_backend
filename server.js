import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
