import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, PhoneCall, Truck, ChevronDown, ListFilter } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function Header({ onSearchChange, searchQuery }) {
  const { setIsCartOpen, cartTotalCount, cartSubtotal } = useContext(CartContext);
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
    <header style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', width: '100%' }}>
      
      {/* FIRST ROW: Logo, Search Bar, Info Badges */}
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        height: '90px',
        padding: '0 1.5rem',
        gap: '2rem'
      }} className="header-first-row">
        
        {/* Brand Logo (Left) */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <img 
            src="/logo.png" 
            alt="Right Technology Holdings Logo" 
            style={{ 
              height: '82px', 
              objectFit: 'contain',
              maxWidth: '350px',
              /* Invert colors to make dark text white, while hue-rotating 180deg to preserve the blue brand color */
              filter: 'invert(1) hue-rotate(180deg) brightness(1.2) contrast(1.1)'
            }} 
          />
        </Link>

        {/* Search Input (Center) */}
        <form onSubmit={handleSearchSubmit} style={{ 
          position: 'relative', 
          flexGrow: 1,
          maxWidth: '550px',
          display: 'flex',
          alignItems: 'center'
        }} className="search-form-desktop">
          <input
            type="text"
            placeholder="Search products, brands or services..."
            value={searchQuery || ''}
            onChange={handleSearchChangeInternal}
            style={{
              width: '100%',
              backgroundColor: '#1c1c1f',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '0.65rem 3.5rem 0.65rem 1.25rem',
              borderRadius: '50px',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color var(--transition-fast), background-color var(--transition-fast)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.backgroundColor = '#0a0a0a';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.backgroundColor = '#1c1c1f';
            }}
          />
          <button 
            type="submit"
            style={{
              position: 'absolute',
              right: '3px',
              backgroundColor: 'var(--accent)',
              border: 'none',
              borderRadius: '50px',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          >
            <Search size={16} strokeWidth={2.5} />
          </button>
        </form>

        {/* Info Badges (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }} className="info-badges-desktop">
          {/* Hotline info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              backgroundColor: '#1c1c1f',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <PhoneCall size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>24 Hotline</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-numbers)' }}>076 095 9302</span>
            </div>
          </div>

          {/* Delivery info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              backgroundColor: '#1c1c1f',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Truck size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Islandwide</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 700 }}>Fast Delivery</span>
            </div>
          </div>
        </div>

        {/* Mobile controls */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="nav-mobile-controls">
          <button 
            onClick={() => setIsCartOpen(true)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              position: 'relative', 
              color: 'var(--text-primary)' 
            }}
          >
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
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>☰</span>
          </button>
        </div>

      </div>

      {/* SECOND ROW: Categories Selector, Nav Links, User & Cart Buttons */}
      <div style={{ 
        borderTop: '1px solid var(--border-color)', 
        backgroundColor: '#0c0c0e',
        height: '50px',
        display: 'flex',
        alignItems: 'center'
      }} className="header-second-row">
        <div className="container" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 1.5rem',
          height: '100%'
        }}>
          
          {/* Categories / Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', height: '100%' }}>
            
            {/* Category Dropdown Indicator Button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              padding: '0.45rem 1.15rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none'
            }}
              onClick={() => {
                const element = document.getElementById('shop-catalog');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <ListFilter size={15} />
              <span>All Categories</span>
              <ChevronDown size={14} />
            </div>

            {/* Menu Links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '100%' }} className="nav-desktop">
              <Link to="/" style={{ 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: location.pathname === '/' ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'color var(--transition-fast)'
              }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = location.pathname === '/' ? 'var(--accent)' : 'var(--text-secondary)'}
              >
                Shop Home
              </Link>
              
              {isAdmin && (
                <Link to="/admin" style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: location.pathname === '/admin' ? 'var(--accent)' : 'var(--text-secondary)',
                  transition: 'color var(--transition-fast)'
                }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = location.pathname === '/admin' ? 'var(--accent)' : 'var(--text-secondary)'}
                >
                  Admin Control Board
                </Link>
              )}
            </nav>

          </div>

          {/* User Account & Cart Button (Right) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', height: '100%' }} className="nav-desktop">
            
            {/* Auth Indicator */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Link to="/dashboard" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  fontSize: '0.85rem', 
                  color: 'var(--text-secondary)',
                  fontWeight: 600 
                }}>
                  <User size={16} color="var(--accent)" />
                  <span>{user?.name.split(' ')[0]}</span>
                </Link>
                <button 
                  onClick={logout} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--danger)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/auth" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.35rem', 
                fontSize: '0.85rem', 
                color: 'var(--text-secondary)',
                fontWeight: 600
              }}>
                <User size={16} />
                <span>Login / Register</span>
              </Link>
            )}

            {/* Vertically split separator */}
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />

            {/* Cart Selector Trigger */}
            <button 
              onClick={() => setIsCartOpen(true)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = 'var(--shadow-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShoppingCart size={18} color="var(--accent)" />
                {cartTotalCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-7px',
                    right: '-7px',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    fontSize: '0.55rem',
                    fontFamily: 'var(--font-numbers)',
                    fontWeight: 900,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>My Cart</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-numbers)' }}>
                  රු {cartSubtotal.toLocaleString()}
                </span>
              </div>
            </button>

          </div>

        </div>
      </div>

      {/* MOBILE DRAWER DRAWER */}
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
                backgroundColor: '#1c1c1f',
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

          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Shop Home</Link>
          
          {isAdmin && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: 'var(--accent)' }}>Admin Panel</Link>
          )}

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <User size={16} color="var(--accent)" />
                <span>My Dashboard ({user?.name})</span>
              </Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: 0, fontWeight: 600 }}>
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <User size={16} />
              <span>Login / Register</span>
            </Link>
          )}
        </div>
      )}

      {/* Inline styles for responsive layout helper */}
      <style>{`
        @media (max-width: 900px) {
          .search-form-desktop, .info-badges-desktop, .nav-desktop, .header-second-row {
            display: none !important;
          }
          .nav-mobile-controls {
            display: flex !important;
          }
          .header-first-row {
            height: 80px !important;
            gap: 1rem !important;
          }
          .header-first-row img {
            height: 50px !important;
          }
        }
      `}</style>
    </header>
  );
}
