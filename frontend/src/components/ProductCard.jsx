import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart, Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const { token, isAdmin } = useContext(AuthContext);

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

  const hasModifiers = product.selections?.some(sel => 
    sel.values?.some(val => val.priceModifier > 0)
  );

  const displayPrice = hasModifiers 
    ? `From රු ${product.price.toLocaleString()}` 
    : `රු ${product.price.toLocaleString()}`;

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

  const hasSelectionsToChoose = product.selections && product.selections.length > 0;

  return (
    <div className="product-card">
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="product-card-img-wrapper">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'} 
          alt={product.name} 
          className="product-card-img"
          loading="lazy"
        />
        
        {/* Stock Badge Overlay */}
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10 }}>
          {isOutOfStock ? (
            <span className="badge badge-danger">Out of Stock</span>
          ) : (
            <span className="badge badge-success">In Stock</span>
          )}
        </div>
        {/* Floating Admin Delete Action */}
        {isAdmin && (
          <button
            onClick={handleDeleteProduct}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 10,
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
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
            <Trash2 size={16} />
          </button>
        )}
      </Link>

      {/* Product Details */}
      <div className="product-card-content">
        <span className="product-card-category">{product.category}</span>
        
        <h3 className="product-card-title" title={product.name}>
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>
        
        <p className="product-card-desc" title={product.description}>
          {product.description}
        </p>

        <div className="product-card-footer">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price</span>
            <span className="product-card-price font-numbers">{displayPrice}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <Link 
              to={`/product/${product._id}`} 
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.45rem', display: 'flex', alignItems: 'center' }}
              title="View details"
            >
              <Eye size={15} />
            </Link>

            {isOutOfStock ? (
              <button 
                className="btn btn-primary btn-sm" 
                disabled 
                style={{ padding: '0.45rem', display: 'flex', alignItems: 'center' }}
              >
                <ShoppingCart size={15} />
              </button>
            ) : hasSelectionsToChoose ? (
              <Link 
                to={`/product/${product._id}`} 
                className="btn btn-primary btn-sm"
                style={{ 
                  fontSize: '0.75rem', 
                  padding: '0.45rem 0.75rem', 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '0.25rem' 
                }}
              >
                <span>Select</span>
              </Link>
            ) : (
              <button 
                onClick={handleQuickAdd} 
                className="btn btn-primary btn-sm"
                style={{ padding: '0.45rem', display: 'flex', alignItems: 'center' }}
                title="Quick Add to Cart"
              >
                <ShoppingCart size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
