import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';
import './App.css';

// API Base URL
import { API_URL } from './config';

// Discord Icon
const DiscordIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// Header Component
function Header({ user, cart, onLogin, onLogout }) {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">💎</span>
          <span>Hemiko</span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Shop
          </Link>
          <Link
            to="/cart"
            className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
          >
            Cart {cart?.length > 0 && <span className="cart-badge">{cart.reduce((a, c) => a + c.quantity, 0)}</span>}
          </Link>
          {user && (
            <Link
              to="/dashboard"
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="nav-user">
          {user ? (
            <>
              <div className="user-info">
                <div className="user-name">{user.globalName || user.username}</div>
                <div className="user-gold">
                  🪙 {user.goldCoin?.toLocaleString() || 0}
                </div>
              </div>
              <img src={user.avatar} alt={user.username} className="user-avatar" />
              <button className="btn btn-secondary btn-sm" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn btn-discord" onClick={onLogin}>
              <DiscordIcon /> Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// Main App Component
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [cart, setCart] = useState([]);

  // Add to cart
  const addToCart = (pkg) => {
    setCart(current => {
      const existing = current.find(item => item.id === pkg.id);
      if (existing) {
        return current.map(item =>
          item.id === pkg.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...pkg, quantity: 1 }];
    });
    showToast(`Added ${pkg.name} to cart`, 'success');
  };

  // Remove from cart
  const removeFromCart = (pkgId) => {
    setCart(current => current.filter(item => item.id !== pkgId));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check for session on load
  useEffect(() => {
    const checkSession = () => {
      const params = new URLSearchParams(window.location.search);
      const session = params.get('session');
      const error = params.get('error');

      if (error) {
        showToast('Login failed. Please try again.', 'error');
        window.history.replaceState({}, '', window.location.pathname);
      }

      if (session) {
        try {
          const fixedSession = session.replace(/ /g, '+');
          const userData = JSON.parse(atob(fixedSession));
          setUser(userData);
          localStorage.setItem('hemiko_user', JSON.stringify(userData));
          window.history.replaceState({}, '', window.location.pathname);
        } catch (e) {
          console.error('Session parse error:', e);
        }
      } else {
        const savedUser = localStorage.getItem('hemiko_user');
        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            localStorage.removeItem('hemiko_user');
          }
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  // Handle login
  const handleLogin = () => {
    window.location.href = `${API_URL}/api/auth/login`;
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('hemiko_user');
    showToast('Logged out successfully', 'info');
  };

  // Handle payment complete - update user gold
  const handlePaymentComplete = (newGoldBalance) => {
    const updatedUser = { ...user, goldCoin: newGoldBalance };
    setUser(updatedUser);
    localStorage.setItem('hemiko_user', JSON.stringify(updatedUser));
  };

  if (loading) {
    return (
      <div className="app loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Header user={user} cart={cart} onLogin={handleLogin} onLogout={handleLogout} />

        <main className="main-content">
          <div className="container">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    {!user && (
                      <section className="hero">
                        <h1><span className="gradient-text">Premium Shop</span></h1>
                        <p>Get Hemiko Gold instantly with Bakong KHQR payment. Fast, secure, and automatic delivery!</p>
                        <button className="btn btn-discord btn-lg" onClick={handleLogin}>
                          <DiscordIcon /> Login with Discord
                        </button>
                      </section>
                    )}
                    <Shop
                      user={user}
                      showToast={showToast}
                      onPaymentComplete={handlePaymentComplete}
                      addToCart={addToCart}
                    />
                  </>
                }
              />
              <Route
                path="/cart"
                element={
                  <Cart
                    user={user}
                    cart={cart}
                    removeFromCart={removeFromCart}
                    clearCart={clearCart}
                    showToast={showToast}
                    onPaymentComplete={handlePaymentComplete}
                  />
                }
              />
              <Route
                path="/dashboard"
                element={<Dashboard user={user} />}
              />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <p>© 2026 Hemiko Bot. All rights reserved. | <a href="https://discord.gg/fQFajk8cxS" target="_blank" rel="noopener noreferrer">Join Discord</a></p>
          </div>
        </footer>

        {/* Toast Notifications */}
        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
