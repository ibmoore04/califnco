import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  StatusBar as RNStatusBar,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { HeaderBar } from '@/components/HeaderBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBarAndSort } from '@/components/SearchBarAndSort';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartView } from '@/components/CartView';
import { OrdersView } from '@/components/OrdersView';
import { ServicesView } from '@/components/ServicesView';
import { ProfileView } from '@/components/ProfileView';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';
import { AuthModal } from '@/components/AuthModal';
import { DealerApplyModal } from '@/components/DealerApplyModal';
import { ServiceBookingModal } from '@/components/ServiceBookingModal';
import { NotificationsModal } from '@/components/NotificationsModal';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const {
    activeTab,
    products,
    filteredProducts,
    isProductsLoading,
    productsError,
    isDemoFallback,
    refreshProducts,
    searchQuery,
    selectedCategory,
    isAuthModalVisible,
    setAuthModalVisible,
  } = useShop();

  // Android status bar offset: ensure top inset clears status bar and camera punch-hole / notch
  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 0
  );

  return (
    <View style={[styles.rootContainer, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />

      {/* Top Brand Header Bar */}
      <HeaderBar />

      {/* Main Tab Screen Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'catalogue' && (
          <View style={styles.catalogueView}>
            {/* Transparent Backend Source Status Indicator */}
            {isDemoFallback ? (
              <View style={[styles.statusBanner, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Text style={[styles.statusBannerText, { color: '#B45309' }]}>
                  ⚠️ Local Demo Mode: Showing cached catalog (Firestore unconfigured)
                </Text>
              </View>
            ) : products.length > 0 ? (
              <View style={[styles.statusBanner, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                <Text style={[styles.statusBannerText, { color: '#047857' }]}>
                  🟢 Live Firestore Connected ({products.length} Products Active)
                </Text>
              </View>
            ) : null}

            {/* Products List with Header */}
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ProductCard product={item} />}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View>
                  {/* Hero Promotional Banner (Only on default view) */}
                  {!searchQuery && selectedCategory === 'all' && (
                    <View
                      style={[
                        styles.heroBanner,
                        {
                          backgroundColor: scheme === 'dark' ? '#0369A1' : '#0284C7',
                          borderColor: scheme === 'dark' ? '#38BDF8' : '#0369A1',
                        },
                      ]}>
                      {/* Decorative water ripple backdrop */}
                      <View style={styles.heroGlowCircle} />

                      <View style={styles.heroTextCol}>
                        <View style={styles.heroTag}>
                          <Text style={styles.heroTagIcon}>⚡</Text>
                          <Text style={styles.heroTagText}>PURE WATER GUARANTEE</Text>
                        </View>
                        <Text style={styles.heroHeading}>
                          Advanced RO &amp; Alkaline Solutions
                        </Text>
                        <Text style={styles.heroSub}>
                          Certified 0.0001-micron filtration with natural mineral enrichment.
                        </Text>

                        {/* Specs micro-pills */}
                        <View style={styles.heroSpecsRow}>
                          <View style={styles.specPill}>
                            <Text style={styles.specPillText}>✓ 99.9% TDS Reduction</Text>
                          </View>
                          <View style={styles.specPill}>
                            <Text style={styles.specPillText}>✓ ISO 9001:2015</Text>
                          </View>
                        </View>
                      </View>

                      {/* Right Droplet Emblem */}
                      <View style={styles.heroDropEmblemContainer}>
                        <View style={styles.heroDropInnerCircle}>
                          <Text style={styles.heroDropEmoji}>💧</Text>
                        </View>
                        <Text style={styles.heroDropSubtext}>100% PURE</Text>
                      </View>
                    </View>
                  )}

                  {/* Category Pill Filters */}
                  <CategoryFilter />

                  {/* Search Input & Sort Trigger */}
                  <SearchBarAndSort />
                </View>
              }
              ListEmptyComponent={
                isProductsLoading ? (
                  <View style={styles.emptySearchBox}>
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: 12 }} />
                    <Text style={[styles.emptySearchTitle, { color: colors.text }]}>
                      Connecting to Firestore...
                    </Text>
                    <Text style={[styles.emptySearchSubtitle, { color: colors.textSecondary }]}>
                      Loading live Califnco product catalogue from backend.
                    </Text>
                  </View>
                ) : productsError ? (
                  <View style={styles.emptySearchBox}>
                    <Text style={styles.emptySearchEmoji}>⚠️</Text>
                    <Text style={[styles.emptySearchTitle, { color: colors.danger }]}>
                      Could not load products
                    </Text>
                    <Text style={[styles.emptySearchSubtitle, { color: colors.textSecondary, marginBottom: 14 }]}>
                      {productsError}
                    </Text>
                    <TouchableOpacity
                      style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                      onPress={refreshProducts}>
                      <Text style={styles.retryBtnText}>Retry Connection</Text>
                    </TouchableOpacity>
                  </View>
                ) : products.length === 0 ? (
                  <View style={styles.emptySearchBox}>
                    <Text style={styles.emptySearchEmoji}>📦</Text>
                    <Text style={[styles.emptySearchTitle, { color: colors.text }]}>
                      Catalog is empty
                    </Text>
                    <Text style={[styles.emptySearchSubtitle, { color: colors.textSecondary }]}>
                      No products found in Firestore 'products' collection.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptySearchBox}>
                    <Text style={styles.emptySearchEmoji}>🔍</Text>
                    <Text style={[styles.emptySearchTitle, { color: colors.text }]}>
                      No products found
                    </Text>
                    <Text style={[styles.emptySearchSubtitle, { color: colors.textSecondary }]}>
                      No items matched "{searchQuery}" in category "{selectedCategory}". Try clearing your search filters.
                    </Text>
                  </View>
                )
              }
            />

            {/* Product Detail Modal */}
            <ProductDetailModal />
          </View>
        )}

        {activeTab === 'cart' && <CartView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'services' && <ServicesView />}
        {activeTab === 'profile' && <ProfileView />}
      </View>

      {/* Persistent Docked Bottom Navigation */}
      <FloatingBottomNav />

      {/* Firebase Authentication Modal */}
      <AuthModal
        visible={isAuthModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />

      {/* Wholesale Dealer Application Modal */}
      <DealerApplyModal />

      {/* Field Service Booking Modal */}
      <ServiceBookingModal />

      {/* In-App Notifications Drawer Modal */}
      <NotificationsModal />
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  catalogueView: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptySearchBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptySearchEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptySearchTitle: {
    fontFamily: Typography.bold,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySearchSubtitle: {
    fontFamily: Typography.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  heroBanner: {
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 6,
    borderWidth: 1.5,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  heroGlowCircle: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroTextCol: {
    flex: 1,
    marginRight: 14,
    zIndex: 1,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  heroTagIcon: {
    fontSize: 11,
    marginRight: 4,
    color: '#FEF08A',
  },
  heroTagText: {
    fontFamily: Typography.bold,
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  heroHeading: {
    fontFamily: Typography.extraBold,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 5,
    letterSpacing: -0.3,
  },
  heroSub: {
    fontFamily: Typography.medium,
    color: 'rgba(255, 255, 255, 0.94)',
    fontSize: 11.5,
    lineHeight: 16,
    marginBottom: 8,
  },
  heroSpecsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  specPillText: {
    fontFamily: Typography.semiBold,
    color: '#E0F2FE',
    fontSize: 9.5,
    fontWeight: '600',
  },
  heroDropEmblemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  heroDropInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  heroDropEmoji: {
    fontSize: 30,
  },
  heroDropSubtext: {
    fontFamily: Typography.bold,
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  statusBanner: {
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBannerText: {
    fontFamily: Typography.semiBold,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontFamily: Typography.bold,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
