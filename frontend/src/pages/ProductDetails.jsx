import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Shield, Sparkles, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const API_URL = 'http://localhost:5000/api';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery and options state
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  // Fetch product detail
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
          setCalculatedPrice(data.data.price);
          
          // Set default selected options
          const defaults = {};
          data.data.selections?.forEach((sel) => {
            if (sel.values && sel.values.length > 0) {
              defaults[sel.name] = sel.values[0].value;
            }
          });
          setSelectedOptions(defaults);
        } else {
          throw new Error(data.message || 'Product not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Recalculate price whenever selectedOptions changes
  useEffect(() => {
    if (!product) return;

    let tempPrice = product.price;
    Object.entries(selectedOptions).forEach(([optName, optVal]) => {
      const selection = product.selections?.find(
        (s) => s.name.toLowerCase() === optName.toLowerCase()
      );
      if (selection) {
        const valObj = selection.values?.find(
          (v) => v.value.toLowerCase() === optVal.toLowerCase()
        );
        if (valObj) {
          tempPrice += valObj.priceModifier;
        }
      }
    });
    setCalculatedPrice(tempPrice);
  }, [selectedOptions, product]);

  const handleOptionChange = (optionName, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value
    }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedOptions);
  };

  const handlePrevImage = () => {
    if (!product || !product.images) return;
    setActiveImgIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product || !product.images) return;
    setActiveImgIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid var(--bg-secondary)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
          The supplement profile you are looking for does not exist or was removed.
        </p>
        <Link to="/" className="btn btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const kokoInstallment = calculatedPrice / 3;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Back Link */}
      <Link 
        to="/" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ChevronLeft size={16} />
        <span>Back to Catalog</span>
      </Link>

      <div className="product-details-grid">
        
        {/* Gallery / Image Carousel */}
        <div className="image-detail-gallery">
          <div className="main-image-viewport">
            <img 
              src={product.images?.[activeImgIndex] || 'https://via.placeholder.com/600'} 
              alt={product.name} 
              className="main-image-display"
            />

            {/* Carousel Navigation Arrows */}
            {product.images && product.images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '1rem',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={handleNextImage}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '1rem',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Gallery Thumbnails Strip */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  style={{
                    width: '75px',
                    height: '75px',
                    borderRadius: '8px',
                    border: activeImgIndex === idx ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                    padding: 0,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-secondary)',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content details side panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <span style={{
              color: 'var(--accent)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              letterSpacing: '0.1em'
            }}>
              {product.category}
            </span>
            <h1 style={{
              fontSize: '2.2rem',
              fontFamily: 'var(--font-heading)',
              lineHeight: '1.2',
              marginTop: '0.25rem',
              textTransform: 'uppercase'
            }}>
              {product.name}
            </h1>
            
            {/* Stock Badge indicator */}
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isOutOfStock ? (
                <span className="badge badge-danger">Out of Stock</span>
              ) : (
                <span className="badge badge-success">In Stock</span>
              )}
              {!isOutOfStock && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ({product.stock} items remaining)
                </span>
              )}
            </div>
          </div>

          {/* Pricing Row */}
          <div style={{
            padding: '1rem 0',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Price</span>
            <div className="font-numbers" style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: '1.1' }}>
              රු {calculatedPrice.toLocaleString()}
            </div>
            
            {/* Koko BNPL installment preview */}
            {product.allowKoko && (
              <div className="koko-bnpl-widget" style={{ maxWidth: '400px', margin: '0.75rem 0 0 0' }}>
                <span className="koko-logo">koko.</span>
                <div className="koko-text">
                  or 3 X <span className="font-numbers">රු {Math.round(kokoInstallment).toLocaleString()}</span> interest-free
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Product Summary
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {product.description}
            </p>
          </div>

          {/* Selections / Options Selectors */}
          {product.selections && product.selections.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {product.selections.map((sel) => (
                <div key={sel.name}>
                  <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Select {sel.name}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {sel.values?.map((val) => {
                      const isSelected = selectedOptions[sel.name] === val.value;
                      const modifierText = val.priceModifier > 0 
                        ? ` (+රු ${val.priceModifier.toLocaleString()})`
                        : '';
                      return (
                        <button
                          key={val.value}
                          onClick={() => handleOptionChange(sel.name, val.value)}
                          style={{
                            backgroundColor: isSelected ? 'var(--accent-light)' : 'var(--bg-secondary)',
                            border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                            color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            transition: 'border-color var(--transition-fast)'
                          }}
                        >
                          {isSelected && <Check size={14} color="var(--accent)" />}
                          <span>{val.value}{modifierText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity and Checkout Trigger */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
            
            {/* Quantity select */}
            {!isOutOfStock && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quantity</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="form-select"
                  style={{ minWidth: '80px', padding: '0.55rem' }}
                >
                  {Array.from({ length: Math.min(10, product.stock) }, (_, idx) => idx + 1).map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Add to Cart button */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <span style={{ height: '1.1rem' }}></span> {/* spacer */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <ShoppingCart size={18} />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
              </button>
            </div>

          </div>

          {/* Security details cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginTop: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem'
          }}>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <Shield size={20} color="var(--accent)" style={{ margin: '0 auto 0.25rem auto' }} />
              <p style={{ fontSize: '0.7rem', fontWeight: 600 }}>100% Genuine</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Direct imports</p>
            </div>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <Sparkles size={20} color="var(--accent)" style={{ margin: '0 auto 0.25rem auto' }} />
              <p style={{ fontSize: '0.7rem', fontWeight: 600 }}>Lab Tested</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Verified contents</p>
            </div>
            <div style={{ textAlign: 'center', padding: '0.5rem' }}>
              <RefreshCw size={20} color="var(--accent)" style={{ margin: '0 auto 0.25rem auto' }} />
              <p style={{ fontSize: '0.7rem', fontWeight: 600 }}>Easy Returns</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>7 day guarantee</p>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
    </div>
  );
}
