import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  useColorScheme,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop, SortOption } from '@/context/ShopContext';

const SORT_OPTIONS: { id: SortOption; label: string; icon: string }[] = [
  { id: 'featured', label: 'Featured / Recommended', icon: '⭐' },
  { id: 'price-asc', label: 'Price: Low to High', icon: '↗️' },
  { id: 'price-desc', label: 'Price: High to Low', icon: '↘️' },
  { id: 'rating', label: 'Customer Rating', icon: '✨' },
  { id: 'name', label: 'Name (A to Z)', icon: '🔤' },
];

export const SearchBarAndSort: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { searchQuery, setSearchQuery, sortBy, setSortBy, filteredProducts } = useShop();
  const [modalVisible, setModalVisible] = useState(false);

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Featured';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Search Input Box */}
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search purifiers, filters, spares..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={[styles.clearIcon, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Trigger Button */}
        <TouchableOpacity
          style={[
            styles.sortButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          activeOpacity={0.7}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.sortIcon}>⚡</Text>
          <Text style={[styles.sortText, { color: colors.text }]}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Results Count & Active Sort Label */}
      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
          Showing <Text style={[styles.metaHighlight, { color: colors.primary }]}>{filteredProducts.length}</Text> items
        </Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.sortTriggerPill}
          activeOpacity={0.7}>
          <Text
            style={[styles.activeSortText, { color: colors.primary }]}
            numberOfLines={1}
            ellipsizeMode="tail">
            Sorted by: {currentSortLabel} ▼
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Sort Products</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {SORT_OPTIONS.map((option) => {
                const isSelected = sortBy === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected
                          ? colors.primaryLight
                          : 'transparent',
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSortBy(option.id);
                      setModalVisible(false);
                    }}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? '700' : '400',
                        },
                      ]}>
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Text style={[styles.checkmark, { color: colors.primary }]}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 15,
  },
  input: {
    fontFamily: Typography.regular,
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearIcon: {
    fontSize: 13,
    fontWeight: 'bold',
    padding: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  sortIcon: {
    fontSize: 14,
  },
  sortText: {
    fontFamily: Typography.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 2,
    gap: 8,
  },
  metaText: {
    fontFamily: Typography.regular,
    fontSize: 12,
    flexShrink: 0,
  },
  metaHighlight: {
    fontFamily: Typography.bold,
    fontWeight: '700',
  },
  sortTriggerPill: {
    flexShrink: 1,
    maxWidth: '65%',
  },
  activeSortText: {
    fontFamily: Typography.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontFamily: Typography.bold,
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    fontSize: 16,
    padding: 4,
  },
  optionsList: {
    gap: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 10,
  },
  optionIcon: {
    fontSize: 16,
  },
  optionLabel: {
    fontFamily: Typography.medium,
    fontSize: 14,
    flex: 1,
  },
  checkmark: {
    fontSize: 15,
    fontWeight: '800',
  },
});
