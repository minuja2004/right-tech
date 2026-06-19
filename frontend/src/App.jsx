import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider, CartContext } from './context/CartContext';

// Components
import Header from './components/Header';
import CartDrawer from './components/CartDrawer';

// Pages
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import OurProjects from './pages/OurProjects';
import ProjectDetails from './pages/ProjectDetails';

// Route Loading Transition Component
function RouteLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start page load transition on route change
    setLoading(true);
    setProgress(15);
    
    // Simulate steps of the progress bar
    const t1 = setTimeout(() => setProgress(45), 80);
    const t2 = setTimeout(() => setProgress(75), 200);
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 100);
    }, 350);

    // Scroll window to top
    window.scrollTo(0, 0);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [location.pathname]);

  return (
    <>
      <div 
        className="page-loader-progress" 
        style={{ 
          width: `${progress}%`,
          opacity: progress === 100 || progress === 0 ? 0 : 1 
        }} 
      />
      {loading && (
        <div className="page-loader-overlay">
          <div className="page-loader-spinner"></div>
          <span className="page-loader-text">Right Tech</span>
        </div>
      )}
    </>
  );
}

// Global Cart Toast Notification
function CartToast() {
  const { toast } = useContext(CartContext);
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '30px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--accent)',
      color: 'var(--text-primary)',
      padding: '0.85rem 1.25rem',
      borderRadius: '8px',
      boxShadow: '0 8px 30px rgba(0, 125, 250, 0.2)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.65rem',
      fontSize: '0.8rem',
      fontWeight: 600,
      minWidth: '260px',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        backgroundColor: 'var(--accent)',
        color: '#ffffff',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.7rem'
      }}>
        ✓
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', textAlign: 'left' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Added to Cart</span>
        <span>{toast}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <RouteLoader />
          <div className="app-container">
            
            {/* Header & Shared Search Bar */}
            <Header 
              searchQuery={searchQuery} 
              onSearchChange={setSearchQuery} 
              theme={theme}
              toggleTheme={toggleTheme}
            />
            
            {/* Cart Drawer Slide Overlay */}
            <CartDrawer />
            <CartToast />

            {/* Main Page Content */}
            <main>
              <Routes>
                <Route 
                  path="/" 
                  element={<Home searchQuery={searchQuery} onSearchChange={setSearchQuery} />} 
                />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/projects" element={<OurProjects />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
              </Routes>
            </main>

            {/* Premium Dark Theme Footer */}
            <footer style={{
              backgroundColor: 'var(--bg-secondary)',
              borderTop: '1px solid var(--border-color)',
              padding: '3rem 0',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)'
            }}>
              <div className="container footer-layout" style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                gap: '2.5rem'
              }}>
                
                {/* Brand description column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <img 
                    src={theme === 'light' ? '/logo-light.png' : '/logo.png'} 
                    alt="Right Tech Logo" 
                    style={{ 
                      height: '35px', 
                      objectFit: 'contain',
                      alignSelf: 'flex-start',
                      marginBottom: '0.25rem'
                    }} 
                  />
                  <p style={{ lineHeight: '1.6' }}>
                    Professional IT support services, high-definition CCTV security camera installations, laptop & printer repair servicing, and tech gadget retail.
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    © 2026 RIGHT TECH IT & CCTV Solutions. All rights reserved.
                  </p>
                </div>

                {/* Shop links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h5 style={{ color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Categories</h5>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Laptops & PCs</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Laser Printers</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>CCTV Surveillance</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>IT Services & Repair</Link>
                </div>

                {/* Support links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h5 style={{ color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Help & Support</h5>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Service Level Agreement</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Repair Warranty</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>FAQs</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Support Hotline</Link>
                </div>

                {/* Contact info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h5 style={{ color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Contact Info</h5>
                  <p>Right Tech IT & CCTV Solutions</p>
                  <p>123 Galle Road, Colombo, Sri Lanka</p>
                  <p>Hotline: +94 77 123 4567</p>
                  <p>Email: info@righttech.com</p>
                </div>

              </div>
            </footer>

          </div>
        </Router>
      </CartProvider>
      
      {/* Footer responsive layout helper */}
      <style>{`
        .footer-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 2.5rem;
        }
        @media (max-width: 768px) {
          .footer-layout {
            grid-template-columns: 1fr 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 480px) {
          .footer-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AuthProvider>
  );
}
