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
import SupplierRoutes from './routes/supplierRoutes.js';
import connectDB from './db.js';
import { authenticateJWT, authorizeRoles } from './middleware/auth.js';
import emailRoutes from "./routes/emailRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseOrderRoutes from "./routes/purchaseOrderRoutes.js";
import purchaseItemRoutes from "./routes/purchaseItemRoutes.js";
import supplierPaymentRoutes from "./routes/supplierPaymentRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(cors({
  origin: ['http://localhost:5173'], // Frontend URL
  credentials: true,                 // Allow cookies
}));
// Increase the payload size limit for JSON bodies
// app.use(express.json({ limit: '50mb' }));

// // Set a limit for URL-encoded bodies as well
// app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('combined'));  // Log HTTP requests
app.use(helmet());            // Add security headers
app.use(cookieParser());      // Parse cookies
app.disable('x-powered-by');  // Hide Express info


// Connect to MongoDB
connectDB();



// ===== Microservices =====
const services = [
  {
    route: '/productcatalog', // PUBLIC route
    target: 'http://localhost:8000/',

  },
  // {
  //   route: '/users',          // Requires Admin
  //   target: 'http://localhost:8001/',
  //   protected: true,
  //   roles: ['admin']
  // },
  {
    route: '/saleService',          // Requires login (any role)
    target: 'http://localhost:5111/',
  },

];
// app.use(
//   "/productcatalog",
//   createProxyMiddleware({
//     target: "http://localhost:8000",
//     changeOrigin: true,
//     pathRewrite: { "^/productcatalog": "" },
//   })
// );


app.use(
  '/loyaltyProgram',
  createProxyMiddleware({
    target: 'http://localhost:7777',
    changeOrigin: true,
    pathRewrite: { '^/loyaltyProgram': '' },
  })
);

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
app.use(express.json({ limit: '50mb' }));
// ===== Routes =====
app.use('/api/users', router);
app.use('/api/addresses', userAddressRouter);
app.use('/api/suppliers', SupplierRoutes);
app.use("/api", emailRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/purchaseOrders", purchaseOrderRoutes);
app.use("/api/purchaseItems", purchaseItemRoutes);
app.use("/api/supplierPayments", supplierPaymentRoutes);
// ===== Base Route =====
app.get('/', (req, res) => {
  res.send('✅ Welcome to the API Gateway');
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`✅ API Gateway is running on port ${PORT}`);
});