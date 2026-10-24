import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop, InAppNotification } from '@/context/ShopContext';

const TYPE_ICONS: Record<string, string> = {
  order: '📦',
  service: '🔧',
  dealer: '🏢',
  system: '🔔',
};

export const NotificationsModal: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const {
    isNotificationsModalVisible,
    setNotificationsModalVisible,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useShop();

  const renderItem = ({ item }: { item: InAppNotification }) => {
    const icon = TYPE_ICONS[item.type] || '🔔';

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          {
            backgroundColor: item.read
              ? scheme === 'dark'
                ? '#1E293B'
                : '#FFFFFF'
              : scheme === 'dark'
              ? '#0F2942'
              : '#F0F9FF',
            borderColor: item.read ? colors.border : colors.primary,
          },
        ]}
        onPress={() => markNotificationAsRead(item.id)}
        activeOpacity={0.7}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>

        <View style={styles.itemContent}>
          <View style={styles.itemHeaderRow}>
            <Text
              style={[
                styles.itemTitle,
                { color: colors.text, fontWeight: item.read ? '600' : '800' },
              ]}>
              {item.title}
            </Text>
            {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
          </View>
          <Text style={[styles.itemMessage, { color: colors.textSecondary }]}>
            {item.message}
          </Text>
          <Text style={[styles.itemTime, { color: colors.textSecondary }]}>
            {new Date(item.date).toLocaleDateString()} at{' '}
            {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={isNotificationsModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setNotificationsModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Notifications</Text>
              {unreadNotificationCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{unreadNotificationCount} New</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {unreadNotificationCount > 0 && (
                <TouchableOpacity onPress={markAllNotificationsAsRead}>
                  <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: scheme === 'dark' ? '#334155' : '#F1F5F9' }]}
                onPress={() => setNotificationsModalVisible(false)}>
                <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🔔</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>All Caught Up!</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Order status updates, dispatch tracking, and technician booking alerts will appear here in real time.
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '40%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontFamily: Typography.fonts.heading,
    fontSize: 10,
    fontWeight: '700',
  },
  markAllText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 40,
  },
  notificationItem: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  itemContent: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.sm,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  itemMessage: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    lineHeight: 16,
    marginBottom: 4,
  },
  itemTime: {
    fontFamily: Typography.fonts.body,
    fontSize: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyEmoji: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
});
