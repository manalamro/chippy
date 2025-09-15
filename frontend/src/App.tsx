import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUserStore } from "./store/userStore";
import Home from './pages/Home/home';
import ProductsList from './pages/Products/productsList';
import ProductDetails from './pages/Products/productDetails';
import Cart from './pages/Cart/cart';
import AboutUs from './pages/AboutUs/AboutUs';
import Header from "./components/header";
import AuthPage from './pages/Auth/authPage';
import Checkout from './pages/Checkout/checkout';
import MyOrders from './pages/Checkout/myOrder';
import AdminPage from './pages/Admin/admin';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

import './lib/i18n/i18n';

function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // Token exists but user state not set - this will be handled by persisted store
    }
  }, []);

  return (
    <Router>
      
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart onCheckout={() => setShowAuthModal(true)}  />} />
          <Route path="/aboutUs" element={<AboutUs />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<MyOrders />} />
        </Route>

        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminPage />
            </ProtectedAdminRoute>
          } 
        />

        <Route 
          path="/auth" 
          element={user ? <Navigate to={user.role === "ADMIN" ? "/admin" : "/"} replace /> : <AuthPage />} 
        />
      </Routes>
    </Router>
  );
}

export default App;