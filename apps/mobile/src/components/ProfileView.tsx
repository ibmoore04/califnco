import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';

export const ProfileView: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const {
    userProfile,
    updateProfile,
    orders,
    setActiveTab,
    isAuthenticated,
    isFirebaseActive,
    logout,
    setAuthModalVisible,
    resetLocalCache,
    dealerStatus,
    dealerProfile,
    isDealerApproved,
    setDealerApplyModalVisible,
  } = useShop();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile.displayName);
  const [phone, setPhone] = useState(userProfile.phone ?? '');
  const [street, setStreet] = useState(userProfile.defaultAddress?.street ?? '');
  const [city, setCity] = useState(userProfile.defaultAddress?.city ?? 'Bengaluru');
  const [state, setState] = useState(userProfile.defaultAddress?.state ?? 'Karnataka');
  const [postalCode, setPostalCode] = useState(userProfile.defaultAddress?.postalCode ?? '560102');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const totalSpent = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);

  const handleSave = () => {
    updateProfile({
      displayName: displayName.trim(),
      phone: phone.trim(),
      defaultAddress: {
        fullName: displayName.trim(),
        phone: phone.trim(),
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      },
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const initials = userProfile.displayName
    ? userProfile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'CU';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials || 'CU'}</Text>
          </View>

          <View style={styles.profileHeaderInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {userProfile.displayName || 'Guest User'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {userProfile.email || 'Sign in to access your account'}
            </Text>

            <View style={styles.badgeRow}>
              <View style={[styles.roleBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                  {isAuthenticated ? 'Firebase Customer' : 'Guest Account'}
                </Text>
              </View>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: isAuthenticated ? colors.successLight : colors.warningLight },
                ]}>
                <Text
                  style={[
                    styles.roleBadgeText,
                    { color: isAuthenticated ? colors.success : colors.warning },
                  ]}>
                  {isAuthenticated ? 'Live Auth Active' : 'Demo Mode Active'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Authentication Action Card */}
        <View
          style={[
            styles.authActionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          <View style={styles.authActionInfo}>
            <Text style={[styles.authActionTitle, { color: colors.text }]}>
              {isAuthenticated ? 'Active Califnco Session' : 'Califnco Account Sync'}
            </Text>
            <Text style={[styles.authActionSub, { color: colors.textSecondary }]}>
              {isAuthenticated
                ? `Signed in as ${userProfile.email}. Orders sync to cloud.`
                : 'Sign in with Firebase to access saved orders and profile sync.'}
            </Text>
          </View>
          {isAuthenticated ? (
            <TouchableOpacity
              style={[
                styles.signOutBtn,
                { borderColor: colors.danger, backgroundColor: colors.dangerLight },
              ]}
              onPress={logout}>
              <Text style={[styles.signOutBtnText, { color: colors.danger }]}>Sign Out</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.signInBtn, { backgroundColor: colors.primary }]}
              onPress={() => setAuthModalVisible(true)}>
              <Text style={styles.signInBtnText}>Sign In / Register</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => setActiveTab('orders')}
            activeOpacity={0.7}>
            <Text style={styles.statEmoji}>📦</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {orders.length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Orders Placed
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              ₹{Math.round(totalSpent).toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Spent
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}>
            <Text style={styles.statEmoji}>🎁</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>350</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              PurePoints
            </Text>
          </View>
        </View>

        {/* Saved Delivery Information Form */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Default Delivery Address
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Used for auto-filling during checkout
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsEditing((prev) => !prev)}
              style={[
                styles.editBtn,
                { backgroundColor: isEditing ? colors.primaryLight : colors.backgroundElement },
              ]}>
              <Text
                style={[
                  styles.editBtnText,
                  { color: isEditing ? colors.primary : colors.text },
                ]}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {savedSuccess && (
            <View style={[styles.successBanner, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.successBannerText, { color: colors.success }]}>
                ✓ Profile details successfully updated!
              </Text>
            </View>
          )}

          {isEditing ? (
            <View style={styles.formArea}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                  Full Name
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.backgroundElement,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                  Phone Number
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.backgroundElement,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                  Street Address
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: colors.backgroundElement,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={street}
                  onChangeText={setStreet}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                    City
                  </Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: colors.backgroundElement,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary }]}>
                    PIN Code
                  </Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      {
                        backgroundColor: colors.backgroundElement,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Address Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.displayArea}>
              <View style={styles.displayRow}>
                <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>
                  Contact Person:
                </Text>
                <Text style={[styles.displayVal, { color: colors.text }]}>
                  {userProfile.defaultAddress?.fullName || userProfile.displayName}
                </Text>
              </View>

              <View style={styles.displayRow}>
                <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>
                  Phone:
                </Text>
                <Text style={[styles.displayVal, { color: colors.text }]}>
                  {userProfile.defaultAddress?.phone || userProfile.phone || 'Not set'}
                </Text>
              </View>

              <View style={styles.displayRow}>
                <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>
                  Street:
                </Text>
                <Text
                  style={[
                    styles.displayVal,
                    { color: colors.text, flex: 1, textAlign: 'right' },
                  ]}>
                  {userProfile.defaultAddress?.street || 'Not set'}
                </Text>
              </View>

              <View style={styles.displayRow}>
                <Text style={[styles.displayLabel, { color: colors.textSecondary }]}>
                  City & PIN:
                </Text>
                <Text style={[styles.displayVal, { color: colors.text }]}>
                  {userProfile.defaultAddress?.city},{' '}
                  {userProfile.defaultAddress?.state} -{' '}
                  {userProfile.defaultAddress?.postalCode}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Wholesale Dealer Program Portal */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Wholesale Dealer Program
                </Text>
                {isDealerApproved ? (
                  <View style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ color: '#047857', fontSize: 10, fontWeight: '700' }}>✓ ACTIVE PARTNER</Text>
                  </View>
                ) : dealerStatus === 'pending' ? (
                  <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ color: '#B45309', fontSize: 10, fontWeight: '700' }}>UNDER REVIEW</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {isDealerApproved
                  ? `B2B partner tier unlocked for ${dealerProfile?.companyName || 'your business'}. Catalog shows wholesale pricing.`
                  : dealerStatus === 'pending'
                  ? 'Your GST registration application is pending administrator verification.'
                  : 'Distribute Califnco RO water purifiers & commercial filters at wholesale pricing.'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            {isDealerApproved ? (
              <View style={{ backgroundColor: scheme === 'dark' ? '#064E3B' : '#ECFDF5', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#10B981' }}>
                <Text style={{ color: '#047857', fontWeight: '700', fontSize: 12, marginBottom: 4 }}>
                  🏢 {dealerProfile?.companyName} • GST: {dealerProfile?.gstNumber}
                </Text>
                <Text style={{ color: '#065F46', fontSize: 11, lineHeight: 16 }}>
                  Wholesale ordering enabled automatically on product catalog with minimum order quantities (MOQ).
                </Text>
              </View>
            ) : dealerStatus === 'pending' ? (
              <View style={{ backgroundColor: scheme === 'dark' ? '#78350F' : '#FEF3C7', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#F59E0B' }}>
                <Text style={{ color: '#92400E', fontWeight: '700', fontSize: 12, marginBottom: 4 }}>
                  ⏳ Application Submitted (GST: {dealerProfile?.gstNumber || 'Provided'})
                </Text>
                <Text style={{ color: '#78350F', fontSize: 11, lineHeight: 16 }}>
                  Califnco team is reviewing your credentials. B2B rates will activate upon admin approval.
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
                onPress={() => setDealerApplyModalVisible(true)}
                activeOpacity={0.8}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                  Apply for Wholesale / Dealer Account 🏢
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Califnco Support & Helpline Card */}
        <View
          style={[
            styles.supportCard,
            { backgroundColor: colors.backgroundElement, borderColor: colors.border },
          ]}>
          <Text style={styles.supportHeadEmoji}>📞</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.supportTitle, { color: colors.text }]}>
              Califnco Customer Service Desk
            </Text>
            <Text style={[styles.supportHours, { color: colors.textSecondary }]}>
              Monday to Saturday: 9:00 AM – 7:00 PM IST
            </Text>
            <Text style={[styles.supportContact, { color: colors.primary }]}>
              Helpline: 1800-420-PURE (Toll-Free)
            </Text>
            <Text style={[styles.supportEmail, { color: colors.textSecondary }]}>
              Email: care@califnco.com
            </Text>
          </View>
        </View>

        {/* Local Device Storage & Cache Management */}
        <View
          style={[
            styles.supportCard,
            { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 },
          ]}>
          <Text style={styles.supportHeadEmoji}>🧹</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.supportTitle, { color: colors.text }]}>
              Storage & Cache Management
            </Text>
            <Text style={[styles.supportHours, { color: colors.textSecondary, marginBottom: 8 }]}>
              Clear locally cached cart items or stale mock orders from previous app sessions.
            </Text>
            <TouchableOpacity
              style={{
                alignSelf: 'flex-start',
                paddingVertical: 8,
                paddingHorizontal: 14,
                backgroundColor: colors.dangerLight,
                borderColor: colors.danger,
                borderWidth: 1,
                borderRadius: 8,
              }}
              onPress={async () => {
                await resetLocalCache();
                setSavedSuccess(true);
                setTimeout(() => setSavedSuccess(false), 2000);
              }}>
              <Text style={{ fontFamily: Typography.bold, color: colors.danger, fontSize: 12, fontWeight: '700' }}>
                Reset Cart & Purge Local Cache
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* System & Architecture Info */}
        <View style={styles.systemInfo}>
          <Text style={[styles.systemText, { color: colors.textSecondary }]}>
            Califnco Water Purifiers E-Commerce • Phase 1
          </Text>
          <Text style={[styles.systemSub, { color: colors.textSecondary }]}>
            React Native + Expo SDK 58 + Monorepo Shared Types
          </Text>
        </View>
      </ScrollView>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.extraBold,
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: Typography.extraBold,
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    fontFamily: Typography.regular,
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontFamily: Typography.bold,
    fontSize: 10,
    fontWeight: '700',
  },
  authActionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  authActionInfo: {
    flex: 1,
  },
  authActionTitle: {
    fontFamily: Typography.bold,
    fontSize: 14,
    fontWeight: '700',
  },
  authActionSub: {
    fontFamily: Typography.regular,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  signInBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  signInBtnText: {
    fontFamily: Typography.bold,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  signOutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  signOutBtnText: {
    fontFamily: Typography.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  successBanner: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  formArea: {
    gap: 10,
  },
  formGroup: {
    gap: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  formInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  saveBtn: {
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  displayArea: {
    gap: 10,
  },
  displayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  displayLabel: {
    fontSize: 12,
  },
  displayVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  supportCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
    marginBottom: 18,
  },
  supportHeadEmoji: {
    fontSize: 28,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  supportHours: {
    fontSize: 11,
    marginTop: 2,
  },
  supportContact: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  supportEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  systemInfo: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  systemText: {
    fontSize: 11,
    fontWeight: '600',
  },
  systemSub: {
    fontSize: 10,
  },
});
