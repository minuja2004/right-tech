import React, { useContext, useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { User, ClipboardList, Package, CreditCard, Clock, MapPin, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const { user, token, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State to track expanded order panels
  const [expandedOrders, setExpandedOrders] = useState({});

  // Checkout redirect status
  const newOrder = location.state?.newOrder;
  const isGuestCheckout = location.state?.guestCheckout;

  const fetchOrders = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated]);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'badge-success';
      case 'pending':
      case 'shipped':
      default:
        return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'delivered':
        return 'var(--success)';
      case 'pending':
        return 'var(--accent)';
      case 'shipped':
        return '#00b0ff';
      default:
        return 'var(--text-secondary)';
    }
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

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Order Success Banner */}
      {newOrder && (
        <div style={{
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1.5px solid var(--success)',
          color: '#fff',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          animation: 'fadeIn 0.4s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={22} color="var(--success)" />
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Order Placed Successfully!</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Thank you for shopping at Right Tech. Your order has been registered under ID: <strong style={{ color: '#fff' }}>{newOrder.orderId}</strong>. 
            We are preparing your package for shipment.
          </p>
          
          {isGuestCheckout && (
            <div style={{
              marginTop: '0.5rem',
              padding: '1rem',
              backgroundColor: 'rgba(240, 129, 25, 0.05)',
              border: '1px solid var(--accent)',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>Guest Checkout Account Alert</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                You placed this order as a guest. To track your orders and view your purchase history in the future, please create an account using the email: <strong>{newOrder.shippingDetails.email}</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '3rem' }} className="dashboard-grid">
        
        {/* Sidebar Info Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              border: '2px solid var(--accent)'
            }}>
              <User size={36} color="var(--accent)" />
            </div>

            {isAuthenticated ? (
              <>
                <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '0.25rem' }}>{user?.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{user?.email}</p>
                <span className="badge" style={{ backgroundColor: 'var(--accent)', color: '#fff', fontSize: '0.65rem' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Premium Member'}
                </span>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Guest Session</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Log in to persist your purchases history.</p>
                <Link to="/auth" className="btn btn-primary btn-sm" style={{ width: '100%' }}>Login / Register</Link>
              </>
            )}
          </div>
        </div>

        {/* Purchase History Panel */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ClipboardList size={22} color="var(--accent)" />
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>Purchase History</h2>
          </div>

          {!isAuthenticated ? (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <p style={{ marginBottom: '1rem' }}>Please log in to view your dashboard past purchases logs.</p>
              <Link to="/auth" className="btn btn-primary">Log In</Link>
            </div>
          ) : error ? (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              Failed to retrieve order history: {error}
            </div>
          ) : orders.length === 0 ? (
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '4rem 1.5rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Package size={40} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3>No Orders Found</h3>
              <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 1rem 0' }}>You haven't placed any orders yet.</p>
              <Link to="/" className="btn btn-primary btn-sm">Browse Products</Link>
            </div>
          ) : (
            /* Order History List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map((order) => {
                const isExpanded = !!expandedOrders[order.orderId];
                return (
                  <div 
                    key={order.orderId}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  >
                    
                    {/* Collapsible Order Header */}
                    <div 
                      onClick={() => toggleOrderExpand(order.orderId)}
                      style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order ID</p>
                          <p style={{ fontSize: '0.9rem', fontWeight: 700 }} className="font-numbers">{order.orderId}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Purchase Date</p>
                          <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Paid</p>
                          <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)' }} className="font-numbers">
                            LKR {order.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', border: `1px solid ${getStatusColor(order.paymentStatus)}`, color: getStatusColor(order.paymentStatus), padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                            {order.paymentStatus}
                          </span>
                          <span style={{ fontSize: '0.7rem', border: `1px solid ${getStatusColor(order.shippingStatus)}`, color: getStatusColor(order.shippingStatus), padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                            {order.shippingStatus}
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>

                    </div>

                    {/* Order Collapsed Details */}
                    {isExpanded && (
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.2s ease-out' }}>
                        
                        {/* Shipping and Payment info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="order-details-grid">
                          <div>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <MapPin size={13} /> Shipping Address
                            </h4>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.shippingDetails.fullName}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{order.shippingDetails.address}, {order.shippingDetails.city}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tel: {order.shippingDetails.phone}</p>
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <CreditCard size={13} /> Payment Details
                            </h4>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{order.paymentMethod}</p>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status: <span style={{ color: getStatusColor(order.paymentStatus), fontWeight: 600 }}>{order.paymentStatus}</span></p>
                          </div>
                        </div>

                        {/* Itemized list of products */}
                        <div>
                          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Package size={13} /> Itemized Product List
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                            {order.items.map((item, idx) => (
                              <div 
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.75rem 1rem',
                                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                                  borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid var(--border-color)'
                                }}
                              >
                                <div style={{ flexGrow: 1 }}>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.name}</span>
                                  {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                                      ({Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ')})
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Qty: {item.quantity}</span>
                                  <span className="font-numbers" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                    LKR {item.price.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .order-details-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>

    </div>
  );
}
