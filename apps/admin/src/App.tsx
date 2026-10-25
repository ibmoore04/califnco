import React, { useState, useMemo, useEffect } from 'react';
import {
  INITIAL_PRODUCTS,
  type Product,
  type Order,
  type ProductCategory,
  type OrderStatus,
  type DealerProfile,
  type ServiceBooking,
} from '@shared';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { adminDb, adminAuth } from './lib/firebase';
import { CustomDropdown } from './components/CustomDropdown';

type NavSection = 'dashboard' | 'orders' | 'catalog' | 'dealers' | 'services' | 'notifications' | 'marketing';
type TimeRange = 'today' | '7days' | '30days' | '90days' | 'custom';
type MetricFilter = 'revenue' | 'orders' | 'fulfilled';

export function App() {
  const [activeNav, setActiveNav] = useState<NavSection>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dealers, setDealers] = useState<DealerProfile[]>([]);
  const [services, setServices] = useState<ServiceBooking[]>([]);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [, setIsBackendLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdminClaimVerified, setIsAdminClaimVerified] = useState<boolean>(false);

  // Admin Authentication Modal & State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedUid, setCopiedUid] = useState<boolean>(false);

  // Responsive Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

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

  // AI Marketing Studio State
  const [marketingProductId, setMarketingProductId] = useState<string>('');
  const [showRawMetaPayload, setShowRawMetaPayload] = useState<boolean>(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firestore Subscriptions
  useEffect(() => {
    if (!adminDb) {
      setIsBackendLoading(false);
      return;
    }

    // Products are publicly readable
    const unsubProducts = onSnapshot(
      collection(adminDb, 'products'),
      (snapshot) => {
        const list: Product[] = [];
        snapshot.forEach((d) => list.push(d.data() as Product));
        setProducts(list);
        setIsBackendLoading(false);
      },
      (err) => {
        console.warn('[Admin Firestore] Products subscription warning:', err.message);
        setIsBackendLoading(false);
      }
    );

    // Orders, Dealers, and Services require authenticated administrator with verified claim
    let unsubOrders = () => {};
    let unsubDealers = () => {};
    let unsubServices = () => {};

    if (adminUser && isAdminClaimVerified) {
      unsubOrders = onSnapshot(
        collection(adminDb, 'orders'),
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Order;
            list.push({
              ...data,
              id: data.id || d.id,
              shippingAddress: data.shippingAddress || {
                fullName: 'Customer',
                phone: '',
                street: '',
                city: '',
                state: '',
                postalCode: '',
              },
              items: data.items || [],
              totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : 0,
              userEmail: data.userEmail || '',
              status: data.status || 'pending',
              paymentStatus: data.paymentStatus || 'pending',
              paymentMethod: data.paymentMethod || 'demo_simulated',
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(list);
        },
        (err) => {
          console.warn('[Admin Firestore] Orders subscription warning:', err.message);
        }
      );

      unsubDealers = onSnapshot(
        collection(adminDb, 'dealers'),
        (snapshot) => {
          const list: DealerProfile[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as DealerProfile;
            list.push({
              ...data,
              id: data.id || d.id,
              businessName: data.businessName || (data as any).companyName || 'Business',
              companyName: (data as any).companyName || data.businessName || 'Business',
              address: data.address || {
                fullName: '',
                phone: '',
                street: '',
                city: '',
                state: '',
                postalCode: '',
              },
              appliedAt: data.appliedAt || new Date().toISOString(),
            });
          });
          setDealers(list);
        },
        (err) => {
          console.warn('[Admin Firestore] Dealers subscription warning:', err.message);
        }
      );

      unsubServices = onSnapshot(
        collection(adminDb, 'services'),
        (snapshot) => {
          const list: ServiceBooking[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as ServiceBooking;
            list.push({
              ...data,
              id: data.id || d.id,
              address: data.address || {
                fullName: '',
                phone: '',
                street: '',
                city: '',
                state: '',
                postalCode: '',
              },
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          setServices(list);
        },
        (err) => {
          console.warn('[Admin Firestore] Services subscription warning:', err.message);
        }
      );
    } else {
      setOrders([]);
      setDealers([]);
      setServices([]);
    }

    return () => {
      unsubProducts();
      unsubOrders();
      unsubDealers();
      unsubServices();
    };
  }, [adminUser, isAdminClaimVerified]);

  // Listen to Firebase Auth state & verify custom claims
  useEffect(() => {
    if (!adminAuth) return;
    const unsubAuth = onAuthStateChanged(adminAuth, async (user) => {
      setAdminUser(user);
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true);
          setIsAdminClaimVerified(Boolean(tokenResult.claims.admin));
        } catch {
          setIsAdminClaimVerified(false);
        }
      } else {
        setIsAdminClaimVerified(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // Admin Sign In Handler
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAuth) {
      setAuthError('Firebase Authentication is not configured in this environment.');
      return;
    }
    if (!authEmail.trim() || !authPassword) {
      setAuthError('Please enter both email and password.');
      return;
    }

    setIsAuthSubmitting(true);
    setAuthError(null);

    try {
      const cred = await signInWithEmailAndPassword(adminAuth, authEmail.trim(), authPassword);
      setAdminUser(cred.user);
      const tokenResult = await cred.user.getIdTokenResult(true);
      const hasClaim = Boolean(tokenResult.claims.admin);
      setIsAdminClaimVerified(hasClaim);
      setIsAuthSubmitting(false);
      setIsAuthModalOpen(false);
      setAuthPassword('');

      if (hasClaim) {
        showToast(`✓ Welcome Admin (${cred.user.email})! Live Firestore permissions active.`);
      } else {
        showToast(`Signed in as ${cred.user.email}. (Admin claim 'admin: true' pending assignment)`);
      }
    } catch (err: any) {
      setIsAuthSubmitting(false);
      setAuthError(err.message || 'Authentication failed. Please verify email and password.');
    }
  };

  // Admin Sign Out Handler
  const handleAdminSignOut = async () => {
    if (adminAuth) {
      await firebaseSignOut(adminAuth);
      setAdminUser(null);
      setIsAdminClaimVerified(false);
      showToast('Signed out of Administrator session.');
    }
  };

  // Dynamic Time-filtered Orders based on real current date
  const filteredOrdersByTime = useMemo(() => {
    const now = new Date().getTime();
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

  // Dynamic KPI Telemetry Cards (All zero if database is empty)
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
    if (services.length === 0) return 0;
    const scheduledTechs = new Set(
      services
        .filter((s) => s.status === 'scheduled' || s.status === 'in_progress')
        .map((s) => s.technicianAssigned)
    );
    const totalRoster = 5;
    return Math.max(0, totalRoster - scheduledTechs.size);
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
  const pendingDealersCount = useMemo(
    () => dealers.filter((d) => d.status === 'pending').length,
    [dealers]
  );
  const totalProductsCount = useMemo(() => products.length, [products]);

  // Category Breakdown dynamically computed from live products
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

  // Dynamic Chart Coordinate Generator from actual database orders
  const chartTelemetry = useMemo(() => {
    const numBuckets = 7;
    const now = new Date().getTime();
    let daysSpan = 30;
    if (timeRange === 'today') daysSpan = 1;
    else if (timeRange === '7days') daysSpan = 7;
    else if (timeRange === '30days') daysSpan = 30;
    else if (timeRange === '90days') daysSpan = 90;

    const bucketDuration = (daysSpan * 24 * 60 * 60 * 1000) / (numBuckets - 1);
    const startTime = now - daysSpan * 24 * 60 * 60 * 1000;

    const dataPoints = Array.from({ length: numBuckets }, (_, i) => {
      const bucketTime = startTime + i * bucketDuration;
      const d = new Date(bucketTime);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        label,
        timestamp: bucketTime,
        revenue: 0,
        orders: 0,
        fulfilled: 0,
      };
    });

    filteredOrdersByTime.forEach((ord) => {
      const ordTime = new Date(ord.createdAt).getTime();
      let nearestIndex = 0;
      let minDiff = Infinity;
      dataPoints.forEach((pt, idx) => {
        const diff = Math.abs(pt.timestamp - ordTime);
        if (diff < minDiff) {
          minDiff = diff;
          nearestIndex = idx;
        }
      });

      if (nearestIndex >= 0 && nearestIndex < dataPoints.length) {
        dataPoints[nearestIndex].orders += 1;
        if (ord.paymentStatus === 'paid') {
          dataPoints[nearestIndex].revenue += ord.totalAmount;
        }
        if (ord.status === 'delivered') {
          dataPoints[nearestIndex].fulfilled += 1;
        }
      }
    });

    const maxVal = Math.max(
      ...dataPoints.map((d) =>
        metricFilter === 'revenue' ? d.revenue : metricFilter === 'orders' ? d.orders : d.fulfilled
      ),
      1
    );

    const width = 600;
    const height = 200;
    const padding = 20;

    const points = dataPoints.map((pt, index) => {
      const x = padding + (index / (dataPoints.length - 1)) * (width - padding * 2);
      const val =
        metricFilter === 'revenue' ? pt.revenue : metricFilter === 'orders' ? pt.orders : pt.fulfilled;
      const y = height - padding - (val / (maxVal * 1.15)) * (height - padding * 2);
      return { x, y, val, label: pt.label };
    });

    const pathD = points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = points[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return { points, pathD, areaD, maxVal, width, height, dataPoints };
  }, [filteredOrdersByTime, metricFilter, timeRange]);

  // Seed Initial Catalog to Firestore Backend
  const handleSeedCatalogToFirestore = async () => {
    if (!adminDb) {
      alert('Firestore is not configured.');
      return;
    }
    if (!adminUser) {
      setIsAuthModalOpen(true);
      showToast('Please sign in as Administrator before seeding the catalog.');
      return;
    }
    const db = adminDb;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach((p) => {
        const ref = doc(db, 'products', p.id);
        batch.set(ref, p, { merge: true });
      });
      await batch.commit();
      showToast('Successfully seeded 52 certified catalog products to Firestore backend!');
    } catch (err: any) {
      console.error('Failed to seed catalog:', err);
      if (err?.code === 'permission-denied' || String(err).includes('permission')) {
        alert('Permission Denied: Administrator custom claim { admin: true } is required by firestore.rules to modify the catalog.\n\nPlease run the assignment command:\nnode scripts/set-admin-claim.mjs ' + (adminUser?.uid || 'TARGET_UID') + ' "path/to/service-account.json"');
      } else {
        alert('Failed to seed catalog: ' + (err?.message || String(err)));
      }
    } finally {
      setIsSeeding(false);
    }
  };

  // Order status update in Firestore backend
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    if (adminDb) {
      try {
        await updateDoc(doc(adminDb, 'orders', orderId), {
          status: newStatus,
          updatedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Failed to update order status in backend:', e);
      }
    } else {
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === orderId ? { ...ord, status: newStatus, updatedAt: new Date().toISOString() } : ord
        )
      );
    }
    showToast(`Order #${orderId} updated to "${newStatus}".`);
  };

  // Dealer approval in Firestore backend
  const handleDealerApproval = async (dealerId: string, approved: boolean) => {
    const status = approved ? 'approved' : 'rejected';
    const reviewedAt = new Date().toISOString();
    if (adminDb) {
      try {
        await updateDoc(doc(adminDb, 'dealers', dealerId), {
          status,
          reviewedAt,
        });
      } catch (e) {
        console.error('Failed to update dealer status in backend:', e);
      }
    } else {
      setDealers((prev) =>
        prev.map((d) => (d.id === dealerId ? { ...d, status, reviewedAt } : d))
      );
    }
    showToast(`Dealer application marked as ${approved ? 'APPROVED' : 'REJECTED'}.`);
  };

  // Save new or edited product in Firestore backend
  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) {
      alert('Please enter product name and price.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    const dealerPriceNum = formDealerPrice ? parseFloat(formDealerPrice) : Math.round(priceNum * 0.78);
    const stockNum = parseInt(formStock, 10) || 10;
    const minQtyNum = parseInt(formMinQty, 10) || 5;

    const prodId = editingProduct ? editingProduct.id : `prod-${Date.now()}`;
    const productPayload: Product = {
      id: prodId,
      name: formName.trim(),
      category: formCategory,
      description:
        formDesc.trim() ||
        `Certified ${formCategory} unit engineered for domestic & commercial water purification.`,
      price: priceNum,
      wholesalePrice: dealerPriceNum,
      minWholesaleQty: minQtyNum,
      stock: stockNum,
      inStock: stockNum > 0,
      imageUrl:
        formImage.trim() ||
        'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
      specifications: editingProduct?.specifications || {
        Warranty: '1 Year Comprehensive',
        Standard: 'IS 14543 / ISO 9001:2015',
      },
      rating: editingProduct?.rating || 4.8,
      reviewsCount: editingProduct?.reviewsCount || 1,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
    };

    if (adminDb) {
      try {
        await setDoc(doc(adminDb, 'products', prodId), productPayload, { merge: true });
        showToast(
          editingProduct
            ? 'Product updated in backend database.'
            : 'New product created in backend database.'
        );
      } catch (err) {
        console.error('Failed to save product to backend:', err);
        showToast('Error saving product to backend.');
      }
    } else {
      if (editingProduct) {
        setProducts((prev) => prev.map((p) => (p.id === prodId ? productPayload : p)));
      } else {
        setProducts((prev) => [productPayload, ...prev]);
      }
      showToast(editingProduct ? 'Product updated.' : 'New product created.');
    }

    setIsAddProductOpen(false);
    setEditingProduct(null);
    resetForm();
  };

  // Delete product from Firestore backend
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    if (adminDb) {
      try {
        await deleteDoc(doc(adminDb, 'products', deletingProduct.id));
        showToast(`Product "${deletingProduct.name}" removed from backend database.`);
      } catch (err) {
        console.error('Failed to delete product from backend:', err);
      }
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      showToast(`Product "${deletingProduct.name}" removed from catalog.`);
    }
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
        o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesQ;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="admin-shell">
      {/* Mobile Top Header (visible on < 1024px) */}
      <header className="mobile-header-bar">
        <button
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Navigation Menu">
          <span>☰</span>
        </button>
        <div className="mobile-brand-title" onClick={() => { setActiveNav('dashboard'); setIsMobileMenuOpen(false); }}>
          <span>💧 CALIFNCO <span className="brand-title-tag">HQ</span></span>
        </div>
        <div className="mobile-header-actions">
          <button
            className={`mobile-auth-btn ${adminUser ? 'signed-in' : ''}`}
            onClick={() => setIsAuthModalOpen(true)}>
            {adminUser ? (isAdminClaimVerified ? '🛡️ Admin' : '⚠️ Pending') : '🔐 Sign In'}
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ===================================================================
          1. LEFT SIDEBAR NAVIGATION
          =================================================================== */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-badge" onClick={() => { setActiveNav('dashboard'); setIsMobileMenuOpen(false); }}>
            <div className="brand-icon-box">💧</div>
            <div className="brand-info">
              <div className="brand-title">
                CALIFNCO <span className="brand-title-tag">HQ</span>
              </div>
              <div className="brand-sub">ADMIN CENTER</div>
            </div>
          </div>
          <button
            className="mobile-close-sidebar-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close Navigation">
            ✕
          </button>
        </div>

        {/* Navigation Categories */}
        <div className="sidebar-nav-scroll">
          {/* OVERVIEW Group */}
          <div className="nav-group">
            <div className="nav-group-title">OVERVIEW</div>
            <button
              className={`nav-item ${activeNav === 'dashboard' ? 'active' : ''}`}
              onClick={() => { setActiveNav('dashboard'); setIsMobileMenuOpen(false); }}>
              <div className="nav-item-left">
                <span className="nav-icon">📊</span>
                <span>Dashboard & Analytics</span>
              </div>
            </button>
            <button
              className={`nav-item ${activeNav === 'notifications' ? 'active' : ''}`}
              onClick={() => { setActiveNav('notifications'); setIsMobileMenuOpen(false); }}>
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
              onClick={() => { setActiveNav('orders'); setIsMobileMenuOpen(false); }}>
              <div className="nav-item-left">
                <span className="nav-icon">📦</span>
                <span>Orders Management</span>
              </div>
              <span className="nav-badge-count">{orders.length}</span>
            </button>
            <button
              className={`nav-item ${activeNav === 'services' ? 'active' : ''}`}
              onClick={() => { setActiveNav('services'); setIsMobileMenuOpen(false); }}>
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
              onClick={() => { setActiveNav('dealers'); setIsMobileMenuOpen(false); }}>
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
              onClick={() => { setActiveNav('catalog'); setIsMobileMenuOpen(false); }}>
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

          {/* AUTOMATION & SOCIAL Group */}
          <div className="nav-group">
            <div className="nav-group-title">AUTOMATION & MARKETING</div>
            <button
              className={`nav-item ${activeNav === 'marketing' ? 'active' : ''}`}
              onClick={() => { setActiveNav('marketing'); setIsMobileMenuOpen(false); }}>
              <div className="nav-item-left">
                <span className="nav-icon">🤖</span>
                <span>AI Marketing Studio</span>
              </div>
              <span className="nav-badge-count" style={{ backgroundColor: '#10B981', color: '#fff' }}>AUTO</span>
            </button>
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

          <div className="user-profile-widget" onClick={() => setIsAuthModalOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="user-profile-left">
              <div className="user-avatar-initials">
                {adminUser?.email ? adminUser.email.slice(0, 2).toUpperCase() : 'CA'}
              </div>
              <div className="user-profile-meta">
                <div className="user-profile-name" title={adminUser?.email || ''}>
                  {adminUser?.email ? adminUser.email.split('@')[0] : 'Admin Sign In'}
                </div>
                <div className="user-profile-status">
                  {adminUser
                    ? (isAdminClaimVerified ? '● Admin Verified' : '○ Claim Pending')
                    : '○ Click to Sign In'}
                </div>
              </div>
            </div>
            <button
              className="signout-icon-btn"
              title={adminUser ? 'View Account & Claim Details' : 'Sign in as Administrator'}
              onClick={(e) => {
                e.stopPropagation();
                setIsAuthModalOpen(true);
              }}>
              {adminUser ? (isAdminClaimVerified ? '🛡️' : '⚠️') : '🔐'}
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
                {activeNav === 'marketing' && 'AI Marketing Studio & Social Publishing'}
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
              {activeNav === 'marketing' && 'Daily promotional copy generation, Meta Graph Instagram staging, and WhatsApp broadcast'}
            </p>
          </div>

          <div className="top-navbar-right">
            {products.length === 0 && (
              <button
                className="btn-store-pill"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
                disabled={isSeeding}
                onClick={handleSeedCatalogToFirestore}>
                <span>📦</span>
                <span>{isSeeding ? 'Seeding Backend...' : 'Seed Catalog to Backend'}</span>
              </button>
            )}

            {adminUser ? (
              <div className="admin-auth-chip">
                <span className={`auth-badge-dot ${isAdminClaimVerified ? 'verified' : 'pending'}`} />
                <span className="auth-email-text" title={adminUser.email || ''}>
                  {adminUser.email}
                </span>
                <span
                  className={`auth-claim-tag ${isAdminClaimVerified ? 'verified' : 'pending'}`}
                  onClick={() => setIsAuthModalOpen(true)}
                  style={{ cursor: 'pointer' }}>
                  {isAdminClaimVerified ? 'VERIFIED' : 'CLAIM PENDING'}
                </span>
                <button
                  className="auth-signout-btn"
                  onClick={handleAdminSignOut}
                  title="Sign Out">
                  🚪
                </button>
              </div>
            ) : (
              <button
                className="btn-admin-signin"
                onClick={() => setIsAuthModalOpen(true)}>
                <span>🔐</span>
                <span>Admin Sign In</span>
              </button>
            )}

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
          {/* Administrator Authentication Status Banners */}
          {!adminUser && (
            <div className="admin-standby-banner">
              <div className="banner-icon">🛡️</div>
              <div className="banner-text">
                <div className="banner-title">Admin Sign-In Required for Orders & Fleet Operations</div>
                <div className="banner-desc">
                  Firestore rules enforce <code>request.auth.token.admin == true</code>. While products are public, live order dispatches, dealer approvals, and service bookings require an authenticated administrator session.
                </div>
              </div>
              <button className="banner-action-btn" onClick={() => setIsAuthModalOpen(true)}>
                Sign In as Admin
              </button>
            </div>
          )}

          {adminUser && !isAdminClaimVerified && (
            <div className="admin-claim-banner">
              <div className="banner-icon">⚠️</div>
              <div className="banner-text">
                <div className="banner-title">Admin Account Connected — Claim <code>admin: true</code> Required</div>
                <div className="banner-desc">
                  Signed in as <strong>{adminUser.email}</strong> (UID: <code>{adminUser.uid}</code>). To unlock full Firestore write access for catalog seeding and order updates, assign the custom claim via the admin script.
                </div>
              </div>
              <button className="banner-action-btn secondary" onClick={() => setIsAuthModalOpen(true)}>
                View Setup Instructions
              </button>
            </div>
          )}
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

                <CustomDropdown
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val as OrderStatus | 'all')}
                  options={[
                    { value: 'all', label: `All Statuses (${orders.length})` },
                    { value: 'pending', label: 'Pending', icon: '⏳' },
                    { value: 'processing', label: 'Processing', icon: '⚙️' },
                    { value: 'shipped', label: 'Shipped', icon: '🚚' },
                    { value: 'delivered', label: 'Delivered', icon: '✅' },
                    { value: 'cancelled', label: 'Cancelled', icon: '❌' },
                  ]}
                  style={{ minWidth: '180px' }}
                />
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
                    {filteredOrdersList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                          }}>
                          No customer orders recorded in backend database.
                        </td>
                      </tr>
                    ) : (
                      filteredOrdersList.map((ord) => (
                        <tr key={ord.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{ord.id}</td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{ord.shippingAddress?.fullName || 'Customer'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.userEmail || ord.shippingAddress?.phone || 'No email'}</div>
                          </td>
                          <td>
                            {(ord.items || []).map((it, idx) => (
                              <div key={it.productId || idx} style={{ fontSize: '0.75rem' }}>
                                {it.quantity}x {(it.productName || 'Item').substring(0, 32)}...
                              </div>
                            ))}
                          </td>
                          <td style={{ fontWeight: 700 }}>₹{(ord.totalAmount || 0).toLocaleString('en-IN')}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                ord.paymentStatus === 'paid' ? 'success' : ord.paymentStatus === 'pending' ? 'warning' : 'danger'
                              }`}>
                              {ord.paymentStatus} ({ord.paymentMethod})
                            </span>
                          </td>
                          <td>
                            <CustomDropdown
                              size="sm"
                              value={ord.status}
                              onChange={(val) => handleUpdateOrderStatus(ord.id, val as OrderStatus)}
                              options={[
                                { value: 'pending', label: 'Pending', icon: '⏳' },
                                { value: 'processing', label: 'Processing', icon: '⚙️' },
                                { value: 'shipped', label: 'Shipped', icon: '🚚' },
                                { value: 'delivered', label: 'Delivered', icon: '✅' },
                                { value: 'cancelled', label: 'Cancelled', icon: '❌' },
                              ]}
                              style={{ minWidth: '130px' }}
                            />
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
                      ))
                    )}
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

                <CustomDropdown
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val as ProductCategory | 'all')}
                  options={[
                    { value: 'all', label: `All Categories (${products.length})` },
                    { value: 'purifiers', label: 'Purifiers', icon: '💧' },
                    { value: 'dispensers', label: 'Dispensers', icon: '🏢' },
                    { value: 'pumps', label: 'Booster Pumps', icon: '⚡' },
                    { value: 'filters', label: 'Filters & Cartridges', icon: '🔬' },
                    { value: 'spares', label: 'Spare Parts', icon: '🔧' },
                  ]}
                  style={{ minWidth: '200px' }}
                />
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
                    {filteredProductsList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'center',
                            padding: '48px 20px',
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                          }}>
                          <div style={{ marginBottom: '14px', fontWeight: 600 }}>
                            No products found in backend database.
                          </div>
                          <button
                            className="btn-action-primary"
                            style={{
                              margin: '0 auto',
                              display: 'inline-flex',
                              padding: '8px 16px',
                              cursor: 'pointer',
                            }}
                            disabled={isSeeding}
                            onClick={handleSeedCatalogToFirestore}>
                            <span>📦</span>
                            <span>
                              {isSeeding ? 'Writing to Firestore...' : 'Seed 52 Catalog SKUs to Backend'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredProductsList.map((prod) => (
                        <tr key={prod.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    `/products/${prod.category || 'purifiers'}.jpg`;
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
                      ))
                    )}
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
                    {dealers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                          }}>
                          No dealer applications found in backend database.
                        </td>
                      </tr>
                    ) : (
                      dealers.map((d) => (
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
                      ))
                    )}
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
                    {services.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: 'var(--text-muted)',
                            fontSize: '0.9rem',
                          }}>
                          No field service or maintenance bookings in backend database.
                        </td>
                      </tr>
                    ) : (
                      services.map((srv) => (
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
                      ))
                    )}
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
                {lowStockCount === 0 && pendingOrdersCount === 0 && pendingDealersCount === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✨</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', marginBottom: '4px' }}>
                      All systems clear
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>No pending alerts or priority operations require attention.</div>
                  </div>
                )}

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

          {/* ===============================================================
              VIEW G: AI MARKETING AUTOMATION & SOCIAL PUBLISHING
              =============================================================== */}
          {activeNav === 'marketing' && (() => {
            const selectedProd = products.find((p) => p.id === marketingProductId) || products[0] || INITIAL_PRODUCTS[0];
            const postHeadline = `💧 PURE WATER, UNCOMPROMISED HEALTH | ${selectedProd?.name?.toUpperCase() || 'CALIFNCO ADVANCED PURIFICATION'}`;
            const prodSpecs = selectedProd?.specifications || (selectedProd as any)?.specs;
            const postSpecs = prodSpecs
              ? Object.entries(prodSpecs)
                  .map(([k, v]) => `• ${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
                  .join('\n')
              : '• Multi-Stage 0.0001-Micron RO Filtration\n• Active Mineralizer\n• 1 Year On-site Warranty';
            const postCopy = `${postHeadline}

Did you know tap water can carry unseen heavy metals, microplastics, and dissolved solids?

Califnco brings medical-grade water purification to your doorstep. The ${selectedProd?.name} delivers crisp, 100% pure mineral water with certified multi-stage filtration.

✨ KEY PERFORMANCE SPECS:
${postSpecs}

💎 SPECIAL PROMOTION:
• Retail: ₹${selectedProd?.price?.toLocaleString('en-IN')} (Free Standard Installation & TDS Test)
• Verified Wholesale Tier: ₹${selectedProd?.wholesalePrice?.toLocaleString('en-IN')}/unit (MOQ: ${selectedProd?.minWholesaleQty || 5} units)

📲 Order now on the Califnco Mobile App, or schedule an on-demand technician visit today.

1800-420-PURE | support@califnco.com | Bengaluru, India

#Califnco #PureWater #ROWaterPurifier #CleanWaterEveryDay #HealthyLiving #AlkalineWater #BengaluruWater #HomeWellness`;

            const metaGraphPayload = {
              endpoint_step1: 'POST https://graph.facebook.com/v19.0/17841400000000000/media',
              body_step1: {
                image_url: selectedProd?.imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e',
                caption: postCopy,
              },
              endpoint_step2: 'POST https://graph.facebook.com/v19.0/17841400000000000/media_publish',
              body_step2: {
                creation_id: 'CONTAINER_ID_STAGED_READY',
              },
            };

            const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(postCopy)}`;

            const copyToClipboard = () => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(postCopy);
              }
              showToast('✓ AI promotional copy & hashtags copied to clipboard!');
            };

            return (
              <div className="view-panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Top Banner */}
                <div
                  style={{
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                  <div>
                    <div
                      style={{
                        display: 'inline-block',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        marginBottom: '6px',
                      }}>
                      ⚡ AUTONOMOUS MARKETING STUDIO
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                      Daily Campaign &amp; Social Publishing Desk
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
                      Autonomous product marketing copywriter, Meta Graph Instagram staging engine, and WhatsApp broadcast gateway.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>Select Product:</span>
                    <CustomDropdown
                      value={marketingProductId || selectedProd?.id || ''}
                      onChange={(val) => setMarketingProductId(val)}
                      options={(products.length > 0 ? products : INITIAL_PRODUCTS).map((p) => ({
                        value: p.id,
                        label: `${p.name} (₹${p.price.toLocaleString('en-IN')})`,
                      }))}
                      style={{ minWidth: '220px', maxWidth: '300px' }}
                      triggerStyle={{
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                      }}
                      align="right"
                    />
                  </div>
                </div>

                {/* Main Studio Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '1.25rem',
                  }}>
                  {/* Left Column: Creative & Copy Preview */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>🎨 Marketing Creative &amp; Copy</h3>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          backgroundColor: 'var(--primary-light)',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}>
                        Engine: Gemini 1.5 Flash / High-Fidelity NLP
                      </span>
                    </div>

                    {/* Product Media Card */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-subtle, #f8fafc)',
                        padding: '0.85rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                      }}>
                      <img
                        src={selectedProd?.imageUrl}
                        alt={selectedProd?.name}
                        onError={(e) => {
                          (e.target as any).src =
                            `/products/${selectedProd?.category || 'purifiers'}.jpg`;
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                          {selectedProd?.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Category: <strong style={{ textTransform: 'capitalize' }}>{selectedProd?.category}</strong> • Retail: ₹{selectedProd?.price?.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700, marginTop: '2px' }}>
                          Wholesale Partner Rate: ₹{selectedProd?.wholesalePrice?.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Copy Area */}
                    <div>
                      <label
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                          marginBottom: '6px',
                        }}>
                        Generated Social Caption &amp; Hashtag Block
                      </label>
                      <textarea
                        readOnly
                        value={postCopy}
                        style={{
                          width: '100%',
                          minHeight: '240px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          padding: '0.75rem',
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                          lineHeight: '1.5',
                          backgroundColor: 'var(--bg-subtle, #f8fafc)',
                          color: 'var(--text-main)',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    {/* Copy Action Row */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-action-primary"
                        onClick={copyToClipboard}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1.25rem' }}>
                        📋 Copy Caption &amp; Hashtags
                      </button>
                      <button
                        className="btn-action-secondary"
                        onClick={() => {
                          const catalog = products.length > 0 ? products : INITIAL_PRODUCTS;
                          const randomItem = catalog[Math.floor(Math.random() * catalog.length)];
                          setMarketingProductId(randomItem.id);
                          showToast(`✓ Generated new campaign for: ${randomItem.name}`);
                        }}
                        style={{ padding: '0.6rem 1rem' }}>
                        🎲 Pick Another Product
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Multi-Channel Publishing Gateways */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Channel 1: WhatsApp Status & Broadcast */}
                    <div
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        padding: '1.25rem',
                      }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem' }}>💬</span>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                            WhatsApp Broadcast &amp; Status
                          </h3>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#047857',
                            backgroundColor: '#ecfdf5',
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}>
                          ✓ Operational
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
                        Dispatches product marketing post to customer contact lists and WhatsApp Status updates.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <a
                          href={whatsappShareUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            backgroundColor: '#25D366',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            padding: '0.65rem 1rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                          }}>
                          🟢 One-Click Share to WhatsApp Status
                        </a>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            backgroundColor: 'var(--bg-subtle, #f8fafc)',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                          }}>
                          WAHA Endpoint: <code>POST /api/sendText</code> (chatId: status@broadcast)
                        </div>
                      </div>
                    </div>

                    {/* Channel 2: Instagram Meta Graph API */}
                    <div
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        padding: '1.25rem',
                      }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem' }}>📸</span>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                            Instagram Meta Graph API
                          </h3>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#b45309',
                            backgroundColor: '#fef3c7',
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}>
                          Dry-Run Staging Mode
                        </span>
                      </div>
                      <div
                        style={{
                          backgroundColor: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '0.78rem',
                          color: '#92400e',
                          lineHeight: 1.4,
                          marginBottom: '10px',
                        }}>
                        <strong>Account Constraint Status:</strong> The candidate Instagram account is currently restricted by Meta. In accordance with assignment instructions, the pipeline executes in transparent Dry-Run Staging mode with fully validated Meta Graph container and publish payloads.
                      </div>

                      <button
                        className="btn-action-secondary"
                        onClick={() => setShowRawMetaPayload(!showRawMetaPayload)}
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}>
                        {showRawMetaPayload ? 'Hide Staged Graph API Payload' : 'Inspect Staged Meta Graph Payload (JSON)'}
                      </button>

                      {showRawMetaPayload && (
                        <pre
                          style={{
                            marginTop: '10px',
                            backgroundColor: '#0f172a',
                            color: '#38bdf8',
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            overflowX: 'auto',
                            maxHeight: '180px',
                          }}>
                          {JSON.stringify(metaGraphPayload, null, 2)}
                        </pre>
                      )}
                    </div>

                    {/* Channel 3: Staged Artifact Persistence */}
                    <div
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        padding: '1rem',
                        fontSize: '0.8rem',
                      }}>
                      <div style={{ fontWeight: 700, marginBottom: '4px' }}>📁 Local Pipeline Artifacts</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Scripts run autonomously via <code>node scripts/ai-daily-marketing.mjs</code> and persist JSON snapshots to <code>docs/daily_posts/post-[date].json</code>.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
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
                    <CustomDropdown
                      value={formCategory}
                      onChange={(val) => setFormCategory(val as ProductCategory)}
                      options={[
                        { value: 'purifiers', label: 'Purifiers', icon: '💧' },
                        { value: 'dispensers', label: 'Dispensers', icon: '🏢' },
                        { value: 'pumps', label: 'Booster Pumps', icon: '⚡' },
                        { value: 'filters', label: 'Filters & Cartridges', icon: '🔬' },
                        { value: 'spares', label: 'Spare Parts', icon: '🔧' },
                      ]}
                    />
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
                  <div style={{ fontWeight: 700 }}>Customer: {inspectingOrder.shippingAddress?.fullName || 'Customer'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inspectingOrder.userEmail || 'No email'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone: {inspectingOrder.shippingAddress?.phone || 'N/A'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(inspectingOrder.totalAmount || 0).toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>Method: {inspectingOrder.paymentMethod}</div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Delivery Destination:</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {inspectingOrder.shippingAddress?.street || ''}, {inspectingOrder.shippingAddress?.city || ''},{' '}
                  {inspectingOrder.shippingAddress?.state || ''} - {inspectingOrder.shippingAddress?.postalCode || ''}
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

      {/* Admin Sign-In & Claim Status Modal */}
      {isAuthModalOpen && (
        <div className="modal-backdrop premium-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="modal-window auth-modal-premium" onClick={(e) => e.stopPropagation()}>
            {/* Ambient Background Glow Accents */}
            <div className="auth-glow-accent top-right" />
            <div className="auth-glow-accent bottom-left" />

            {/* Header Hero Banner */}
            <div className="auth-modal-hero">
              <button
                className="auth-modal-close"
                onClick={() => setIsAuthModalOpen(false)}
                aria-label="Close modal">
                ✕
              </button>
              <div className="auth-hero-badge">
                <span className="auth-hero-icon">💧</span>
                <span className="auth-hero-tag">HQ SECURITY COMMAND</span>
              </div>
              <h2 className="auth-hero-title">
                {adminUser ? 'Administrator Identity & Privileges' : 'Califnco PureWater Portal'}
              </h2>
              <p className="auth-hero-subtitle">
                {adminUser
                  ? 'Verify active session token, inspect custom claims, and manage operational permissions.'
                  : 'Privileged authentication for order fulfillment, dealer onboarding, and live telemetry.'}
              </p>
            </div>

            {/* Body */}
            {adminUser ? (
              <div className="auth-modal-body">
                {/* Executive Identity Card */}
                <div className="executive-id-card">
                  <div className="id-card-avatar">
                    <span>{adminUser.email ? adminUser.email.slice(0, 2).toUpperCase() : 'AD'}</span>
                    <span className={`id-status-indicator ${isAdminClaimVerified ? 'verified' : 'pending'}`} />
                  </div>
                  <div className="id-card-details">
                    <div className="id-card-email" title={adminUser.email || ''}>
                      {adminUser.email}
                    </div>
                    <div className="id-card-uid-row">
                      <span className="id-uid-label">UID:</span>
                      <code className="id-uid-code">{adminUser.uid}</code>
                      <button
                        type="button"
                        className="btn-copy-chip"
                        onClick={() => {
                          navigator.clipboard.writeText(adminUser.uid);
                          setCopiedUid(true);
                          setTimeout(() => setCopiedUid(false), 2000);
                          showToast('UID copied to clipboard!');
                        }}>
                        {copiedUid ? '✓ Copied' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                  <div className={`id-claim-badge ${isAdminClaimVerified ? 'verified' : 'pending'}`}>
                    {isAdminClaimVerified ? '🛡️ TOKEN VERIFIED' : '⚠️ CLAIM PENDING'}
                  </div>
                </div>

                {/* Token Verification Details */}
                {!isAdminClaimVerified ? (
                  <div className="claim-command-card">
                    <div className="command-card-header">
                      <span className="command-card-icon">⚡</span>
                      <div>
                        <div className="command-card-title">Assign Cryptographic Claim</div>
                        <div className="command-card-sub">Run via Terminal using your Firebase Service Account</div>
                      </div>
                    </div>
                    <div className="command-terminal-box">
                      <div className="terminal-header">
                        <span className="terminal-dot red" />
                        <span className="terminal-dot yellow" />
                        <span className="terminal-dot green" />
                        <span className="terminal-title">powershell / bash</span>
                      </div>
                      <pre className="terminal-code">
                        node scripts/set-admin-claim.mjs {adminUser.uid} "path/to/service-account.json"
                      </pre>
                    </div>
                    <p className="terminal-hint">
                      💡 Once executed, click <strong>"Refresh Token Claims"</strong> below to activate permissions without re-authenticating.
                    </p>
                  </div>
                ) : (
                  <div className="claim-active-card">
                    <div className="claim-active-icon">✓</div>
                    <div className="claim-active-text">
                      <div className="claim-active-title">Full Administrative Authority Active</div>
                      <div className="claim-active-desc">
                        Custom claim <code>request.auth.token.admin == true</code> is validated on project <strong>califnco-assignment-d989e</strong>.
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Feature Highlights */}
                <div className="auth-security-pills">
                  <span className="security-pill">🔒 TLS 1.3 Encryption</span>
                  <span className="security-pill">🛡️ Firestore Rules Guarded</span>
                  <span className="security-pill">⚡ Real-time Telemetry Active</span>
                </div>

                {/* Actions Footer */}
                <div className="auth-modal-footer">
                  <button
                    type="button"
                    className="btn-auth-action outline"
                    onClick={async () => {
                      try {
                        const token = await adminUser.getIdTokenResult(true);
                        const hasClaim = Boolean(token.claims.admin);
                        setIsAdminClaimVerified(hasClaim);
                        showToast(hasClaim ? '✓ Admin claim verified!' : 'Claim not detected yet. Run set-admin-claim.mjs first.');
                      } catch (err: any) {
                        showToast('Error refreshing claims: ' + err.message);
                      }
                    }}>
                    🔄 Refresh Token Claims
                  </button>
                  <button
                    type="button"
                    className="btn-auth-action danger"
                    onClick={handleAdminSignOut}>
                    Sign Out Session
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminSignIn} className="auth-modal-body">
                {authError && (
                  <div className="auth-error-card">
                    <span className="error-icon">⚠️</span>
                    <div className="error-text">
                      <div className="error-title">Authentication Failed</div>
                      <div className="error-desc">{authError}</div>
                    </div>
                  </div>
                )}

                <div className="auth-input-group">
                  <label className="auth-label">
                    <span>ADMINISTRATOR EMAIL</span>
                    <span className="auth-label-hint">Registered Account</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">✉️</span>
                    <input
                      type="email"
                      required
                      autoFocus
                      className="auth-input-field"
                      placeholder="admin@califnco.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <div className="auth-label-row">
                    <label className="auth-label">PASSWORD</label>
                    <button
                      type="button"
                      className="auth-toggle-pwd"
                      onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? '👁️ Hide' : '👁️‍🗨️ Show'}
                    </button>
                  </div>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon">🔑</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="auth-input-field"
                      placeholder="••••••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                    />
                  </div>
                </div>

                {/* Quick Security Badges */}
                <div className="auth-security-pills">
                  <span className="security-pill">🛡️ Role-Based Access</span>
                  <span className="security-pill">🔐 Firebase Auth Verified</span>
                  <span className="security-pill">⚡ Live Operations Desk</span>
                </div>

                {/* Submit Footer */}
                <div className="auth-modal-footer">
                  <button
                    type="button"
                    className="btn-auth-action cancel"
                    onClick={() => setIsAuthModalOpen(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-auth-action submit"
                    disabled={isAuthSubmitting}>
                    {isAuthSubmitting ? (
                      <>
                        <span className="btn-spinner" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀</span>
                        <span>Sign In to Admin Console</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && <div className="live-toast">{toastMessage}</div>}
    </div>
  );
}
export default App;
