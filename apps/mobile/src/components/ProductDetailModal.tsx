import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';

export const ProductDetailModal: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { selectedProduct, setSelectedProduct, addToCart } = useShop();
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!selectedProduct) return null;

  const handleAddToCart = () => {
    if (!selectedProduct.inStock || selectedProduct.stock <= 0) return;
    addToCart(selectedProduct, quantity);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      setSelectedProduct(null);
      setQuantity(1);
    }, 1200);
  };

  const totalPrice = selectedProduct.price * quantity;

  return (
    <Modal
      visible={!!selectedProduct}
      animationType="slide"
      transparent
      onRequestClose={() => setSelectedProduct(null)}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          {/* Header Bar */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.categoryPill, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.categoryPillText, { color: colors.primary }]}>
                  {selectedProduct.category}
                </Text>
              </View>
              {selectedProduct.inStock ? (
                <Text style={[styles.stockText, { color: colors.success }]}>
                  ● In Stock ({selectedProduct.stock} units)
                </Text>
              ) : (
                <Text style={[styles.stockText, { color: colors.danger }]}>
                  ● Out of Stock
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}
              onPress={() => setSelectedProduct(null)}>
              <Text style={[styles.closeIcon, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Main Product Image */}
            <View style={[styles.imageWrapper, { backgroundColor: colors.backgroundElement }]}>
              {!imageError && selectedProduct.imageUrl ? (
                <Image
                  source={{ uri: selectedProduct.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <View style={styles.fallbackBox}>
                  <Text style={styles.fallbackEmoji}>💧</Text>
                  <Text style={[styles.fallbackTitle, { color: colors.textSecondary }]}>
                    {selectedProduct.category.toUpperCase()} SPECIFICATION
                  </Text>
                </View>
              )}
            </View>

            {/* Title & Ratings */}
            <View style={styles.body}>
              <View style={styles.ratingRow}>
                <Text style={styles.star}>★</Text>
                <Text style={[styles.ratingNumber, { color: colors.text }]}>
                  {selectedProduct.rating ?? 4.8}
                </Text>
                <Text style={[styles.reviewsCount, { color: colors.textSecondary }]}>
                  ({selectedProduct.reviewsCount ?? 140} verified ratings)
                </Text>
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                {selectedProduct.name}
              </Text>

              {/* Price Row */}
              <View style={[styles.priceBox, { backgroundColor: colors.backgroundElement }]}>
                <View>
                  <Text style={[styles.priceTagLabel, { color: colors.textSecondary }]}>
                    Customer Price (Incl. GST)
                  </Text>
                  <Text style={[styles.priceAmount, { color: colors.text }]}>
                    ₹{selectedProduct.price.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.wholesaleBadge}>
                  <Text style={[styles.wholesaleHead, { color: colors.primaryDark }]}>
                    Wholesale Dealer Tier
                  </Text>
                  <Text style={[styles.wholesaleVal, { color: colors.primary }]}>
                    ₹{selectedProduct.wholesalePrice.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.wholesaleMoq, { color: colors.textSecondary }]}>
                    Min. Bulk Order: {selectedProduct.minWholesaleQty} units
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeading, { color: colors.text }]}>
                  Description & Features
                </Text>
                <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                  {selectedProduct.description}
                </Text>
              </View>

              {/* Technical Specifications */}
              <View style={styles.section}>
                <Text style={[styles.sectionHeading, { color: colors.text }]}>
                  Technical Specifications
                </Text>
                <View style={[styles.specTable, { borderColor: colors.border }]}>
                  {Object.entries(selectedProduct.specifications).map(
                    ([key, val], index, arr) => (
                      <View
                        key={key}
                        style={[
                          styles.specRow,
                          index < arr.length - 1 && {
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                          },
                          {
                            backgroundColor:
                              index % 2 === 0
                                ? colors.backgroundElement
                                : 'transparent',
                          },
                        ]}>
                        <Text style={[styles.specKey, { color: colors.textSecondary }]}>
                          {key}
                        </Text>
                        <Text style={[styles.specValue, { color: colors.text }]}>
                          {val}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>

              {/* Genuine Califnco Guarantee Note */}
              <View
                style={[
                  styles.guaranteeBox,
                  { backgroundColor: colors.primaryLight, borderColor: colors.primary },
                ]}>
                <Text style={styles.guaranteeIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.guaranteeTitle, { color: colors.primaryDark }]}>
                    Califnco PureWater Assurance
                  </Text>
                  <Text style={[styles.guaranteeDesc, { color: colors.primaryDark }]}>
                    Certified food-grade components, 100% genuine water-filtration parts, and direct technician support.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer Quantity & Add to Cart */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.backgroundElement }]}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}>
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyNumber, { color: colors.text }]}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyBtn, { backgroundColor: colors.backgroundElement }]}
                onPress={() =>
                  setQuantity((q) =>
                    Math.min(selectedProduct.stock || 10, q + 1)
                  )
                }>
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.addToCartBtn,
                {
                  backgroundColor: !selectedProduct.inStock
                    ? colors.backgroundElement
                    : addedNotice
                    ? colors.success
                    : colors.primary,
                },
              ]}
              onPress={handleAddToCart}
              disabled={!selectedProduct.inStock || selectedProduct.stock <= 0}
              activeOpacity={0.85}>
              <Text
                style={[
                  styles.addToCartText,
                  {
                    color: !selectedProduct.inStock
                      ? colors.textSecondary
                      : '#ffffff',
                  },
                ]}>
                {!selectedProduct.inStock
                  ? 'Out of Stock'
                  : addedNotice
                  ? '✓ Added to Cart!'
                  : `Add to Cart • ₹${totalPrice.toLocaleString('en-IN')}`}
              </Text>
            </TouchableOpacity>
          </View>
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
    height: '90%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
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
  },
  imageWrapper: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackBox: {
    alignItems: 'center',
    gap: 8,
  },
  fallbackEmoji: {
    fontSize: 56,
  },
  fallbackTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  body: {
    padding: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  star: {
    color: '#F59E0B',
    fontSize: 15,
  },
  ratingNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  reviewsCount: {
    fontSize: 13,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 14,
  },
  priceBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
  },
  priceTagLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '800',
  },
  wholesaleBadge: {
    alignItems: 'flex-end',
  },
  wholesaleHead: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  wholesaleVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  wholesaleMoq: {
    fontSize: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
  },
  specTable: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  specKey: {
    width: '40%',
    fontSize: 12,
    fontWeight: '600',
  },
  specValue: {
    width: '60%',
    fontSize: 12,
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 16,
  },
  guaranteeIcon: {
    fontSize: 24,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  guaranteeDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },
  qtyNumber: {
    fontSize: 16,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
