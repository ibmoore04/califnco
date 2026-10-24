import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Product,
  CartItem,
  Address,
  Order,
  UserProfile,
  ProductCategory,
  INITIAL_PRODUCTS,
} from '@shared';
import {
  isFirebaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  subscribeToAuthChanges,
  syncOrderToFirestore,
  formatFirebaseAuthError,
} from '@/services/firebase';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';
export type TabType = 'catalogue' | 'cart' | 'orders' | 'profile';

interface ShopContextType {
  // Products & Filters
  products: Product[];
  filteredProducts: Product[];
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
  placeOrder: (shippingAddress: Address, paymentMethod: 'razorpay' | 'cod') => Order;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;

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

  // Auth Modal Visibility
  isAuthModalVisible: boolean;
  setAuthModalVisible: (visible: boolean) => void;

  // Navigation
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

// Initial Sample Orders for immediate testing & realistic demonstration
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'CAL-2026-7841',
    userId: 'usr_cust_demo_01',
    userEmail: 'customer@califnco.demo',
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
      fullName: 'Ibrahim Olatunde',
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
    userId: 'usr_cust_demo_01',
    userEmail: 'customer@califnco.demo',
    userRole: 'customer',
    items: [
      {
        productId: 'filter-alkaline-mineral-cartridge-post-ro',
        productName: 'BioAlkaline Remineralization Cartridge with Anti-Oxidant Balls',
        category: 'filters',
        unitPrice: 899,
        quantity: 1,
        totalPrice: 899,
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
    subtotal: 1349,
    taxAmount: 242.82,
    totalAmount: 1591.82,
    shippingAddress: {
      fullName: 'Ibrahim Olatunde',
      phone: '9876543210',
      street: '402, Silicon Heights, 12th Main, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
    },
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'razorpay',
    razorpayPaymentId: 'pay_test_881920b',
    createdAt: '2026-10-22T09:15:00.000Z',
    updatedAt: '2026-10-22T10:00:00.000Z',
  },
];

const INITIAL_DEMO_PROFILE: UserProfile = {
  uid: 'usr_cust_demo_01',
  displayName: 'Ibrahim Olatunde',
  email: 'customer@califnco.demo',
  phone: '9876543210',
  role: 'customer',
  defaultAddress: {
    fullName: 'Ibrahim Olatunde',
    phone: '9876543210',
    street: '402, Silicon Heights, 12th Main, HSR Layout',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560102',
  },
  referralCode: 'CALIF-PURE-2026',
  createdAt: '2026-01-10T00:00:00.000Z',
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [cart, setCart] = useState<CartItem[]>([
    // Start with 1 item in cart to make instant testing convenient
    {
      product: INITIAL_PRODUCTS[0], // AquaGrand+
      quantity: 1,
      pricePerUnit: INITIAL_PRODUCTS[0].price,
    },
  ]);

  const [orders, setOrders] = useState<Order[]>(INITIAL_DEMO_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_DEMO_PROFILE);
  const [activeTab, setActiveTab] = useState<TabType>('catalogue');

  // Firebase Auth states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalVisible, setAuthModalVisible] = useState<boolean>(false);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Hydrate persistent state on mount
  useEffect(() => {
    const hydrateStorage = async () => {
      try {
        const savedOrders = await AsyncStorage.getItem('califnco_orders');
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
          }
        }

        const savedCart = await AsyncStorage.getItem('califnco_cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
          }
        }

        const savedProfile = await AsyncStorage.getItem('califnco_profile');
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          if (parsedProfile && parsedProfile.displayName) {
            setUserProfile(parsedProfile);
            if (parsedProfile.isFirebaseAuth) {
              setIsAuthenticated(true);
            }
          }
        }
      } catch (err) {
        console.warn('[Califnco Storage] Could not hydrate stored data:', err);
      }
    };
    hydrateStorage();

    // Listen to Firebase Auth state
    if (isFirebaseConfigured) {
      const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
        if (firebaseUser) {
          setIsAuthenticated(true);
          setUserProfile((prev) => ({
            ...prev,
            uid: firebaseUser.uid,
            email: firebaseUser.email || prev.email,
            displayName: firebaseUser.displayName || prev.displayName,
            role: 'customer',
          }));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Persist cart changes
  useEffect(() => {
    AsyncStorage.setItem('califnco_cart', JSON.stringify(cart)).catch(() => {});
  }, [cart]);

  // Persist profile changes
  useEffect(() => {
    AsyncStorage.setItem('califnco_profile', JSON.stringify(userProfile)).catch(() => {});
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
        await AsyncStorage.setItem('califnco_profile', JSON.stringify({ ...profile, isFirebaseAuth: true }));
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
        await AsyncStorage.setItem('califnco_profile', JSON.stringify(demoProfile));
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
        const profile = await signUpWithEmail(email, password, displayName, phone);
        setUserProfile(profile);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('califnco_profile', JSON.stringify({ ...profile, isFirebaseAuth: true }));
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
        await AsyncStorage.setItem('califnco_profile', JSON.stringify(demoProfile));
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
    setUserProfile(INITIAL_DEMO_PROFILE);
    await AsyncStorage.removeItem('califnco_profile');
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

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          pricePerUnit: product.price,
        },
      ];
    });

    return { success: true, message: `Added "${product.name}" to cart.` };
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

  // Place Order (Safe Demo & Firestore sync)
  const placeOrder = (
    shippingAddress: Address,
    paymentMethod: 'razorpay' | 'cod'
  ): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `CAL-2026-${randomSuffix}`,
      userId: userProfile.uid,
      userEmail: userProfile.email,
      userRole: 'customer',
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
      paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
      paymentMethod,
      razorpayPaymentId: paymentMethod === 'razorpay' ? `pay_demo_${Date.now()}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      AsyncStorage.setItem('califnco_orders', JSON.stringify(updated)).catch(() => {});
      return updated;
    });

    // Attempt non-blocking sync to Firestore
    syncOrderToFirestore(newOrder).catch(() => {});

    clearCart();
    return newOrder;
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...data }));
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        filteredProducts,
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
