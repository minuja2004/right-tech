import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, PhoneCall, Truck, ChevronDown, ListFilter, Plus, X, CloudUpload } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Header({ onSearchChange, searchQuery }) {
  const { setIsCartOpen, cartTotalCount } = useContext(CartContext);
  const { user, logout, isAuthenticated, isAdmin, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddFlyerModalOpen, setIsAddFlyerModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Laptops',
    price: '',
    description: '',
    stock: '',
    allowKoko: true,
    images: []
  });

  const [flyerForm, setFlyerForm] = useState({
    name: '',
    category: 'Flyers',
    price: 0,
    description: 'Flyer banner',
    stock: 100,
    allowKoko: false,
    images: []
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'CCTV Setup',
    description: '',
    images: []
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/products/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'product') {
          setProductForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
        } else if (type === 'flyer') {
          setFlyerForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
        } else if (type === 'project') {
          setProjectForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Product added successfully!');
        setIsAddProductModalOpen(false);
        setProductForm({ name: '', category: 'Laptops', price: '', description: '', stock: '', allowKoko: true, images: [] });
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to add product');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleFlyerSubmit = async (e) => {
    e.preventDefault();
    if (flyerForm.images.length === 0) {
      alert('Please upload an image for the flyer first.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(flyerForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Flyer added successfully!');
        setIsAddFlyerModalOpen(false);
        setFlyerForm({ name: '', category: 'Flyers', price: 0, description: 'Flyer banner', stock: 100, allowKoko: false, images: [] });
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to add flyer');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (projectForm.images.length === 0) {
      alert('Please upload an image for the project first.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(projectForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Project added successfully!');
        setIsAddProjectModalOpen(false);
        setProjectForm({ title: '', category: 'CCTV Setup', description: '', images: [] });
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to add project');
      }
    } catch (err) {
      alert(err.message);
    }
  };

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
      
      {/* Admin Quick Bar */}
      {isAdmin && (
        <div style={{
          backgroundColor: '#0a0a0a',
          borderBottom: '1px solid var(--accent)',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#ffffff'
        }} className="admin-quick-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admin Toolbar:
            </span>
            <button 
              onClick={() => setIsAddProductModalOpen(true)}
              style={{
                backgroundColor: '#1c1c1f',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: '#ffffff',
                padding: '0.25rem 0.65rem',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = '#ffffff'; }}
            >
              <Plus size={12} /> Add Product
            </button>
            <button 
              onClick={() => setIsAddFlyerModalOpen(true)}
              style={{
                backgroundColor: '#1c1c1f',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: '#ffffff',
                padding: '0.25rem 0.65rem',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = '#ffffff'; }}
            >
              <Plus size={12} /> Add Flyer
            </button>
            <button 
              onClick={() => setIsAddProjectModalOpen(true)}
              style={{
                backgroundColor: '#1c1c1f',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                color: '#ffffff',
                padding: '0.25rem 0.65rem',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = '#ffffff'; }}
            >
              <Plus size={12} /> Add Project
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/admin" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s', fontWeight: 600 }} onMouseEnter={(e) => e.target.style.color = 'var(--accent)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}>
              Orders Dashboard →
            </Link>
          </div>
        </div>
      )}

      {/* FIRST ROW: Logo, Search Bar, Info Badges */}
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        height: '90px',
        padding: '0 1.5rem',
        gap: '2rem'
      }} className="header-first-row">
        
        <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0, margin: 0, padding: 0 }}>
          <img 
            src="/logo.png" 
            alt="Right Technology Holdings Logo" 
            style={{ 
              height: '70px', 
              objectFit: 'contain',
              maxWidth: '330px',
              display: 'block'
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
              
              <Link to="/projects" style={{ 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: location.pathname === '/projects' ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'color var(--transition-fast)'
              }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = location.pathname === '/projects' ? 'var(--accent)' : 'var(--text-secondary)'}
              >
                Our Projects
              </Link>
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
          
          <Link to="/projects" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Our Projects</Link>

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
            max-width: 60% !important;
          }
        }
      `}</style>

      {/* ADD PRODUCT MODAL */}
      {isAddProductModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '550px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} className="animate-fade-in">
            <button 
              onClick={() => setIsAddProductModalOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#ffffff', textTransform: 'uppercase' }}>
              Add New Product
            </h3>
            
            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name</label>
                <input 
                  type="text" 
                  required 
                  value={productForm.name} 
                  onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                  <select 
                    value={productForm.category} 
                    onChange={(e) => setProductForm(p => ({ ...p, category: e.target.value }))}
                    style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Printers">Printers</option>
                    <option value="CCTV & Security">CCTV & Security</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="IT Services">IT Services</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Base Price (LKR)</label>
                  <input 
                    type="number" 
                    required 
                    value={productForm.price} 
                    onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))}
                    style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Stock Qty</label>
                  <input 
                    type="number" 
                    required 
                    value={productForm.stock} 
                    onChange={(e) => setProductForm(p => ({ ...p, stock: e.target.value }))}
                    style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="allowKoko"
                    checked={productForm.allowKoko} 
                    onChange={(e) => setProductForm(p => ({ ...p, allowKoko: e.target.checked }))}
                    style={{ cursor: 'pointer' }}
                  />
                  <label htmlFor="allowKoko" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Allow Koko split payments</label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
                <textarea 
                  required 
                  rows={3}
                  value={productForm.description} 
                  onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Images</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#1c1c1f',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    <CloudUpload size={16} />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'product')} 
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                  {productForm.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        onClick={() => setProductForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}
                        style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff', fontSize: '0.5rem', cursor: 'pointer', padding: '1px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                disabled={uploading}
              >
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD FLYER MODAL */}
      {isAddFlyerModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '450px',
            position: 'relative'
          }} className="animate-fade-in">
            <button 
              onClick={() => setIsAddFlyerModalOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#ffffff', textTransform: 'uppercase' }}>
              Add Promotional Flyer
            </h3>
            
            <form onSubmit={handleFlyerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Flyer Title / Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. IT support setup promo"
                  value={flyerForm.name} 
                  onChange={(e) => setFlyerForm(p => ({ ...p, name: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upload Flyer Banner Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#1c1c1f',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    flexGrow: 1,
                    justifyContent: 'center'
                  }}>
                    <CloudUpload size={16} />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'flyer')} 
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                  {flyerForm.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        onClick={() => setFlyerForm(p => ({ ...p, images: [] }))}
                        style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff', fontSize: '0.5rem', cursor: 'pointer', padding: '2px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                disabled={uploading || flyerForm.images.length === 0}
              >
                Publish Flyer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD PROJECT MODAL */}
      {isAddProjectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '500px',
            position: 'relative'
          }} className="animate-fade-in">
            <button 
              onClick={() => setIsAddProjectModalOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#ffffff', textTransform: 'uppercase' }}>
              Add Completed Project
            </h3>
            
            <form onSubmit={handleProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. CCTV Camera setup at Liberty Plaza"
                  value={projectForm.title} 
                  onChange={(e) => setProjectForm(p => ({ ...p, title: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project Category</label>
                <select 
                  value={projectForm.category} 
                  onChange={(e) => setProjectForm(p => ({ ...p, category: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                >
                  <option value="CCTV Setup">CCTV Setup</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Gadget Retail">Gadget Retail</option>
                  <option value="Networking">Networking</option>
                  <option value="Repair Job">Repair Job</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project Description</label>
                <textarea 
                  required 
                  rows={3}
                  placeholder="Describe the installation details, hardware used, and completed scope..."
                  value={projectForm.description} 
                  onChange={(e) => setProjectForm(p => ({ ...p, description: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Upload Project Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    backgroundColor: '#1c1c1f',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    flexGrow: 1,
                    justifyContent: 'center'
                  }}>
                    <CloudUpload size={16} />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'project')} 
                      style={{ display: 'none' }}
                      disabled={uploading}
                    />
                  </label>
                  {projectForm.images.map((img, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        onClick={() => setProjectForm(p => ({ ...p, images: [] }))}
                        style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(239, 68, 68, 0.9)', border: 'none', color: '#fff', fontSize: '0.5rem', cursor: 'pointer', padding: '2px' }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                disabled={uploading || projectForm.images.length === 0}
              >
                Publish Project
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
