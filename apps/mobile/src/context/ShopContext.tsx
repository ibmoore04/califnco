import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { safeStorage } from '@/services/storage';
import {
  Product,
  CartItem,
  Address,
  Order,
  UserProfile,
  ProductCategory,
  DealerProfile,
  DealerApprovalStatus,
  ServiceBooking,
  INITIAL_PRODUCTS,
} from '@shared';
import {
  isFirebaseConfigured,
  auth,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  subscribeToAuthChanges,
  syncOrderToFirestore,
  fetchUserOrdersFromFirestore,
  subscribeUserOrdersFromFirestore,
  submitDealerApplicationToFirestore,
  fetchDealerApplicationFromFirestore,
  subscribeDealerApplicationFromFirestore,
  createServiceBookingInFirestore,
  fetchUserServiceBookingsFromFirestore,
  subscribeUserServiceBookingsFromFirestore,
  formatFirebaseAuthError,
} from '@/services/firebase';
import { ProductService, ProductServiceResult } from '@/services/productService';
import { PaymentService } from '@/services/paymentService';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';
export type TabType = 'catalogue' | 'cart' | 'orders' | 'services' | 'profile';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'order' | 'service' | 'dealer' | 'system';
}

interface ShopContextType {
  // Products & Filters
  products: Product[];
  filteredProducts: Product[];
  isProductsLoading: boolean;
  productsError: string | null;
  isDemoFallback: boolean;
  refreshProducts: () => Promise<void>;
  selectedCategory: ProductCategory | 'all';
  setSelectedCategory: (category: ProductCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  // Cart
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  addToCart: (product: Product, quantity?: number) => { success: boolean; message: string };
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Orders
  orders: Order[];
  placeOrder: (shippingAddress: Address, paymentMethod: 'razorpay' | 'cod') => Promise<Order>;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  resetLocalCache: () => Promise<void>;

  // Customer Profile & Authentication
  userProfile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  isFirebaseActive: boolean;
  isAuthLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    email: string,
    password: string,
    displayName: string,
    phone?: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;

  // Wholesale Dealer Program
  dealerProfile: DealerProfile | null;
  isDealerApproved: boolean;
  dealerStatus: DealerApprovalStatus | null;
  applyForDealer: (data: Omit<DealerProfile, 'id' | 'userId' | 'status' | 'appliedAt'>) => Promise<boolean>;
  isDealerApplyModalVisible: boolean;
  setDealerApplyModalVisible: (visible: boolean) => void;

  // Field Service Bookings
  serviceBookings: ServiceBooking[];
  isServicesLoading: boolean;
  bookService: (data: Omit<ServiceBooking, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>) => Promise<ServiceBooking | null>;
  refreshServiceBookings: () => Promise<void>;
  isServiceBookingModalVisible: boolean;
  setServiceBookingModalVisible: (visible: boolean) => void;

  // In-App Notifications
  notifications: InAppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  isNotificationsModalVisible: boolean;
  setNotificationsModalVisible: (visible: boolean) => void;

  // Auth Modal Visibility
  isAuthModalVisible: boolean;
  setAuthModalVisible: (visible: boolean) => void;

  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

// Clean guest profile (Zero hardcoding)
const EMPTY_GUEST_PROFILE: UserProfile = {
  uid: '',
  displayName: '',
  email: '',
  phone: '',
  role: 'customer',
  createdAt: new Date().toISOString(),
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Initialize completely empty - zero hardcoded data
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(EMPTY_GUEST_PROFILE);
  const [activeTab, setActiveTab] = useState<TabType>('catalogue');

  // Dealer Program States
  const [dealerProfile, setDealerProfile] = useState<DealerProfile | null>(null);
  const [isDealerApplyModalVisible, setDealerApplyModalVisible] = useState<boolean>(false);

  // Field Service Bookings States
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState<boolean>(false);
  const [isServiceBookingModalVisible, setServiceBookingModalVisible] = useState<boolean>(false);

  // In-App Operational Notifications State
  const [notifications, setNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif_welcome',
      title: 'Welcome to Califnco PureWater',
      message: 'Explore our 52+ certified pure water RO purifiers, dispensers, booster pumps, and genuine spare parts.',
      date: new Date().toISOString(),
      read: false,
      type: 'system',
    },
  ]);
  const [isNotificationsModalVisible, setNotificationsModalVisible] = useState<boolean>(false);

  // Firebase Auth states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalVisible, setAuthModalVisible] = useState<boolean>(false);

  // Derived Dealer Approvals
  const isDealerApproved = useMemo(() => {
    return (
      userProfile.role === 'dealer' ||
      dealerProfile?.status === 'approved' ||
      userProfile.dealerStatus === 'approved'
    );
  }, [userProfile, dealerProfile]);

  const dealerStatus = useMemo(() => {
    if (dealerProfile?.status) return dealerProfile.status;
    if (userProfile.dealerStatus) return userProfile.dealerStatus;
    return null;
  }, [dealerProfile, userProfile]);

  // Notifications Helpers
  const addNotification = useCallback(
    (title: string, message: string, type: 'order' | 'service' | 'dealer' | 'system') => {
      const newNotif: InAppNotification = {
        id: `notif_${Date.now()}`,
        title,
        message,
        date: new Date().toISOString(),
        read: false,
        type,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Wholesale Dealer Application Handler
  const applyForDealer = useCallback(
    async (data: Omit<DealerProfile, 'id' | 'userId' | 'status' | 'appliedAt'>): Promise<boolean> => {
      if (!isFirebaseConfigured || !auth?.currentUser) {
        // Fallback demo dealer application
        const name = data.businessName || data.companyName || 'Business';
        const demoApp: DealerProfile = {
          id: `demo_dealer_${Date.now()}`,
          userId: userProfile.uid || 'demo_user',
          businessName: name,
          companyName: name,
          contactPerson: data.contactPerson,
          email: data.email || userProfile.email,
          phone: data.phone,
          gstNumber: data.gstNumber.toUpperCase(),
          address: data.address,
          status: 'pending',
          appliedAt: new Date().toISOString(),
        };
        setDealerProfile(demoApp);
        setUserProfile((prev) => ({ ...prev, dealerStatus: 'pending' }));
        addNotification(
          'Dealer Application Submitted',
          `Your wholesale registration for "${name}" (GST: ${data.gstNumber}) is under review by Califnco HQ.`,
          'dealer'
        );
        return true;
      }

      const companyName = data.businessName || data.companyName || 'Business';
      const app = await submitDealerApplicationToFirestore(data);
      if (app) {
        setDealerProfile(app);
        setUserProfile((prev) => ({ ...prev, dealerStatus: 'pending' }));
        addNotification(
          'Dealer Application Submitted',
          `Your wholesale registration for "${companyName}" (GST: ${data.gstNumber}) is under review by Califnco HQ.`,
          'dealer'
        );
        return true;
      }
      return false;
    },
    [isFirebaseConfigured, userProfile, addNotification]
  );

  // Field Service Booking Handlers
  const refreshServiceBookings = useCallback(async () => {
    if (!auth?.currentUser) return;
    setIsServicesLoading(true);
    try {
      const bookings = await fetchUserServiceBookingsFromFirestore(auth.currentUser.uid);
      setServiceBookings(bookings);
    } catch (err) {
      console.warn('[Califnco Services] Error fetching service bookings:', err);
    } finally {
      setIsServicesLoading(false);
    }
  }, []);

  const bookService = useCallback(
    async (
      data: Omit<ServiceBooking, 'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'>
    ): Promise<ServiceBooking | null> => {
      const uid = auth?.currentUser?.uid || userProfile.uid || `demo_user_${Date.now()}`;

      if (!isFirebaseConfigured || !auth?.currentUser) {
        // Fallback demo service booking
        const bookingId = `SRV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const demoBooking: ServiceBooking = {
          id: bookingId,
          userId: uid,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          serviceType: data.serviceType,
          preferredDate: data.preferredDate,
          preferredTimeSlot: data.preferredTimeSlot || '10:00 AM - 1:00 PM',
          address: data.address,
          notes: data.notes || '',
          status: 'submitted',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setServiceBookings((prev) => [demoBooking, ...prev]);
        addNotification(
          'Service Appointment Booked',
          `Your service ticket #${demoBooking.id} for "${demoBooking.serviceType.replace('_', ' ').toUpperCase()}" on ${demoBooking.preferredDate} (${demoBooking.preferredTimeSlot}) has been logged.`,
          'service'
        );
        return demoBooking;
      }

      const booking = await createServiceBookingInFirestore(data);
      if (booking) {
        setServiceBookings((prev) => [booking, ...prev]);
        addNotification(
          'Service Appointment Booked',
          `Your service ticket #${booking.id} for "${booking.serviceType.replace('_', ' ').toUpperCase()}" on ${booking.preferredDate} (${booking.preferredTimeSlot}) has been logged.`,
          'service'
        );
        return booking;
      }
      return null;
    },
    [isFirebaseConfigured, userProfile, addNotification]
  );

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const refreshProducts = useCallback(async () => {
    setIsProductsLoading(true);
    setProductsError(null);
    try {
      const res = await ProductService.getProducts();
      setProducts(res.products);
      setIsDemoFallback(res.isDemoFallback);
      setProductsError(res.error);
    } catch (err: any) {
      setProductsError(err.message || 'Failed to load products');
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  // Hydrate persistent state on mount & connect to live Firestore catalog
  useEffect(() => {
    const hydrateStorage = async () => {
      try {
        const savedOrders = await safeStorage.getItem('califnco_orders');
        if (savedOrders) {
          try {
            const parsed = JSON.parse(savedOrders);
            if (Array.isArray(parsed)) {
              // Strip out any legacy mock orders from earlier revisions
              const cleanOrders = parsed.filter(
                (o) =>
                  o &&
                  o.userId !== 'usr_cust_demo_01' &&
                  !String(o.id).includes('7841') &&
                  !String(o.id).includes('8194')
              );
              setOrders(cleanOrders);
              if (cleanOrders.length !== parsed.length) {
                safeStorage.setItem('califnco_orders', JSON.stringify(cleanOrders)).catch(() => {});
              }
            }
          } catch {
            safeStorage.removeItem('califnco_orders').catch(() => {});
          }
        }

        const savedCart = await safeStorage.getItem('califnco_cart');
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart);
            if (Array.isArray(parsedCart)) {
              setCart(parsedCart);
            }
          } catch {
            safeStorage.removeItem('califnco_cart').catch(() => {});
          }
        }

        const savedProfile = await safeStorage.getItem('califnco_profile');
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            if (parsedProfile && parsedProfile.uid !== 'usr_cust_demo_01') {
              setUserProfile(parsedProfile);
              if (parsedProfile.isFirebaseAuth) {
                setIsAuthenticated(true);
              }
            } else {
              safeStorage.removeItem('califnco_profile').catch(() => {});
            }
          } catch {
            safeStorage.removeItem('califnco_profile').catch(() => {});
          }
        }
      } catch (err) {
        console.warn('[Califnco Storage] Could not hydrate stored data:', err);
      }
    };
    hydrateStorage();

    // Subscribe to live Firestore products collection
    const unsubProducts = ProductService.subscribeProducts(
      (res: ProductServiceResult) => {
        setProducts(res.products);
        setIsDemoFallback(res.isDemoFallback);
        setProductsError(res.error);
        setIsProductsLoading(false);
      },
      (err: Error) => {
        setProductsError(err.message);
        setIsProductsLoading(false);
      }
    );

    // Listen to Firebase Auth state and establish real-time Firestore listeners
    let authUnsubscribe: (() => void) | null = null;
    let unsubOrders: (() => void) | null = null;
    let unsubDealer: (() => void) | null = null;
    let unsubServices: (() => void) | null = null;

    if (isFirebaseConfigured) {
      authUnsubscribe = subscribeToAuthChanges((firebaseUser) => {
        // Clean up previous user subscriptions
        if (unsubOrders) { unsubOrders(); unsubOrders = null; }
        if (unsubDealer) { unsubDealer(); unsubDealer = null; }
        if (unsubServices) { unsubServices(); unsubServices = null; }

        if (firebaseUser) {
          setIsAuthenticated(true);
          setUserProfile((prev) => ({
            ...prev,
            uid: firebaseUser.uid,
            email: firebaseUser.email || prev.email,
            displayName: firebaseUser.displayName || prev.displayName,
            role: 'customer',
          }));

          // 1. Subscribe to Orders in real-time
          unsubOrders = subscribeUserOrdersFromFirestore(firebaseUser.uid, (remoteOrders) => {
            setOrders(remoteOrders);
            safeStorage.setItem('califnco_orders', JSON.stringify(remoteOrders)).catch(() => {});
          });

          // 2. Subscribe to Dealer status in real-time
          unsubDealer = subscribeDealerApplicationFromFirestore(firebaseUser.uid, (dealer) => {
            if (dealer) {
              setDealerProfile(dealer);
              setUserProfile((prev) => ({ ...prev, dealerStatus: dealer.status }));
            }
          });

          // 3. Subscribe to Service Bookings in real-time
          unsubServices = subscribeUserServiceBookingsFromFirestore(firebaseUser.uid, (bookings) => {
            setServiceBookings(bookings);
          });
        }
      });
    }

    return () => {
      unsubProducts();
      if (authUnsubscribe) authUnsubscribe();
      if (unsubOrders) unsubOrders();
      if (unsubDealer) unsubDealer();
      if (unsubServices) unsubServices();
    };
  }, []);

  // Persist cart changes
  useEffect(() => {
    safeStorage.setItem('califnco_cart', JSON.stringify(cart)).catch(() => {});
  }, [cart]);

  // Persist profile changes
  useEffect(() => {
    safeStorage.setItem('califnco_profile', JSON.stringify(userProfile)).catch(() => {});
  }, [userProfile]);

  // Firebase Authentication Actions
  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured) {
        const profile = await signInWithEmail(email, password);
        setUserProfile(profile);
        setIsAuthenticated(true);
        safeStorage.setItem('califnco_profile', JSON.stringify({ ...profile, isFirebaseAuth: true })).catch(() => {});
        setIsAuthLoading(false);
        return { success: true };
      } else {
        // Fallback demo login
        const demoProfile: UserProfile = {
          uid: `demo_user_${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        setUserProfile(demoProfile);
        setIsAuthenticated(true);
        safeStorage.setItem('califnco_profile', JSON.stringify(demoProfile)).catch(() => {});
        setIsAuthLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setIsAuthLoading(false);
      const friendlyMessage = formatFirebaseAuthError(err);
      setAuthError(friendlyMessage);
      return { success: false, message: friendlyMessage };
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    phone?: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      if (isFirebaseConfigured) {
        let profile: UserProfile;
        try {
          profile = await signUpWithEmail(email, password, displayName, phone);
        } catch (signupErr: any) {
          // If the account was already created during an earlier interrupted attempt, attempt sign-in
          if (signupErr?.code === 'auth/email-already-in-use') {
            profile = await signInWithEmail(email, password);
          } else {
            throw signupErr;
          }
        }
        setUserProfile(profile);
        setIsAuthenticated(true);
        safeStorage.setItem('califnco_profile', JSON.stringify({ ...profile, isFirebaseAuth: true })).catch(() => {});
        setIsAuthLoading(false);
        return { success: true };
      } else {
        // Fallback demo registration
        const demoProfile: UserProfile = {
          uid: `demo_user_${Date.now()}`,
          email,
          displayName,
          phone,
          role: 'customer', // Locked to customer role
          createdAt: new Date().toISOString(),
        };
        setUserProfile(demoProfile);
        setIsAuthenticated(true);
        safeStorage.setItem('califnco_profile', JSON.stringify(demoProfile)).catch(() => {});
        setIsAuthLoading(false);
        return { success: true };
      }
    } catch (err: any) {
      setIsAuthLoading(false);
      const friendlyMessage = formatFirebaseAuthError(err);
      setAuthError(friendlyMessage);
      return { success: false, message: friendlyMessage };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (isFirebaseConfigured) {
        await signOutUser();
      }
    } catch (err) {
      console.warn('[Califnco Auth] Sign out error:', err);
    }
    setIsAuthenticated(false);
    setUserProfile(EMPTY_GUEST_PROFILE);
    setOrders([]);
    safeStorage.removeItem('califnco_profile').catch(() => {});
    safeStorage.removeItem('califnco_orders').catch(() => {});
  };

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch =
          !searchQuery ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          Object.values(product.specifications).some((val) =>
            val.toLowerCase().includes(searchQuery.toLowerCase())
          );
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'name':
            return a.name.localeCompare(b.name);
          case 'featured':
          default:
            return 0; // Natural sequence
        }
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Cart Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.pricePerUnit * item.quantity, 0);
  }, [cart]);

  // Standard Indian GST on electronics/water purifiers is 18%
  const taxAmount = useMemo(() => {
    return +(subtotal * 0.18).toFixed(2);
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    return +(subtotal + taxAmount).toFixed(2);
  }, [subtotal, taxAmount]);

  // Cart Operations
  const addToCart = (product: Product, quantity = 1) => {
    if (!product.inStock || product.stock <= 0) {
      return { success: false, message: 'Sorry, this product is currently out of stock.' };
    }

    const effectivePrice =
      isDealerApproved && ((product as any).dealerPrice || product.wholesalePrice)
        ? ((product as any).dealerPrice || product.wholesalePrice)
        : product.price;
    const effectiveQty = isDealerApproved
      ? Math.max(quantity, (product as any).minOrderQuantity || product.minWholesaleQty || 5)
      : quantity;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + effectiveQty }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: effectiveQty,
          pricePerUnit: effectivePrice,
        },
      ];
    });

    const tierMsg = isDealerApproved
      ? ` (Wholesale tier: ₹${effectivePrice}/unit, MOQ: ${effectiveQty})`
      : '';
    return { success: true, message: `Added "${product.name}" to cart.${tierMsg}` };
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Place Order (Safe Demo & Firestore sync via modular PaymentService)
  const placeOrder = async (
    shippingAddress: Address,
    paymentMethod: 'razorpay' | 'cod'
  ): Promise<Order> => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `CAL-2026-${randomSuffix}`;

    const paymentResult = await PaymentService.processPayment({
      orderId,
      amount: totalAmount,
      customer: {
        fullName: shippingAddress.fullName,
        email: userProfile.email || auth?.currentUser?.email || '',
        phone: shippingAddress.phone,
        address: shippingAddress,
      },
      method: paymentMethod,
    });

    const currentUid = auth?.currentUser?.uid || userProfile.uid || `demo_user_${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      userId: currentUid,
      userEmail: userProfile.email || auth?.currentUser?.email || 'customer@califnco.app',
      userRole: isDealerApproved ? 'dealer' : 'customer',
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        category: item.product.category,
        unitPrice: item.pricePerUnit,
        quantity: item.quantity,
        totalPrice: item.pricePerUnit * item.quantity,
        imageUrl: item.product.imageUrl,
      })),
      subtotal,
      taxAmount,
      totalAmount,
      shippingAddress,
      status: 'pending',
      paymentStatus: paymentResult.paymentStatus, // 'pending'
      paymentMethod,
      razorpayPaymentId: paymentResult.transactionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      safeStorage.setItem('califnco_orders', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    addNotification(
      'Order Confirmed',
      `Order #${orderId} for ₹${totalAmount.toLocaleString('en-IN')} has been placed successfully. Status: Pending Fulfillment.`,
      'order'
    );

    // Attempt non-blocking sync to Firestore
    syncOrderToFirestore(newOrder).catch((err) => {
      console.warn('[Califnco Shop] Firestore sync warning:', err);
    });

    clearCart();
    return newOrder;
  };

  const resetLocalCache = async (): Promise<void> => {
    setCart([]);
    setOrders([]);
    await safeStorage.removeItem('califnco_cart');
    await safeStorage.removeItem('califnco_orders');
    if (!isAuthenticated) {
      setUserProfile(EMPTY_GUEST_PROFILE);
      await safeStorage.removeItem('califnco_profile');
    }
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        filteredProducts,
        isProductsLoading,
        productsError,
        isDemoFallback,
        refreshProducts,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        selectedProduct,
        setSelectedProduct,
        cart,
        cartCount,
        subtotal,
        taxAmount,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        orders,
        placeOrder,
        selectedOrder,
        setSelectedOrder,
        resetLocalCache,
        userProfile,
        updateProfile,
        isAuthenticated,
        isFirebaseActive: isFirebaseConfigured,
        isAuthLoading,
        authError,
        clearAuthError,
        login,
        register,
        logout,
        dealerProfile,
        isDealerApproved,
        dealerStatus,
        applyForDealer,
        isDealerApplyModalVisible,
        setDealerApplyModalVisible,
        serviceBookings,
        isServicesLoading,
        bookService,
        refreshServiceBookings,
        isServiceBookingModalVisible,
        setServiceBookingModalVisible,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isNotificationsModalVisible,
        setNotificationsModalVisible,
        isAuthModalVisible,
        setAuthModalVisible,
        activeTab,
        setActiveTab,
      }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
