import { Routes, Route, useLocation } from 'react-router-dom';
import { Popup } from './components/layout/Popup';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import { Toaster } from 'react-hot-toast';
import { Home } from './pages/Home';
import { AdminIndex } from './pages/admin/index';
import { UserLogin } from './pages/UserLogin';
import { ProductDetails } from './pages/ProductDetails';
import { ShopPage } from './pages/ShopPage';
import { UserRegister } from './pages/UserRegister';
import { CategoryPage } from './pages/CategoryPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Cart } from './pages/Cart';
import { CheckOut } from './pages/CheckOut';
import { Wishlist } from './pages/Wishlist';
import { CategoriesPage } from './pages/CategoriesPage';
import { NotFound } from './pages/NotFound';

// Account Pages
import { AccountLayout } from './pages/account/AccountLayout';
import { AccountDashboard } from './pages/account/AccountDashboard';
import { MyProfile } from './pages/account/MyProfile';
import { AddressBook } from './pages/account/AddressBook';
import { PaymentOptions } from './pages/account/PaymentOptions';
import { WalletPage } from './pages/account/WalletPage';
import { OrderHistory } from './pages/account/OrderHistory';
import { MyReturns } from './pages/account/MyReturns';
import { MyCancellations } from './pages/account/MyCancellations';
import { MyReviews } from './pages/account/MyReviews';
import { ForgotPassword } from './pages/account/ForgotPassword';
import { ResetPassword } from './pages/account/ResetPassword';
import { useHomeStore } from './store/homeStore';
import React from 'react';

function App() {
  const { fetchHomeData } = useHomeStore();
  const location = useLocation();

  React.useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const isAdminPath = location.pathname.startsWith('/adm');

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex flex-col min-h-screen pb-24 lg:pb-0">
        {!isAdminPath && <Popup />}
        {!isAdminPath && <Navbar />}
        
        <div className="flex-grow flex flex-col min-h-[85vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Admin Routes */}
            <Route path="/adm/*" element={<AdminIndex />} />
            
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/search" element={<ShopPage />} />
            <Route path="/best-sellers" element={<ShopPage />} />
            <Route path="/new-arrivals" element={<ShopPage />} />
            <Route path="/offers" element={<ShopPage />} />
            <Route path="/account/login" element={<UserLogin />} />
            <Route path="/account/register" element={<UserRegister />} />
            <Route path="/account/forgot-password" element={<ForgotPassword />} />
            <Route path="/account/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute role="user" />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<CheckOut />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/account" element={<AccountLayout />}>
                <Route index element={<AccountDashboard />} />
                <Route path="profile" element={<MyProfile />} />
                <Route path="addresses" element={<AddressBook />} />
                <Route path="payments" element={<PaymentOptions />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="orders" element={<OrderHistory />} />
                <Route path="returns" element={<MyReturns />} />
                <Route path="cancellations" element={<MyCancellations />} />
                <Route path="reviews" element={<MyReviews />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        
        {!isAdminPath && <Footer />}
        {!isAdminPath && <MobileBottomNav />}
      </div>
    </ErrorBoundary>
  );
}

export default App;
