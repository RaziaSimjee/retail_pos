// import jwt from 'jsonwebtoken';

// export const authenticateJWT = (req, res, next) => {
//   try {
//     const token = req.cookies?.jwt || req.headers['authorization']?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'Authentication required' });

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // attach token payload
//     next();
//   } catch (err) {
//     res.status(403).json({ message: 'Invalid or expired token' });
//   }
// };

// export const authorizeRoles = (...roles) => (req, res, next) => {
//   if (!req.user || !roles.includes(req.user.role)) {
//     return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
//   }
//   next();
// };
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
  try {
    // Get token from cookie or Bearer header
    const authHeader = req.headers['authorization'];
    const token = req.cookies?.jwt || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // attach only userId
    next();
  } catch (err) {
    console.error('JWT Authentication Error:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    res.status(401).json({ message: 'Invalid token' });
  }
};



// ===== Role-Based Authorization Middleware =====
export const authorizeRoles = (...roles) => async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Fetch user by ID
    const user = await User.findById(req.userId).select('userRole isActive');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is deactivated' });
    }

    // Normalize role for comparison
    const userRole = user.userRole.toLowerCase();
    const allowedRoles = roles.map(role => role.toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }

    // Attach user to request for later use
    req.user = user;
    next();
  } catch (error) {
    console.error('Authorization Middleware Error:', error);
    res.status(500).json({ message: 'Server error during authorization' });
  }
};