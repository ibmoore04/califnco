import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { Address, Order } from '@shared';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ visible, onClose }) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { cart, subtotal, taxAmount, totalAmount, placeOrder, userProfile, setActiveTab, setSelectedOrder } = useShop();

  const [fullName, setFullName] = useState(userProfile.defaultAddress?.fullName ?? userProfile.displayName);
  const [phone, setPhone] = useState(userProfile.defaultAddress?.phone ?? userProfile.phone ?? '');
  const [street, setStreet] = useState(userProfile.defaultAddress?.street ?? '');
  const [city, setCity] = useState(userProfile.defaultAddress?.city ?? 'Bengaluru');
  const [state, setState] = useState(userProfile.defaultAddress?.state ?? 'Karnataka');
  const [postalCode, setPostalCode] = useState(userProfile.defaultAddress?.postalCode ?? '560102');

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errs.phone = 'Contact number is required';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.phone = 'Enter valid 10-digit mobile number';
    }

    if (!street.trim()) {
      errs.street = 'Street address / Flat number is required';
    }

    if (!city.trim()) {
      errs.city = 'City is required';
    }

    if (!state.trim()) {
      errs.state = 'State is required';
    }

    const cleanPin = postalCode.trim();
    if (!cleanPin) {
      errs.postalCode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(cleanPin)) {
      errs.postalCode = 'Enter valid 6-digit postal code';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const address: Address = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      };

      const order = await placeOrder(address, paymentMethod);
      setIsSubmitting(false);
      setConfirmedOrder(order);
    } catch (err) {
      console.warn('[Checkout] Order submission error:', err);
      setIsSubmitting(false);
    }
  };

  const handleViewOrderHistory = () => {
    if (confirmedOrder) {
      setSelectedOrder(confirmedOrder);
    }
    setConfirmedOrder(null);
    onClose();
    setActiveTab('orders');
  };

  const handleDoneShopping = () => {
    setConfirmedOrder(null);
    onClose();
    setActiveTab('catalogue');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {confirmedOrder ? 'Order Placed!' : 'Checkout & Review'}
              </Text>
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                {confirmedOrder ? 'Thank you for choosing Califnco' : 'Review details & place test order'}
              </Text>
            </View>
            {!isSubmitting && (
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}
                onPress={confirmedOrder ? handleDoneShopping : onClose}>
                <Text style={[styles.closeIcon, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {confirmedOrder ? (
            /* Order Success View */
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.successContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={[styles.successIconCircle, { backgroundColor: colors.successLight }]}>
                <Text style={styles.successCheckmark}>✓</Text>
              </View>

              <Text style={[styles.successTitle, { color: colors.text }]}>Order Confirmed!</Text>
              <Text style={[styles.orderIdBadge, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
                Order ID: {confirmedOrder.id}
              </Text>

              <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
                Your order for {confirmedOrder.items.length} items totaling{' '}
                <Text style={{ fontWeight: '700', color: colors.text }}>
                  ₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}
                </Text>{' '}
                has been placed in demo mode.
              </Text>

              {/* Order Meta Card */}
              <View style={[styles.summaryCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <View style={styles.summaryRow}>
                  <Text style={[styles.sumLabel, { color: colors.textSecondary }]}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: colors.warningLight }]}>
                    <Text style={[styles.statusText, { color: colors.warning }]}>Pending Verification</Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.sumLabel, { color: colors.textSecondary }]}>Payment</Text>
                  <Text style={[styles.sumVal, { color: colors.text }]}>
                    {confirmedOrder.paymentMethod === 'razorpay' ? 'Demo Mode (Pending PAN Verification)' : 'Cash on Delivery (Pending)'}
                  </Text>
                </View>

                <View style={styles.summaryRow}>
                  <Text style={[styles.sumLabel, { color: colors.textSecondary }]}>Delivery Address</Text>
                  <Text style={[styles.sumVal, { color: colors.text, textAlign: 'right', flex: 1, marginLeft: 12 }]}>
                    {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.city},{' '}
                    {confirmedOrder.shippingAddress.postalCode}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.successActions}>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleViewOrderHistory}>
                  <Text style={styles.primaryActionText}>View in Order History →</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryActionBtn, { borderColor: colors.border, backgroundColor: colors.backgroundElement }]}
                  onPress={handleDoneShopping}>
                  <Text style={[styles.secondaryActionText, { color: colors.text }]}>Continue Shopping</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            /* Checkout Form View */
            <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
              {/* Transparent Gateway Status Banner */}
              <View style={[styles.demoBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
                <Text style={styles.demoBannerIcon}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.demoBannerTitle, { color: colors.warning }]}>
                    DEMO PAYMENT MODE (PAN VERIFICATION PENDING)
                  </Text>
                  <Text style={[styles.demoBannerText, { color: colors.warning }]}>
                    Razorpay live activation is currently awaiting PAN verification. Online orders are safely registered in Demo / Pending status and synced to Firestore.
                  </Text>
                </View>
              </View>

              {/* Order Items Summary */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Order Items ({cart.length})
                </Text>
                <View style={[styles.itemsBox, { backgroundColor: colors.backgroundElement }]}>
                  {cart.map((item) => (
                    <View key={item.product.id} style={styles.itemSummaryRow}>
                      <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                        {item.quantity}x {item.product.name}
                      </Text>
                      <Text style={[styles.itemPrice, { color: colors.text }]}>
                        ₹{(item.pricePerUnit * item.quantity).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <View style={styles.itemSummaryRow}>
                    <Text style={[styles.totalLabel, { color: colors.text }]}>Grand Total (Incl. 18% GST)</Text>
                    <Text style={[styles.totalVal, { color: colors.primary }]}>
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Delivery Address Form */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Delivery Address
                </Text>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Recipient Full Name *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: errors.fullName ? colors.danger : colors.border }]}
                    placeholder="e.g. Alex Verma"
                    placeholderTextColor={colors.textSecondary}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                  {errors.fullName && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.fullName}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Contact Mobile Phone (10 digits) *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: errors.phone ? colors.danger : colors.border }]}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                  {errors.phone && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.phone}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Street Address & Flat / Door No. *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: errors.street ? colors.danger : colors.border }]}
                    placeholder="e.g. Flat 301, Lakeview Residency, Main Road"
                    placeholderTextColor={colors.textSecondary}
                    value={street}
                    onChangeText={setStreet}
                  />
                  {errors.street && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.street}</Text>}
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>City *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: errors.city ? colors.danger : colors.border }]}
                      placeholder="e.g. Bengaluru"
                      placeholderTextColor={colors.textSecondary}
                      value={city}
                      onChangeText={setCity}
                    />
                    {errors.city && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.city}</Text>}
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>State *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: errors.state ? colors.danger : colors.border }]}
                      placeholder="e.g. Karnataka"
                      placeholderTextColor={colors.textSecondary}
                      value={state}
                      onChangeText={setState}
                    />
                    {errors.state && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.state}</Text>}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>PIN Code (6 digits) *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: errors.postalCode ? colors.danger : colors.border }]}
                    placeholder="e.g. 560102"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={postalCode}
                    onChangeText={setPostalCode}
                  />
                  {errors.postalCode && <Text style={[styles.errorText, { color: colors.danger }]}>{errors.postalCode}</Text>}
                </View>
              </View>

              {/* Payment Method Selector */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Payment Mode (Demo)
                </Text>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    {
                      backgroundColor: paymentMethod === 'razorpay' ? colors.primaryLight : colors.backgroundElement,
                      borderColor: paymentMethod === 'razorpay' ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setPaymentMethod('razorpay')}>
                  <View style={styles.radioRow}>
                    <View style={[styles.radioCircle, { borderColor: paymentMethod === 'razorpay' ? colors.primary : colors.textSecondary }]}>
                      {paymentMethod === 'razorpay' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.paymentTitle, { color: colors.text }]}>
                        💳 Demo Online Payment (Pending PAN Verification)
                      </Text>
                      <Text style={[styles.paymentSub, { color: colors.textSecondary }]}>
                        Simulated authorization • Registered in Firestore with 'pending' status
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentOption,
                    {
                      backgroundColor: paymentMethod === 'cod' ? colors.primaryLight : colors.backgroundElement,
                      borderColor: paymentMethod === 'cod' ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setPaymentMethod('cod')}>
                  <View style={styles.radioRow}>
                    <View style={[styles.radioCircle, { borderColor: paymentMethod === 'cod' ? colors.primary : colors.textSecondary }]}>
                      {paymentMethod === 'cod' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.paymentTitle, { color: colors.text }]}>
                        💵 Cash on Delivery (Demo COD)
                      </Text>
                      <Text style={[styles.paymentSub, { color: colors.textSecondary }]}>
                        Pay ₹{totalAmount.toLocaleString('en-IN')} upon physical delivery
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* Footer Submit Button */}
          {!confirmedOrder && (
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
                activeOpacity={0.85}>
                {isSubmitting ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#ffffff" size="small" />
                    <Text style={styles.submitBtnText}>Processing Test Order...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitBtnText}>
                    Place Order (Test Mode) • ₹{totalAmount.toLocaleString('en-IN')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: Typography.extraBold,
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    fontFamily: Typography.regular,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  demoBanner: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  demoBannerIcon: {
    fontSize: 22,
  },
  demoBannerTitle: {
    fontFamily: Typography.bold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  demoBannerText: {
    fontFamily: Typography.regular,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: Typography.bold,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  itemsBox: {
    padding: 12,
    borderRadius: 12,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontFamily: Typography.medium,
    fontSize: 13,
    flex: 1,
    marginRight: 10,
  },
  itemPrice: {
    fontFamily: Typography.bold,
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  formGroup: {
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  paymentOption: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  paymentSub: {
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successCheckmark: {
    fontSize: 32,
    color: '#10B981',
    fontWeight: '900',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  orderIdBadge: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryCard: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sumLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sumVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  successActions: {
    width: '100%',
    gap: 10,
  },
  primaryActionBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
