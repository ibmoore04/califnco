import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';
import { Product } from '@shared';

interface ProductCardProps {
  product: Product;
}

const LOCAL_CATEGORY_IMAGES: Record<string, any> = {
  purifiers: require('../../assets/products/purifiers.jpg'),
  dispensers: require('../../assets/products/dispensers.jpg'),
  pumps: require('../../assets/products/pumps.jpg'),
  filters: require('../../assets/products/filters.jpg'),
  spares: require('../../assets/products/spares.jpg'),
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { addToCart, setSelectedProduct, isDealerApproved } = useShop();
  const [imageError, setImageError] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const handleAddToCart = () => {
    if (!product.inStock || product.stock <= 0) return;
    addToCart(product, 1);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
    }, 1500);
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'purifiers':
        return '💧';
      case 'dispensers':
        return '🚰';
      case 'pumps':
        return '⚡';
      case 'filters':
        return '🧪';
      case 'spares':
        return '🔧';
      default:
        return '💧';
    }
  };

  // Get first key specification
  const firstSpecKey = Object.keys(product.specifications)[0];
  const firstSpecVal = firstSpecKey ? product.specifications[firstSpecKey] : null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.88}
      onPress={() => setSelectedProduct(product)}>
      {/* Product Image with Fallback */}
      <View style={[styles.imageContainer, { backgroundColor: colors.backgroundElement }]}>
        {!imageError && product.imageUrl && product.imageUrl.startsWith('http') ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <Image
            source={LOCAL_CATEGORY_IMAGES[product.category] || LOCAL_CATEGORY_IMAGES.purifiers}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        {/* Stock Badge Overlay */}
        <View style={styles.badgeOverlay}>
          {product.inStock && product.stock > 0 ? (
            <View style={[styles.stockBadge, { backgroundColor: colors.successLight }]}>
              <View style={[styles.stockDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.stockText, { color: colors.success }]}>
                In Stock ({product.stock})
              </Text>
            </View>
          ) : (
            <View style={[styles.stockBadge, { backgroundColor: colors.dangerLight }]}>
              <View style={[styles.stockDot, { backgroundColor: colors.danger }]} />
              <Text style={[styles.stockText, { color: colors.danger }]}>Out of Stock</Text>
            </View>
          )}

          <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>
              {product.category}
            </Text>
          </View>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        {/* Rating Row */}
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={[styles.ratingNumber, { color: colors.text }]}>
            {product.rating ?? 4.8}
          </Text>
          <Text style={[styles.reviewsCount, { color: colors.textSecondary }]}>
            ({product.reviewsCount ?? 120})
          </Text>
        </View>

        {/* Title */}
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {product.name}
        </Text>

        {/* Highlight Spec */}
        {firstSpecKey && firstSpecVal && (
          <Text
            style={[styles.specText, { color: colors.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {firstSpecKey}: <Text style={styles.specVal}>{firstSpecVal}</Text>
          </Text>
        )}

        {/* Price Section */}
        <View style={styles.priceContainer}>
          {isDealerApproved ? (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={[styles.priceLabel, { color: '#047857', fontWeight: '700' }]}>Wholesale Tier</Text>
                <Text style={{ fontSize: 10, color: '#047857' }}>🏢</Text>
              </View>
              <Text style={[styles.priceText, { color: '#047857', fontWeight: '800' }]}>
                ₹{product.wholesalePrice.toLocaleString('en-IN')}
              </Text>
              <Text style={{ fontSize: 10, color: colors.textSecondary, textDecorationLine: 'line-through' }}>
                Retail: ₹{product.price.toLocaleString('en-IN')}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Retail</Text>
              <Text style={[styles.priceText, { color: colors.text }]}>
                ₹{product.price.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          {!isDealerApproved && (
            <View style={[styles.wholesaleTag, { backgroundColor: colors.backgroundElement }]}>
              <Text style={[styles.wholesaleText, { color: colors.textSecondary }]}>
                Bulk: <Text style={{ fontWeight: '700', color: colors.primary }}>₹{product.wholesalePrice.toLocaleString('en-IN')}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.detailsBtn,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
            ]}
            onPress={() => setSelectedProduct(product)}
            activeOpacity={0.7}>
            <Text style={[styles.detailsBtnText, { color: colors.text }]}>Specs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.addBtn,
              {
                backgroundColor: !product.inStock
                  ? colors.backgroundElement
                  : addedToast
                  ? colors.success
                  : colors.primary,
              },
            ]}
            onPress={handleAddToCart}
            disabled={!product.inStock || product.stock <= 0}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.addBtnText,
                { color: !product.inStock ? colors.textSecondary : '#ffffff' },
              ]}>
              {!product.inStock
                ? 'Out of Stock'
                : addedToast
                ? '✓ Added!'
                : '+ Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  fallbackEmoji: {
    fontSize: 44,
  },
  fallbackCategory: {
    fontFamily: Typography.bold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  badgeOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 5,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontFamily: Typography.bold,
    fontSize: 11,
    fontWeight: '700',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: Typography.bold,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  content: {
    padding: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  star: {
    color: '#F59E0B',
    fontSize: 13,
  },
  ratingNumber: {
    fontFamily: Typography.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewsCount: {
    fontFamily: Typography.regular,
    fontSize: 12,
  },
  title: {
    fontFamily: Typography.bold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 6,
  },
  specText: {
    fontFamily: Typography.regular,
    fontSize: 12,
    marginBottom: 10,
  },
  specVal: {
    fontFamily: Typography.semiBold,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  priceLabel: {
    fontFamily: Typography.semiBold,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceText: {
    fontFamily: Typography.extraBold,
    fontSize: 18,
    fontWeight: '800',
  },
  wholesaleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  wholesaleText: {
    fontFamily: Typography.medium,
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontFamily: Typography.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  addBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: Typography.bold,
    fontSize: 13,
    fontWeight: '700',
  },
});
