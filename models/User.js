import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  profileImage: {
    type: String,
    default: '',
  },
  mobile: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }
  ],
}, { timestamps: true });

export default mongoose.model('User', userSchema);
