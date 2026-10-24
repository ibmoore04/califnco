import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { ProductCategory } from '@shared';

interface CategoryItem {
  id: ProductCategory | 'all';
  label: string;
  icon: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'All Products', icon: '✨' },
  { id: 'purifiers', label: 'Purifiers', icon: '💧' },
  { id: 'dispensers', label: 'Dispensers', icon: '🚰' },
  { id: 'pumps', label: 'Pumps', icon: '⚡' },
  { id: 'filters', label: 'Filters', icon: '🧪' },
  { id: 'spares', label: 'Spare Parts', icon: '🔧' },
];

export const CategoryFilter: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { selectedCategory, setSelectedCategory, products } = useShop();

  const getCategoryCount = (catId: ProductCategory | 'all'): number => {
    if (catId === 'all') return products.length;
    return products.filter((p) => p.category === catId).length;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = getCategoryCount(cat.id);

          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(cat.id)}>
              <Text style={styles.pillIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.pillLabel,
                  { color: isSelected ? '#ffffff' : colors.text },
                  isSelected && styles.pillLabelSelected,
                ]}>
                {cat.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isSelected
                      ? 'rgba(255, 255, 255, 0.25)'
                      : colors.backgroundElement,
                  },
                ]}>
                <Text
                  style={[
                    styles.countText,
                    { color: isSelected ? '#ffffff' : colors.textSecondary },
                  ]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillLabel: {
    fontFamily: Typography.medium,
    fontSize: 13,
    fontWeight: '500',
  },
  pillLabelSelected: {
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 2,
  },
  countText: {
    fontFamily: Typography.bold,
    fontSize: 11,
    fontWeight: '700',
  },
});
