import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const msg = err.name === 'TokenExpiredError'
          ? 'Token expired'
          : 'Invalid token';
        console.error('Auth Middleware Error:', msg);
        return res.status(401).json({ message: msg });
      }

      req.userId = decoded.userId;
      req.userRole = decoded.role;
      next();
    });
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

export default authMiddleware;
