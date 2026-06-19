import React, { useContext, useEffect, useState } from 'react';
import { Plus, Trash2, Edit, CheckCircle, Package, Truck, CloudUpload, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function Admin() {
  const { token, isAdmin } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'categories'

  // Loading / error states
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState(null);

  // Categories form states
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryInputs, setNewSubcategoryInputs] = useState({}); // {[catId]: 'text'}

  // Form states (Product creation/editing)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    price: '',
    description: '',
    stock: '',
    allowKoko: true,
    isPremium: false,
    isHotOffer: false,
    images: []
  });

  // Dynamic Options builder inside admin panel
  const [selectionForm, setSelectionForm] = useState({ name: 'Specifications', value: '', priceModifier: '0' });
  const [selectionsList, setSelectionsList] = useState([]); // Array of selections e.g. { name: 'Size', values: [...] }

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        return data.data;
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
    return [];
  };

  const fetchData = async () => {
    if (!isAdmin) return;
    setError(null);
    try {
      // Fetch Orders
      setLoadingOrders(true);
      const ordersRes = await fetch(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.data);
      }

      // Fetch Products
      setLoadingProducts(true);
      const productsRes = await fetch(`${API_URL}/products`);
      const productsData = await productsRes.json();
      if (productsData.success) {
        setProducts(productsData.data);
      }

      // Fetch Categories
      const loadedCats = await fetchCategories();
      // Set defaults for form if empty
      if (loadedCats.length > 0 && !productForm.category) {
        setProductForm(prev => ({
          ...prev,
          category: loadedCats[0].name,
          subcategory: loadedCats[0].subcategories[0] || ''
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOrders(false);
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newCategoryName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewCategoryName('');
        await fetchCategories();
      } else {
        alert(data.message || 'Failed to add category');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category? All its subcategories will be removed.')) return;
    try {
      const res = await fetch(`${API_URL}/categories/${catId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSubcategory = async (catId) => {
    const subName = newSubcategoryInputs[catId] || '';
    if (!subName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/categories/${catId}/subcategories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: subName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewSubcategoryInputs(prev => ({ ...prev, [catId]: '' }));
        await fetchCategories();
      } else {
        alert(data.message || 'Failed to add subcategory');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSubcategory = async (catId, subName) => {
    if (!window.confirm(`Are you sure you want to delete subcategory "${subName}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/categories/${catId}/subcategories/${encodeURIComponent(subName)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
      } else {
        alert(data.message || 'Failed to delete subcategory');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, updates) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (data.success) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.data : o)));
      } else {
        throw new Error(data.message || 'Status update failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Image upload to Cloudinary handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_URL}/products/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, data.url]
        }));
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Remove uploaded image from form preview
  const handleRemoveImageFromForm = (indexToRemove) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Add Option variant to selection list
  const handleAddSelectionOption = () => {
    if (!selectionForm.value) return;

    const mod = Number(selectionForm.priceModifier) || 0;
    const optName = selectionForm.name;

    setSelectionsList((prev) => {
      const existingIdx = prev.findIndex((s) => s.name === optName);
      let updated = [...prev];
      if (existingIdx > -1) {
        updated[existingIdx].values.push({ value: selectionForm.value, priceModifier: mod });
      } else {
        updated.push({
          name: optName,
          values: [{ value: selectionForm.value, priceModifier: mod }]
        });
      }
      return updated;
    });

    setSelectionForm((prev) => ({ ...prev, value: '', priceModifier: '0' }));
  };

  const handleClearSelections = () => {
    setSelectionsList([]);
  };

  // Handle Product CRUD submit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      selections: selectionsList
    };

    try {
      let response;
      if (isEditing) {
        response = await fetch(`${API_URL}/products/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Saving product failed');
      }

      // Reset form
      setProductForm({
        name: '',
        category: 'Laptops',
        price: '',
        description: '',
        stock: '',
        allowKoko: true,
        isPremium: false,
        isHotOffer: false,
        images: []
      });
      setSelectionsList([]);
      setIsEditing(false);
      setEditingId(null);

      // Refetch
      fetchData();
      alert(isEditing ? 'Product updated successfully!' : 'Product created successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Set product for edit
  const handleEditInit = (prod) => {
    setIsEditing(true);
    setEditingId(prod._id);
    setProductForm({
      name: prod.name,
      category: prod.category,
      subcategory: prod.subcategory || '',
      price: prod.price,
      description: prod.description,
      stock: prod.stock,
      allowKoko: prod.allowKoko,
      isPremium: prod.isPremium || false,
      isHotOffer: prod.isHotOffer || false,
      images: prod.images || []
    });
    setSelectionsList(prod.selections || []);
    setActiveTab('products-form');
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product profile?')) return;
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        throw new Error(data.message || 'Deletion failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0' }}>
          This operations dashboard is restricted to administrator accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
          Restricted Admin Control Board
        </h1>
        
        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Fulfillment Orders ({orders.length})
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Manage Products ({products.length})
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Manage Categories ({categories.length})
          </button>
          <button 
            onClick={() => {
              setIsEditing(false);
              setProductForm({ 
                name: '', 
                category: categories[0]?.name || '', 
                subcategory: categories[0]?.subcategories[0] || '', 
                price: '', 
                description: '', 
                stock: '', 
                allowKoko: true, 
                isPremium: false,
                isHotOffer: false,
                images: [] 
              });
              setSelectionsList([]);
              setActiveTab('products-form');
            }}
            className={`btn ${activeTab === 'products-form' ? 'btn-primary' : 'btn-accent-outline'} btn-sm`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      )}

      {/* ORDERS TAB PANEL */}
      {activeTab === 'orders' && (
        <div>
          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No orders placed yet.</p>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem' }}>Order ID</th>
                    <th style={{ padding: '1rem' }}>Customer / Email</th>
                    <th style={{ padding: '1rem' }}>Items Details</th>
                    <th style={{ padding: '1rem' }}>Total Amount</th>
                    <th style={{ padding: '1rem' }}>Payment Status</th>
                    <th style={{ padding: '1rem' }}>Shipping Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }} className="font-numbers">{order.orderId}</td>
                      <td style={{ padding: '1rem' }}>
                        <p style={{ fontWeight: 600 }}>{order.shippingDetails.fullName}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{order.shippingDetails.email}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{order.shippingDetails.phone}</p>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                          {order.items.map((item, idx) => (
                            <li key={idx} style={{ color: 'var(--text-secondary)' }}>
                              {item.name} x {item.quantity} 
                              {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {' '}({Object.entries(item.selectedOptions).map(([k,v]) => `${k}: ${v}`).join(', ')})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700 }} className="font-numbers">LKR {order.totalAmount.toLocaleString()}</td>
                      
                      {/* Payment Status Switcher */}
                      <td style={{ padding: '1rem' }}>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => handleUpdateOrderStatus(order._id, { paymentStatus: e.target.value })}
                          className="form-select"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>

                      {/* Shipping Status Switcher */}
                      <td style={{ padding: '1rem' }}>
                        <select
                          value={order.shippingStatus}
                          onChange={(e) => handleUpdateOrderStatus(order._id, { shippingStatus: e.target.value })}
                          className="form-select"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS LIST TAB PANEL */}
      {activeTab === 'products' && (
        <div>
          {loadingProducts ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No products in database catalog.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {products.map((prod) => (
                <div key={prod._id} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', display: 'flex', gap: '1rem' }}>
                  <img src={prod.images?.[0] || 'https://via.placeholder.com/80'} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                  
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{prod.name}</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase' }}>{prod.category}</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700 }} className="font-numbers">LKR {prod.price.toLocaleString()}</p>
                      <p style={{ fontSize: '0.75rem', color: prod.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        Stock: {prod.stock}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button onClick={() => handleEditInit(prod)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      <button onClick={() => handleDeleteProduct(prod._id)} className="btn btn-danger btn-sm" style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Trash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS FORM TAB PANEL (ADD/EDIT) */}
      {activeTab === 'products-form' && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            {isEditing ? `Edit Product Profile: ${productForm.name}` : 'Create Product Profile'}
          </h2>

          <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dell Inspiron 15"
                value={productForm.name}
                onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                className="form-input"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row-two">
              <div className="form-group">
                <label>Main Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => {
                    const selectedCat = e.target.value;
                    const catObj = categories.find(c => c.name === selectedCat);
                    setProductForm((p) => ({
                      ...p,
                      category: selectedCat,
                      subcategory: catObj?.subcategories[0] || ''
                    }));
                  }}
                  className="form-select"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Subcategory</label>
                <select
                  value={productForm.subcategory}
                  onChange={(e) => setProductForm((p) => ({ ...p, subcategory: e.target.value }))}
                  className="form-select"
                >
                  <option value="">-- None (Or select subcategory) --</option>
                  {categories.find(c => c.name === productForm.category)?.subcategories.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="form-row-two">
              <div className="form-group">
                <label>Base Price (LKR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 4500"
                  value={productForm.price}
                  onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>In-Stock Quantity</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 15"
                  value={productForm.stock}
                  onChange={(e) => setProductForm((p) => ({ ...p, stock: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Detailed Description</label>
              <textarea
                required
                rows={3}
                placeholder="Formulate ingredients list, dosage directions, benefits..."
                value={productForm.description}
                onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                className="form-input"
                style={{ resize: 'vertical', fontFamily: 'var(--font-body)' }}
              />
            </div>

            {/* Checkbox for BNPL eligibility */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="allowKoko"
                checked={productForm.allowKoko}
                onChange={(e) => setProductForm((p) => ({ ...p, allowKoko: e.target.checked }))}
                style={{ accentColor: 'var(--accent)', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="allowKoko" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                Eligible for Koko 3-split payments BNPL
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="adminIsPremium"
                  checked={productForm.isPremium}
                  onChange={(e) => setProductForm((p) => ({ ...p, isPremium: e.target.checked }))}
                  style={{ accentColor: 'var(--accent)', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="adminIsPremium" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Premium Product (Showcase)
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="adminIsHotOffer"
                  checked={productForm.isHotOffer}
                  onChange={(e) => setProductForm((p) => ({ ...p, isHotOffer: e.target.checked }))}
                  style={{ accentColor: 'var(--accent)', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="adminIsHotOffer" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  Hot Deals / Offers
                </label>
              </div>
            </div>

            {/* Cloudinary Upload Section */}
            <div style={{ border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CloudUpload size={16} color="var(--accent)" />
                <span>Cloudinary Image Gallery</span>
              </h4>

              {uploadError && <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginBottom: '0.5rem' }}>{uploadError}</p>}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                {productForm.images.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '70px', height: '70px', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageFromForm(idx)}
                      style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyItems: 'center', cursor: 'pointer', color: '#fff', padding: 0 }}
                    >
                      <X size={10} style={{ margin: 'auto' }} />
                    </button>
                  </div>
                ))}
              </div>

              <input
                type="file"
                id="file-upload"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                accept="image/*"
              />
              <label 
                htmlFor="file-upload"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
              >
                <span>{uploading ? 'Uploading Image...' : 'Upload Image File'}</span>
              </label>
            </div>

            {/* Product Options Builder */}
            <div style={{ border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Manage Selections & Variants modifiers
              </h4>
              
              {/* Added selections preview list */}
              {selectionsList.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {selectionsList.map((sel, sIdx) => (
                    <div key={sIdx} style={{ backgroundColor: '#18181c', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{sel.name}: </strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {sel.values.map(v => `${v.value} (+${v.priceModifier})`).join(' | ')}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={handleClearSelections} className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-start' }}>
                    Reset Options List
                  </button>
                </div>
              )}

              {/* Builder Inputs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr 1fr', gap: '0.75rem', alignItems: 'end' }} className="options-builder-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Option Type</label>
                  <select
                    value={selectionForm.name}
                    onChange={(e) => setSelectionForm(s => ({ ...s, name: e.target.value }))}
                    className="form-select"
                    style={{ padding: '0.6rem' }}
                  >
                    <option value="Specifications">Specifications</option>
                    <option value="Color Theme">Color Theme</option>
                    <option value="Storage Option">Storage Option</option>
                    <option value="Support Plan">Support Plan</option>
                    <option value="Location Range">Location Range</option>
                    <option value="Priority Service">Priority Service</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Option Choice Value</label>
                  <input
                    type="text"
                    placeholder="e.g. 16GB RAM or Black"
                    value={selectionForm.value}
                    onChange={(e) => setSelectionForm(s => ({ ...s, value: e.target.value }))}
                    className="form-input"
                    style={{ padding: '0.6rem' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Price Modifier (LKR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 8000"
                    value={selectionForm.priceModifier}
                    onChange={(e) => setSelectionForm(s => ({ ...s, priceModifier: e.target.value }))}
                    className="form-input"
                    style={{ padding: '0.6rem' }}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={handleAddSelectionOption}
                  className="btn btn-accent-outline"
                  style={{ height: '39px', padding: '0.5rem' }}
                >
                  <span>Add Option</span>
                </button>
              </div>

            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                {isEditing ? 'Update Product Details' : 'Publish Product Profile'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setProductForm({ 
                    name: '', 
                    category: categories[0]?.name || '', 
                    subcategory: categories[0]?.subcategories[0] || '', 
                    price: '', 
                    description: '', 
                    stock: '', 
                    allowKoko: true, 
                    isPremium: false,
                    isHotOffer: false,
                    images: [] 
                  });
                  setSelectionsList([]);
                  setIsEditing(false);
                  setEditingId(null);
                  setActiveTab('products');
                }} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      )}

      {/* CATEGORIES MANAGEMENT TAB PANEL */}
      {activeTab === 'categories' && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem' }} className="animate-fade-in">
          <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '1.5rem', color: '#ffffff' }}>
            Manage Categories & Subcategories
          </h2>

          {/* Add Main Category Form */}
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flexGrow: 1, maxWidth: '400px', minWidth: '250px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>New Main Category Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Network Cabinets"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.65rem 1rem', outline: 'none', fontSize: '0.85rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', height: '38px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Plus size={16} />
              <span>Add Category</span>
            </button>
          </form>

          {/* Categories Grid List */}
          {loadingCategories ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
            </div>
          ) : categories.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No categories configured. Seed database or add one above.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {categories.map((cat) => (
                <div key={cat._id} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '220px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700 }}>{cat.name}</h3>
                      {cat.name !== 'Flyers' && (
                        <button 
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="btn btn-sm"
                          style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                          title="Delete Main Category"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Subcategories list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subcategories</h4>
                      {cat.subcategories.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No subcategories yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                          {cat.subcategories.map((sub, idx) => (
                            <span 
                              key={idx} 
                              style={{ 
                                backgroundColor: 'var(--bg-secondary)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '4px', 
                                padding: '0.2rem 0.5rem', 
                                fontSize: '0.75rem', 
                                color: 'var(--text-secondary)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <span>{sub}</span>
                              {cat.name !== 'Flyers' && (
                                <button 
                                  onClick={() => handleDeleteSubcategory(cat._id, sub)}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'inline-flex', padding: 0 }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                  <X size={12} />
                                </button>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add Subcategory form for this main category */}
                  {cat.name !== 'Flyers' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                      <input 
                        type="text" 
                        placeholder="Add subcategory..."
                        value={newSubcategoryInputs[cat._id] || ''}
                        onChange={(e) => setNewSubcategoryInputs(prev => ({ ...prev, [cat._id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubcategory(cat._id);
                        }}
                        style={{ backgroundColor: '#141416', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#ffffff', padding: '0.45rem 0.75rem', outline: 'none', fontSize: '0.8rem', flexGrow: 1 }}
                      />
                      <button 
                        onClick={() => handleAddSubcategory(cat._id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        th, td {
          border-bottom: 1px solid var(--border-color);
        }
        @media (max-width: 768px) {
          .form-row-three, .options-builder-row {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
      
    </div>
  );
}
