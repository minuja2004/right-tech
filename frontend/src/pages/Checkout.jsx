import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, ShoppingBag, Truck, MapPin, BadgePercent, ShieldCheck } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Checkout() {
  const { cartItems, cartSubtotal, clearCart } = useContext(CartContext);
  const { token, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  
  // Card details (mocked)
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCardChange = (e) => {
    setCardData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);
    setError(null);

    // Structure checkout payload
    const orderItems = cartItems.map((item) => ({
      product: item.product,
      name: item.name,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions,
      price: item.price
    }));

    const payload = {
      items: orderItems,
      shippingDetails: formData,
      paymentMethod
    };

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Checkout failed');
      }

      // Successful order creation
      clearCart();
      
      // Redirect to dashboard or order success page
      if (isAuthenticated) {
        navigate('/dashboard', { state: { newOrder: data.data } });
      } else {
        // Redirect to a public summary page (we can mock this or redirect to home with success message)
        navigate('/dashboard', { state: { newOrder: data.data, guestCheckout: true } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h2>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
          Add products to your shopping cart before attempting checkout.
        </p>
        <Link to="/" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const kokoInstallment = cartSubtotal / 3;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '2rem' }}>
        Secure Checkout
      </h1>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--danger)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }} className="checkout-container">
        
        {/* Form and Payment Details Panel */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Shipping Address */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              <Truck size={18} color="var(--accent)" />
              <span>Shipping Information</span>
            </h3>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="e.g. 0771234567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <input
                type="text"
                name="address"
                required
                placeholder="e.g. 123 Galle Road"
                value={formData.address}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                required
                placeholder="e.g. Colombo"
                value={formData.city}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              <CreditCard size={18} color="var(--accent)" />
              <span>Select Payment Method</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Cash on Delivery', 'Store Pickup', 'Card Payment', 'Koko BNPL'].map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <label
                    key={method}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--accent-light)' : 'rgba(255,255,255,0.01)',
                      cursor: 'pointer',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method}
                        checked={isSelected}
                        onChange={() => setPaymentMethod(method)}
                        style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{method}</span>
                    </div>

                    {/* Branded elements for gateways */}
                    {method === 'Koko BNPL' && (
                      <img src="/koko-logo.png" alt="Koko" className="koko-logo" style={{ height: '18px' }} />
                    )}
                    {method === 'Card Payment' && (
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {/* Visa Card Badge */}
                        <div style={{ 
                          height: '20px', 
                          width: '32px', 
                          backgroundColor: '#ffffff', 
                          borderRadius: '3px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          padding: '1.5px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                        }}>
                          <img src="/visa-logo.png" alt="Visa" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
                        </div>
                        {/* MasterCard Card Badge */}
                        <div style={{ 
                          height: '20px', 
                          width: '32px', 
                          backgroundColor: '#ffffff', 
                          borderRadius: '3px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          padding: '1.5px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                        }}>
                          <img src="/mastercard-logo.jpg" alt="MasterCard" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
                        </div>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Custom Payment Details Fields */}
            {paymentMethod === 'Card Payment' && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                border: '1px dashed var(--border-color)',
                borderRadius: '8px',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    placeholder="0000 0000 0000 0000"
                    value={cardData.cardNumber}
                    onChange={handleCardChange}
                    className="form-input"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Expiration Date</label>
                    <input
                      type="text"
                      name="expiry"
                      required
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={handleCardChange}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV / CVN</label>
                    <input
                      type="text"
                      name="cvv"
                      required
                      placeholder="3 Digits"
                      value={cardData.cvv}
                      onChange={handleCardChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'Koko BNPL' && (
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                backgroundColor: 'rgba(0, 210, 196, 0.05)',
                border: '1.5px solid var(--koko-teal)',
                borderRadius: '8px',
                animation: 'fadeIn 0.2s ease-out',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <h4 style={{ color: 'var(--koko-teal)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span>Koko Installment Breakdown</span>
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Pay 1/3 today and the rest in 2 interest-free monthly payments.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.25rem', textAlign: 'center' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: '#141416', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>1st Payment</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700 }} className="font-numbers">LKR {Math.round(kokoInstallment).toLocaleString()}</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--koko-teal)', fontWeight: 600 }}>TODAY</p>
                  </div>
                  <div style={{ padding: '0.5rem', backgroundColor: '#141416', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>2nd Payment</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700 }} className="font-numbers">LKR {Math.round(kokoInstallment).toLocaleString()}</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>In 30 Days</p>
                  </div>
                  <div style={{ padding: '0.5rem', backgroundColor: '#141416', borderRadius: '4px' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>3rd Payment</p>
                    <p style={{ fontSize: '0.8rem', fontWeight: 700 }} className="font-numbers">LKR {Math.round(kokoInstallment).toLocaleString()}</p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>In 60 Days</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '1rem', fontSize: '1rem', textTransform: 'uppercase' }}
          >
            {loading ? 'Processing Order...' : `Complete Order • LKR ${cartSubtotal.toLocaleString()}`}
          </button>

        </form>

        {/* Order Items Preview Panel */}
        <div>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            position: 'sticky',
            top: '100px'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <ShoppingBag size={18} color="var(--accent)" />
              <span>Order Summary</span>
            </h3>

            {/* List items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', marginBottom: '1.5rem' }}>
              {cartItems.map((item) => (
                <div key={item.cartItemId} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <img src={item.image} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} />
                  <div style={{ flexGrow: 1 }}>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</h5>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      Qty: {item.quantity} • {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </p>
                  </div>
                  <span className="font-numbers" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    LKR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                <span className="font-numbers">LKR {cartSubtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>Grand Total</span>
                <span className="font-numbers" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--accent)' }}>
                  LKR {cartSubtotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* SSL checkout badge details */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.65rem',
              marginTop: '1.5rem',
              backgroundColor: 'rgba(255,255,255,0.01)',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)'
            }}>
              <ShieldCheck size={14} color="var(--success)" />
              <span>128-bit SSL encrypted connection secure checkout</span>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .checkout-container {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 480px) {
          .form-row {
            grid-template-columns: 1fr !important;
            gap: 0 !important;
          }
        }
      `}</style>
      
    </div>
  );
}
