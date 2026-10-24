import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { HeaderBar } from '@/components/HeaderBar';
import { CategoryFilter } from '@/components/CategoryFilter';
import { SearchBarAndSort } from '@/components/SearchBarAndSort';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { CartView } from '@/components/CartView';
import { OrdersView } from '@/components/OrdersView';
import { ProfileView } from '@/components/ProfileView';
import { FloatingBottomNav } from '@/components/FloatingBottomNav';

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { activeTab, filteredProducts, searchQuery, selectedCategory } = useShop();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      />

      {/* Top Brand Header Bar */}
      <HeaderBar />

      {/* Main Tab Screen Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'catalogue' && (
          <View style={styles.catalogueView}>
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
                        { backgroundColor: colors.primary, borderColor: colors.primaryDark },
                      ]}>
                      <View style={styles.heroTextCol}>
                        <View style={styles.heroTag}>
                          <Text style={styles.heroTagText}>⚡ PURE WATER GUARANTEE</Text>
                        </View>
                        <Text style={styles.heroHeading}>
                          Advanced RO & Alkaline Solutions
                        </Text>
                        <Text style={styles.heroSub}>
                          Certified 0.0001-micron filtration with natural mineral enrichment.
                        </Text>
                      </View>
                      <Text style={styles.heroDropEmoji}>💧</Text>
                    </View>
                  )}

                  {/* Category Pill Filters */}
                  <CategoryFilter />

                  {/* Search Input & Sort Trigger */}
                  <SearchBarAndSort />
                </View>
              }
              ListEmptyComponent={
                <View style={styles.emptySearchBox}>
                  <Text style={styles.emptySearchEmoji}>🔍</Text>
                  <Text style={[styles.emptySearchTitle, { color: colors.text }]}>
                    No products found
                  </Text>
                  <Text style={[styles.emptySearchSubtitle, { color: colors.textSecondary }]}>
                    No items matched "{searchQuery}" in category "{selectedCategory}". Try clearing your search filters.
                  </Text>
                </View>
              }
            />

            {/* Product Detail Modal */}
            <ProductDetailModal />
          </View>
        )}

        {activeTab === 'cart' && <CartView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'profile' && <ProfileView />}
      </View>

      {/* Persistent Docked Bottom Navigation */}
      <FloatingBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySearchSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTextCol: {
    flex: 1,
    marginRight: 12,
  },
  heroTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  heroTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroHeading: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 4,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    lineHeight: 15,
  },
  heroDropEmoji: {
    fontSize: 48,
  },
});
