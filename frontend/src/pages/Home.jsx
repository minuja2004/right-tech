import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, Search, Dumbbell, Zap, Flame, ShieldCheck } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const categories = ['All', 'Protein', 'Pre-workout', 'Creatine', 'Recovery', 'Vitamins'];

export default function Home({ searchQuery, onSearchChange }) {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async (category, search) => {
    setLoading(true);
    try {
      let queryStr = '';
      const params = [];
      if (category && category !== 'All') {
        params.push(`category=${encodeURIComponent(category)}`);
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
        setProducts(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when category or search changes
  useEffect(() => {
    fetchProducts(activeCategory, searchQuery);
  }, [activeCategory, searchQuery]);

  return (
    <div className="animate-fade-in">
      
      {/* Hero Header Section */}
      <section style={{
        position: 'relative',
        height: '380px',
        background: 'linear-gradient(rgba(0,0,0,0.5), rgba(10,10,10,1)), url("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ zIndex: 2 }}>
          <div style={{ maxWidth: '600px' }}>
            <span style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              textTransform: 'uppercase',
              padding: '0.3rem 0.65rem',
              borderRadius: '4px',
              letterSpacing: '0.1em'
            }}>
              ELITE ATHLETIC NUTRITION
            </span>
            <h1 style={{
              fontSize: '3.5rem',
              fontFamily: 'var(--font-heading)',
              lineHeight: '1.05',
              marginTop: '0.75rem',
              marginBottom: '1rem',
              textTransform: 'uppercase'
            }}>
              UNLEASH YOUR <span style={{ color: 'var(--accent)' }}>MAXIMUM</span> POTENTIAL
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Engineered for champions. Right Tech sports supplements deliver pure, clinically-dosed ingredients to fuel strength, focus, recovery, and hypertrophy.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => {
                  const element = document.getElementById('shop-catalog');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="btn btn-primary"
              >
                Explore Supplements
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Icons Strip */}
      <section style={{ marginBottom: '3rem' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem'
          }} className="feature-strip">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Flame color="var(--accent)" size={24} />
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Explosive Power</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pre-workouts for heavy lifts</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Dumbbell color="var(--accent)" size={24} />
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Lean Muscle</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ultra-filtered whey isolate</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap color="var(--accent)" size={24} />
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Rapid Recovery</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Premium branched amino acids</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck color="var(--accent)" size={24} />
              <div>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase' }}>Pure Quality</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>No banned fillers. Lab-verified.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <SlidersHorizontal size={14} />
              <span>Filter Category</span>
            </div>
          </div>

          {/* Category Filter List */}
          <div className="category-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time search count indicator */}
        {searchQuery && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Showing {products.length} result(s) for "<span style={{ color: 'var(--accent)' }}>{searchQuery}</span>"
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
            <p>Error loading supplements: {error}</p>
            <button onClick={() => fetchProducts(activeCategory, searchQuery)} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 0',
            color: 'var(--text-secondary)'
          }}>
            <Dumbbell size={48} strokeWidth={1} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <h3>No products found</h3>
            <p style={{ fontSize: '0.85rem' }}>We couldn't find any supplements matching your active selection.</p>
          </div>
        ) : (
          /* Products Grid */
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

      </section>

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
