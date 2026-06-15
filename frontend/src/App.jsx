import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

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

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-container">
            
            {/* Header & Shared Search Bar */}
            <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            
            {/* Cart Drawer Slide Overlay */}
            <CartDrawer />

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
              <div className="container" style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
                gap: '2.5rem'
              }} className="footer-layout">
                
                {/* Brand description column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <img 
                    src="/logo.png" 
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
                  <h5 style={{ color: '#fff', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Categories</h5>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Laptops & PCs</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Laser Printers</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>CCTV Surveillance</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>IT Services & Repair</Link>
                </div>

                {/* Support links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h5 style={{ color: '#fff', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Help & Support</h5>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Service Level Agreement</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Repair Warranty</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>FAQs</Link>
                  <Link to="/" style={{ color: 'var(--text-secondary)' }}>Support Hotline</Link>
                </div>

                {/* Contact info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h5 style={{ color: '#fff', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Contact Info</h5>
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
