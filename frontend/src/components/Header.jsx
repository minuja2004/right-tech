import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut, PhoneCall, Truck, ChevronDown, ListFilter, Plus, X, CloudUpload, Sun, Moon, Tag } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Header({ onSearchChange, searchQuery, theme, toggleTheme }) {
  const { setIsCartOpen, cartTotalCount, cartSubtotal } = useContext(CartContext);
  const { user, logout, isAuthenticated, isAdmin, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search suggestions states
  const [productsList, setProductsList] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

  const desktopSearchRef = React.useRef(null);
  const mobileSearchRef = React.useRef(null);

  // Modal states
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddFlyerModalOpen, setIsAddFlyerModalOpen] = useState(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
 
  // Categories state
  const [categories, setCategories] = useState([]);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    if (!categoriesDropdownOpen) return;
    const handleClose = () => {
      setCategoriesDropdownOpen(false);
      setHoveredCategory(null);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [categoriesDropdownOpen]);
 
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    stock: '',
    allowKoko: true,
    isPremium: false,
    isHotOffer: false,
    images: []
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
          if (data.data.length > 0 && !productForm.category) {
            setProductForm(prev => ({
              ...prev,
              category: data.data[0].name,
              subcategory: data.data[0].subcategories[0] || ''
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching categories in Header:', err);
      }
    };
    fetchCats();
  }, []);

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
        setProductForm({ 
          name: '', 
          category: categories[0]?.name || '', 
          subcategory: categories[0]?.subcategories[0] || '', 
          price: '', 
          description: '', 
          stock: '', 
          allowKoko: true, 
          isPremium: false,
          isHotOffer: false,
          images: [] 
        });
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

  const loadProductsForSuggestions = async () => {
    if (hasFetchedProducts) return;
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      if (data.success) {
        setProductsList(data.data);
        setHasFetchedProducts(true);
      }
    } catch (err) {
      console.error('Error fetching products for suggestions:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setShowMobileSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTagClick = (tag) => {
    if (onSearchChange) {
      onSearchChange(tag);
    }
    setShowSuggestions(false);
    setShowMobileSuggestions(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      const element = document.getElementById('shop-catalog');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCategoryClick = (catName) => {
    setShowSuggestions(false);
    setShowMobileSuggestions(false);
    navigate(`/?category=${encodeURIComponent(catName)}`);
    setTimeout(() => {
      const element = document.getElementById('shop-catalog');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleProductClick = (prodId) => {
    setShowSuggestions(false);
    setShowMobileSuggestions(false);
    navigate(`/product/${prodId}`);
  };

  const trimmedQuery = (searchQuery || '').trim();
  const matchedProducts = trimmedQuery === '' ? [] : productsList.filter(prod => 
    (prod.name && prod.name.toLowerCase().includes(trimmedQuery.toLowerCase())) ||
    (prod.description && prod.description.toLowerCase().includes(trimmedQuery.toLowerCase()))
  ).slice(0, 5);

  const getMatchedTags = () => {
    if (trimmedQuery === '') {
      return ['ThinkPad', 'CCTV', 'Printer', 'Services', 'Repasting', 'Mouse'];
    }
    const query = trimmedQuery.toLowerCase();
    const uniqueTags = new Set();
    
    categories.forEach(cat => {
      if (cat.name && cat.name !== 'Flyers') {
        if (cat.name.toLowerCase().includes(query)) {
          uniqueTags.add(cat.name);
        }
        if (cat.subcategories) {
          cat.subcategories.forEach(sub => {
            if (sub.toLowerCase().includes(query)) {
              uniqueTags.add(sub);
            }
          });
        }
      }
    });

    const curated = ['ThinkPad', 'CCTV', 'Printer', 'Services', 'Repasting', 'Mouse', 'Keyboard', 'Repair', 'Security', 'Survey', 'Installation'];
    curated.forEach(word => {
      if (word.toLowerCase().includes(query)) {
        uniqueTags.add(word);
      }
    });

    return Array.from(uniqueTags).slice(0, 6);
  };

  const matchedTags = getMatchedTags();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setShowMobileSuggestions(false);
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
            src={theme === 'light' ? '/logo-light.png' : '/logo.png'} 
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
        <form 
          ref={desktopSearchRef}
          onSubmit={handleSearchSubmit} 
          style={{ 
            position: 'relative', 
            flexGrow: 1,
            maxWidth: '550px',
            display: 'flex',
            alignItems: 'center'
          }} 
          className="search-form-desktop"
        >
          <input
            type="text"
            placeholder="Search products, brands or services..."
            value={searchQuery || ''}
            onChange={handleSearchChangeInternal}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.backgroundColor = theme === 'light' ? '#ffffff' : '#0a0a0a';
              loadProductsForSuggestions();
              setShowSuggestions(true);
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.backgroundColor = theme === 'light' ? 'var(--bg-primary)' : '#1c1c1f';
            }}
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

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(20, 20, 22, 0.96)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1100,
                marginTop: '8px',
                padding: '1rem',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                textAlign: 'left',
                maxHeight: '450px',
                overflowY: 'auto'
              }}
            >
              {trimmedQuery === '' ? (
                <>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                      Popular Search Tags
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {matchedTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            backgroundColor: theme === 'light' ? '#f4f4f5' : '#1c1c1f',
                            border: '1px solid var(--border-color)',
                            borderRadius: '20px',
                            color: 'var(--text-secondary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--accent)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                            e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 125, 250, 0.05)' : 'rgba(0, 125, 250, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.backgroundColor = theme === 'light' ? '#f4f4f5' : '#1c1c1f';
                          }}
                        >
                          <Tag size={10} color="var(--accent)" />
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                      Popular Categories
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      {categories.filter(c => c.name !== 'Flyers').slice(0, 5).map(cat => (
                        <div
                          key={cat._id}
                          onClick={() => handleCategoryClick(cat.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            color: 'var(--text-secondary)',
                            fontSize: '0.8rem'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-primary)';
                            e.currentTarget.style.backgroundColor = theme === 'light' ? '#f4f4f5' : 'rgba(255, 255, 255, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <span>{cat.name}</span>
                          <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Browse →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {matchedTags.length === 0 && matchedProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>No suggestions found for "{trimmedQuery}"</p>
                      <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Try searching for general terms like "CCTV" or "ThinkPad"</p>
                    </div>
                  ) : (
                    <>
                      {matchedTags.length > 0 && (
                        <div>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                            Suggested Keywords
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {matchedTags.map(tag => (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleTagClick(tag)}
                                style={{
                                  padding: '0.35rem 0.75rem',
                                  backgroundColor: theme === 'light' ? '#f4f4f5' : '#1c1c1f',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '20px',
                                  color: 'var(--text-secondary)',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--accent)';
                                  e.currentTarget.style.color = 'var(--text-primary)';
                                  e.currentTarget.style.backgroundColor = theme === 'light' ? 'rgba(0, 125, 250, 0.05)' : 'rgba(0, 125, 250, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = 'var(--border-color)';
                                  e.currentTarget.style.color = 'var(--text-secondary)';
                                  e.currentTarget.style.backgroundColor = theme === 'light' ? '#f4f4f5' : '#1c1c1f';
                                }}
                              >
                                <Tag size={10} color="var(--accent)" />
                                <span>{tag}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {matchedProducts.length > 0 && (
                        <div style={{ borderTop: matchedTags.length > 0 ? '1px solid var(--border-color)' : 'none', paddingTop: matchedTags.length > 0 ? '0.75rem' : 0 }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
                            Suggested Products
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {matchedProducts.map(prod => (
                              <div
                                key={prod._id}
                                onClick={() => handleProductClick(prod._id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.75rem',
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  border: '1px solid transparent'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = theme === 'light' ? '#f4f4f5' : 'rgba(255, 255, 255, 0.05)';
                                  e.currentTarget.style.transform = 'translateX(2px)';
                                  e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.transform = 'translateX(0)';
                                  e.currentTarget.style.borderColor = 'transparent';
                                }}
                              >
                                <img
                                  src={prod.images && prod.images.length > 0 ? prod.images[0] : '/placeholder-product.png'}
                                  alt={prod.name}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    objectFit: 'cover',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: '#0d0d0f'
                                  }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden', textAlign: 'left' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {prod.name}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                    {prod.category} {prod.subcategory ? `> ${prod.subcategory}` : ''}
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-numbers)', whiteSpace: 'nowrap' }}>
                                  LKR {prod.price.toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </form>

        {/* Info Badges (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }} className="info-badges-desktop">
          {/* Hotline info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
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
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)'
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
              <span 
                key={cartTotalCount}
                className="animate-pop"
                style={{
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
            
            {/* Category Dropdown Container */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoriesDropdownOpen(!categoriesDropdownOpen);
                }}
              >
                <ListFilter size={15} />
                <span>All Categories</span>
                <ChevronDown size={14} style={{
                  transform: categoriesDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform var(--transition-fast)'
                }} />
              </div>

              {/* Dropdown Menu */}
              {categoriesDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '8px',
                    width: '240px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                    zIndex: 1000,
                    padding: '0.5rem 0',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeIn var(--transition-fast) ease-out'
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {categories.filter(c => c.name !== 'Flyers').map((cat) => {
                    const hasSub = cat.subcategories && cat.subcategories.length > 0;
                    const isHovered = hoveredCategory?._id === cat._id;
                    return (
                      <div
                        key={cat._id}
                        onMouseEnter={() => setHoveredCategory(cat)}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.7rem 1.25rem',
                          color: isHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
                          backgroundColor: isHovered ? 'var(--bg-primary)' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          transition: 'all 0.15s ease'
                        }}
                        onClick={() => {
                          setCategoriesDropdownOpen(false);
                          setHoveredCategory(null);
                          navigate(`/?category=${encodeURIComponent(cat.name)}`);
                          setTimeout(() => {
                            const element = document.getElementById('shop-catalog');
                            element?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }}
                      >
                        <span>{cat.name}</span>
                        {hasSub && (
                          <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>&gt;</span>
                        )}

                        {/* Flyout for Subcategories */}
                        {isHovered && hasSub && (
                          <div 
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: '100%',
                              width: '220px',
                              backgroundColor: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              boxShadow: '10px 10px 30px rgba(0, 0, 0, 0.25)',
                              zIndex: 1010,
                              padding: '0.5rem 0',
                              display: 'flex',
                              flexDirection: 'column',
                              marginLeft: '4px',
                              animation: 'fadeIn var(--transition-fast) ease-out'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {cat.subcategories.map((sub, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '0.7rem 1.25rem',
                                  color: 'var(--text-secondary)',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: 500,
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = 'var(--text-primary)';
                                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = 'var(--text-secondary)';
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                onClick={() => {
                                  setCategoriesDropdownOpen(false);
                                  setHoveredCategory(null);
                                  navigate(`/?category=${encodeURIComponent(cat.name)}&subcategory=${encodeURIComponent(sub)}`);
                                  setTimeout(() => {
                                    const element = document.getElementById('shop-catalog');
                                    element?.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                }}
                              >
                                {sub}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Menu Links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: '100%' }} className="nav-desktop">
              <Link to="/" style={{ 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: location.pathname === '/' ? 'var(--accent)' : '#a1a1aa',
                transition: 'color var(--transition-fast)'
              }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = location.pathname === '/' ? 'var(--accent)' : '#a1a1aa'}
              >
                Shop Home
              </Link>
              
              <Link to="/projects" style={{ 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: location.pathname === '/projects' ? 'var(--accent)' : '#a1a1aa',
                transition: 'color var(--transition-fast)'
              }}
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = location.pathname === '/projects' ? 'var(--accent)' : '#a1a1aa'}
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
                  color: '#a1a1aa',
                  fontWeight: 600,
                  transition: 'color var(--transition-fast)'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
                >
                  <User size={16} color="var(--accent)" />
                  <span>{user?.name.split(' ')[0]}</span>
                </Link>
                <button 
                  onClick={logout} 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: 'rgba(255, 255, 255, 0.55)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                    transition: 'color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)'}
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
                color: '#a1a1aa',
                fontWeight: 600,
                transition: 'color var(--transition-fast)'
              }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
              >
                <User size={16} />
                <span>Login / Register</span>
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.45rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a1a1aa',
                transition: 'color var(--transition-fast), background-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#a1a1aa';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Vertically split separator */}
            <div style={{ width: '1px', height: '20px', backgroundColor: '#27272a' }} />

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
                  <span 
                    key={cartTotalCount}
                    className="animate-pop"
                    style={{
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
                  LKR {cartSubtotal.toLocaleString()}
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
          <form 
            ref={mobileSearchRef}
            onSubmit={handleSearchSubmit} 
            style={{ position: 'relative', width: '100%' }}
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery || ''}
              onChange={handleSearchChangeInternal}
              onFocus={() => {
                loadProductsForSuggestions();
                setShowMobileSuggestions(true);
              }}
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

            {/* Mobile Suggestions Dropdown */}
            {showMobileSuggestions && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '100%',
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(20, 20, 22, 0.96)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 1100,
                  marginTop: '6px',
                  padding: '0.75rem',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  textAlign: 'left',
                  maxHeight: '320px',
                  overflowY: 'auto'
                }}
              >
                {trimmedQuery === '' ? (
                  <>
                    <div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                        Popular Search Tags
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {matchedTags.map(tag => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              handleTagClick(tag);
                              setMobileMenuOpen(false);
                            }}
                            style={{
                              padding: '0.25rem 0.55rem',
                              backgroundColor: theme === 'light' ? '#f4f4f5' : '#1c1c1f',
                              border: '1px solid var(--border-color)',
                              borderRadius: '20px',
                              color: 'var(--text-secondary)',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <Tag size={8} color="var(--accent)" />
                            <span>{tag}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                        Popular Categories
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                        {categories.filter(c => c.name !== 'Flyers').slice(0, 4).map(cat => (
                          <div
                            key={cat._id}
                            onClick={() => {
                              handleCategoryClick(cat.name);
                              setMobileMenuOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.4rem 0.65rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: 'var(--text-secondary)',
                              fontSize: '0.75rem'
                            }}
                          >
                            <span>{cat.name}</span>
                            <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Browse →</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {matchedTags.length === 0 && matchedProducts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600 }}>No suggestions found for "{trimmedQuery}"</p>
                      </div>
                    ) : (
                      <>
                        {matchedTags.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                              Suggested Keywords
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {matchedTags.map(tag => (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => {
                                    handleTagClick(tag);
                                    setMobileMenuOpen(false);
                                  }}
                                  style={{
                                    padding: '0.25rem 0.55rem',
                                    backgroundColor: theme === 'light' ? '#f4f4f5' : '#1c1c1f',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '20px',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.2,rem'
                                  }}
                                >
                                  <Tag size={8} color="var(--accent)" />
                                  <span>{tag}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {matchedProducts.length > 0 && (
                          <div style={{ borderTop: matchedTags.length > 0 ? '1px solid var(--border-color)' : 'none', paddingTop: matchedTags.length > 0 ? '0.6rem' : 0 }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                              Suggested Products
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                              {matchedProducts.map(prod => (
                                <div
                                  key={prod._id}
                                  onClick={() => {
                                    handleProductClick(prod._id);
                                    setMobileMenuOpen(false);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    padding: '0.4rem 0.6rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <img
                                    src={prod.images && prod.images.length > 0 ? prod.images[0] : '/placeholder-product.png'}
                                    alt={prod.name}
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      objectFit: 'cover',
                                      borderRadius: '4px',
                                      border: '1px solid var(--border-color)',
                                      backgroundColor: '#0d0d0f'
                                    }}
                                  />
                                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden', textAlign: 'left' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {prod.name}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                      {prod.category}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-numbers)', whiteSpace: 'nowrap' }}>
                                    LKR {prod.price.toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
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
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Main Category</label>
                  <select 
                    value={productForm.category} 
                    onChange={(e) => {
                      const selectedCat = e.target.value;
                      const catObj = categories.find(c => c.name === selectedCat);
                      setProductForm(p => ({ 
                        ...p, 
                        category: selectedCat, 
                        subcategory: catObj?.subcategories[0] || '' 
                      }));
                    }}
                    style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subcategory</label>
                  <select 
                    value={productForm.subcategory} 
                    onChange={(e) => setProductForm(p => ({ ...p, subcategory: e.target.value }))}
                    style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="">-- None --</option>
                    {categories.find(c => c.name === productForm.category)?.subcategories.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="allowKoko"
                  checked={productForm.allowKoko} 
                  onChange={(e) => setProductForm(p => ({ ...p, allowKoko: e.target.checked }))}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                <label htmlFor="allowKoko" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Allow Koko split payments</label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="isPremium"
                    checked={productForm.isPremium} 
                    onChange={(e) => setProductForm(p => ({ ...p, isPremium: e.target.checked }))}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="isPremium" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Premium Product (Showcase)</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="isHotOffer"
                    checked={productForm.isHotOffer} 
                    onChange={(e) => setProductForm(p => ({ ...p, isHotOffer: e.target.checked }))}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="isHotOffer" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Hot Deals / Offers</label>
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
