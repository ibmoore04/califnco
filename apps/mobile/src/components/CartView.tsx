import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { CheckoutModal } from './CheckoutModal';

export const CartView: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { cart, subtotal, taxAmount, totalAmount, updateQuantity, removeFromCart, clearCart, setActiveTab } = useShop();
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  if (cart.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyIconCircle, { backgroundColor: colors.primaryLight }]}>
          <Text style={styles.emptyIcon}>🛒</Text>
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Cart is Empty</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          You haven't added any water purifiers, filters, or spare parts yet. Explore our 50+ item catalog to get started!
        </Text>
        <TouchableOpacity
          style={[styles.browseBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('catalogue')}>
          <Text style={styles.browseBtnText}>Explore 50+ Products →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cart Header */}
        <View style={styles.cartHeaderRow}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Shopping Cart</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
              {cart.length} unique {cart.length === 1 ? 'item' : 'items'} in your cart
            </Text>
          </View>
          <TouchableOpacity onPress={clearCart} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.clearBtnText, { color: colors.danger }]}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items List */}
        <View style={styles.itemsList}>
          {cart.map((item) => (
            <View
              key={item.product.id}
              style={[
                styles.cartItemCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}>
              {/* Product Thumbnail */}
              <View style={[styles.thumbBox, { backgroundColor: colors.backgroundElement }]}>
                {item.product.imageUrl ? (
                  <Image source={{ uri: item.product.imageUrl }} style={styles.thumbImage} resizeMode="cover" />
                ) : (
                  <Text style={styles.thumbEmoji}>💧</Text>
                )}
              </View>

              {/* Item Info */}
              <View style={styles.itemInfo}>
                <View style={styles.itemTitleRow}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.product.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={[styles.deleteBtn, { color: colors.danger }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.itemCategory, { color: colors.primary }]}>
                  {item.product.category}
                </Text>

                <View style={styles.itemBottomRow}>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    ₹{(item.pricePerUnit * item.quantity).toLocaleString('en-IN')}
                    <Text style={[styles.unitPrice, { color: colors.textSecondary }]}>
                      {' '}(₹{item.pricePerUnit.toLocaleString('en-IN')} ea)
                    </Text>
                  </Text>

                  {/* Quantity Stepper */}
                  <View style={[styles.stepper, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => updateQuantity(item.product.id, item.quantity - 1)}>
                      <Text style={[styles.stepBtnText, { color: colors.text }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.stepQty, { color: colors.text }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepBtn}
                      onPress={() => updateQuantity(item.product.id, item.quantity + 1)}>
                      <Text style={[styles.stepBtnText, { color: colors.text }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing Summary Breakdown */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Price Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Items Subtotal</Text>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              ₹{subtotal.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.taxLabelRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Applicable GST (18%)</Text>
              <Text style={[styles.taxInfoTag, { color: colors.primary, backgroundColor: colors.primaryLight }]}>
                Standard Appliance Rate
              </Text>
            </View>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              ₹{taxAmount.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Standard Doorstep Delivery</Text>
            <Text style={[styles.summaryVal, { color: colors.success, fontWeight: '700' }]}>FREE</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.grandTotalLabel, { color: colors.text }]}>Grand Total</Text>
            <Text style={[styles.grandTotalVal, { color: colors.primary }]}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Secure Califnco Assurance Badge */}
          <View style={[styles.assuranceBox, { backgroundColor: colors.backgroundElement }]}>
            <Text style={styles.assuranceIcon}>🔒</Text>
            <Text style={[styles.assuranceText, { color: colors.textSecondary }]}>
              Safe & Verified • Free Returns within 7 days • Direct Technician Installation Support
            </Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[styles.checkoutBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => setCheckoutVisible(true)}>
          <Text style={styles.checkoutBtnText}>
            Proceed to Checkout • ₹{totalAmount.toLocaleString('en-IN')} →
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Checkout Modal */}
      <CheckoutModal visible={checkoutVisible} onClose={() => setCheckoutVisible(false)} />
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
  cartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pageTitle: {
    fontFamily: Typography.extraBold,
    fontSize: 22,
    fontWeight: '800',
  },
  pageSubtitle: {
    fontFamily: Typography.regular,
    fontSize: 13,
    marginTop: 2,
  },
  clearBtnText: {
    fontFamily: Typography.semiBold,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 4,
  },
  itemsList: {
    gap: 12,
    marginBottom: 20,
  },
  cartItemCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  thumbBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbEmoji: {
    fontSize: 32,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontFamily: Typography.bold,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  deleteBtn: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
  itemCategory: {
    fontFamily: Typography.semiBold,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontFamily: Typography.extraBold,
    fontSize: 15,
    fontWeight: '800',
  },
  unitPrice: {
    fontFamily: Typography.regular,
    fontSize: 11,
    fontWeight: '400',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontFamily: Typography.bold,
    fontSize: 16,
    fontWeight: '700',
  },
  stepQty: {
    fontFamily: Typography.bold,
    fontSize: 13,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontFamily: Typography.bold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taxInfoTag: {
    fontFamily: Typography.bold,
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  summaryLabel: {
    fontFamily: Typography.regular,
    fontSize: 13,
  },
  summaryVal: {
    fontFamily: Typography.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  grandTotalLabel: {
    fontFamily: Typography.extraBold,
    fontSize: 16,
    fontWeight: '800',
  },
  grandTotalVal: {
    fontFamily: Typography.extraBold,
    fontSize: 20,
    fontWeight: '800',
  },
  assuranceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  assuranceIcon: {
    fontSize: 16,
  },
  assuranceText: {
    fontFamily: Typography.regular,
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  checkoutBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  checkoutBtnText: {
    fontFamily: Typography.extraBold,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontFamily: Typography.extraBold,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: Typography.regular,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  browseBtnText: {
    fontFamily: Typography.bold,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
