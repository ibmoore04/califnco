import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/constants/theme';
import { useShop, TabType } from '@/context/ShopContext';

interface NavItem {
  id: TabType;
  label: string;
  icon: string;
  badgeCount?: number;
}

export const FloatingBottomNav: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { activeTab, setActiveTab, cartCount, orders } = useShop();

  const navItems: NavItem[] = [
    { id: 'catalogue', label: 'Shop', icon: '🏪' },
    { id: 'cart', label: 'Cart', icon: '🛒', badgeCount: cartCount },
    { id: 'orders', label: 'Orders', icon: '📦', badgeCount: orders.length },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 10),
        },
      ]}>
      <View style={styles.navRow}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tabBtn,
                isActive && { backgroundColor: colors.backgroundElement },
              ]}
              activeOpacity={0.7}
              onPress={() => setActiveTab(item.id)}>
              <View style={styles.iconContainer}>
                <Text style={styles.tabIcon}>{item.icon}</Text>
                {item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: item.id === 'cart' ? colors.primary : colors.textSecondary,
                      },
                    ]}>
                    <Text style={styles.badgeText}>
                      {item.badgeCount > 99 ? '99+' : item.badgeCount}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  {
                    fontFamily: isActive ? Typography.bold : Typography.medium,
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: Typography.bold,
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
});
