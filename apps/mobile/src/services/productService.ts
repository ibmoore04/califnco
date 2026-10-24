import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { Product, INITIAL_PRODUCTS } from '@shared';

export interface ProductServiceResult {
  products: Product[];
  isLiveFirestore: boolean;
  isDemoFallback: boolean;
  error: string | null;
}

/**
 * Reusable Firestore Product Service for Califnco
 * Connects directly to the 'products' collection in Firebase Firestore.
 */
export const ProductService = {
  /**
   * Fetch all products from Firestore 'products' collection.
   * If Firestore is unconfigured or encounters an error, returns the error and
   * flags that data is NOT live, preventing deceptive presentation.
   */
  async getProducts(): Promise<ProductServiceResult> {
    if (!isFirebaseConfigured || !db) {
      console.log('[ProductService] Firebase not configured; using labeled demo fallback.');
      return {
        products: INITIAL_PRODUCTS,
        isLiveFirestore: false,
        isDemoFallback: true,
        error: 'Firestore not configured (running in local demo mode).',
      };
    }

    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);

      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Product);
      });

      if (items.length === 0) {
        // Backend collection is empty - return empty list truthful to backend
        return {
          products: [],
          isLiveFirestore: true,
          isDemoFallback: false,
          error: null,
        };
      }

      return {
        products: items,
        isLiveFirestore: true,
        isDemoFallback: false,
        error: null,
      };
    } catch (err: any) {
      console.warn('[ProductService] Error fetching products from Firestore:', err);
      return {
        products: [],
        isLiveFirestore: false,
        isDemoFallback: false,
        error: err?.message || 'Failed to load products from Firestore.',
      };
    }
  },

  /**
   * Subscribe to real-time changes in the 'products' collection.
   */
  subscribeProducts(
    onSuccess: (result: ProductServiceResult) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    if (!isFirebaseConfigured || !db) {
      onSuccess({
        products: INITIAL_PRODUCTS,
        isLiveFirestore: false,
        isDemoFallback: true,
        error: 'Firestore not configured.',
      });
      return () => {};
    }

    const productsRef = collection(db, 'products');
    return onSnapshot(
      productsRef,
      (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Product);
        });
        onSuccess({
          products: items,
          isLiveFirestore: true,
          isDemoFallback: false,
          error: null,
        });
      },
      (err) => {
        console.warn('[ProductService] Real-time subscription error:', err);
        if (onError) onError(err);
        onSuccess({
          products: [],
          isLiveFirestore: false,
          isDemoFallback: false,
          error: err.message,
        });
      }
    );
  },

  /**
   * Fetch a single product by ID from Firestore
   */
  async getProductById(productId: string): Promise<Product | null> {
    if (!isFirebaseConfigured || !db) {
      return INITIAL_PRODUCTS.find((p) => p.id === productId) || null;
    }

    try {
      const docRef = doc(db, 'products', productId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as Product;
      }
      return null;
    } catch (err) {
      console.warn('[ProductService] Error fetching product by ID:', err);
      return null;
    }
  },

  /**
   * Safe, repeatable seeding operation.
   * Checks if each product already exists before inserting.
   * Will NEVER overwrite existing administrator modifications unless explicitly told to.
   */
  async seedInitialProducts(options: { overwrite?: boolean } = {}): Promise<{
    seeded: number;
    skipped: number;
    total: number;
  }> {
    if (!db) {
      throw new Error('Firestore is not configured.');
    }

    let seeded = 0;
    let skipped = 0;

    for (const prod of INITIAL_PRODUCTS) {
      const docRef = doc(db, 'products', prod.id);
      if (!options.overwrite) {
        const existing = await getDoc(docRef);
        if (existing.exists()) {
          skipped++;
          continue;
        }
      }
      await setDoc(docRef, prod, { merge: true });
      seeded++;
    }

    return {
      seeded,
      skipped,
      total: INITIAL_PRODUCTS.length,
    };
  },
};
