import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, Search, Laptop, Printer, Camera, Wrench, ShieldCheck, Trash2, Edit, X, CloudUpload, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Home({ searchQuery, onSearchChange }) {
  const { token, isAdmin } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [flyers, setFlyers] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';
  const activeSubcategory = searchParams.get('subcategory') || 'All';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Advanced Shop Filters & Sort states
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Filter and sort products locally in memory for instant responsiveness
  const displayedProducts = React.useMemo(() => {
    let result = [...products];

    // Filter by Price
    if (minPrice !== '') {
      const minVal = parseFloat(minPrice);
      if (!isNaN(minVal)) {
        result = result.filter(p => p.price >= minVal);
      }
    }
    if (maxPrice !== '') {
      const maxVal = parseFloat(maxPrice);
      if (!isNaN(maxVal)) {
        result = result.filter(p => p.price <= maxVal);
      }
    }

    // Filter by Stock Availability
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    return result;
  }, [products, sortBy, minPrice, maxPrice, inStockOnly]);

  const premiumProducts = React.useMemo(() => {
    return displayedProducts.filter(p => p.isPremium);
  }, [displayedProducts]);

  const newlyAddedProducts = React.useMemo(() => {
    return [...displayedProducts]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  }, [displayedProducts]);

  const hotOffersProducts = React.useMemo(() => {
    return displayedProducts.filter(p => p.isHotOffer);
  }, [displayedProducts]);

  const cctvProducts = React.useMemo(() => {
    return displayedProducts.filter(p => {
      const catLower = p.category?.toLowerCase() || '';
      const subLower = p.subcategory?.toLowerCase() || '';
      return catLower.includes('cctv') || subLower.includes('cctv');
    });
  }, [displayedProducts]);

  const isShowcaseMode = 
    activeCategory === 'All' && 
    activeSubcategory === 'All' && 
    !searchQuery && 
    minPrice === '' && 
    maxPrice === '' && 
    !inStockOnly && 
    sortBy === 'default';

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + flyers.length) % flyers.length);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % flyers.length);
  };

  // Autoplay slider interval (4.5s)
  useEffect(() => {
    if (flyers.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % flyers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [flyers, isHovered]);

  // Handle out of bounds safety index check
  useEffect(() => {
    if (currentSlide >= flyers.length && flyers.length > 0) {
      setCurrentSlide(flyers.length - 1);
    }
  }, [flyers, currentSlide]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingFlyer, setEditingFlyer] = useState(null);

  const [productEditForm, setProductEditForm] = useState({
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

  const [flyerEditForm, setFlyerEditForm] = useState({
    name: '',
    images: []
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleStartEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductEditForm({
      name: prod.name,
      category: prod.category,
      subcategory: prod.subcategory || '',
      price: prod.price,
      description: prod.description,
      stock: prod.stock,
      allowKoko: prod.allowKoko,
      isPremium: prod.isPremium || false,
      isHotOffer: prod.isHotOffer || false,
      images: prod.images || []
    });
  };

  const handleStartEditFlyer = (flyer) => {
    setEditingFlyer(flyer);
    setFlyerEditForm({
      name: flyer.name,
      images: flyer.images || []
    });
  };

  const handleFileUpload = async (e, formType) => {
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
        if (formType === 'product') {
          setProductEditForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
        } else if (formType === 'flyer') {
          setFlyerEditForm((prev) => ({ ...prev, images: [data.url] }));
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

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productEditForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Product updated successfully!');
        setEditingProduct(null);
        fetchProducts(activeCategory, searchQuery, activeSubcategory);
      } else {
        throw new Error(data.message || 'Failed to update product');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditFlyerSubmit = async (e) => {
    e.preventDefault();
    if (flyerEditForm.images.length === 0) {
      alert('Please upload an image for the flyer first.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/products/${editingFlyer._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: flyerEditForm.name,
          category: 'Flyers',
          price: 0,
          description: 'Flyer banner',
          stock: 100,
          allowKoko: false,
          images: flyerEditForm.images
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Flyer updated successfully!');
        setEditingFlyer(null);
        fetchFlyers();
      } else {
        throw new Error(data.message || 'Failed to update flyer');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchFlyers = async () => {
    try {
      const response = await fetch(`${API_URL}/products?category=Flyers`);
      const data = await response.json();
      if (data.success) {
        setFlyers(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch flyers:', err.message);
    }
  };

  const fetchProducts = async (category, search, subcategory) => {
    setLoading(true);
    try {
      let queryStr = '';
      const params = [];
      if (category && category !== 'All') {
        params.push(`category=${encodeURIComponent(category)}`);
      }
      if (subcategory && subcategory !== 'All') {
        params.push(`subcategory=${encodeURIComponent(subcategory)}`);
      }
      if (search) {
        params.push(`search=${encodeURIComponent(search)}`);
      }
      if (params.length > 0) {
        queryStr = `?${params.join('&')}`;
      }

      const response = await fetch(`${API_URL}/products${queryStr}`);
      const data = await response.json();
      if (data.success) {
        // Filter out flyers from the main products catalog
        const filtered = data.data.filter(p => p.category !== 'Flyers');
        setProducts(filtered);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlyer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this flyer?')) return;
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFlyers(prev => prev.filter(f => f._id !== id));
      } else {
        throw new Error(data.message || 'Failed to delete flyer');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Fetch flyers and categories on mount
  useEffect(() => {
    fetchFlyers();
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          setDbCategories(data.data);
        }
      } catch (err) {
        console.error('Error fetching categories in Home:', err);
      }
    };
    fetchCategories();
  }, []);

  // Trigger fetch when category, subcategory or search changes
  useEffect(() => {
    fetchProducts(activeCategory, searchQuery, activeSubcategory);
  }, [activeCategory, searchQuery, activeSubcategory]);

  return (
    <div className="animate-fade-in">
      
      {/* Flyers Slider Section (Top Banner Carousel Showcase) */}
      {flyers && flyers.length > 0 && (
        <section style={{ marginTop: '2rem', marginBottom: '2rem' }}>
          <div className="container">
            <div 
              style={{
                position: 'relative',
                width: '100%',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                overflow: 'hidden'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flyer-slider"
            >
              {/* Slides */}
              {flyers.map((flyer, index) => {
                const isActive = index === currentSlide;
                return (
                  <div
                    key={flyer._id}
                    className={`flyer-slider-slide ${isActive ? 'active' : ''}`}
                  >
                    {/* Admin Actions Overlay on Current Flyer */}
                    {isAdmin && isActive && (
                      <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 20 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditFlyer(flyer);
                          }}
                          style={{
                            backgroundColor: 'rgba(0, 130, 200, 0.95)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          title="Edit Flyer"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFlyer(flyer._id);
                          }}
                          style={{
                            backgroundColor: 'rgba(239, 68, 68, 0.95)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          title="Delete Flyer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    {flyer.images && flyer.images.length > 0 ? (
                      <img 
                        src={flyer.images[0]} 
                        alt={flyer.name} 
                        className="flyer-slider-img"
                      />
                    ) : (
                      <div style={{ color: 'var(--text-muted)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                        No Image Available
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Navigation Arrows (Only if more than 1 flyer) */}
              {flyers.length > 1 && (
                <>
                  <button
                    onClick={handlePrevSlide}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '20px',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      backgroundColor: 'rgba(20, 20, 22, 0.65)',
                      border: '1px solid var(--border-color)',
                      color: '#ffffff',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                    className="slider-arrow-btn"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(20, 20, 22, 0.65)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextSlide}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      right: '20px',
                      transform: 'translateY(-50%)',
                      zIndex: 10,
                      backgroundColor: 'rgba(20, 20, 22, 0.65)',
                      border: '1px solid var(--border-color)',
                      color: '#ffffff',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                    className="slider-arrow-btn"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent)';
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(20, 20, 22, 0.65)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Dot Indicators */}
              {flyers.length > 1 && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10
                  }}
                >
                  {flyers.map((_, index) => {
                    const isActive = index === currentSlide;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        style={{
                          width: isActive ? '24px' : '8px',
                          height: '8px',
                          borderRadius: '4px',
                          backgroundColor: isActive ? 'var(--accent)' : 'rgba(255, 255, 255, 0.4)',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          padding: 0
                        }}
                        title={`Go to slide ${index + 1}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Shop Section */}
      <section id="shop-catalog" className="container" style={{ scrollMarginTop: '100px' }}>
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.75rem', textTransform: 'uppercase', fontFamily: 'var(--font-heading)' }}>
              Catalog
            </h2>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: showFilters ? 'var(--accent)' : 'var(--text-secondary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                transition: 'all 0.2s',
                backgroundColor: showFilters ? 'var(--accent-light)' : 'transparent',
                fontWeight: 600
              }}
            >
              <SlidersHorizontal size={14} />
              <span>{showFilters ? 'Hide Filters' : 'Filter & Sort'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Panel */}
        {showFilters && (
          <div 
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              animation: 'fadeIn var(--transition-fast) ease-out'
            }}
          >
            {/* Sorting Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  padding: '0.55rem 0.75rem',
                  outline: 'none',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <option value="default">Default / Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            {/* Price Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Price Range (LKR)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    padding: '0.55rem 0.75rem',
                    outline: 'none',
                    fontSize: '0.85rem',
                    width: '100%'
                  }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    padding: '0.55rem 0.75rem',
                    outline: 'none',
                    fontSize: '0.85rem',
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* In Stock Toggle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Availability
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                In Stock Only
              </label>
            </div>

            {/* Clear Button */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setSortBy('default');
                  setMinPrice('');
                  setMaxPrice('');
                  setInStockOnly(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Active Category/Subcategory Filter Banner */}
        {((activeCategory && activeCategory !== 'All') || (activeSubcategory && activeSubcategory !== 'All')) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--accent-light, rgba(0, 125, 250, 0.1))',
            border: '1px solid var(--accent, #007DFA)',
            color: 'var(--text-primary)',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            marginTop: '-0.5rem',
            fontSize: '0.9rem',
            animation: 'fadeIn var(--transition-fast) ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>Filtered by:</span>
              <strong style={{ color: 'var(--accent)' }}>{activeCategory}</strong>
              {activeSubcategory && activeSubcategory !== 'All' && (
                <>
                  <span style={{ color: 'var(--text-muted)' }}>&gt;</span>
                  <strong style={{ color: 'var(--accent)' }}>{activeSubcategory}</strong>
                </>
              )}
            </div>
            <button
              onClick={() => setSearchParams({})}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(0, 125, 250, 0.15)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Clear Category Filter
            </button>
          </div>
        )}

        {/* Real-time search/filter count indicator */}
        {(searchQuery || minPrice !== '' || maxPrice !== '' || inStockOnly || sortBy !== 'default') && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
            Showing {displayedProducts.length} of {products.length} product(s) 
            {searchQuery && <> for "<span style={{ color: 'var(--accent)' }}>{searchQuery}</span>"</>}
            {(minPrice !== '' || maxPrice !== '' || inStockOnly || sortBy !== 'default') && <span style={{ color: 'var(--text-muted)' }}> (filtered)</span>}
          </p>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '5rem 0'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--bg-secondary)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            margin: '2rem 0'
          }}>
            <p>Error loading products: {error}</p>
            <button onClick={() => fetchProducts(activeCategory, searchQuery)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 0',
            color: 'var(--text-secondary)'
          }}>
            <Cpu size={48} strokeWidth={1} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <h3>No products found</h3>
            <p style={{ fontSize: '0.85rem' }}>We couldn't find any items matching your active selection or filters.</p>
          </div>
        ) : isShowcaseMode ? (
          /* Showcase Rows Mode */
          <div>
            {/* 1. Hot Deals & Offers Showcase */}
            {hotOffersProducts.length > 0 && (
              <div style={{ marginBottom: '3.5rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                  borderLeft: '4px solid var(--accent)',
                  paddingLeft: '0.75rem',
                  letterSpacing: '0.03em',
                  color: 'var(--text-primary)'
                }}>
                  Hot Deals & Offers
                </h3>
                <div className="product-grid">
                  {hotOffersProducts.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      onEdit={isAdmin ? handleStartEditProduct : null} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Premium Products Showcase */}
            {premiumProducts.length > 0 && (
              <div style={{ marginBottom: '3.5rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                  borderLeft: '4px solid var(--accent)',
                  paddingLeft: '0.75rem',
                  letterSpacing: '0.03em',
                  color: 'var(--text-primary)'
                }}>
                  Premium Tech Line
                </h3>
                <div className="product-grid">
                  {premiumProducts.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      onEdit={isAdmin ? handleStartEditProduct : null} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Newly Arrived Products Showcase */}
            {newlyAddedProducts.length > 0 && (
              <div style={{ marginBottom: '3.5rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                  borderLeft: '4px solid var(--accent)',
                  paddingLeft: '0.75rem',
                  letterSpacing: '0.03em',
                  color: 'var(--text-primary)'
                }}>
                  Newly Arrived Tech
                </h3>
                <div className="product-grid">
                  {newlyAddedProducts.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      onEdit={isAdmin ? handleStartEditProduct : null} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 4. CCTV & Smart Security Showcase */}
            {cctvProducts.length > 0 && (
              <div style={{ marginBottom: '3.5rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '1.25rem',
                  borderLeft: '4px solid var(--accent)',
                  paddingLeft: '0.75rem',
                  letterSpacing: '0.03em',
                  color: 'var(--text-primary)'
                }}>
                  CCTV & Smart Security Solutions
                </h3>
                <div className="product-grid">
                  {cctvProducts.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      onEdit={isAdmin ? handleStartEditProduct : null} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 5. General Catalog Explore Grid */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
                borderLeft: '4px solid var(--accent)',
                paddingLeft: '0.75rem',
                letterSpacing: '0.03em',
                color: 'var(--text-primary)'
              }}>
                Explore Entire Catalog
              </h3>
              <div className="product-grid">
                {displayedProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    onEdit={isAdmin ? handleStartEditProduct : null} 
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Search/Filters Grid Fallback */
          <div className="product-grid">
            {displayedProducts.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onEdit={isAdmin ? handleStartEditProduct : null} 
              />
            ))}
          </div>
        )}

      </section>

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
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
          }}>
            <button 
              onClick={() => setEditingProduct(null)}
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
              Edit Product
            </h3>
            
            <form onSubmit={handleEditProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name</label>
                <input 
                  type="text" 
                  required 
                  value={productEditForm.name} 
                  onChange={(e) => setProductEditForm(p => ({ ...p, name: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                  <select 
                    value={productEditForm.category} 
                    onChange={(e) => {
                      const selectedCat = e.target.value;
                      const catObj = dbCategories.find(c => c.name === selectedCat);
                      setProductEditForm(p => ({ 
                        ...p, 
                        category: selectedCat,
                        subcategory: catObj?.subcategories[0] || ''
                      }));
                    }}
                    style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                  >
                    {dbCategories.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Subcategory</label>
                  <select 
                    value={productEditForm.subcategory} 
                    onChange={(e) => setProductEditForm(p => ({ ...p, subcategory: e.target.value }))}
                    style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="">No Subcategory</option>
                    {dbCategories.find(c => c.name === productEditForm.category)?.subcategories.map((sub, idx) => (
                      <option key={idx} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Price (LKR)</label>
                  <input 
                    type="number" 
                    required 
                    value={productEditForm.price} 
                    onChange={(e) => setProductEditForm(p => ({ ...p, price: e.target.value }))}
                    style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Stock Qty</label>
                  <input 
                    type="number" 
                    required 
                    value={productEditForm.stock} 
                    onChange={(e) => setProductEditForm(p => ({ ...p, stock: e.target.value }))}
                    style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  id="editAllowKoko"
                  checked={productEditForm.allowKoko} 
                  onChange={(e) => setProductEditForm(p => ({ ...p, allowKoko: e.target.checked }))}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                />
                <label htmlFor="editAllowKoko" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  Allow Koko Installments
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="editIsPremium"
                    checked={productEditForm.isPremium} 
                    onChange={(e) => setProductEditForm(p => ({ ...p, isPremium: e.target.checked }))}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="editIsPremium" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Premium Product (Showcase)
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="editIsHotOffer"
                    checked={productEditForm.isHotOffer} 
                    onChange={(e) => setProductEditForm(p => ({ ...p, isHotOffer: e.target.checked }))}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--accent)' }}
                  />
                  <label htmlFor="editIsHotOffer" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Hot Deals / Offers
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Description</label>
                <textarea 
                  required 
                  rows={3}
                  value={productEditForm.description} 
                  onChange={(e) => setProductEditForm(p => ({ ...p, description: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {/* Images list & upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Images</label>
                
                {productEditForm.images && productEditForm.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {productEditForm.images.map((imgUrl, index) => (
                      <div key={index} style={{ position: 'relative', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={imgUrl} alt="product preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setProductEditForm(p => ({ ...p, images: p.images.filter((_, i) => i !== index) }))}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            color: '#ffffff',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{
                  border: '1px dashed var(--border-color)',
                  borderRadius: '6px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#141416',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <CloudUpload size={24} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {uploading ? 'Uploading...' : 'Upload new image'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'product')}
                    disabled={uploading}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                  />
                </div>
                {uploadError && <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>{uploadError}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '0.65rem' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FLYER MODAL */}
      {editingFlyer && (
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
          }}>
            <button 
              onClick={() => setEditingFlyer(null)}
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
              Edit Flyer Banner
            </h3>
            
            <form onSubmit={handleEditFlyerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Flyer Name / Label</label>
                <input 
                  type="text" 
                  required 
                  value={flyerEditForm.name} 
                  onChange={(e) => setFlyerEditForm(p => ({ ...p, name: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              {/* Image preview & upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Flyer Image</label>
                
                {flyerEditForm.images && flyerEditForm.images.length > 0 ? (
                  <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={flyerEditForm.images[0]} alt="flyer preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ height: '180px', borderRadius: '8px', border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    No Flyer Image Uploaded
                  </div>
                )}

                <div style={{
                  border: '1px dashed var(--border-color)',
                  borderRadius: '6px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#141416',
                  cursor: 'pointer',
                  position: 'relative',
                  marginTop: '0.5rem'
                }}>
                  <CloudUpload size={24} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {uploading ? 'Uploading...' : 'Replace flyer image'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'flyer')}
                    disabled={uploading}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                  />
                </div>
                {uploadError && <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>{uploadError}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingFlyer(null)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '0.65rem' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}




      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .feature-strip {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
            padding: 1rem !important;
          }
          h1 {
            font-size: 2.2rem !important;
          }
        }
        @media (max-width: 480px) {
          .feature-strip {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
