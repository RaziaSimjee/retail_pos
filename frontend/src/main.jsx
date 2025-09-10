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
import NotFoundScreen from "./screens/NotFoundScreen.jsx";
// Components
import ProductDetails from "./components/ProductDetails.jsx";
import ProductSizeDetails from "./components/ProductSizeDetails.jsx";
// Api Slices
import store from "./store";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      {/* Screens */}
      <Route index element={<HomeScreen />} />
      <Route path="products" element={<ProductsAdminScreen />} />
      <Route path="brands" element={<BrandsAdminScreen />} />
      <Route path="categories" element={<CategoriesAdminScreen />} />
      <Route path="colors" element={<ColorsAdminScreen />} />
      <Route path="productsizes" element={<ProductSizesAdminScreen />} />
      <Route path="productvariants" element={<ProductVariantAdminScreen />} />

      {/* Components */}
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/productsizes/:id" element={<ProductSizeDetails />} />

      {/* Fallback */}
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
