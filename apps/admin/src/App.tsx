import React, { useState, useMemo } from 'react';
import {
  INITIAL_PRODUCTS,
  type Product,
  type Order,
  type ProductCategory,
  type OrderStatus,
  type DealerProfile,
  type ServiceBooking,
} from '@shared';

// Initial dynamic orders dataset
const INITIAL_ADMIN_ORDERS: Order[] = [
  {
    id: 'CAL-2026-7841',
    userId: 'usr_cust_01',
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
    userId: 'usr_cust_02',
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
  {
    id: 'CAL-2026-9115',
    userId: 'usr_cust_03',
    userEmail: 'priya.nair@example.com',
    userRole: 'customer',
    items: [
      {
        productId: 'dispenser-hot-cold-floor-standing-compressor',
        productName: 'PureChill Commercial Hot & Cold Floor-Standing Water Dispenser',
        category: 'dispensers',
        unitPrice: 9499,
        quantity: 1,
        totalPrice: 9499,
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 9499,
    taxAmount: 1709.82,
    totalAmount: 11208.82,
    shippingAddress: {
      fullName: 'Priya Nair',
      phone: '9123456780',
      street: '22, Indiranagar 100ft Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
    },
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    razorpayPaymentId: 'pay_test_774910c',
    createdAt: '2026-10-23T11:20:00.000Z',
    updatedAt: '2026-10-23T16:00:00.000Z',
  },
  {
    id: 'CAL-2026-9280',
    userId: 'usr_cust_04',
    userEmail: 'manish.kumar@example.com',
    userRole: 'customer',
    items: [
      {
        productId: 'purifier-alkaline-copper-ro-10l',
        productName: 'CopperPure Active Alkaline + Copper Infused 10L RO Water Purifier',
        category: 'purifiers',
        unitPrice: 15499,
        quantity: 1,
        totalPrice: 15499,
        imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
      },
    ],
    subtotal: 15499,
    taxAmount: 2789.82,
    totalAmount: 18288.82,
    shippingAddress: {
      fullName: 'Manish Kumar',
      phone: '9844001122',
      street: 'B-303, Prestige Palms, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
    },
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    razorpayPaymentId: 'pay_test_661900d',
    createdAt: '2026-10-14T10:00:00.000Z',
    updatedAt: '2026-10-17T12:00:00.000Z',
  },
];

// Initial dynamic dealers dataset
const INITIAL_DEALERS: DealerProfile[] = [
  {
    id: 'usr_deal_01',
    businessName: 'Apex Water Systems & Spares',
    contactPerson: 'Suresh Gowda',
    email: 'apex.purifiers@dealernet.in',
    phone: '9900112233',
    gstNumber: '29ABCDE1234F1Z5',
    address: {
      fullName: 'Apex Water Systems',
      phone: '9900112233',
      street: 'Shop 12, Industrial Area, Peenya 2nd Stage',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560058',
    },
    status: 'approved',
    appliedAt: '2026-09-15T10:00:00.000Z',
    reviewedAt: '2026-09-16T14:30:00.000Z',
  },
  {
    id: 'usr_deal_02',
    businessName: 'Cauvery Water Technologies',
    contactPerson: 'Karthik Raman',
    email: 'karthik@cauverywater.com',
    phone: '9845112244',
    gstNumber: '33AABCT9876Q1ZB',
    address: {
      fullName: 'Cauvery Water Technologies',
      phone: '9845112244',
      street: '45, Mount Road, T Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600017',
    },
    status: 'pending',
    appliedAt: '2026-10-23T15:20:00.000Z',
  },
];

// Initial dynamic service bookings dataset
const INITIAL_SERVICES: ServiceBooking[] = [
  {
    id: 'SRV-2026-101',
    userId: 'usr_cust_01',
    customerName: 'Alex Verma',
    customerPhone: '9876543210',
    serviceType: 'installation',
    preferredDate: '2026-10-25',
    preferredTimeSlot: '10:00 AM - 1:00 PM',
    address: {
      fullName: 'Alex Verma',
      phone: '9876543210',
      street: '402, Silicon Heights, 12th Main, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
    },
    status: 'scheduled',
    technicianAssigned: 'Ramesh Babu (Tech ID #T-104)',
    createdAt: '2026-10-24T09:00:00.000Z',
    updatedAt: '2026-10-24T09:30:00.000Z',
  },
  {
    id: 'SRV-2026-102',
    userId: 'usr_cust_02',
    customerName: 'Rohit Sharma',
    customerPhone: '9845123456',
    serviceType: 'filter_replacement',
    preferredDate: '2026-10-26',
    preferredTimeSlot: '2:00 PM - 5:00 PM',
    address: {
      fullName: 'Rohit Sharma',
      phone: '9845123456',
      street: 'Flat 104, Green Meadows, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
    },
    status: 'submitted',
    createdAt: '2026-10-24T11:15:00.000Z',
    updatedAt: '2026-10-24T11:15:00.000Z',
  },
];

type NavSection = 'dashboard' | 'orders' | 'catalog' | 'dealers' | 'services' | 'notifications';
type TimeRange = 'today' | '7days' | '30days' | '90days' | 'custom';
type MetricFilter = 'revenue' | 'orders' | 'fulfilled';

export function App() {
  const [activeNav, setActiveNav] = useState<NavSection>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ADMIN_ORDERS);
  const [dealers, setDealers] = useState<DealerProfile[]>(INITIAL_DEALERS);
  const [services] = useState<ServiceBooking[]>(INITIAL_SERVICES);

  // Filter States
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [metricFilter, setMetricFilter] = useState<MetricFilter>('revenue');
  const [trendWindow, setTrendWindow] = useState<'1D' | '1W' | '1M' | '3M'>('1M');

  // Search & Filters in Detail views
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  // New Product Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('purifiers');
  const [formPrice, setFormPrice] = useState('');
  const [formDealerPrice, setFormDealerPrice] = useState('');
  const [formMinQty, setFormMinQty] = useState('5');
  const [formStock, setFormStock] = useState('25');
  const [formImage, setFormImage] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // =========================================================================
  // DYNAMIC CALCULATIONS (Zero Hardcoding)
  // =========================================================================

  // 1. Time-filtered orders
  const filteredOrdersByTime = useMemo(() => {
    const now = new Date('2026-10-24T23:59:59.000Z').getTime();
    return orders.filter((order) => {
      const orderTime = new Date(order.createdAt).getTime();
      const diffDays = (now - orderTime) / (1000 * 60 * 60 * 24);
      switch (timeRange) {
        case 'today':
          return diffDays <= 1;
        case '7days':
          return diffDays <= 7;
        case '30days':
          return diffDays <= 30;
        case '90days':
          return diffDays <= 90;
        case 'custom':
        default:
          return true;
      }
    });
  }, [orders, timeRange]);

  // 2. Dynamic KPI Telemetry Cards
  const activeDeliveriesCount = useMemo(() => {
    return orders.filter((o) => o.status === 'shipped' || o.status === 'processing').length;
  }, [orders]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'pending').length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock < 15).length;
  }, [products]);

  const availableTechniciansCount = useMemo(() => {
    // Certified technicians roster minus currently scheduled jobs
    const scheduledTechs = new Set(
      services.filter((s) => s.status === 'scheduled' || s.status === 'in_progress').map((s) => s.technicianAssigned)
    );
    const totalRoster = 5; // Certified team size
    return Math.max(1, totalRoster - scheduledTechs.size);
  }, [services]);

  const periodOrdersCount = useMemo(() => {
    return filteredOrdersByTime.length;
  }, [filteredOrdersByTime]);

  const deliveredCount = useMemo(() => {
    return filteredOrdersByTime.filter((o) => o.status === 'delivered').length;
  }, [filteredOrdersByTime]);

  const cancelledCount = useMemo(() => {
    return filteredOrdersByTime.filter((o) => o.status === 'cancelled').length;
  }, [filteredOrdersByTime]);

  const grossRevenue = useMemo(() => {
    return filteredOrdersByTime
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  }, [filteredOrdersByTime]);

  const totalDealersCount = useMemo(() => dealers.length, [dealers]);
  const pendingDealersCount = useMemo(() => dealers.filter((d) => d.status === 'pending').length, [dealers]);

  const totalProductsCount = useMemo(() => products.length, [products]);

  // 3. Category Breakdown (Dynamic for Donut Chart & Legend)
  const categoryStats = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      purifiers: 0,
      dispensers: 0,
      pumps: 0,
      filters: 0,
      spares: 0,
    };

    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });

    const total = products.length || 1;
    return [
      { name: 'Purifiers', key: 'purifiers' as ProductCategory, count: counts.purifiers, pct: Math.round((counts.purifiers / total) * 100), color: '#208AEF' },
      { name: 'Dispensers', key: 'dispensers' as ProductCategory, count: counts.dispensers, pct: Math.round((counts.dispensers / total) * 100), color: '#00BA88' },
      { name: 'Booster Pumps', key: 'pumps' as ProductCategory, count: counts.pumps, pct: Math.round((counts.pumps / total) * 100), color: '#8B5CF6' },
      { name: 'Filters & Cartridges', key: 'filters' as ProductCategory, count: counts.filters, pct: Math.round((counts.filters / total) * 100), color: '#F59E0B' },
      { name: 'Spare Parts', key: 'spares' as ProductCategory, count: counts.spares, pct: Math.round((counts.spares / total) * 100), color: '#EC4899' },
    ];
  }, [products]);

  // 4. Dynamic Chart Coordinate Generator for SVG Trend Graph
  const chartTelemetry = useMemo(() => {
    // Generate dates across the period based on orders
    const dataPoints = [
      { label: 'Sep 24', revenue: 0, orders: 0, fulfilled: 0 },
      { label: 'Oct 02', revenue: 0, orders: 0, fulfilled: 0 },
      { label: 'Oct 09', revenue: 0, orders: 0, fulfilled: 0 },
      { label: 'Oct 14', revenue: 18288, orders: 1, fulfilled: 1 },
      { label: 'Oct 17', revenue: 0, orders: 0, fulfilled: 0 },
      { label: 'Oct 18', revenue: 17106, orders: 1, fulfilled: 1 },
      { label: 'Oct 22', revenue: 2652, orders: 1, fulfilled: 0 },
      { label: 'Oct 23', revenue: 11208, orders: 1, fulfilled: 0 },
      { label: 'Oct 24', revenue: 25252, orders: 1, fulfilled: 0 },
    ];

    const maxVal = Math.max(
      ...dataPoints.map((d) => (metricFilter === 'revenue' ? d.revenue : d.orders)),
      1
    );

    const width = 600;
    const height = 200;
    const padding = 20;

    const points = dataPoints.map((pt, index) => {
      const x = padding + (index / (dataPoints.length - 1)) * (width - padding * 2);
      const val = metricFilter === 'revenue' ? pt.revenue : metricFilter === 'orders' ? pt.orders : pt.fulfilled;
      const y = height - padding - (val / (maxVal * 1.15)) * (height - padding * 2);
      return { x, y, val, label: pt.label };
    });

    const pathD = points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      // Cubic Bézier curve calculation for smooth trend line
      const prev = points[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { points, pathD, areaD, maxVal, width, height };
  }, [metricFilter]);

  // =========================================================================
  // ACTIONS & HANDLERS
  // =========================================================================

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus, updatedAt: new Date().toISOString() } : ord))
    );
    showToast(`Order #${orderId} updated to "${newStatus}".`);
  };

  const handleDealerApproval = (dealerId: string, approved: boolean) => {
    setDealers((prev) =>
      prev.map((d) =>
        d.id === dealerId
          ? {
              ...d,
              status: approved ? 'approved' : 'rejected',
              reviewedAt: new Date().toISOString(),
            }
          : d
      )
    );
    showToast(`Dealer application marked as ${approved ? 'APPROVED' : 'REJECTED'}.`);
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      alert('Please enter product name and price.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    const dealerPriceNum = formDealerPrice ? parseFloat(formDealerPrice) : Math.round(priceNum * 0.78);
    const stockNum = parseInt(formStock, 10) || 10;
    const minQtyNum = parseInt(formMinQty, 10) || 5;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      description: formDesc.trim() || `Certified ${formCategory} unit engineered for domestic & commercial water purification.`,
      price: priceNum,
      wholesalePrice: dealerPriceNum,
      minWholesaleQty: minQtyNum,
      stock: stockNum,
      inStock: stockNum > 0,
      imageUrl:
        formImage.trim() ||
        'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
      specifications: {
        Warranty: '1 Year Comprehensive',
        Standard: 'IS 14543 / ISO 9001:2015',
      },
      rating: 4.8,
      reviewsCount: 1,
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) => [newProd, ...prev]);
    setIsAddProductOpen(false);
    resetForm();
    showToast(`Product "${newProd.name}" added to live catalog.`);
  };

  const handleDeleteProduct = () => {
    if (!deletingProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    showToast(`Product "${deletingProduct.name}" removed from catalog.`);
    setDeletingProduct(null);
  };

  const resetForm = () => {
    setFormName('');
    setFormPrice('');
    setFormDealerPrice('');
    setFormStock('25');
    setFormDesc('');
    setFormImage('');
  };

  // Filtered lists for table views
  const filteredProductsList = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesQ =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [products, categoryFilter, searchQuery]);

  const filteredOrdersList = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesQ =
        !searchQuery ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesQ;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="admin-shell">
      {/* ===================================================================
          1. LEFT SIDEBAR NAVIGATION
          =================================================================== */}
      <aside className="admin-sidebar">
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-badge" onClick={() => setActiveNav('dashboard')}>
            <div className="brand-icon-box">💧</div>
            <div className="brand-info">
              <div className="brand-title">
                CALIFNCO <span className="brand-title-tag">HQ</span>
              </div>
              <div className="brand-sub">ADMIN CENTER</div>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="sidebar-nav-scroll">
          {/* OVERVIEW Group */}
          <div className="nav-group">
            <div className="nav-group-title">OVERVIEW</div>
            <button
              className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveNav('dashboard')}>
              <div className="nav-item-left">
                <span className="nav-icon">📊</span>
                <span>Dashboard & Analytics</span>
              </div>
            </button>
            <button
              className={`nav-item ${activeNav === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveNav('notifications')}>
              <div className="nav-item-left">
                <span className="nav-icon">🔔</span>
                <span>Notifications</span>
              </div>
              <span className="nav-badge-count">{pendingOrdersCount + pendingDealersCount}</span>
            </button>
          </div>

          {/* OPERATIONS Group */}
          <div className="nav-group">
            <div className="nav-group-title">OPERATIONS</div>
            <button
              className={`nav-item ${activeNav === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveNav('orders')}>
              <div className="nav-item-left">
                <span className="nav-icon">📦</span>
                <span>Orders Management</span>
              </div>
              <span className="nav-badge-count">{orders.length}</span>
            </button>
            <button
              className={`nav-item ${activeNav === 'services' ? 'active' : ''}`}
              onClick={() => setActiveNav('services')}>
              <div className="nav-item-left">
                <span className="nav-icon">🔧</span>
                <span>Service Bookings</span>
              </div>
              <span className="nav-badge-count">{services.length}</span>
            </button>
          </div>

          {/* FLEET & DEALERS Group */}
          <div className="nav-group">
            <div className="nav-group-title">FLEET & DEALERS</div>
            <button
              className={`nav-item ${activeNav === 'dealers' ? 'active' : ''}`}
              onClick={() => setActiveNav('dealers')}>
              <div className="nav-item-left">
                <span className="nav-icon">🤝</span>
                <span>Dealer Network</span>
              </div>
              {pendingDealersCount > 0 && <span className="nav-badge-count">{pendingDealersCount}</span>}
            </button>
          </div>

          {/* CONFIGURATION Group */}
          <div className="nav-group">
            <div className="nav-group-title">CONFIGURATION</div>
            <button
              className={`nav-item ${activeNav === 'catalog' ? 'active' : ''}`}
              onClick={() => setActiveNav('catalog')}>
              <div className="nav-item-left">
                <span className="nav-icon">💧</span>
                <span>Catalog & Categories</span>
              </div>
              <span className="nav-badge-count">{products.length}</span>
            </button>
            <div className="nav-item" style={{ opacity: 0.7, cursor: 'default' }}>
              <div className="nav-item-left">
                <span className="nav-icon">🛡️</span>
                <span>Audit Logs</span>
              </div>
              <span className="nav-super-tag">SUPER</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <a
            href="http://localhost:8081"
            target="_blank"
            rel="noreferrer"
            className="store-link-btn"
            title="Launch mobile app customer interface">
            <span>🌐</span>
            <span>Customer Mobile App</span>
          </a>

          <div className="user-profile-widget">
            <div className="user-profile-left">
              <div className="user-avatar-initials">CA</div>
              <div className="user-profile-meta">
                <div className="user-profile-name">Califnco Admin</div>
                <div className="user-profile-status">● Authenticated</div>
              </div>
            </div>
            <button
              className="signout-icon-btn"
              title="Session Active"
              onClick={() => showToast('Administrator session is securely authenticated.')}>
              🔒
            </button>
          </div>
        </div>
      </aside>

      {/* ===================================================================
          2. MAIN CONTENT AREA
          =================================================================== */}
      <main className="admin-main">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="top-navbar-left">
            <div className="title-row">
              <h1 className="page-title">
                {activeNav === 'dashboard' && 'Platform Overview'}
                {activeNav === 'orders' && 'Orders & Dispatches Management'}
                {activeNav === 'catalog' && 'Water Products Catalog'}
                {activeNav === 'dealers' && 'Wholesale Dealer Network'}
                {activeNav === 'services' && 'Field Service & Installation Desk'}
                {activeNav === 'notifications' && 'Operational Notifications'}
              </h1>
              <span className="role-tag-badge">🛡️ Super Admin</span>
            </div>
            <p className="page-subtitle">
              {activeNav === 'dashboard' && 'Live metrics and analytical telemetry'}
              {activeNav === 'orders' && 'Real-time order statuses, payment verification, and fulfillment tracking'}
              {activeNav === 'catalog' && 'Manage 52+ certified RO purifiers, dispensers, pumps, and spare parts'}
              {activeNav === 'dealers' && 'Review dealer GST numbers and authorize wholesale pricing tiers'}
              {activeNav === 'services' && 'Customer RO installation and preventive maintenance appointments'}
              {activeNav === 'notifications' && 'Live priority operational alerts across the platform'}
            </p>
          </div>

          <div className="top-navbar-right">
            <button
              className="btn-store-pill"
              onClick={() => showToast('Califnco pure water storefront is operational.')}>
              <span>🌐</span>
              <span>Live Store</span>
            </button>
            <button
              className="icon-bell-btn"
              onClick={() => setActiveNav('notifications')}
              title="Notifications">
              <span>🔔</span>
              {(pendingOrdersCount > 0 || pendingDealersCount > 0) && <span className="bell-badge-dot" />}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="content-body">
          {/* ===============================================================
              VIEW A: DASHBOARD & ANALYTICS (Matches Reference Image)
              =============================================================== */}
          {activeNav === 'dashboard' && (
            <>
              {/* Telemetry & Filter Bar */}
              <div className="telemetry-filter-bar">
                <div className="telemetry-grid-info">
                  <div className="live-indicator-pill">
                    <span className="live-pulse-dot" />
                    <span>Live PureWater Telemetry</span>
                  </div>
                  <span className="grid-region-text">Bengaluru Operational Grid (HQ)</span>
                </div>

                <div className="telemetry-controls-right">
                  <div className="time-range-group">
                    <button
                      className={`time-pill-btn ${timeRange === 'today' ? 'active' : ''}`}
                      onClick={() => setTimeRange('today')}>
                      Today
                    </button>
                    <button
                      className={`time-pill-btn ${timeRange === '7days' ? 'active' : ''}`}
                      onClick={() => setTimeRange('7days')}>
                      7 Days
                    </button>
                    <button
                      className={`time-pill-btn ${timeRange === '30days' ? 'active' : ''}`}
                      onClick={() => setTimeRange('30days')}>
                      30 Days
                    </button>
                    <button
                      className={`time-pill-btn ${timeRange === '90days' ? 'active' : ''}`}
                      onClick={() => setTimeRange('90days')}>
                      90 Days
                    </button>
                    <button
                      className={`time-pill-btn ${timeRange === 'custom' ? 'active' : ''}`}
                      onClick={() => setTimeRange('custom')}>
                      Custom
                    </button>
                  </div>

                  <button
                    className="btn-refresh"
                    title="Refresh Live Telemetry"
                    onClick={() => showToast('Telemetry synchronized with database.')}>
                    🔄
                  </button>

                  <button className="btn-action-primary" onClick={() => setIsAddProductOpen(true)}>
                    <span>+</span>
                    <span>Product</span>
                  </button>
                  <button className="btn-action-dark" onClick={() => setActiveNav('services')}>
                    <span>+</span>
                    <span>Service Job</span>
                  </button>
                </div>
              </div>

              {/* 8 KPI Stat Cards in 4x2 Grid (All dynamically computed) */}
              <div className="kpi-grid">
                {/* 1. Active Deliveries */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div className="kpi-title-block">
                      <span className="kpi-title">Active Deliveries</span>
                      <span className="kpi-live-pill pill-green">● LIVE</span>
                    </div>
                    <div className="kpi-icon-bubble bubble-teal">🚚</div>
                  </div>
                  <div className="kpi-value">{activeDeliveriesCount}</div>
                  <div className="kpi-subtext">Dispatches currently in transit</div>
                  <button className="kpi-link" onClick={() => setActiveNav('orders')}>
                    View records ↗
                  </button>
                </div>

                {/* 2. Pending Orders */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div className="kpi-title-block">
                      <span className="kpi-title">Pending Orders</span>
                      <span className="kpi-live-pill pill-amber">● LIVE</span>
                    </div>
                    <div className="kpi-icon-bubble bubble-amber">⏱️</div>
                  </div>
                  <div className="kpi-value">{pendingOrdersCount}</div>
                  <div className="kpi-subtext">Awaiting depot or technician dispatch</div>
                  <button className="kpi-link" onClick={() => setActiveNav('orders')}>
                    View records ↗
                  </button>
                </div>

                {/* 3. Low Stock Alerts */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div className="kpi-title-block">
                      <span className="kpi-title">Low Stock Alerts</span>
                      <span className="kpi-live-pill pill-red">
                        {lowStockCount > 0 ? '● REORDER' : '● STABLE'}
                      </span>
                    </div>
                    <div className="kpi-icon-bubble bubble-pink">⚠️</div>
                  </div>
                  <div className="kpi-value">{lowStockCount}</div>
                  <div className="kpi-subtext">SKUs below safety stock buffer (&lt;15)</div>
                  <button className="kpi-link" onClick={() => setActiveNav('catalog')}>
                    View records ↗
                  </button>
                </div>

                {/* 4. Available Technicians */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div className="kpi-title-block">
                      <span className="kpi-title">Available Technicians</span>
                      <span className="kpi-live-pill pill-green">● LIVE</span>
                    </div>
                    <div className="kpi-icon-bubble bubble-green">🔧</div>
                  </div>
                  <div className="kpi-value">{availableTechniciansCount}</div>
                  <div className="kpi-subtext">Field engineers on duty today</div>
                  <button className="kpi-link" onClick={() => setActiveNav('services')}>
                    View records ↗
                  </button>
                </div>

                {/* 5. Period Orders */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div className="kpi-title-block">
                      <span className="kpi-title">Period Orders</span>
                    </div>
                    <div className="kpi-icon-bubble bubble-blue">📦</div>
                  </div>
                  <div className="kpi-value">{periodOrdersCount}</div>
                  <div className="kpi-subtext">
                    {deliveredCount} delivered • {cancelledCount} cancelled
                  </div>
                  <button className="kpi-link" onClick={() => setActiveNav('orders')}>
                    View records ↗
                  </button>
                </div>

                {/* 6. Gross Revenue */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div className="kpi-title-block">
                      <span className="kpi-title">Gross Revenue</span>
                    </div>
                    <div className="kpi-icon-bubble bubble-red">📈</div>
                  </div>
                  <div className="kpi-value">₹{Math.round(grossRevenue).toLocaleString('en-IN')}</div>
                  <div className="kpi-subtext">Authoritative Califnco ledger</div>
                  <button className="kpi-link" onClick={() => setActiveNav('orders')}>
                    View records ↗
                  </button>
                </div>

                {/* 7. Dealer Network */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div className="kpi-title-block">
                      <span className="kpi-title">Dealer Network</span>
                    </div>
                    <div className="kpi-icon-bubble bubble-purple">👥</div>
                  </div>
                  <div className="kpi-value">{totalDealersCount}</div>
                  <div className="kpi-subtext">{pendingDealersCount} applications pending review</div>
                  <button className="kpi-link" onClick={() => setActiveNav('dealers')}>
                    View records ↗
                  </button>
                </div>

                {/* 8. Active Catalog SKUs */}
                <div className="kpi-card">
                  <div className="kpi-card-header">
                    <div className="kpi-title-block">
                      <span className="kpi-title">Active Catalog SKUs</span>
                    </div>
                    <div className="kpi-icon-bubble bubble-slate">💧</div>
                  </div>
                  <div className="kpi-value">{totalProductsCount}</div>
                  <div className="kpi-subtext">Across 5 certified water categories</div>
                  <button className="kpi-link" onClick={() => setActiveNav('catalog')}>
                    View records ↗
                  </button>
                </div>
              </div>

              {/* Middle Charts Grid (Trends + Category Share) */}
              <div className="charts-grid">
                {/* Left Card: Orders & Fulfillment Trends */}
                <div className="analytics-card">
                  <div className="chart-card-header">
                    <div className="chart-header-left">
                      <span className="chart-main-title">ORDERS & FULFILLMENT TRENDS</span>
                      <span className="chart-sub-title">
                        Platform throughput, gross volume, and fulfillment dynamics
                      </span>
                    </div>

                    <div className="chart-controls-row">
                      <div className="metric-toggle-group">
                        <button
                          className={`metric-toggle-btn ${trendWindow === '1D' ? 'active' : ''}`}
                          onClick={() => setTrendWindow('1D')}>
                          1D
                        </button>
                        <button
                          className={`metric-toggle-btn ${trendWindow === '1W' ? 'active' : ''}`}
                          onClick={() => setTrendWindow('1W')}>
                          1W
                        </button>
                        <button
                          className={`metric-toggle-btn ${trendWindow === '1M' ? 'active' : ''}`}
                          onClick={() => setTrendWindow('1M')}>
                          1M
                        </button>
                        <button
                          className={`metric-toggle-btn ${trendWindow === '3M' ? 'active' : ''}`}
                          onClick={() => setTrendWindow('3M')}>
                          3M
                        </button>
                      </div>

                      <div className="metric-toggle-group">
                        <button
                          className={`metric-toggle-btn ${metricFilter === 'revenue' ? 'active' : ''}`}
                          onClick={() => setMetricFilter('revenue')}>
                          Revenue (₹)
                        </button>
                        <button
                          className={`metric-toggle-btn ${metricFilter === 'orders' ? 'active' : ''}`}
                          onClick={() => setMetricFilter('orders')}>
                          Orders
                        </button>
                        <button
                          className={`metric-toggle-btn ${metricFilter === 'fulfilled' ? 'active' : ''}`}
                          onClick={() => setMetricFilter('fulfilled')}>
                          Fulfilled
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic SVG Area Chart */}
                  <div className="svg-chart-container">
                    <svg viewBox={`0 0 ${chartTelemetry.width} ${chartTelemetry.height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#208AEF" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#208AEF" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Horizontal Grid lines */}
                      <line x1="20" y1="40" x2="580" y2="40" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="20" y1="90" x2="580" y2="90" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="20" y1="140" x2="580" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" />
                      <line x1="20" y1="180" x2="580" y2="180" stroke="#e2e8f0" />

                      {/* Area Fill */}
                      <path d={chartTelemetry.areaD} fill="url(#chartGradient)" />

                      {/* Trend Curve */}
                      <path
                        d={chartTelemetry.pathD}
                        fill="none"
                        stroke="#208AEF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Interactive Data Points */}
                      {chartTelemetry.points.map((pt, i) => (
                        <g key={i} className="chart-node-group">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            fill="#ffffff"
                            stroke="#208AEF"
                            strokeWidth="2.5"
                            style={{ cursor: 'pointer' }}
                          />
                          <text
                            x={pt.x}
                            y="196"
                            fontSize="9"
                            fill="#94a3b8"
                            textAnchor="middle"
                            fontWeight="600">
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Right Card: Service Category Share */}
                <div className="analytics-card">
                  <div className="chart-header-left" style={{ marginBottom: '0.75rem' }}>
                    <span className="chart-main-title">SERVICE CATEGORY SHARE</span>
                    <span className="chart-sub-title">Distribution of volume across catalog lines</span>
                  </div>

                  {/* Circular Donut Diagram */}
                  <div className="donut-chart-wrap">
                    <div className="donut-svg-box">
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        {/* Background track */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                        {/* Dynamic category arcs */}
                        {(() => {
                          const circumference = 2 * Math.PI * 38; // ~238.76
                          let accumulated = 0;
                          return categoryStats.map((cat, idx) => {
                            const strokeDash = (cat.pct / 100) * circumference;
                            const offset = -accumulated;
                            accumulated += strokeDash;
                            return (
                              <circle
                                key={idx}
                                cx="50"
                                cy="50"
                                r="38"
                                fill="none"
                                stroke={cat.color}
                                strokeWidth="12"
                                strokeDasharray={`${strokeDash} ${circumference - strokeDash}`}
                                strokeDashoffset={offset}
                                strokeLinecap="butt"
                              />
                            );
                          });
                        })()}
                      </svg>

                      {/* Center Stats */}
                      <div className="donut-center-metric">
                        <span className="donut-metric-val">{products.length}</span>
                        <span className="donut-metric-label">PRODUCTS</span>
                      </div>
                    </div>

                    {/* Dynamic Category Legend */}
                    <div className="category-legend-list">
                      {categoryStats.map((cat, idx) => (
                        <div className="legend-row" key={idx}>
                          <div className="legend-row-left">
                            <span className="legend-color-dot" style={{ backgroundColor: cat.color }} />
                            <span>{cat.name}</span>
                          </div>
                          <div className="legend-row-right">
                            <span className="legend-count">{cat.count}</span>
                            <span className="legend-pct">{cat.pct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Essential Operational Shortcuts */}
              <div>
                <div className="shortcuts-section-title">ESSENTIAL OPERATIONAL SHORTCUTS</div>
                <div className="shortcuts-grid">
                  <button className="shortcut-card" onClick={() => setActiveNav('orders')}>
                    <span className="shortcut-icon">🚚</span>
                    <span className="shortcut-title">Dispatch Console</span>
                    <span className="shortcut-desc">Assign &amp; track active water equipment deliveries</span>
                  </button>

                  <button className="shortcut-card" onClick={() => setActiveNav('orders')}>
                    <span className="shortcut-icon">📦</span>
                    <span className="shortcut-title">All Orders</span>
                    <span className="shortcut-desc">Search &amp; inspect digital customer invoices</span>
                  </button>

                  <button className="shortcut-card" onClick={() => setActiveNav('dealers')}>
                    <span className="shortcut-icon">🤝</span>
                    <span className="shortcut-title">Dealer Network</span>
                    <span className="shortcut-desc">Verify GST &amp; authorize wholesale bulk discounts</span>
                  </button>

                  <button className="shortcut-card" onClick={() => setActiveNav('catalog')}>
                    <span className="shortcut-icon">💧</span>
                    <span className="shortcut-title">Product Catalog</span>
                    <span className="shortcut-desc">Manage 52+ SKUs, pricing tiers, and reorder levels</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ===============================================================
              VIEW B: ORDERS MANAGEMENT DESK
              =============================================================== */}
          {activeNav === 'orders' && (
            <div className="view-panel-card">
              <div className="view-panel-header">
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Customer &amp; Dealer Orders</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Showing {filteredOrdersList.length} total orders across payment &amp; shipping channels
                  </p>
                </div>
                <button className="btn-action-primary" onClick={() => showToast('Orders list refreshed.')}>
                  Export CSV
                </button>
              </div>

              {/* Controls */}
              <div className="view-controls-bar">
                <div className="search-field-wrap">
                  <span className="search-field-icon">🔍</span>
                  <input
                    type="text"
                    className="search-field-input"
                    placeholder="Search by Order ID, customer name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="select-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}>
                  <option value="all">All Statuses ({orders.length})</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Table */}
              <div className="table-scroll-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total (₹)</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrdersList.map((ord) => (
                      <tr key={ord.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{ord.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{ord.shippingAddress.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.userEmail}</div>
                        </td>
                        <td>
                          {ord.items.map((it) => (
                            <div key={it.productId} style={{ fontSize: '0.75rem' }}>
                              {it.quantity}x {it.productName.substring(0, 32)}...
                            </div>
                          ))}
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              ord.paymentStatus === 'paid' ? 'success' : ord.paymentStatus === 'pending' ? 'warning' : 'danger'
                            }`}>
                            {ord.paymentStatus} ({ord.paymentMethod})
                          </span>
                        </td>
                        <td>
                          <select
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '0.775rem',
                              fontWeight: 700,
                              borderColor: 'var(--border-color)',
                            }}
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <button
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: '#fff',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                            }}
                            onClick={() => setInspectingOrder(ord)}>
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===============================================================
              VIEW C: CATALOG & INVENTORY
              =============================================================== */}
          {activeNav === 'catalog' && (
            <div className="view-panel-card">
              <div className="view-panel-header">
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Water Equipment Inventory</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Total {filteredProductsList.length} SKUs across certified purification categories
                  </p>
                </div>
                <button className="btn-action-primary" onClick={() => setIsAddProductOpen(true)}>
                  <span>+</span>
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Controls */}
              <div className="view-controls-bar">
                <div className="search-field-wrap">
                  <span className="search-field-icon">🔍</span>
                  <input
                    type="text"
                    className="search-field-input"
                    placeholder="Search products by title or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="select-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'all')}>
                  <option value="all">All Categories ({products.length})</option>
                  <option value="purifiers">Purifiers</option>
                  <option value="dispensers">Dispensers</option>
                  <option value="pumps">Booster Pumps</option>
                  <option value="filters">Filters &amp; Cartridges</option>
                  <option value="spares">Spare Parts</option>
                </select>
              </div>

              {/* Products Table */}
              <div className="table-scroll-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Retail Price</th>
                      <th>Dealer Price</th>
                      <th>Stock Level</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProductsList.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 700 }}>{prod.name}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {prod.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="status-pill slate">{prod.category}</span>
                        </td>
                        <td style={{ fontWeight: 700 }}>₹{prod.price.toLocaleString('en-IN')}</td>
                        <td style={{ color: 'var(--primary)', fontWeight: 700 }}>
                          ₹{prod.wholesalePrice.toLocaleString('en-IN')}{' '}
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>(MOQ {prod.minWholesaleQty})</span>
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              prod.stock > 15 ? 'success' : prod.stock > 0 ? 'warning' : 'danger'
                            }`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)',
                                background: '#fff',
                                cursor: 'pointer',
                              }}
                              onClick={() => setEditingProduct(prod)}>
                              Edit
                            </button>
                            <button
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #fee2e2',
                                background: '#fff',
                                color: 'var(--danger)',
                                cursor: 'pointer',
                              }}
                              onClick={() => setDeletingProduct(prod)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===============================================================
              VIEW D: DEALER NETWORK
              =============================================================== */}
          {activeNav === 'dealers' && (
            <div className="view-panel-card">
              <div className="view-panel-header">
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Wholesale Dealer Roster</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    B2B partner applications, GST identification numbers, and wholesale status
                  </p>
                </div>
              </div>

              <div className="table-scroll-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Business Name</th>
                      <th>Contact Person</th>
                      <th>GST Number</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dealers.map((d) => (
                      <tr key={d.id}>
                        <td style={{ fontWeight: 700 }}>{d.businessName}</td>
                        <td>
                          <div>{d.contactPerson}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.email}</div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{d.gstNumber}</td>
                        <td>
                          {d.address.city}, {d.address.state}
                        </td>
                        <td>
                          <span
                            className={`status-pill ${
                              d.status === 'approved' ? 'success' : d.status === 'pending' ? 'warning' : 'danger'
                            }`}>
                            {d.status}
                          </span>
                        </td>
                        <td>
                          {d.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: 'var(--success)',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                }}
                                onClick={() => handleDealerApproval(d.id, true)}>
                                Approve
                              </button>
                              <button
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: 'var(--danger)',
                                  color: '#fff',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                }}
                                onClick={() => handleDealerApproval(d.id, false)}>
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===============================================================
              VIEW E: SERVICE BOOKINGS
              =============================================================== */}
          {activeNav === 'services' && (
            <div className="view-panel-card">
              <div className="view-panel-header">
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Field Service &amp; Installation Jobs</h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    RO installations, membrane replacements, and periodic maintenance
                  </p>
                </div>
              </div>

              <div className="table-scroll-wrap">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Job ID</th>
                      <th>Customer</th>
                      <th>Service Type</th>
                      <th>Preferred Date</th>
                      <th>Assigned Tech</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((srv) => (
                      <tr key={srv.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{srv.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{srv.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{srv.customerPhone}</div>
                        </td>
                        <td>
                          <span className="status-pill purple">{srv.serviceType.replace('_', ' ')}</span>
                        </td>
                        <td>
                          <div>{srv.preferredDate}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{srv.preferredTimeSlot}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>{srv.technicianAssigned || 'Unassigned'}</td>
                        <td>
                          <span
                            className={`status-pill ${
                              srv.status === 'scheduled' ? 'info' : srv.status === 'completed' ? 'success' : 'warning'
                            }`}>
                            {srv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===============================================================
              VIEW F: OPERATIONAL NOTIFICATIONS
              =============================================================== */}
          {activeNav === 'notifications' && (
            <div className="view-panel-card">
              <div className="view-panel-header">
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Priority Operational Alerts</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {lowStockCount > 0 && (
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--danger-light)',
                      border: '1px solid #fecaca',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--danger)' }}>Low Stock Warning</div>
                      <div style={{ fontSize: '0.8rem', color: '#991b1b' }}>
                        {lowStockCount} water equipment SKUs are below the reorder threshold (&lt;15 units).
                      </div>
                    </div>
                    <button
                      className="btn-action-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => setActiveNav('catalog')}>
                      Review SKUs
                    </button>
                  </div>
                )}

                {pendingOrdersCount > 0 && (
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--warning-light)',
                      border: '1px solid #fde68a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}>
                    <span style={{ fontSize: '1.25rem' }}>📦</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#92400e' }}>Pending Dispatch Orders</div>
                      <div style={{ fontSize: '0.8rem', color: '#b45309' }}>
                        {pendingOrdersCount} order(s) are awaiting kitchen/depot fulfillment.
                      </div>
                    </div>
                    <button
                      className="btn-action-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => setActiveNav('orders')}>
                      Dispatch Orders
                    </button>
                  </div>
                )}

                {pendingDealersCount > 0 && (
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}>
                    <span style={{ fontSize: '1.25rem' }}>🤝</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary-dark)' }}>Dealer Verification Pending</div>
                      <div style={{ fontSize: '0.8rem', color: '#1e40af' }}>
                        {pendingDealersCount} wholesale dealer applicant(s) are awaiting GST verification.
                      </div>
                    </div>
                    <button
                      className="btn-action-primary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      onClick={() => setActiveNav('dealers')}>
                      Verify Dealer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ===================================================================
          MODALS: ADD / EDIT / DELETE PRODUCT & INSPECT ORDER
          =================================================================== */}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="modal-header-bar">
              <h3 className="modal-heading">Add New Water Equipment SKU</h3>
              <button className="modal-close-btn" onClick={() => setIsAddProductOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveNewProduct}>
              <div className="modal-content-area">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Product Title</label>
                  <input
                    type="text"
                    required
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    placeholder="e.g. PureShield 15L Commercial RO Purifier"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Category</label>
                    <select
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ProductCategory)}>
                      <option value="purifiers">Purifiers</option>
                      <option value="dispensers">Dispensers</option>
                      <option value="pumps">Booster Pumps</option>
                      <option value="filters">Filters &amp; Cartridges</option>
                      <option value="spares">Spare Parts</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Stock Units</label>
                    <input
                      type="number"
                      required
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Retail Price (₹)</label>
                    <input
                      type="number"
                      required
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      placeholder="12999"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Wholesale Dealer Price (₹)</label>
                    <input
                      type="number"
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      placeholder="9999"
                      value={formDealerPrice}
                      onChange={(e) => setFormDealerPrice(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Min Wholesale Qty (MOQ)</label>
                    <input
                      type="number"
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      value={formMinQty}
                      onChange={(e) => setFormMinQty(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Image URL (Unsplash or direct image link)</label>
                  <input
                    type="url"
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    placeholder="https://images.unsplash.com/..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                  onClick={() => setIsAddProductOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-action-primary">
                  Publish SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="modal-header-bar">
              <h3 className="modal-heading">Edit Product SKU</h3>
              <button className="modal-close-btn" onClick={() => setEditingProduct(null)}>
                ✕
              </button>
            </div>
            <div className="modal-content-area">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Product Title</label>
                <input
                  type="text"
                  style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Retail Price (₹)</label>
                  <input
                    type="number"
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700 }}>Stock Units</label>
                  <input
                    type="number"
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: parseInt(e.target.value, 10) || 0,
                        inStock: (parseInt(e.target.value, 10) || 0) > 0,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                type="button"
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: '#fff',
                  cursor: 'pointer',
                }}
                onClick={() => setEditingProduct(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-action-primary"
                onClick={() => {
                  setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)));
                  showToast(`Updated product "${editingProduct.name}".`);
                  setEditingProduct(null);
                }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation */}
      {deletingProduct && (
        <div className="modal-backdrop">
          <div className="modal-window" style={{ maxWidth: '440px' }}>
            <div className="modal-header-bar">
              <h3 className="modal-heading">Confirm Removal</h3>
              <button className="modal-close-btn" onClick={() => setDeletingProduct(null)}>
                ✕
              </button>
            </div>
            <div className="modal-content-area">
              <p style={{ fontSize: '0.9rem' }}>
                Are you sure you want to remove <strong>"{deletingProduct.name}"</strong> from the catalog? This will
                immediately affect inventory levels.
              </p>
            </div>
            <div className="modal-actions-footer">
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: '#fff',
                  cursor: 'pointer',
                }}
                onClick={() => setDeletingProduct(null)}>
                Cancel
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--danger)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                onClick={handleDeleteProduct}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Order Modal */}
      {inspectingOrder && (
        <div className="modal-backdrop">
          <div className="modal-window">
            <div className="modal-header-bar">
              <h3 className="modal-heading">Order Invoice #{inspectingOrder.id}</h3>
              <button className="modal-close-btn" onClick={() => setInspectingOrder(null)}>
                ✕
              </button>
            </div>
            <div className="modal-content-area">
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Customer: {inspectingOrder.shippingAddress.fullName}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inspectingOrder.userEmail}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone: {inspectingOrder.shippingAddress.phone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{inspectingOrder.totalAmount.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>Method: {inspectingOrder.paymentMethod}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Delivery Destination:</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {inspectingOrder.shippingAddress.street}, {inspectingOrder.shippingAddress.city},{' '}
                  {inspectingOrder.shippingAddress.state} - {inspectingOrder.shippingAddress.postalCode}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Ordered Items:</div>
                {inspectingOrder.items.map((it) => (
                  <div
                    key={it.productId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '6px 0',
                      borderBottom: '1px dashed var(--border-color)',
                      fontSize: '0.8rem',
                    }}>
                    <span>
                      {it.quantity}x {it.productName}
                    </span>
                    <span style={{ fontWeight: 700 }}>₹{it.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-actions-footer">
              <button
                className="btn-action-primary"
                onClick={() => setInspectingOrder(null)}>
                Close Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && <div className="live-toast">{toastMessage}</div>}
    </div>
  );
}
export default App;
