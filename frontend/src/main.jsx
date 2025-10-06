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
import Dashboard from "./screens/Dashboard.jsx";
import ProductsAdminScreen from "./screens/ProductsAdminScreen.jsx";
import ProductVariantAdminScreen from "./screens/ProductVaraintAdminScreen.jsx";
import Catalog from "./screens/Catalog.jsx";
import Checkout from "./screens/Checkout.jsx";
import SerialNumbers from "./components/SerialNumbers.jsx";
import BrandsAdminScreen from "./screens/BrandsAdminScreen.jsx";
import CategoriesAdminScreen from "./screens/CategoriesAdminScreen.jsx";
import ColorsAdminScreen from "./screens/ColorsAdminScreen.jsx";
import ProductSizesAdminScreen from "./screens/ProductSizesAdminScreen.jsx";
import UsersAdminScreen from "./screens/UsersAdminScreen.jsx";
import SuppliersAdminScreen from "./screens/SuppliersAdminScreen.jsx";
import PurchaseItemsAdminScreen from "./screens/PurchaseItemsAdminScreen.jsx";
import PurchaseOrdersAdminScreen from "./screens/PurchaseOrdersAdminScreen.jsx";
import SupplierPaymentsAdminScreen from "./screens/SupplierPaymentsAdminScreen.jsx";
import NotFoundScreen from "./screens/NotFoundScreen.jsx";
import Order from "./screens/Order.jsx";
// Components
import ProductDetails from "./components/ProductDetails.jsx";
import ProductSizeDetails from "./components/ProductSizeDetails.jsx";
import ProductVariantDetails from "./components/ProductVariantDetails.jsx";
import Profile from "./screens/profile.jsx";
// Api Slices
import store from "./store";
// Layouts
import Layout from "./components/Layout.jsx";

import AddressesScreen from "./screens/AddressesScreen.jsx";
// Auth Screens
import LoginForm from "./screens/LoginForm.jsx";
import RegisterForm from "./screens/RegisterForm.jsx";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen.jsx";
// import ResetPasswordForm from "./screens/ResetPasswordForm.jsx";

// Loyalty Program
import Wallets from "./components/Wallets.jsx";
import Rules from "./components/Rules.jsx";
import Rewards from "./components/Rewards.jsx";
import Spendings from "./components/Spendings.jsx";
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
        {/* Public routes */}

        <Route index element={<Catalog />} />
        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegisterForm />} />
        <Route path="forgotPassword" element={<ForgotPasswordScreen />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="users/:role" element={<UsersAdminScreen />} />
        <Route path="/addresses/:id" element={<AddressesScreen />} />
        <Route path="/suppliers" element={<SuppliersAdminScreen />} />
        <Route path="/purchaseitems" element={<PurchaseItemsAdminScreen />} />
        <Route path="/purchaseorders" element={<PurchaseOrdersAdminScreen />} />
        <Route path="/supplierpayments" element={<SupplierPaymentsAdminScreen />} />
        <Route path="/wallets" element={<Wallets />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/spendings" element={<Spendings />} />
        <Route path="products" element={<ProductsAdminScreen />} />
        <Route path="productvariants" element={<ProductVariantAdminScreen />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="productVariants/:id" element={<ProductVariantDetails />} />
        <Route path="brands" element={<BrandsAdminScreen />} />
        <Route path="categories" element={<CategoriesAdminScreen />} />
        <Route path="colors" element={<ColorsAdminScreen />} />
        <Route path="productsizes" element={<ProductSizesAdminScreen />} />
        <Route path="productsizes/:id" element={<ProductSizeDetails />} />
        <Route path="serialnumbers" element={<SerialNumbers />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<Order />} />
        <Route path="profile" element={<Profile />} />

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
