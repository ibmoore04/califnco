import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { ServiceBooking, ServiceStatus } from '@califnco/shared';

const STATUS_CONFIG: Record<ServiceStatus, { label: string; bg: string; text: string; icon: string }> = {
  submitted: { label: 'Ticket Logged', bg: '#FEF3C7', text: '#B45309', icon: '⏳' },
  scheduled: { label: 'Technician Assigned', bg: '#E0F2FE', text: '#0369A1', icon: '📅' },
  in_progress: { label: 'Work In Progress', bg: '#EDE9FE', text: '#6D28D9', icon: '⚡' },
  completed: { label: 'Service Completed', bg: '#ECFDF5', text: '#047857', icon: '✅' },
  cancelled: { label: 'Cancelled', bg: '#F1F5F9', text: '#475569', icon: '❌' },
};

const SERVICE_TYPE_NAMES: Record<string, string> = {
  installation: 'RO Water Purifier Installation',
  filter_replacement: 'Filter & Membrane Renewal',
  maintenance: 'Periodic Sanitization & Tune-up',
  repair: 'Fault Diagnostic & Repair',
};

export const ServicesView: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const {
    serviceBookings,
    isServicesLoading,
    refreshServiceBookings,
    setServiceBookingModalVisible,
    isAuthenticated,
    setAuthModalVisible,
  } = useShop();

  const handleBookPress = () => {
    if (!isAuthenticated) {
      setAuthModalVisible(true);
      return;
    }
    setServiceBookingModalVisible(true);
  };

  const renderBookingCard = ({ item }: { item: ServiceBooking }) => {
    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.submitted;
    const typeLabel = SERVICE_TYPE_NAMES[item.serviceType] || item.serviceType;

    return (
      <View
        style={[
          styles.bookingCard,
          {
            backgroundColor: scheme === 'dark' ? '#1E293B' : '#FFFFFF',
            borderColor: colors.border,
          },
        ]}>
        {/* Card Header */}
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bookingTypeTitle, { color: colors.text }]}>{typeLabel}</Text>
            <Text style={[styles.bookingIdText, { color: colors.textSecondary }]}>
              Ticket #{item.id.slice(0, 8).toUpperCase()} • {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
              {statusCfg.icon} {statusCfg.label}
            </Text>
          </View>
        </View>

        {/* Schedule Details */}
        <View
          style={[
            styles.detailsBox,
            { backgroundColor: scheme === 'dark' ? '#0F172A' : '#F8FAFC', borderColor: colors.border },
          ]}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Scheduled Date:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              📅 {item.preferredDate} {item.preferredTimeSlot ? `• ${item.preferredTimeSlot}` : ''}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Service Address:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={2}>
              📍 {item.address?.street}, {item.address?.city} ({item.address?.postalCode})
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Contact:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              👤 {item.customerName} ({item.customerPhone})
            </Text>
          </View>
          {item.technicianAssigned ? (
            <View style={[styles.detailRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: '#0369A1' }]}>Assigned Tech:</Text>
              <Text style={[styles.detailValue, { color: '#0369A1', fontWeight: '700' }]}>
                👷‍♂️ {item.technicianAssigned}
              </Text>
            </View>
          ) : (
            <View style={[styles.detailRow, { marginTop: 4 }]}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Dispatch:</Text>
              <Text style={[styles.detailValue, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                Awaiting technician route allocation
              </Text>
            </View>
          )}
          {item.notes ? (
            <View style={[styles.detailRow, { marginTop: 4 }]}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notes:</Text>
              <Text style={[styles.detailValue, { color: colors.textSecondary }]} numberOfLines={2}>
                "{item.notes}"
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Hero Banner */}
      <View
        style={[
          styles.heroCard,
          {
            backgroundColor: scheme === 'dark' ? '#075985' : '#0284C7',
            borderColor: scheme === 'dark' ? '#38BDF8' : '#0369A1',
          },
        ]}>
        <View style={styles.heroTextCol}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>⚡ CERTIFIED FIELD SERVICE</Text>
          </View>
          <Text style={styles.heroTitle}>Doorstep RO Care &amp; Maintenance</Text>
          <Text style={styles.heroSub}>
            Genuine membranes, certified technicians, 30-day post-service warranty.
          </Text>

          <TouchableOpacity style={styles.heroBtn} onPress={handleBookPress} activeOpacity={0.8}>
            <Text style={styles.heroBtnText}>+ Book a Technician</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroEmoji}>🛠️</Text>
      </View>

      {/* Bookings List */}
      <View style={styles.listHeaderRow}>
        <Text style={[styles.listHeaderTitle, { color: colors.text }]}>Service History &amp; Active Requests</Text>
        <Text style={[styles.listHeaderCount, { color: colors.textSecondary }]}>
          {serviceBookings.length} {serviceBookings.length === 1 ? 'ticket' : 'tickets'}
        </Text>
      </View>

      {isServicesLoading && serviceBookings.length === 0 ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading service appointments from Firestore...
          </Text>
        </View>
      ) : (
        <FlatList
          data={serviceBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isServicesLoading}
              onRefresh={refreshServiceBookings}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🔧</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Service Bookings Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Need installation, membrane filter renewal, or water quality tuning? Schedule an authorized Califnco engineer anytime.
              </Text>
              <TouchableOpacity
                style={[styles.emptyCtaBtn, { backgroundColor: colors.primary }]}
                onPress={handleBookPress}>
                <Text style={styles.emptyCtaText}>Schedule First Visit</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontFamily: Typography.fonts.heading,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    lineHeight: 16,
    marginBottom: 12,
  },
  heroBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: '#0369A1',
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
  },
  heroEmoji: {
    fontSize: 48,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  listHeaderTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  },
  listHeaderCount: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  bookingCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bookingTypeTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  bookingIdText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeText: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  detailsBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    width: 100,
    fontWeight: '600',
  },
  detailValue: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    flex: 1,
    fontWeight: '500',
  },
  centerLoading: {
    paddingTop: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: Typography.sizes.xs,
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
    marginBottom: 16,
  },
  emptyCtaBtn: {
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
});
