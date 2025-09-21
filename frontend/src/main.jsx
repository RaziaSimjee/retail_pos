import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
// CSS Styles
import "./assets/styles/index.css";
import App from "./App.jsx";
// Admin Screens
import HomeScreen from "./screens/HomeScreen.jsx";
import ProductsAdminScreen from "./screens/ProductsAdminScreen.jsx";
import ProductVariantAdminScreen from "./screens/ProductVaraintAdminScreen.jsx";
import BrandsAdminScreen from "./screens/BrandsAdminScreen.jsx";
import CategoriesAdminScreen from "./screens/CategoriesAdminScreen.jsx";
import ColorsAdminScreen from "./screens/ColorsAdminScreen.jsx";
import ProductSizesAdminScreen from "./screens/ProductSizesAdminScreen.jsx";
import UsersAdminScreen from "./screens/UsersAdminScreen.jsx";
import NotFoundScreen from "./screens/NotFoundScreen.jsx";
// Components
import ProductDetails from "./components/ProductDetails.jsx";
import ProductSizeDetails from "./components/ProductSizeDetails.jsx";
// Api Slices
import store from "./store";
// Layouts
import Layout from "./components/Layout.jsx";

import AddressesScreen from "./screens/AddressesScreen.jsx";
// Auth Screens
import LoginForm from "./screens/LoginForm.jsx";
import RegisterForm from "./screens/RegisterForm.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
      
      {/* Public routes */}
      <Route index element={<LoginForm />} />
      <Route path="login" element={<LoginForm />} />
      <Route path="register" element={<RegisterForm />} />

      {/* Admin Dashboard */}
      <Route element={<Layout />}>
        <Route path="dashboard" element={<HomeScreen />} />
        <Route path="users/:role" element={<UsersAdminScreen />} />
        <Route path="/addresses/:id" element={<AddressesScreen />} />

      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFoundScreen />} />
      
    </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
