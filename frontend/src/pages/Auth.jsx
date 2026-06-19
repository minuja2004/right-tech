import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, UserCheck, Phone } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Auth() {
  const { login, register, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLoginTab) {
        await login(formData.email, formData.password);
        navigate('/');
      } else {
        // Strong password and phone validation checks
        if (!formData.phone.trim()) {
          throw new Error('Please enter a phone number');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (!/[A-Z]/.test(formData.password)) {
          throw new Error('Password must contain at least one capital letter');
        }
        if (!/[^A-Za-z0-9]/.test(formData.password)) {
          throw new Error('Password must contain at least one symbol (special character)');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        await register(formData.name, formData.email, formData.password, formData.phone);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (email, password) => {
    setFormData({
      name: isLoginTab ? '' : 'John Doe',
      email,
      password,
      confirmPassword: isLoginTab ? '' : password,
      phone: isLoginTab ? '' : '0771234567'
    });
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      
      <div style={{
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        
        {/* Auth Box Container */}
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle glowing highlight */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--accent) 0%, #ffc107 100%)'
          }} />

          {/* Form tab header toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '0.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <button
              onClick={() => { setIsLoginTab(true); setError(null); }}
              style={{
                backgroundColor: isLoginTab ? 'var(--accent)' : 'transparent',
                color: isLoginTab ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'background-color var(--transition-fast), color var(--transition-fast)'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLoginTab(false); setError(null); }}
              style={{
                backgroundColor: !isLoginTab ? 'var(--accent)' : 'transparent',
                color: !isLoginTab ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'background-color var(--transition-fast), color var(--transition-fast)'
              }}
            >
              Sign Up
            </button>
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            {isLoginTab ? 'Access Your Account' : 'Register New Member'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
            {isLoginTab ? 'Sign in to access your Right Tech orders and service status.' : 'Create an account to track your orders, service tickets, and projects.'}
          </p>

          {/* Error alert banner */}
          {(error || authError) && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '1.25rem'
            }}>
              {error || authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {!isLoginTab && (
              <div className="form-group" style={{ position: 'relative' }}>
                <label>Full Name</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
                </div>
              </div>
            )}

            {!isLoginTab && (
              <div className="form-group">
                <label>Phone Number</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="0771234567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
              </div>
              {!isLoginTab && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ color: formData.password.length >= 6 ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    • At least 6 characters
                  </span>
                  <span style={{ color: /[A-Z]/.test(formData.password) ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    • At least one capital letter
                  </span>
                  <span style={{ color: /[^A-Za-z0-9]/.test(formData.password) ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    • At least one symbol (special character)
                  </span>
                </div>
              )}
            </div>

            {!isLoginTab && (
              <div className="form-group">
                <label>Confirm Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                  />
                  <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem' }} />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Processing...' : isLoginTab ? 'Sign In' : 'Create Account'}
            </button>

          </form>
        </div>

        {/* Demo Credentials Helper Box */}
        <div style={{
          backgroundColor: 'var(--bg-primary)',
          border: '1px dashed var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--accent)' }}>
            <Sparkles size={14} />
            <span>Developer Demo Credentials</span>
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Quickly test the dashboard features using these pre-seeded accounts:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {/* Customer Demo */}
            <div 
              onClick={() => fillDemoCredentials('customer@righttech.com', 'customer123')}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                <User size={12} color="var(--accent)" />
                <strong style={{ fontSize: '0.7rem' }}>Customer Profile</strong>
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>customer@righttech.com</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pass: customer123</p>
            </div>

            {/* Admin Demo */}
            <div 
              onClick={() => fillDemoCredentials('admin@righttech.com', 'admin123')}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.75rem',
                cursor: 'pointer',
                transition: 'border-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                <UserCheck size={12} color="var(--accent)" />
                <strong style={{ fontSize: '0.7rem' }}>Admin Control</strong>
              </div>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>admin@righttech.com</p>
              <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pass: admin123</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
