import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Edit, Search, ShieldCheck } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function ProductCard({ product, onEdit }) {
  const { addToCart, setIsCartOpen } = useContext(CartContext);
  const { token, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleDeleteProduct = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete this product: "${product.name}"?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/products/${product._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        alert('Product deleted successfully!');
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to delete product');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(product);
  };

  // Find max modifier to construct Alibaba-style price ranges
  let maxModifier = 0;
  product.selections?.forEach(sel => {
    sel.values?.forEach(val => {
      if (val.priceModifier > maxModifier) {
        maxModifier = val.priceModifier;
      }
    });
  });

  const formattedBasePrice = product.price.toLocaleString();
  const formattedMaxPrice = (product.price + maxModifier).toLocaleString();
  const displayPrice = maxModifier > 0 
    ? `LKR ${formattedBasePrice} - ${formattedMaxPrice}` 
    : `LKR ${formattedBasePrice}`;

  const isOutOfStock = product.stock <= 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Default to first selection options if any exist
    const defaultOptions = {};
    product.selections?.forEach(sel => {
      if (sel.values && sel.values.length > 0) {
        defaultOptions[sel.name] = sel.values[0].value;
      }
    });

    addToCart(product, 1, defaultOptions);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Default to first selection options if any exist
    const defaultOptions = {};
    product.selections?.forEach(sel => {
      if (sel.values && sel.values.length > 0) {
        defaultOptions[sel.name] = sel.values[0].value;
      }
    });

    addToCart(product, 1, defaultOptions);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // Deterministic calculations based on product ID to simulate Alibaba wholesale metrics
  const baseNum = parseInt(product._id.toString().slice(-4), 16) || 123;
  const reorderRate = (baseNum % 25) + 15; // 15% - 39%
  const unitsSold = (baseNum % 1400) + 12; // 12 - 1411 sold
  const yrs = (baseNum % 8) + 2; // 2 - 9 years
  
  let moq = '1 piece';
  if (product.category?.toLowerCase().includes('cctv') || product.category?.toLowerCase().includes('security')) {
    moq = '1 set';
  } else if (product.category?.toLowerCase().includes('services') || product.category?.toLowerCase().includes('site')) {
    moq = '1 project';
  } else if (product.category?.toLowerCase().includes('accessories') || product.category?.toLowerCase().includes('gadgets')) {
    moq = '2 pieces';
  }

  return (
    <div 
      className="product-card" 
      onClick={() => navigate(`/product/${product._id}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }}
    >
      {/* Product Image Wrapper */}
      <Link 
        to={`/product/${product._id}`} 
        onClick={(e) => e.stopPropagation()} 
        className="product-card-img-wrapper" 
        style={{ display: 'block', position: 'relative' }}
      >
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'} 
          alt={product.name} 
          className="product-card-img"
          loading="lazy"
        />
        
        {/* Search/Eye floating badge at bottom-left */}
        <div 
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-card, #ffffff)',
            border: '1px solid var(--border-color, #e4e4e7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary, #18181b)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            zIndex: 12,
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/product/${product._id}`);
          }}
          title="View Details"
        >
          <Search size={13} strokeWidth={2.5} />
        </div>

        {/* Stock Badge Overlay */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
          {isOutOfStock ? (
            <span className="badge badge-danger" style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}>Out of Stock</span>
          ) : (
            <span className="badge badge-success" style={{ fontSize: '0.65rem', padding: '0.2rem 0.4rem' }}>In Stock</span>
          )}
        </div>

        {/* Floating Admin Actions */}
        {isAdmin && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 10 }}>
            {onEdit && (
              <button
                onClick={handleEditClick}
                style={{
                  backgroundColor: 'rgba(0, 125, 250, 0.95)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                title="Edit Product"
              >
                <Edit size={13} />
              </button>
            )}
            <button
              onClick={handleDeleteProduct}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Delete Product"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </Link>

      {/* Product Details (Alibaba Style) */}
      <div className="product-card-content" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
        
        <div>
          {/* Category Label */}
          <span className="product-card-category" style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--accent)',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '0.15rem'
          }}>
            {product.category}
          </span>

          {/* Product Name (2 Lines limit) */}
          <h3 className="product-card-title" style={{
            fontSize: '0.825rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            margin: '0.25rem 0 0.35rem 0',
            height: '2.4rem',
            lineHeight: '1.2rem',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            wordBreak: 'break-word',
            whiteSpace: 'normal'
          }} title={product.name}>
            <Link 
              to={`/product/${product._id}`} 
              onClick={(e) => e.stopPropagation()} 
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {product.name}
            </Link>
          </h3>

          {/* Trust Rate Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.35rem' }}>
            {reorderRate % 2 === 0 ? (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> Reorder rate {reorderRate}%
              </span>
            ) : (
              <span style={{ fontSize: '0.7rem', color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.15rem', fontWeight: 500 }}>
                <span>⚡</span> Lower priced than similar
              </span>
            )}
          </div>

          {/* Price Range */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.2rem' }}>
            <span className="product-card-price font-numbers" style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: '1.2'
            }}>
              {displayPrice}
            </span>
          </div>

          {/* MOQ & Units Sold */}
          <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginBottom: '0.65rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span>MOQ: {moq}</span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ color: 'var(--text-secondary)' }}>{unitsSold} sold</span>
          </div>
        </div>

        <div>
          {/* Verified Badge and Year / Origin */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', fontSize: '0.7rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ color: '#007DFA', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                <ShieldCheck size={11} fill="rgba(0, 125, 250, 0.15)" /> Verified
              </span>
              <span style={{ color: 'var(--text-muted)' }}>·</span>
              <span style={{ color: 'var(--text-secondary)' }}>{yrs} yrs · LK</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.65rem' }}>
            {isOutOfStock ? (
              <button 
                className="btn btn-secondary btn-sm" 
                disabled 
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 600, borderRadius: '4px' }}
              >
                Out of Stock
              </button>
            ) : (
              <>
                <button 
                  onClick={handleQuickAdd} 
                  className="btn btn-secondary btn-sm"
                  style={{ 
                    flex: 1.1, 
                    padding: '0.45rem 0.2rem', 
                    fontSize: '0.7rem', 
                    textTransform: 'uppercase', 
                    fontWeight: 600, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.2rem',
                    borderRadius: '4px',
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-primary)'
                  }}
                  title="Add to Cart"
                >
                  <ShoppingCart size={11} />
                  <span>Add</span>
                </button>
                <button 
                  onClick={handleBuyNow} 
                  className="btn btn-primary btn-sm"
                  style={{ 
                    flex: 1, 
                    padding: '0.45rem 0.2rem', 
                    fontSize: '0.7rem', 
                    textTransform: 'uppercase', 
                    fontWeight: 700, 
                    borderRadius: '4px',
                    boxShadow: 'none'
                  }}
                  title="Buy Now"
                >
                  Buy Now
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
