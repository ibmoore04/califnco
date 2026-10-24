import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';

export const DealerApplyModal: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const {
    isDealerApplyModalVisible,
    setDealerApplyModalVisible,
    dealerStatus,
    dealerProfile,
    applyForDealer,
    userProfile,
    isAuthenticated,
    setAuthModalVisible,
  } = useShop();

  const [companyName, setCompanyName] = useState(dealerProfile?.companyName || '');
  const [gstNumber, setGstNumber] = useState(dealerProfile?.gstNumber || '');
  const [contactPerson, setContactPerson] = useState(
    dealerProfile?.contactPerson || userProfile.displayName || ''
  );
  const [phone, setPhone] = useState(dealerProfile?.phone || userProfile.phone || '');
  const [email, setEmail] = useState(dealerProfile?.email || userProfile.email || '');
  const [street, setStreet] = useState(
    dealerProfile?.address.street || userProfile.defaultAddress?.street || ''
  );
  const [city, setCity] = useState(
    dealerProfile?.address.city || userProfile.defaultAddress?.city || 'Bengaluru'
  );
  const [state, setState] = useState(
    dealerProfile?.address.state || userProfile.defaultAddress?.state || 'Karnataka'
  );
  const [postalCode, setPostalCode] = useState(
    dealerProfile?.address.postalCode || userProfile.defaultAddress?.postalCode || '560001'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setDealerApplyModalVisible(false);
      setAuthModalVisible(true);
      return;
    }

    if (!companyName.trim()) {
      setErrorMsg('Please enter your company or business name.');
      return;
    }
    if (!gstNumber.trim() || gstNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid GST identification number.');
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMsg('Please enter contact person name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!street.trim()) {
      setErrorMsg('Please enter your business street address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const success = await applyForDealer({
        businessName: companyName.trim(),
        companyName: companyName.trim(),
        gstNumber: gstNumber.trim().toUpperCase(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        email: email.trim() || userProfile.email,
        address: {
          fullName: contactPerson.trim(),
          phone: phone.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
        },
      });

      setIsSubmitting(false);
      if (success) {
        Alert.alert(
          'Application Submitted',
          'Your wholesale dealer application has been submitted to Califnco HQ. Our operations team will verify your GST and authorize your wholesale tier.',
          [{ text: 'OK', onPress: () => setDealerApplyModalVisible(false) }]
        );
      } else {
        setErrorMsg('Failed to submit application. Please try again.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error submitting application.');
    }
  };

  return (
    <Modal
      visible={isDealerApplyModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setDealerApplyModalVisible(false)}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalWindow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.headerTitleCol}>
              <View style={styles.headerTagRow}>
                <Text style={styles.headerTag}>WHOLESALE B2B</Text>
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Dealer Registration
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Access dedicated bulk wholesale pricing tiers and commercial distribution
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setDealerApplyModalVisible(false)}>
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Status Alert if already applied */}
            {dealerStatus === 'pending' && (
              <View style={[styles.statusCard, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                <Text style={styles.statusCardIcon}>⏳</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusCardTitle, { color: '#B45309' }]}>
                    Application Pending HQ Verification
                  </Text>
                  <Text style={[styles.statusCardDesc, { color: '#92400E' }]}>
                    Your application for "{companyName || 'Business'}" is currently under review by Califnco store administrators. Standard retail prices apply until approved.
                  </Text>
                </View>
              </View>
            )}

            {dealerStatus === 'approved' && (
              <View style={[styles.statusCard, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                <Text style={styles.statusCardIcon}>✓</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusCardTitle, { color: '#047857' }]}>
                    Wholesale Partner Active
                  </Text>
                  <Text style={[styles.statusCardDesc, { color: '#065F46' }]}>
                    You are verified! Wholesale dealer discounts and bulk minimum order quantities (MOQ) are unlocked across the entire catalog.
                  </Text>
                </View>
              </View>
            )}

            {errorMsg && (
              <View style={[styles.errorCard, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
                <Text style={[styles.errorText, { color: colors.danger }]}>⚠️ {errorMsg}</Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Company / Trade Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Apex PureWater Enterprises"
                placeholderTextColor={colors.textSecondary}
                value={companyName}
                onChangeText={setCompanyName}
                editable={dealerStatus !== 'approved'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>GST Identification Number (GSTIN) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. 29AAAAA0000A1Z5"
                placeholderTextColor={colors.textSecondary}
                value={gstNumber}
                onChangeText={(text) => setGstNumber(text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={15}
                editable={dealerStatus !== 'approved'}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Contact Person Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={contactPerson}
                onChangeText={setContactPerson}
                editable={dealerStatus !== 'approved'}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Phone Number *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                  placeholder="10-digit mobile"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={dealerStatus !== 'approved'}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Email Address</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                  placeholder="business@example.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={dealerStatus !== 'approved'}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Business Street Address *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                placeholder="Shop / Office No., Street, Area"
                placeholderTextColor={colors.textSecondary}
                value={street}
                onChangeText={setStreet}
                editable={dealerStatus !== 'approved'}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>City</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                  placeholder="City"
                  placeholderTextColor={colors.textSecondary}
                  value={city}
                  onChangeText={setCity}
                  editable={dealerStatus !== 'approved'}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>State</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                  placeholder="State"
                  placeholderTextColor={colors.textSecondary}
                  value={state}
                  onChangeText={setState}
                  editable={dealerStatus !== 'approved'}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>PIN Code</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
                  placeholder="PIN"
                  placeholderTextColor={colors.textSecondary}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={dealerStatus !== 'approved'}
                />
              </View>
            </View>

            {/* Wholesale Benefits Preview */}
            <View style={[styles.benefitsCard, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
              <Text style={[styles.benefitsTitle, { color: colors.text }]}>Wholesale Partner Perks</Text>
              <Text style={[styles.benefitsItem, { color: colors.textSecondary }]}>• Up to 35% margin on genuine RO membranes & pumps</Text>
              <Text style={[styles.benefitsItem, { color: colors.textSecondary }]}>• Flexible bulk minimum order quantities (MOQ 5-10 units)</Text>
              <Text style={[styles.benefitsItem, { color: colors.textSecondary }]}>• Priority dispatch and dedicated field technician support</Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => setDealerApplyModalVisible(false)}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            {dealerStatus !== 'approved' && (
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                disabled={isSubmitting}
                onPress={handleSubmit}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {dealerStatus === 'pending' ? 'Update Application' : 'Submit Application'}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalWindow: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitleCol: {
    flex: 1,
    marginRight: 12,
  },
  headerTagRow: {
    marginBottom: 4,
  },
  headerTag: {
    fontFamily: Typography.bold,
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  modalTitle: {
    fontFamily: Typography.bold,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontFamily: Typography.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    maxHeight: 520,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  statusCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    alignItems: 'center',
  },
  statusCardIcon: {
    fontSize: 24,
  },
  statusCardTitle: {
    fontFamily: Typography.bold,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusCardDesc: {
    fontFamily: Typography.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  errorCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: {
    fontFamily: Typography.medium,
    fontSize: 13,
  },
  formGroup: {
    gap: 6,
  },
  formRow: {
    flexDirection: 'row',
  },
  fieldLabel: {
    fontFamily: Typography.bold,
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    fontFamily: Typography.medium,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  benefitsCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    marginTop: 4,
  },
  benefitsTitle: {
    fontFamily: Typography.bold,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  benefitsItem: {
    fontFamily: Typography.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontFamily: Typography.bold,
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  submitBtnText: {
    fontFamily: Typography.bold,
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
