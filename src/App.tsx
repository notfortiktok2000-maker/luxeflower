/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import { ProductProvider } from "./context/ProductContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                <Route path="history" element={<History />} />
                <Route path="orders" element={<Orders />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </ProductProvider>
    </AuthProvider>
  );
}
