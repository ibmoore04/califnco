import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { safeStorage } from '@/services/storage';
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
  fetchUserOrdersFromFirestore,
  fetchProductsFromFirestore,
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
        const savedOrders = await safeStorage.getItem('califnco_orders');
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
          }
        }

        const savedCart = await safeStorage.getItem('califnco_cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
          }
        }

        const savedProfile = await safeStorage.getItem('califnco_profile');
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          if (parsedProfile && parsedProfile.displayName) {
            setUserProfile(parsedProfile);
            if (parsedProfile.isFirebaseAuth) {
              setIsAuthenticated(true);
            }
          }
        }

        // Fetch live catalog from Firestore backend
        if (isFirebaseConfigured) {
          try {
            const backendProducts = await fetchProductsFromFirestore();
            if (backendProducts && backendProducts.length > 0) {
              setProducts(backendProducts);
            }
          } catch (pErr) {
            console.warn('[Califnco Shop] Could not load products from Firestore:', pErr);
          }
        }
      } catch (err) {
        console.warn('[Califnco Storage] Could not hydrate stored data:', err);
      }
    };
    hydrateStorage();

    // Listen to Firebase Auth state
    if (isFirebaseConfigured) {
      const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
        if (firebaseUser) {
          setIsAuthenticated(true);
          setUserProfile((prev) => ({
            ...prev,
            uid: firebaseUser.uid,
            email: firebaseUser.email || prev.email,
            displayName: firebaseUser.displayName || prev.displayName,
            role: 'customer',
          }));
          const remoteOrders = await fetchUserOrdersFromFirestore(firebaseUser.uid);
          if (remoteOrders && remoteOrders.length > 0) {
            setOrders(remoteOrders);
            safeStorage.setItem('califnco_orders', JSON.stringify(remoteOrders)).catch(() => {});
          }
        }
      });
      return () => unsubscribe();
    }
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
      safeStorage.setItem('califnco_orders', JSON.stringify(updated)).catch(() => {});
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
