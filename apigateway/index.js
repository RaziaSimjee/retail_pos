


import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import router from './routes/authRoutes.js';
import userAddressRouter from './routes/userAddressRoutes.js';
import connectDB from './db.js';
import { authenticateJWT, authorizeRoles } from './middleware/auth.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(cors({
  origin: ['http://localhost:5173'], // Frontend URL
  credentials: true,                 // Allow cookies
}));

app.use(morgan('combined'));  // Log HTTP requests
app.use(helmet());            // Add security headers
app.use(cookieParser());      // Parse cookies
app.disable('x-powered-by');  // Hide Express info
app.use(express.json());      // Parse JSON bodies

// Connect to MongoDB
connectDB();

// ===== Routes =====
app.use('/api/users', router);
app.use('/api/addresses', userAddressRouter);


// ===== Microservices =====
const services = [
  {
    route: '/productcatalog', // PUBLIC route
    target: 'http://localhost:8000/',
    protected: false
  },
  // {
  //   route: '/users',          // Requires Admin
  //   target: 'http://localhost:8001/',
  //   protected: true,
  //   roles: ['admin']
  // },
  {
    route: '/sales',          // Requires login (any role)
    target: 'http://localhost:8002/',
    protected: true
  },
  {
    route: '/payment',        // Requires login (any role)
    target: 'http://localhost:8003/',
    protected: true,
    roles: ['admin', 'manager', 'cashier'],
  },
];

// ===== Apply Proxies =====
services.forEach(({ route, target, protected: isProtected, roles }) => {
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: { [`^${route}`]: '' },
  };

  if (isProtected) {
    if (roles && roles.length > 0) {
      // Requires authentication + specific roles
      app.use(route, authenticateJWT, authorizeRoles(...roles), createProxyMiddleware(proxyOptions));
    } else {
      // Requires authentication only
      app.use(route, authenticateJWT, createProxyMiddleware(proxyOptions));
    }
  } else {
    // Public access
    app.use(route, createProxyMiddleware(proxyOptions));
  }
});

// ===== Base Route =====
app.get('/', (req, res) => {
  res.send('✅ Welcome to the API Gateway');
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`✅ API Gateway is running on port ${PORT}`);
});
