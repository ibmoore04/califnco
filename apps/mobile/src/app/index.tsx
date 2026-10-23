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
});
