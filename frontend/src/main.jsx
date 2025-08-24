import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";

import "./assets/styles/index.css";
import App from "./App.jsx";

import HomeScreen from "./screens/HomeScreen.jsx";
import ProductsAdminScreen from "./screens/ProductsAdminScreen.jsx";
import BrandsAdminScreen from "./screens/BrandsAdminScreen.jsx";
import NotFoundScreen from "./screens/NotFoundScreen.jsx";

import store from "./store";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomeScreen />} />
      <Route path="products" element={<ProductsAdminScreen />} />  
      <Route path="brands" element={<BrandsAdminScreen />} />      
      <Route path="*" element={<NotFoundScreen />} />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
