import React, { useState, useMemo } from 'react';
import {
  INITIAL_PRODUCTS,
  type Product,
  type Order,
  type ProductCategory,
  type OrderStatus,
} from '@shared';

// Initial Demo Orders for the Admin Desk
const INITIAL_ADMIN_ORDERS: Order[] = [
  {
    id: 'CAL-2026-7841',
    userId: 'usr_cust_demo_01',
    userEmail: 'alex.verma@example.com',
    userRole: 'customer',
    items: [
      {
        productId: 'purifier-aqua-grand-plus-12l',
        productName: 'AquaGrand+ RO+UV+UF+TDS Controller 12L Purifier',
        category: 'purifiers',
        unitPrice: 13999,
        quantity: 1,
        totalPrice: 13999,
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
      },
      {
        productId: 'filter-sediment-spun-5micron-10inch',
        productName: 'PureShield 5-Micron 10-Inch Spun Polypropylene Sediment Filter',
        category: 'filters',
        unitPrice: 249,
        quantity: 2,
        totalPrice: 498,
        imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 14497,
    taxAmount: 2609.46,
    totalAmount: 17106.46,
    shippingAddress: {
      fullName: 'Alex Verma',
      phone: '9876543210',
      street: '402, Silicon Heights, 12th Main, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
    },
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    razorpayPaymentId: 'pay_test_994821a',
    createdAt: '2026-10-18T14:30:00.000Z',
    updatedAt: '2026-10-21T11:00:00.000Z',
  },
  {
    id: 'CAL-2026-8194',
    userId: 'usr_cust_demo_02',
    userEmail: 'rohit.sharma@example.com',
    userRole: 'customer',
    items: [
      {
        productId: 'filter-alkaline-mineral-cartridge-post-ro',
        productName: 'BioAlkaline Remineralization Cartridge with Anti-Oxidant Balls',
        category: 'filters',
        unitPrice: 899,
        quantity: 2,
        totalPrice: 1798,
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
      },
      {
        productId: 'spare-solenoid-valve-24v-slx',
        productName: 'Precision 24V DC Push-Fit Magnetic Water Solenoid Valve (SV)',
        category: 'spares',
        unitPrice: 450,
        quantity: 1,
        totalPrice: 450,
        imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 2248,
    taxAmount: 404.64,
    totalAmount: 2652.64,
    shippingAddress: {
      fullName: 'Rohit Sharma',
      phone: '9845123456',
      street: 'Flat 104, Green Meadows, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
    },
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    razorpayPaymentId: 'pay_test_881920b',
    createdAt: '2026-10-22T09:15:00.000Z',
    updatedAt: '2026-10-22T10:00:00.000Z',
  },
  {
    id: 'CAL-2026-9042',
    userId: 'usr_deal_01',
    userEmail: 'apex.purifiers@dealernet.in',
    userRole: 'dealer',
    items: [
      {
        productId: 'pump-booster-75gpd-24vdc',
        productName: 'VoltForce 75 GPD Domestic RO Booster Pump (24V DC)',
        category: 'pumps',
        unitPrice: 1190,
        quantity: 10,
        totalPrice: 11900,
      },
      {
        productId: 'filter-membrane-ro-75gpd-tfc',
        productName: 'Dow-FilmTec Grade 75 GPD Thin Film Composite (TFC) RO Membrane',
        category: 'filters',
        unitPrice: 950,
        quantity: 10,
        totalPrice: 9500,
      },
    ],
    subtotal: 21400,
    taxAmount: 3852.0,
    totalAmount: 25252.0,
    shippingAddress: {
      fullName: 'Apex Water Systems (Dealer)',
      phone: '9900112233',
      street: 'Shop 12, Industrial Area, Peenya 2nd Stage',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560058',
    },
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'cod',
    createdAt: '2026-10-24T08:00:00.000Z',
    updatedAt: '2026-10-24T08:00:00.000Z',
  },
];

type ActiveTab = 'products' | 'orders' | 'analytics';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ADMIN_ORDERS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add / Edit Product
  const [formData, setFormData] = useState({
    name: '',
    category: 'purifiers' as ProductCategory,
    price: 9999,
    wholesalePrice: 6999,
    minWholesaleQty: 5,
    stock: 25,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [products, categoryFilter, searchQuery]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.shippingAddress.fullName.toLowerCase().includes(q) ||
        o.userEmail.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, searchQuery]);

  // Metrics
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => (o.paymentStatus === 'paid' ? sum + o.totalAmount : sum), 0);
  }, [orders]);

  const outOfStockCount = useMemo(() => {
    return products.filter((p) => !p.inStock || p.stock <= 0).length;
  }, [products]);

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'purifiers',
      price: 9999,
      wholesalePrice: 6999,
      minWholesaleQty: 5,
      stock: 25,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      wholesalePrice: prod.wholesalePrice,
      minWholesaleQty: prod.minWholesaleQty,
      stock: prod.stock,
      description: prod.description,
      imageUrl: prod.imageUrl,
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      // Update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name.trim(),
                category: formData.category,
                price: Number(formData.price),
                wholesalePrice: Number(formData.wholesalePrice),
                minWholesaleQty: Number(formData.minWholesaleQty),
                stock: Number(formData.stock),
                inStock: Number(formData.stock) > 0,
                description: formData.description.trim(),
                imageUrl: formData.imageUrl.trim(),
              }
            : p
        )
      );
      showToast(`Updated product "${formData.name}"`);
    } else {
      // Add
      const newId = `${formData.category}-${Date.now().toString(36)}`;
      const newProduct: Product = {
        id: newId,
        name: formData.name.trim(),
        category: formData.category,
        price: Number(formData.price),
        wholesalePrice: Number(formData.wholesalePrice),
        minWholesaleQty: Number(formData.minWholesaleQty),
        stock: Number(formData.stock),
        inStock: Number(formData.stock) > 0,
        description: formData.description.trim() || 'High performance water treatment component.',
        imageUrl: formData.imageUrl.trim(),
        specifications: {
          Category: formData.category,
          Condition: 'Brand New Genuine Califnco Part',
        },
        rating: 5.0,
        reviewsCount: 1,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      showToast(`Created new product "${formData.name}"`);
    }
    setShowProductModal(false);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast(`Deleted product "${productName}"`);
    }
  };

  // Handlers for Orders
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: newStatus,
              paymentStatus: newStatus === 'delivered' ? 'paid' : ord.paymentStatus,
              updatedAt: new Date().toISOString(),
            }
          : ord
      )
    );
    showToast(`Order ${orderId} status changed to ${newStatus}`);
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return 'badge-success';
      case 'shipped':
        return 'badge-purple';
      case 'processing':
        return 'badge-info';
      case 'pending':
        return 'badge-warning';
      case 'cancelled':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <header className="admin-navbar">
        <div className="brand-section">
          <div className="brand-icon">💧</div>
          <div>
            <div className="brand-title">
              Califnco PureWater
              <span className="admin-tag">Admin Console</span>
            </div>
            <div className="brand-sub">Enterprise Catalog, Order Desk & Operations</div>
          </div>
        </div>

        <nav className="nav-links">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Products Desk
            <span className="nav-badge">{products.length}</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📋 Orders Desk
            <span className="nav-badge">{orders.length}</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        </nav>
      </header>

      {/* Main Body */}
      <main className="main-content">
        {/* Quick Metric Cards */}
        <section className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon-box" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              📦
            </div>
            <div>
              <div className="metric-val">{products.length}</div>
              <div className="metric-label">Catalog Products</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              💰
            </div>
            <div>
              <div className="metric-val">₹{Math.round(totalRevenue).toLocaleString('en-IN')}</div>
              <div className="metric-label">Settled Revenue</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              📋
            </div>
            <div>
              <div className="metric-val">{orders.length}</div>
              <div className="metric-label">Active Orders</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              ⚠️
            </div>
            <div>
              <div className="metric-val">{outOfStockCount}</div>
              <div className="metric-label">Out of Stock Alerts</div>
            </div>
          </div>
        </section>

        {/* 1. PRODUCTS DESK TAB */}
        {activeTab === 'products' && (
          <section>
            <div className="controls-bar">
              <div className="search-input-wrap">
                <span className="search-icon-svg">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search products by title, ID, or specs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')}
              >
                <option value="all">All Categories ({products.length})</option>
                <option value="purifiers">Purifiers</option>
                <option value="dispensers">Dispensers</option>
                <option value="pumps">Pumps</option>
                <option value="filters">Filters</option>
                <option value="spares">Spare Parts</option>
              </select>

              <button type="button" className="btn-primary" onClick={handleOpenAddProduct}>
                + Add Product
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product & Thumbnail</th>
                    <th>Category</th>
                    <th>Retail Price</th>
                    <th>Wholesale Price</th>
                    <th>Stock Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="product-row-meta">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="product-row-thumb" />
                          ) : (
                            <div className="product-row-thumb">💧</div>
                          )}
                          <div>
                            <strong>{p.name}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              ID: {p.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                          {p.category}
                        </span>
                      </td>
                      <td>
                        <strong>₹{p.price.toLocaleString('en-IN')}</strong>
                      </td>
                      <td>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          ₹{p.wholesalePrice.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {' '}(MOQ: {p.minWholesaleQty})
                        </span>
                      </td>
                      <td>
                        <strong>{p.stock}</strong> units
                      </td>
                      <td>
                        {p.inStock && p.stock > 0 ? (
                          <span className="badge badge-success">● In Stock</span>
                        ) : (
                          <span className="badge badge-danger">● Out of Stock</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => handleOpenEditProduct(p)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger btn-sm"
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                        No products match your search or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 2. ORDERS DESK TAB */}
        {activeTab === 'orders' && (
          <section>
            <div className="controls-bar">
              <div className="search-input-wrap">
                <span className="search-icon-svg">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search orders by Order ID, customer, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              >
                <option value="all">All Statuses ({orders.length})</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer Details</th>
                    <th>Items Purchased</th>
                    <th>Grand Total</th>
                    <th>Payment</th>
                    <th>Order Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id}>
                      <td>
                        <strong>{ord.id}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{ord.shippingAddress.fullName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {ord.userEmail} • {ord.shippingAddress.phone}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{ord.items.reduce((s, i) => s + i.quantity, 0)} items</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {ord.items[0]?.productName}{' '}
                            {ord.items.length > 1 && `+ ${ord.items.length - 1} more`}
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>₹{ord.totalAmount.toLocaleString('en-IN')}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          (Incl. ₹{ord.taxAmount.toLocaleString('en-IN')} GST)
                        </div>
                      </td>
                      <td>
                        {ord.paymentStatus === 'paid' ? (
                          <span className="badge badge-success">✓ Paid ({ord.paymentMethod})</span>
                        ) : (
                          <span className="badge badge-warning">⏳ Pending ({ord.paymentMethod})</span>
                        )}
                      </td>
                      <td>
                        <select
                          className={`status-select ${getStatusBadgeClass(ord.status)}`}
                          value={ord.status}
                          onChange={(e) =>
                            handleOrderStatusChange(ord.id, e.target.value as OrderStatus)
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => setViewingOrder(ord)}
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 3. ANALYTICS & METRICS TAB */}
        {activeTab === 'analytics' && (
          <section>
            <div className="table-container" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>Califnco PureWater Overview & Metrics</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                System operational state, catalog valuation, and inventory metrics.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h3>Inventory Valuation</h3>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '0.5rem 0' }}>
                    ₹
                    {products
                      .reduce((sum, p) => sum + p.price * p.stock, 0)
                      .toLocaleString('en-IN')}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Total retail valuation across {products.length} distinct products in stock.
                  </p>
                </div>

                <div style={{ padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h3>Category Distribution</h3>
                  <ul style={{ listStyle: 'none', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <li>💧 Purifiers: <strong>{products.filter((p) => p.category === 'purifiers').length} products</strong></li>
                    <li>🚰 Dispensers: <strong>{products.filter((p) => p.category === 'dispensers').length} products</strong></li>
                    <li>⚡ Pumps: <strong>{products.filter((p) => p.category === 'pumps').length} products</strong></li>
                    <li>🧪 Filters: <strong>{products.filter((p) => p.category === 'filters').length} products</strong></li>
                    <li>🔧 Spare Parts: <strong>{products.filter((p) => p.category === 'spares').length} products</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveProduct}>
              <div className="modal-header">
                <div className="modal-title">
                  {editingProduct ? 'Edit Product' : 'Add New Water Product'}
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProductModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="form-group">
                  <label>Product Title *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. PureShield 10-Inch Sediment Filter"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as ProductCategory })
                      }
                    >
                      <option value="purifiers">Purifiers</option>
                      <option value="dispensers">Dispensers</option>
                      <option value="pumps">Pumps</option>
                      <option value="filters">Filters</option>
                      <option value="spares">Spare Parts</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Stock Count *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-input"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Retail Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Wholesale Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={formData.wholesalePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, wholesalePrice: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Min. Bulk Quantity for Wholesale</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={formData.minWholesaleQty}
                    onChange={(e) =>
                      setFormData({ ...formData, minWholesaleQty: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Product Description</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter full specifications, purification stages, and compatibility..."
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Receipt Modal */}
      {viewingOrder && (
        <div className="modal-overlay" onClick={() => setViewingOrder(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Receipt: {viewingOrder.id}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Placed on {new Date(viewingOrder.createdAt).toLocaleString()}
                </div>
              </div>
              <button type="button" className="btn-close" onClick={() => setViewingOrder(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <strong>Customer:</strong> {viewingOrder.shippingAddress.fullName} ({viewingOrder.userEmail})<br />
                <strong>Phone:</strong> {viewingOrder.shippingAddress.phone}<br />
                <strong>Delivery Address:</strong> {viewingOrder.shippingAddress.street}, {viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state} - {viewingOrder.shippingAddress.postalCode}
              </div>

              <h4>Items ({viewingOrder.items.length})</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {viewingOrder.items.map((it, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <span>{it.quantity}x {it.productName}</span>
                    <strong>₹{it.totalPrice.toLocaleString('en-IN')}</strong>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>₹{viewingOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST (18%):</span>
                  <span>₹{viewingOrder.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.5rem', borderTop: '2px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--primary)' }}>₹{viewingOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-primary" onClick={() => setViewingOrder(null)}>
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notice */}
      {toastMessage && <div className="toast-notice">{toastMessage}</div>}
    </>
  );
}
export default App;
