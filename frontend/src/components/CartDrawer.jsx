import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export default function CartDrawer() {
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    cartSubtotal 
  } = useContext(CartContext);

  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const kokoInstallment = cartSubtotal / 3;

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Panel */}
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} color="var(--accent)" />
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Your Cart</h2>
            <span style={{
              fontSize: '0.75rem',
              backgroundColor: '#1f1f23',
              color: 'var(--text-secondary)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontWeight: 600,
              fontFamily: 'var(--font-numbers)'
            }}>
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: '2rem 0'
            }}>
              <ShoppingBag size={48} strokeWidth={1} color="var(--text-muted)" />
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Your cart is empty</p>
                <p style={{ fontSize: '0.8rem' }}>Add some premium IT products or service packages to your cart!</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="btn btn-primary btn-sm"
                style={{ marginTop: '0.5rem' }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.cartItemId}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid #1a1a1e'
                }}
              >
                {/* Product Thumbnail */}
                <img 
                  src={item.image} 
                  alt={item.name} 
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#0d0d0f'
                  }}
                />

                {/* Product Details */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <h4 style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    lineHeight: '1.3',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere'
                  }}>
                    {item.name}
                  </h4>
                  
                  {/* Selected Options List */}
                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.1rem 0' }}>
                      {Object.entries(item.selectedOptions).map(([key, val]) => (
                        <span 
                          key={key} 
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: '#1b1b1f',
                            color: 'var(--text-secondary)',
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity and Price Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    {/* Quantity Selector */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.8rem', padding: '0 0.5rem', fontFamily: 'var(--font-numbers)', fontWeight: 600 }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price and Delete Button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="font-numbers" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '4px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: '#0d0d0f'
          }}>
            {/* Subtotal Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Subtotal</span>
              <span className="font-numbers" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                LKR {cartSubtotal.toLocaleString()}
              </span>
            </div>

            {/* Koko Installment Banner */}
            <div className="koko-bnpl-widget" style={{ padding: '0.65rem 0.85rem', margin: '0 0 1.25rem 0' }}>
              <img src="/koko-logo.png" alt="Koko" className="koko-logo" style={{ height: '15px' }} />
              <div className="koko-text" style={{ fontSize: '0.75rem' }}>
                or 3 X <span className="font-numbers">LKR {Math.round(kokoInstallment).toLocaleString()}</span> interest-free
              </div>
            </div>

            {/* Checkout Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                onClick={handleCheckoutClick} 
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
              >
                Proceed to Checkout
              </button>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
