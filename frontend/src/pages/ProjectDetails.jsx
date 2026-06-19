import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, ShieldCheck, Tag, Cpu } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gallery active image index state
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/projects/${id}`);
        const data = await response.json();
        if (data.success) {
          setProject(data.data);
        } else {
          throw new Error(data.message || 'Project details not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handlePrevImage = () => {
    if (!project || !project.images) return;
    setActiveImgIndex((prev) => (prev === 0 ? project.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!project || !project.images) return;
    setActiveImgIndex((prev) => (prev === project.images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {error || 'Project not found.'}
        </div>
        <Link to="/projects" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 4rem 1.5rem' }}>
      
      {/* Back Button */}
      <Link 
        to="/projects" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '2rem',
          transition: 'color var(--transition-fast)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ChevronLeft size={16} />
        <span>Back to Projects</span>
      </Link>

      <div className="product-details-grid">
        
        {/* Gallery / Image Viewer */}
        <div className="image-detail-gallery">
          <div className="main-image-viewport">
            <img 
              src={project.images?.[activeImgIndex] || 'https://via.placeholder.com/600'} 
              alt={project.title} 
              className="main-image-display"
            />

            {/* Carousel Navigation Arrows */}
            {project.images && project.images.length > 1 && (
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
          {project.images && project.images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {project.images.map((img, idx) => (
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

        {/* Project Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{
              color: 'var(--accent)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              letterSpacing: '0.1em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Tag size={12} />
              <span>{project.category}</span>
            </span>
            <h1 style={{
              fontSize: '2rem',
              fontFamily: 'var(--font-heading)',
              lineHeight: '1.2',
              marginTop: '0.5rem',
              marginBottom: '1rem',
              color: '#ffffff',
              textTransform: 'uppercase'
            }}>
              {project.title}
            </h1>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem',
              marginBottom: '1.5rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={14} />
                <span>
                  Date: {new Date(project.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ShieldCheck size={14} color="var(--success)" />
                <span>Verified Setup</span>
              </div>
            </div>

            <h4 style={{ 
              fontSize: '0.9rem', 
              textTransform: 'uppercase', 
              color: 'var(--text-secondary)', 
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-heading)'
            }}>
              Project Summary & Scope
            </h4>
            <p style={{ 
              fontSize: '0.95rem', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.7',
              whiteSpace: 'pre-line' 
            }}>
              {project.description}
            </p>
          </div>

          {/* Callout Info Block */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            marginTop: '1rem'
          }}>
            <Cpu size={24} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h5 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                Need a Similar Technical Setup?
              </h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', margin: 0 }}>
                Our engineers design custom IT solutions and security architectures tailored to your requirements. Contact us to schedule a site survey or engineering consult.
              </p>
              <div style={{ marginTop: '0.75rem' }}>
                <Link to="/" className="btn btn-primary btn-sm" style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem' }}>
                  Request Consultation
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
