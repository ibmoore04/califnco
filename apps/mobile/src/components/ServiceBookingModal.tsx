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
import { ServiceType } from '@califnco/shared';

const SERVICE_OPTIONS: { type: ServiceType; label: string; icon: string; desc: string; estFee: string }[] = [
  {
    type: 'installation',
    label: 'Standard / RO Installation',
    icon: '🔧',
    desc: 'Unboxing, wall-mounting, plumbing inlet/drain line setup, TDS testing.',
    estFee: '₹499 (Free with New RO)',
  },
  {
    type: 'filter_replacement',
    label: 'Filter & Membrane Renewal',
    icon: '🔄',
    desc: 'Pre-sediment filter, activated carbon, and reverse osmosis membrane swap.',
    estFee: '₹299 + Filter Cost',
  },
  {
    type: 'maintenance',
    label: 'Periodic Deep Clean & Sanitization',
    icon: '✨',
    desc: 'UV sterilizer check, tank decaling, pump pressure tuning, taste test.',
    estFee: '₹349',
  },
  {
    type: 'repair',
    label: 'Diagnostic & Leak Repair',
    icon: '⚡',
    desc: 'Rapid fault diagnosis for low water flow, motor vibration, or pipe leakage.',
    estFee: '₹199 Inspection',
  },
];

const TIME_SLOTS = [
  'Morning (09:00 AM - 12:00 PM)',
  'Afternoon (12:00 PM - 03:00 PM)',
  'Evening (03:00 PM - 07:00 PM)',
];

export const ServiceBookingModal: React.FC = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const {
    isServiceBookingModalVisible,
    setServiceBookingModalVisible,
    bookService,
    userProfile,
    isAuthenticated,
    setAuthModalVisible,
  } = useShop();

  const [selectedService, setSelectedService] = useState<ServiceType>('installation');
  const [customerName, setCustomerName] = useState(userProfile.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(userProfile.phone || '');
  const [preferredDate, setPreferredDate] = useState(() => {
    // Tomorrow by default
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [preferredSlot, setPreferredSlot] = useState(TIME_SLOTS[0]);
  const [street, setStreet] = useState(userProfile.defaultAddress?.street || '');
  const [city, setCity] = useState(userProfile.defaultAddress?.city || 'Bengaluru');
  const [state, setState] = useState(userProfile.defaultAddress?.state || 'Karnataka');
  const [postalCode, setPostalCode] = useState(userProfile.defaultAddress?.postalCode || '560001');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setServiceBookingModalVisible(false);
      setAuthModalVisible(true);
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg('Please enter customer contact name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number for dispatch updates.');
      return;
    }
    if (!preferredDate.trim()) {
      setErrorMsg('Please enter a preferred service date.');
      return;
    }
    if (!street.trim()) {
      setErrorMsg('Please enter the service location street address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await bookService({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        serviceType: selectedService,
        preferredDate: preferredDate.trim(),
        preferredTimeSlot: preferredSlot,
        address: {
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
        },
        notes: notes.trim(),
      });

      if (res) {
        Alert.alert(
          'Service Scheduled! 🛠️',
          `Your service ticket (${res.id.slice(0, 8)}) has been registered with Califnco Field Support. A certified technician will call before visiting on ${preferredDate}.`,
          [{ text: 'View Bookings', onPress: () => setServiceBookingModalVisible(false) }]
        );
      } else {
        setErrorMsg('Failed to register service booking. Please check network connection.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isServiceBookingModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setServiceBookingModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Book a Technician</Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                On-demand installation, servicing &amp; genuine parts
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: scheme === 'dark' ? '#334155' : '#F1F5F9' }]}
              onPress={() => setServiceBookingModalVisible(false)}>
              <Text style={[styles.closeBtnText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
            {/* Service Type Selection */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Service Required</Text>
            <View style={styles.serviceCardsContainer}>
              {SERVICE_OPTIONS.map((opt) => {
                const isSelected = selectedService === opt.type;
                return (
                  <TouchableOpacity
                    key={opt.type}
                    style={[
                      styles.serviceOptionCard,
                      {
                        backgroundColor: isSelected
                          ? scheme === 'dark'
                            ? '#0C4A6E'
                            : '#E0F2FE'
                          : scheme === 'dark'
                          ? '#1E293B'
                          : '#F8FAFC',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setSelectedService(opt.type)}
                    activeOpacity={0.7}>
                    <View style={styles.serviceCardHeader}>
                      <Text style={styles.serviceCardIcon}>{opt.icon}</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={[
                            styles.serviceCardTitle,
                            { color: isSelected ? colors.primary : colors.text },
                          ]}>
                          {opt.label}
                        </Text>
                        <Text style={[styles.serviceCardFee, { color: colors.success }]}>
                          {opt.estFee}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          {
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary : 'transparent',
                          },
                        ]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </View>
                    <Text style={[styles.serviceCardDesc, { color: colors.textSecondary }]}>
                      {opt.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date & Time Slot */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Schedule Date &amp; Slot</Text>
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Preferred Date (YYYY-MM-DD)</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: scheme === 'dark' ? '#1E293B' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={preferredDate}
                onChangeText={setPreferredDate}
                placeholder="2026-10-25"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Time Window</Text>
              <View style={styles.slotsRow}>
                {TIME_SLOTS.map((slot) => {
                  const isSlotActive = preferredSlot === slot;
                  return (
                    <TouchableOpacity
                      key={slot}
                      style={[
                        styles.slotChip,
                        {
                          backgroundColor: isSlotActive
                            ? colors.primary
                            : scheme === 'dark'
                            ? '#1E293B'
                            : '#F1F5F9',
                          borderColor: isSlotActive ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setPreferredSlot(slot)}>
                      <Text
                        style={[
                          styles.slotChipText,
                          { color: isSlotActive ? '#FFFFFF' : colors.text },
                        ]}>
                        {slot.split(' (')[0]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Contact & Location Details */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact &amp; Location</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Contact Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: scheme === 'dark' ? '#1E293B' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: scheme === 'dark' ? '#1E293B' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
                placeholder="10-digit mobile number"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Street Address &amp; Flat/House #</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: scheme === 'dark' ? '#1E293B' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={street}
                onChangeText={setStreet}
                placeholder="Door No, Building, Main Road"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>City</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: scheme === 'dark' ? '#1E293B' : '#F8FAFC',
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>PIN Code</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: scheme === 'dark' ? '#1E293B' : '#F8FAFC',
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                  placeholder="560001"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                Issue Notes / Model Details (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: scheme === 'dark' ? '#1E293B' : '#F8FAFC',
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="e.g., Califnco AquaPure 15L water taste change or beep sound."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {errorMsg && (
              <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            )}

            {/* Submit CTA */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}>
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Confirm Technician Dispatch 🛠️</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>
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
    maxHeight: '90%',
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
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
  },
  modalSub: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.base,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 10,
  },
  serviceCardsContainer: {
    gap: 10,
    marginBottom: 14,
  },
  serviceOptionCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceCardIcon: {
    fontSize: 24,
  },
  serviceCardTitle: {
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.sm,
    fontWeight: '700',
  },
  serviceCardFee: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    marginTop: 1,
  },
  serviceCardDesc: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    lineHeight: 16,
    paddingLeft: 34,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  slotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  slotChipText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#991B1B',
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontFamily: Typography.fonts.heading,
    fontSize: Typography.sizes.base,
    fontWeight: '700',
  },
});
