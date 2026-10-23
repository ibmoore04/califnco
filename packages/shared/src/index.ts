export type UserRole = 'customer' | 'dealer' | 'admin';

export type ProductCategory = 'purifiers' | 'dispensers' | 'pumps' | 'filters' | 'spares';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number; // Regular customer price
  wholesalePrice: number; // Lower wholesale price for approved dealers
  minWholesaleQty: number; // Minimum quantity for dealer bulk order
  imageUrl: string;
  images?: string[];
  stock: number;
  inStock: boolean;
  specifications: Record<string, string>;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  pricePerUnit: number; // Will reflect customer price or wholesale price depending on role
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress: Address;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'razorpay' | 'cod';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DealerApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface DealerProfile {
  id: string; // matches userId
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  address: Address;
  status: DealerApprovalStatus;
  rejectionReason?: string;
  appliedAt: string;
  reviewedAt?: string;
}

export type ServiceType = 'installation' | 'filter_replacement' | 'maintenance' | 'repair';
export type ServiceStatus = 'submitted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceBooking {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  serviceType: ServiceType;
  preferredDate: string;
  preferredTimeSlot?: string;
  address: Address;
  notes?: string;
  status: ServiceStatus;
  technicianAssigned?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  defaultAddress?: Address;
  dealerStatus?: DealerApprovalStatus;
  referralCode?: string;
  referredBy?: string;
  createdAt: string;
}

// AI Automation Types
export interface AIPostWorkflowItem {
  productId: string;
  productName: string;
  generatedImageUrl?: string;
  caption: string;
  hashtags: string[];
  status: 'draft' | 'ready' | 'published' | 'blocked';
  scheduledDate: string;
  externalPlatformStatus?: {
    instagram?: { status: 'published' | 'failed' | 'blocked'; error?: string };
    whatsapp?: { status: 'published' | 'failed' | 'not_configured'; error?: string };
  };
}

// Validation Utilities
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

export const isValidPhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ''));
};

export const isValidGST = (gst: string): boolean => {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.trim().toUpperCase());
};

export const calculateOrderTotal = (
  items: CartItem[],
  role: UserRole
): { subtotal: number; tax: number; total: number } => {
  const subtotal = items.reduce((acc, item) => {
    const unitPrice = role === 'dealer' ? item.product.wholesalePrice : item.product.price;
    return acc + unitPrice * item.quantity;
  }, 0);
  const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST typical for water purifiers/appliances
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
};

export { INITIAL_PRODUCTS } from './data/products';
