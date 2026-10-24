import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
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

  // Customer Profile
  userProfile: UserProfile;
  updateProfile: (data: Partial<UserProfile>) => void;

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

const INITIAL_PROFILE: UserProfile = {
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
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [activeTab, setActiveTab] = useState<TabType>('catalogue');

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
          }
        }
      } catch (err) {
        console.warn('[Califnco Storage] Could not hydrate stored data:', err);
      }
    };
    hydrateStorage();
  }, []);

  // Persist cart changes
  useEffect(() => {
    AsyncStorage.setItem('califnco_cart', JSON.stringify(cart)).catch(() => {});
  }, [cart]);

  // Persist profile changes
  useEffect(() => {
    AsyncStorage.setItem('califnco_profile', JSON.stringify(userProfile)).catch(() => {});
  }, [userProfile]);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesCategory =
          selectedCategory === 'all' || item.category === selectedCategory;
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          query === '' ||
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          Object.values(item.specifications).some((val) =>
            val.toLowerCase().includes(query)
          );
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0; // 'featured' keeps curated order
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  // Cart Calculations
  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    // 18% GST standard on water purifier appliances and spares
    return Math.round(subtotal * 0.18 * 100) / 100;
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    return Math.round((subtotal + taxAmount) * 100) / 100;
  }, [subtotal, taxAmount]);

  // Cart Operations
  const addToCart = (product: Product, quantity = 1): { success: boolean; message: string } => {
    if (!product.inStock || product.stock <= 0) {
      return { success: false, message: 'Sorry, this product is currently out of stock.' };
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingIndex].quantity + quantity;
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newQty,
        };
        return newCart;
      }
      return [
        ...prevCart,
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

  // Place Order (Demo Mode)
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
