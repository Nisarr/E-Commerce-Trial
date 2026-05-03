import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Popup } from './components/layout/Popup';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Home } from './pages/Home';
import { AdminIndex } from './pages/admin/index';
import { UserLogin } from './pages/UserLogin';
import { Account } from './pages/Account';
import { ProductDetails } from './pages/ProductDetails';
import { ShopPage } from './pages/ShopPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Cart } from './pages/Cart';

// Placeholder pages
const Placeholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex-grow flex items-center justify-center py-20 text-xl font-medium text-gray-500">
    {title} Page
  </div>
);

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/adm');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPath && <Popup />}
      {!isAdminPath && <Navbar />}
      
      <div className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* Admin Routes */}
          <Route path="/adm" element={<AdminIndex />} />
          
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/search" element={<ShopPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Placeholder title="Wishlist" />} />
          
          {/* User Account Routes */}
          <Route path="/account/login" element={<UserLogin />} />
          <Route element={<ProtectedRoute role="user" />}>
            <Route path="/account" element={<Account />} />
          </Route>
          
          <Route path="*" element={<Placeholder title="404 Not Found" />} />
        </Routes>
      </div>
      
      {!isAdminPath && <Footer />}
      {!isAdminPath && <MobileBottomNav />}
    </div>
  );
}

export default App;
