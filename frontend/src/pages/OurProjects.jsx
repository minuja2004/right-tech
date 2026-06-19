import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShieldCheck, Camera, Layers, Plus, Edit, X, CloudUpload } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function OurProjects() {
  const { token, isAdmin } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editingProject, setEditingProject] = useState(null);
  const [projectEditForm, setProjectEditForm] = useState({
    title: '',
    category: 'CCTV Setup',
    description: '',
    images: []
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleStartEditProject = (proj) => {
    setEditingProject(proj);
    setProjectEditForm({
      title: proj.title,
      category: proj.category,
      description: proj.description,
      images: proj.images || []
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/products/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setProjectEditForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditProjectSubmit = async (e) => {
    e.preventDefault();
    if (projectEditForm.images.length === 0) {
      alert('Please upload an image for the project first.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/projects/${editingProject._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(projectEditForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('Project updated successfully!');
        setEditingProject(null);
        fetchProjects();
      } else {
        throw new Error(data.message || 'Failed to update project');
      }
    } catch (err) {
      alert(err.message);
    }
  };

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
                
                {/* Floating Admin Actions */}
                {isAdmin && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px', zIndex: 10 }}>
                    <button
                      onClick={() => handleStartEditProject(project)}
                      style={{
                        backgroundColor: 'rgba(0, 130, 200, 0.95)',
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
                      title="Edit Project"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project._id)}
                      style={{
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
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {/* Project Image */}
                <Link to={`/projects/${project._id}`} style={{ display: 'block' }}>
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
                </Link>

                {/* Project Details */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <h3 style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-heading)',
                    marginBottom: '0.5rem',
                    color: '#ffffff'
                  }}>
                    <Link to={`/projects/${project._id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="project-title-link">
                      {project.title}
                    </Link>
                  </h3>
                  <p style={{
                    fontSize: '0.825rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    margin: 0,
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {project.description}
                  </p>
                  
                  <div style={{ marginTop: '1.25rem' }}>
                    <Link 
                      to={`/projects/${project._id}`}
                      className="btn btn-secondary btn-sm"
                      style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.45rem 0.85rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.3rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}
                    >
                      <span>See More</span>
                      <span style={{ fontSize: '0.85rem' }}>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* EDIT PROJECT MODAL */}
      {editingProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '2rem',
            width: '100%',
            maxWidth: '550px',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setEditingProject(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#ffffff', textTransform: 'uppercase' }}>
              Edit Project Highlights
            </h3>
            
            <form onSubmit={handleEditProjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project Title</label>
                <input 
                  type="text" 
                  required 
                  value={projectEditForm.title} 
                  onChange={(e) => setProjectEditForm(p => ({ ...p, title: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category</label>
                <select 
                  value={projectEditForm.category} 
                  onChange={(e) => setProjectEditForm(p => ({ ...p, category: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
                >
                  <option value="CCTV Setup">CCTV Setup</option>
                  <option value="Corporate Server Setup">Corporate Server Setup</option>
                  <option value="Network Infrastructure">Network Infrastructure</option>
                  <option value="IT Diagnostics/Repairs">IT Diagnostics/Repairs</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Description / Highlights</label>
                <textarea 
                  required 
                  rows={4}
                  value={projectEditForm.description} 
                  onChange={(e) => setProjectEditForm(p => ({ ...p, description: e.target.value }))}
                  style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {/* Images preview & upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Project Gallery Images</label>
                
                {projectEditForm.images && projectEditForm.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {projectEditForm.images.map((imgUrl, index) => (
                      <div key={index} style={{ position: 'relative', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={imgUrl} alt="project preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => setProjectEditForm(p => ({ ...p, images: p.images.filter((_, i) => i !== index) }))}
                          style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            backgroundColor: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            color: '#ffffff',
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '10px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{
                  border: '1px dashed var(--border-color)',
                  borderRadius: '6px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#141416',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <CloudUpload size={24} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {uploading ? 'Uploading...' : 'Upload project image'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                  />
                </div>
                {uploadError && <span style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>{uploadError}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingProject(null)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.65rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ padding: '0.65rem' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
