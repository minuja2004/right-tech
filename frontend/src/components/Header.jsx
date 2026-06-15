import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, Cpu, Menu, X } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Header({ onSearchChange, searchQuery }) {
  const { setIsCartOpen, cartTotalCount } = useContext(CartContext);
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleSearchChangeInternal = (e) => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <header className="header-glass">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '130px' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/logo.png" 
            alt="Right Tech Logo" 
            style={{ 
              height: '110px', 
              objectFit: 'contain',
              maxWidth: '380px'
            }} 
          />
        </Link>

        {/* Real-time Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ 
          position: 'relative', 
          width: '320px', 
          display: 'flex',
          alignItems: 'center'
        }} className="search-form-desktop">
          <input
            type="text"
            placeholder="Search supplements..."
            value={searchQuery || ''}
            onChange={handleSearchChangeInternal}
            style={{
              width: '100%',
              backgroundColor: '#16161a',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
          />
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.85rem' }} />
        </form>

        {/* Navigation Actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="nav-desktop">
          <Link to="/" style={{ fontSize: '0.9rem', fontWeight: 500, color: location.pathname === '/' ? 'var(--accent)' : 'var(--text-primary)' }}>
            Shop
          </Link>
          
          {isAdmin && (
            <Link to="/admin" style={{ fontSize: '0.9rem', fontWeight: 500, color: location.pathname === '/admin' ? 'var(--accent)' : 'var(--text-primary)' }}>
              Admin Panel
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <User size={16} color="var(--accent)" />
                <span>{user?.name.split(' ')[0]}</span>
              </Link>
              <button onClick={logout} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/auth" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              <User size={16} />
              <span>Login</span>
            </Link>
          )}

          {/* Cart Icon Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ShoppingCart size={22} color="var(--text-primary)" />
            {cartTotalCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-numbers)',
                fontWeight: 900,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartTotalCount}
              </span>
            )}
          </button>
        </nav>

        {/* Mobile Navigation controls */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="nav-mobile-controls">
          <button onClick={() => setIsCartOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
            <ShoppingCart size={22} />
            {cartTotalCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: 'var(--accent)',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-numbers)',
                fontWeight: 900,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartTotalCount}
              </span>
            )}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: 'none', border: 'none', color: '#fff' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 1.5rem 1.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          animation: 'fadeIn 0.2s ease-out'
        }} className="mobile-menu-drawer">
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery || ''}
              onChange={handleSearchChangeInternal}
              style={{
                width: '100%',
                backgroundColor: '#16161a',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '0.5rem 1rem 0.5rem 2.5rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.85rem', top: '10px' }} />
          </form>

          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 500 }}>Shop</Link>
          
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 500, color: 'var(--accent)' }}>Admin Panel</Link>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} color="var(--accent)" />
                <span>My Dashboard ({user?.name})</span>
              </Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0 }}>
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} />
              <span>Login / Register</span>
            </Link>
          )}
        </div>
      )}

      {/* Inline styles for responsive layout helper */}
      <style>{`
        @media (max-width: 768px) {
          .search-form-desktop, .nav-desktop {
            display: none !important;
          }
          .nav-mobile-controls {
            display: flex !important;
          }
          .header-glass .container {
            height: 90px !important;
          }
          .header-glass img {
            height: 70px !important;
            max-width: 250px !important;
          }
        }
      `}</style>
    </header>
  );
}
