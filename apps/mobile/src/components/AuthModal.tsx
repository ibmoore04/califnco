import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography } from '@/constants/theme';
import { useShop } from '@/context/ShopContext';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const { login, register, isAuthLoading, authError, clearAuthError, isFirebaseActive } = useShop();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [localValidation, setLocalValidation] = useState<string | null>(null);

  const handleTabChange = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setLocalValidation(null);
    clearAuthError();
  };

  const handleSubmit = async () => {
    setLocalValidation(null);
    clearAuthError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setLocalValidation('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setLocalValidation('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setLocalValidation('Password must be at least 6 characters.');
      return;
    }

    if (mode === 'signup') {
      const trimmedName = displayName.trim();
      if (!trimmedName || trimmedName.length < 2) {
        setLocalValidation('Please enter your full name.');
        return;
      }
      const res = await register(trimmedEmail, password, trimmedName, phone.trim());
      if (res.success) {
        onClose();
      }
    } else {
      const res = await login(trimmedEmail, password);
      if (res.success) {
        onClose();
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0) + 16,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}>
        <View style={[styles.dialog, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.brandRow}>
              <View style={[styles.logoBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={styles.logoEmoji}>💧</Text>
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Califnco Account</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {isFirebaseActive ? 'Firebase Authentication' : 'Local Demo Mode'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.background }]}
              accessibilityLabel="Close">
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Mode Switcher Tabs */}
            <View style={[styles.tabBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  mode === 'signin' && [styles.tabBtnActive, { backgroundColor: colors.card }],
                ]}
                onPress={() => handleTabChange('signin')}>
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: mode === 'signin' ? colors.primary : colors.textSecondary },
                  ]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabBtn,
                  mode === 'signup' && [styles.tabBtnActive, { backgroundColor: colors.card }],
                ]}
                onPress={() => handleTabChange('signup')}>
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: mode === 'signup' ? colors.primary : colors.textSecondary },
                  ]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Notice */}
            {(localValidation || authError) && (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={[styles.errorText, { color: colors.danger }]}>
                  {localValidation || authError}
                </Text>
              </View>
            )}

            {/* Inputs */}
            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name</Text>
                <TextInput
                  style={[
                    styles.inputField,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={colors.textSecondary}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
              <TextInput
                style={[
                  styles.inputField,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="you@example.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
              <TextInput
                style={[
                  styles.inputField,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>

            {mode === 'signup' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number (Optional)</Text>
                <TextInput
                  style={[
                    styles.inputField,
                    { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
                  ]}
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textSecondary}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            )}

            {/* Role safeguard banner */}
            <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
              <Text style={styles.infoBannerEmoji}>🔒</Text>
              <Text style={[styles.infoBannerText, { color: colors.primaryDark }]}>
                {mode === 'signup'
                  ? 'Accounts are registered with customer shopping permissions. Administrator privileges are granted via backend admin console.'
                  : 'Enter your Califnco account credentials. Unregistered accounts can be created with the Create Account tab.'}
              </Text>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary },
                isAuthLoading && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isAuthLoading}
              activeOpacity={0.8}>
              {isAuthLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'signin' ? 'Sign In to Califnco' : 'Create Customer Account'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoBtn, { borderColor: colors.border }]}
              onPress={onClose}
              disabled={isAuthLoading}>
              <Text style={[styles.demoBtnText, { color: colors.textSecondary }]}>
                Continue in Demo Mode (Browse without signing in)
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    borderWidth: 1,
    maxHeight: '88%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 22,
  },
  title: {
    fontFamily: Typography.extraBold,
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontFamily: Typography.medium,
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: Typography.bold,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollBody: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 20,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontFamily: Typography.semiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
    gap: 10,
  },
  errorIcon: {
    fontSize: 16,
  },
  errorText: {
    fontFamily: Typography.semiBold,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontFamily: Typography.semiBold,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputField: {
    fontFamily: Typography.regular,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  infoBanner: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 18,
    gap: 10,
    alignItems: 'center',
  },
  infoBannerEmoji: {
    fontSize: 16,
  },
  infoBannerText: {
    fontFamily: Typography.medium,
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
    fontWeight: '500',
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: Typography.bold,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  demoBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  demoBtnText: {
    fontFamily: Typography.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
});
