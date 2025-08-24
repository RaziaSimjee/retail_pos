import express from 'express';
import cors from 'cors';

import httpProxy from 'express-http-proxy';
import { createProxyMiddleware } from 'http-proxy-middleware';

import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// Enable CORS for all routes
app.use(cors());

app.use(morgan('combined')); // Add security headers
app.use(helmet()); // Log HTTP requests
app.disable('x-powered-by'); // Hide Express server information

const services = [
  {
    route: '/productcatalog',
    target: 'http://localhost:8000/',
    
  },
  {
    route: '/users',
    target: 'https://your-deployed-service.herokuapp.com/users/',
  },
  {
    route: '/sales',
    target: 'https://your-deployed-service.herokuapp.com/chats/',
  },
  {
    route: '/payment',
    target: 'https://your-deployed-service.herokuapp.com/payment/',
  },
];

// Set up proxy middleware for each microservice
services.forEach(({ route, target }) => {
  // Proxy options
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: '',
    },
  };

  // Apply rate limiting and timeout middleware before proxying
  app.use(route, createProxyMiddleware(proxyOptions));
});

app.get('/', (req, res) => {
  res.send('Welcome to the API Gateway');
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
