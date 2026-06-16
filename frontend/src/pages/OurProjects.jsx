import React, { useState, useEffect, useContext } from 'react';
import { Trash2, ShieldCheck, Camera, Layers, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function OurProjects() {
  const { token, isAdmin } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/projects`);
      const data = await response.json();
      if (data.success) {
        setProjects(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch projects');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setProjects(prev => prev.filter(p => p._id !== id));
      } else {
        throw new Error(data.message || 'Failed to delete project');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Hero Header */}
      <section style={{
        position: 'relative',
        height: '220px',
        background: 'linear-gradient(rgba(0,0,0,0.7), rgba(10,10,10,1)), url("https://images.unsplash.com/photo-1510519138101-570d1dca3d66?q=80&w=1200&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '3rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ zIndex: 2 }}>
          <div>
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
              Proven Expertise
            </span>
            <h1 style={{
              fontSize: '2.5rem',
              fontFamily: 'var(--font-heading)',
              lineHeight: '1.1',
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              textTransform: 'uppercase'
            }}>
              OUR COMPLETED PROJECTS
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: 0 }}>
              Real-world technical setups, high-definition CCTV security camera installations, corporate server configs, and structured networking implemented by Right Tech engineers.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <div className="container">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '5rem 0' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : projects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-secondary)'
          }}>
            <Layers size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <h3>No Projects Added Yet</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              When the administrator adds project highlights, they will be displayed here for clients.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '2rem'
          }} className="projects-grid">
            {projects.map((project) => (
              <div 
                key={project._id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'transform var(--transition-normal), border-color var(--transition-normal)',
                }}
                className="project-card-item"
              >
                
                {/* Floating Admin Delete Action */}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteProject(project._id)}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
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
                      transition: 'transform var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                {/* Project Image */}
                <div style={{
                  height: '200px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#141416'
                }}>
                  {project.images && project.images.length > 0 ? (
                    <img 
                      src={project.images[0]} 
                      alt={project.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      className="project-image-img"
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'var(--text-muted)'
                    }}>
                      <ShieldCheck size={40} style={{ opacity: 0.2 }} />
                    </div>
                  )}
                  
                  {/* Category Badge overlay */}
                  <span style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(10, 10, 10, 0.85)',
                    border: '1px solid var(--accent)',
                    color: 'var(--accent)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    letterSpacing: '0.05em'
                  }}>
                    {project.category}
                  </span>
                </div>

                {/* Project Details */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    marginBottom: '0.5rem',
                    color: '#ffffff'
                  }}>
                    {project.title}
                  </h3>
                  <p style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    margin: 0,
                    flexGrow: 1
                  }}>
                    {project.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* CSS selector helper overrides inside this file */}
      <style>{`
        .project-card-item:hover {
          transform: translateY(-4px);
          border-color: var(--accent) !important;
        }
        .project-card-item:hover .project-image-img {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
