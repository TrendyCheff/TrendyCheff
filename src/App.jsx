import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import CartBar from './components/CartBar.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Catering from './pages/Catering.jsx';
import Checkout from './pages/Checkout.jsx';
import About from './pages/About.jsx';
import Reviews from './pages/Reviews.jsx';
import Admin from './pages/Admin.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import SignIn from './pages/SignIn.jsx';
import MyOrders from './pages/MyOrders.jsx';
import { useCart } from './context/CartContext.jsx';

function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}

function AdminGuard({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading)
    return (
      <div className="py-20 text-center text-gray-500">Checking access…</div>
    );
  if (!user) return <Navigate to="/signin" replace />;
  if (!isAdmin) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Access denied</h1>
        <p className="mt-3 text-gray-600">This page is for the chef only.</p>
      </div>
    );
  }
  return children;
}

export default function App() {
  const { toast } = useCart();
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <Admin />
              </AdminGuard>
            }
          />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <CartBar />
      <Footer />
      {toast && <Toast />}
    </div>
  );
}
