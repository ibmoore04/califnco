import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  useColorScheme,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { Order, OrderStatus } from '@shared';

export const OrdersView: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { orders, selectedOrder, setSelectedOrder, setActiveTab } = useShop();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { bg: colors.warningLight, text: colors.warning, label: 'Pending Verification' };
      case 'processing':
        return { bg: colors.primaryLight, text: colors.primary, label: 'Processing & Assembly' };
      case 'shipped':
        return { bg: '#F3E8FF', text: '#9333EA', label: 'Dispatched / In Transit' };
      case 'delivered':
        return { bg: colors.successLight, text: colors.success, label: 'Delivered' };
      case 'cancelled':
        return { bg: colors.dangerLight, text: colors.danger, label: 'Cancelled' };
      default:
        return { bg: colors.backgroundElement, text: colors.textSecondary, label: status };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (orders.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyCircle, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.emptyIcon}>📦</Text>
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Orders Found</Text>
        <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
          You haven't placed any orders yet. Select items from our catalog to place your first test order!
        </Text>
        <TouchableOpacity
          style={[styles.shopBtn, { backgroundColor: colors.primary }]}
          onPress={() => setActiveTab('catalogue')}>
          <Text style={styles.shopBtnText}>Browse Products →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Order History</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {orders.length} total {orders.length === 1 ? 'order' : 'orders'} placed with Califnco
          </Text>
        </View>

        {/* Orders Cards List */}
        <View style={styles.ordersList}>
          {orders.map((order) => {
            const statusInfo = getStatusColor(order.status);
            const totalItemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <TouchableOpacity
                key={order.id}
                style={[
                  styles.orderCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedOrder(order)}>
                {/* Order Top Bar */}
                <View style={styles.orderTopRow}>
                  <View>
                    <Text style={[styles.orderId, { color: colors.text }]}>{order.id}</Text>
                    <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                      Placed on {formatDate(order.createdAt)}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusText, { color: statusInfo.text }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Items Preview */}
                <View style={[styles.itemsPreviewBox, { backgroundColor: colors.backgroundElement }]}>
                  {order.items.slice(0, 2).map((item, idx) => (
                    <Text
                      key={`${order.id}-${idx}`}
                      style={[styles.previewItemText, { color: colors.text }]}
                      numberOfLines={1}>
                      • {item.quantity}x {item.productName}
                    </Text>
                  ))}
                  {order.items.length > 2 && (
                    <Text style={[styles.moreItemsText, { color: colors.textSecondary }]}>
                      + {order.items.length - 2} more items
                    </Text>
                  )}
                </View>

                {/* Card Bottom Row */}
                <View style={styles.orderBottomRow}>
                  <View>
                    <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                      Total Amount ({totalItemsCount} items)
                    </Text>
                    <Text style={[styles.totalPrice, { color: colors.text }]}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={[styles.detailsLink, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.detailsLinkText, { color: colors.primary }]}>
                      View Receipt →
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Order Details Receipt Modal */}
      {selectedOrder && (
        <Modal
          visible={!!selectedOrder}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedOrder(null)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContainer,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Receipt & Timeline
                  </Text>
                  <Text style={[styles.modalOrderId, { color: colors.primary }]}>
                    {selectedOrder.id}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.modalCloseBtn, { backgroundColor: colors.backgroundElement }]}
                  onPress={() => setSelectedOrder(null)}>
                  <Text style={[styles.modalCloseIcon, { color: colors.text }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Status Progress Tracker */}
                <View style={[styles.trackerBox, { backgroundColor: colors.backgroundElement }]}>
                  <Text style={[styles.trackerHeading, { color: colors.text }]}>
                    Delivery Status Progression
                  </Text>
                  <View style={styles.trackerStepsRow}>
                    {['pending', 'processing', 'shipped', 'delivered'].map((step, idx) => {
                      const isCompleted =
                        (selectedOrder.status === 'delivered') ||
                        (selectedOrder.status === 'shipped' && idx <= 2) ||
                        (selectedOrder.status === 'processing' && idx <= 1) ||
                        (selectedOrder.status === 'pending' && idx === 0);

                      return (
                        <View key={step} style={styles.trackerStepItem}>
                          <View
                            style={[
                              styles.trackerDot,
                              {
                                backgroundColor: isCompleted
                                  ? colors.primary
                                  : colors.border,
                              },
                            ]}>
                            <Text style={styles.trackerDotText}>
                              {isCompleted ? '✓' : idx + 1}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.trackerLabel,
                              {
                                color: isCompleted
                                  ? colors.primary
                                  : colors.textSecondary,
                                fontWeight: isCompleted ? '700' : '500',
                              },
                            ]}>
                            {step}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Itemized Receipt */}
                <View style={styles.receiptSection}>
                  <Text style={[styles.sectionHeading, { color: colors.text }]}>
                    Itemized Order Breakdown
                  </Text>
                  <View
                    style={[
                      styles.receiptItemsCard,
                      { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                    ]}>
                    {selectedOrder.items.map((item, index) => (
                      <View key={index} style={styles.receiptItemRow}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={[styles.receiptItemName, { color: colors.text }]}>
                            {item.productName}
                          </Text>
                          <Text style={[styles.receiptItemMeta, { color: colors.textSecondary }]}>
                            Qty: {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')}
                          </Text>
                        </View>
                        <Text style={[styles.receiptItemTotal, { color: colors.text }]}>
                          ₹{item.totalPrice.toLocaleString('en-IN')}
                        </Text>
                      </View>
                    ))}

                    <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.subtotalRow}>
                      <Text style={[styles.subText, { color: colors.textSecondary }]}>
                        Items Subtotal
                      </Text>
                      <Text style={[styles.subVal, { color: colors.text }]}>
                        ₹{selectedOrder.subtotal.toLocaleString('en-IN')}
                      </Text>
                    </View>

                    <View style={styles.subtotalRow}>
                      <Text style={[styles.subText, { color: colors.textSecondary }]}>
                        GST (18% Appliance Tax)
                      </Text>
                      <Text style={[styles.subVal, { color: colors.text }]}>
                        ₹{selectedOrder.taxAmount.toLocaleString('en-IN')}
                      </Text>
                    </View>

                    <View style={styles.subtotalRow}>
                      <Text style={[styles.subText, { color: colors.textSecondary }]}>
                        Standard Delivery
                      </Text>
                      <Text style={[styles.subVal, { color: colors.success, fontWeight: '700' }]}>
                        FREE
                      </Text>
                    </View>

                    <View style={[styles.receiptDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.subtotalRow}>
                      <Text style={[styles.grandLabel, { color: colors.text }]}>
                        Total Billed
                      </Text>
                      <Text style={[styles.grandVal, { color: colors.primary }]}>
                        ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Delivery & Payment Info */}
                <View style={styles.receiptSection}>
                  <Text style={[styles.sectionHeading, { color: colors.text }]}>
                    Shipping & Payment Details
                  </Text>
                  <View
                    style={[
                      styles.receiptItemsCard,
                      { backgroundColor: colors.backgroundElement, borderColor: colors.border },
                    ]}>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Recipient
                      </Text>
                      <Text style={[styles.infoVal, { color: colors.text }]}>
                        {selectedOrder.shippingAddress.fullName} ({selectedOrder.shippingAddress.phone})
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Delivery Address
                      </Text>
                      <Text
                        style={[
                          styles.infoVal,
                          { color: colors.text, flex: 1, textAlign: 'right', marginLeft: 16 },
                        ]}>
                        {selectedOrder.shippingAddress.street},{' '}
                        {selectedOrder.shippingAddress.city},{' '}
                        {selectedOrder.shippingAddress.state} -{' '}
                        {selectedOrder.shippingAddress.postalCode}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Payment Mode
                      </Text>
                      <Text style={[styles.infoVal, { color: colors.text }]}>
                        {selectedOrder.paymentMethod === 'razorpay'
                          ? 'Demo Simulated Card/UPI (Paid)'
                          : 'Cash on Delivery (Pending)'}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: Typography.extraBold,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontFamily: Typography.regular,
    fontSize: 13,
    marginTop: 2,
  },
  ordersList: {
    gap: 14,
  },
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontFamily: Typography.extraBold,
    fontSize: 15,
    fontWeight: '800',
  },
  orderDate: {
    fontFamily: Typography.regular,
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: Typography.bold,
    fontSize: 11,
    fontWeight: '700',
  },
  itemsPreviewBox: {
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  previewItemText: {
    fontFamily: Typography.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  moreItemsText: {
    fontFamily: Typography.regular,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  totalLabel: {
    fontFamily: Typography.regular,
    fontSize: 11,
  },
  totalPrice: {
    fontFamily: Typography.extraBold,
    fontSize: 17,
    fontWeight: '800',
  },
  detailsLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailsLinkText: {
    fontFamily: Typography.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  shopBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalOrderId: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalScroll: {
    flex: 1,
    padding: 16,
  },
  trackerBox: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  trackerHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },
  trackerStepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackerStepItem: {
    alignItems: 'center',
    flex: 1,
  },
  trackerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  trackerDotText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  trackerLabel: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  receiptSection: {
    marginBottom: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  receiptItemsCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptItemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  receiptItemMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  receiptItemTotal: {
    fontSize: 13,
    fontWeight: '700',
  },
  receiptDivider: {
    height: 1,
    marginVertical: 4,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subText: {
    fontSize: 12,
  },
  subVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  grandLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  grandVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 12,
    width: '35%',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
  },
});
