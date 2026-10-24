import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';

export const HeaderBar: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const {
    cartCount,
    setActiveTab,
    activeTab,
    unreadNotificationCount,
    setNotificationsModalVisible,
  } = useShop();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={styles.brandRow}
        activeOpacity={0.7}
        onPress={() => setActiveTab('catalogue')}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.logoDrop, { color: colors.primary }]}>💧</Text>
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={[styles.brandTitle, { color: colors.text }]}>Califnco</Text>
            <View style={[styles.pureBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.pureBadgeText}>PURE</Text>
            </View>
          </View>
          <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>
            Clean Water, Pure Life • Est. 2026
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        {/* Notifications Button */}
        <TouchableOpacity
          style={[
            styles.cartButton,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => setNotificationsModalVisible(true)}
          accessibilityLabel="Notifications">
          <Text style={styles.cartIcon}>🔔</Text>
          {unreadNotificationCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.warning }]}>
              <Text style={styles.badgeText}>
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Cart Button */}
        <TouchableOpacity
          style={[
            styles.cartButton,
            {
              backgroundColor: activeTab === 'cart' ? colors.primaryLight : colors.backgroundElement,
              borderColor: activeTab === 'cart' ? colors.primary : colors.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('cart')}
          accessibilityLabel="Shopping cart">
          <Text style={styles.cartIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDrop: {
    fontSize: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontFamily: Typography.extraBold,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pureBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pureBadgeText: {
    fontFamily: Typography.bold,
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontFamily: Typography.medium,
    fontSize: 11,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  authBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  authIcon: {
    fontSize: 16,
  },
  authInitialText: {
    fontFamily: Typography.bold,
    fontSize: 14,
    fontWeight: '800',
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    fontFamily: Typography.bold,
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
});
