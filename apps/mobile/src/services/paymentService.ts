import { Address } from '@shared';

/**
 * Califnco Modular Payment Service
 *
 * Architecture:
 * - Decouples checkout and order placement from specific payment gateways.
 * - Current Status: Razorpay live account is pending PAN verification.
 * - Implements a transparent, fully functional Demo Payment Gateway adapter that
 *   simulates the authorization flow and records payment as 'pending' with
 *   transparent demo transaction references.
 * - Designed for drop-in live Razorpay SDK activation once KYC/PAN verification clears.
 */

export type PaymentMethodType = 'razorpay' | 'cod';

export interface PaymentCustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  address?: Address;
}

export interface PaymentInitializationParams {
  orderId: string;
  amount: number;
  currency?: string;
  customer: PaymentCustomerDetails;
  method: PaymentMethodType;
}

export interface PaymentTransactionResult {
  success: boolean;
  gatewayMode: 'demo_simulation' | 'live_razorpay' | 'cash_on_delivery';
  paymentStatus: 'pending' | 'paid' | 'failed';
  transactionId?: string;
  displayStatusText: string;
  message: string;
  panVerificationBlocked: boolean;
}

export const PaymentService = {
  /**
   * Check whether live gateway is available or blocked
   */
  getGatewayStatus() {
    return {
      isRazorpayConfigured: false,
      isPanVerificationBlocked: true,
      activeMode: 'demo_simulation' as const,
      noticeText:
        'Razorpay live payment gateway is currently pending merchant PAN verification. Online payments run in Demo/Pending status.',
    };
  },

  /**
   * Process payment (Modular demo adapter with live interface compatibility)
   */
  async processPayment(params: PaymentInitializationParams): Promise<PaymentTransactionResult> {
    if (params.method === 'cod') {
      return {
        success: true,
        gatewayMode: 'cash_on_delivery',
        paymentStatus: 'pending',
        displayStatusText: 'Cash on Delivery (Pending)',
        message: 'Order confirmed for Cash on Delivery. Payment will be collected at doorstep upon delivery/installation.',
        panVerificationBlocked: false,
      };
    }

    // Demo Online Payment simulation (Live Razorpay blocked by PAN verification)
    const simulatedTxnId = `DEMO_PAN_PENDING_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;

    return {
      success: true,
      gatewayMode: 'demo_simulation',
      paymentStatus: 'pending', // Transparently pending - never claims live settlement occurred
      transactionId: simulatedTxnId,
      displayStatusText: 'Demo Mode (Pending PAN Verification)',
      message: 'Demo payment submitted. Live transaction is pending merchant PAN verification.',
      panVerificationBlocked: true,
    };
  },
};
