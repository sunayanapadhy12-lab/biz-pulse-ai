import { useState, type FC } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import type { Invoice, Transaction } from '../../types';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Building,
  KeyRound,
} from 'lucide-react';

interface PayPalPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentSuccess: (updatedInvoice: Invoice, newTransaction?: Transaction) => void;
}

export const PayPalPaymentModal: FC<PayPalPaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>(
    'idle'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [captureId, setCaptureId] = useState('');

  if (!invoice) return null;

  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || '';
  const isClientIdConfigured = Boolean(clientId && clientId !== 'your_paypal_sandbox_client_id_here');

  const handleCreateOrder = async (): Promise<string> => {
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // 1. Safe pre-synchronization: Ensure the backend repository has this exact invoice record
      const syncRes = await fetch('/api/invoices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });

      if (!syncRes.ok) {
        const syncData = await syncRes.json().catch(() => ({}));
        throw new Error(
          syncData.message || syncData.error || 'Failed to synchronize invoice with backend repository'
        );
      }

      // 2. Request PayPal Sandbox order creation:
      // Note: The backend retrieves the invoice from its own repository and strictly dictates the payment amount.
      // Frontend only supplies the invoiceId; never an arbitrary price.
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create PayPal order');
      }

      return data.orderId;
    } catch (err: any) {
      setPaymentStatus('error');
      setErrorMessage(err.message || 'Unable to initiate order on PayPal Sandbox');
      throw err;
    }
  };

  const handleApprove = async (data: { orderID: string }) => {
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Never trust frontend success: send orderID to backend for server-side capture & verification
      const response = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderID,
          invoiceId: invoice.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || result.error || 'Server capture verification failed'
        );
      }

      setCaptureId(result.captureId);
      setPaymentStatus('success');

      // Propagate verified state change to parent React state
      onPaymentSuccess(result.invoice, result.transaction);
    } catch (err: any) {
      setPaymentStatus('error');
      setErrorMessage(
        err.message || 'Server failed to verify PayPal Sandbox capture'
      );
    }
  };

  const handleModalClose = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
    setCaptureId('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="PayPal Sandbox Settlement"
      subtitle={`Invoice #${invoice.invoiceNumber} • ${invoice.customer}`}
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Invoice Summary Card */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60">
            <span className="text-xs font-semibold text-slate-500">Invoice Target</span>
            <span className="font-mono font-bold text-xs text-slate-900">
              {invoice.invoiceNumber}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 text-xs">
            <span className="text-slate-500 font-medium">Billed Client</span>
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {invoice.customer}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 text-xs">
            <span className="text-slate-500 font-medium">Due Date & Status</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-600">{invoice.dueDate}</span>
              {invoice.status === 'overdue' ? (
                <Badge variant="danger" size="sm">
                  Overdue
                </Badge>
              ) : (
                <Badge variant="warning" size="sm">
                  Pending
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-700">Amount Due (USD)</span>
            <span className="text-xl font-black text-indigo-700">
              ${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Missing Credentials Notice */}
        {!isClientIdConfigured && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">PayPal Sandbox Credentials Notice</p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Add your Sandbox credentials to <code>.env</code> (<code>PAYPAL_CLIENT_ID</code>,{' '}
                <code>PAYPAL_CLIENT_SECRET</code>, and <code>VITE_PAYPAL_CLIENT_ID</code>) to enable
                live sandbox transaction processing.
              </p>
            </div>
          </div>
        )}

        {/* Status: Processing */}
        {paymentStatus === 'processing' && (
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3 text-xs text-indigo-900">
            <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
            <div>
              <p className="font-bold">Verifying PayPal Capture Server-Side...</p>
              <p className="text-[11px] text-indigo-700">
                Confirming settlement status, currency, and amount on PayPal Sandbox.
              </p>
            </div>
          </div>
        )}

        {/* Status: Error */}
        {paymentStatus === 'error' && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Payment Verification Error</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Status: Success */}
        {paymentStatus === 'success' && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Payment Successfully Verified!</h4>
              <p className="text-xs text-emerald-800 mt-1">
                Captured ${invoice.amount.toLocaleString()} via PayPal Sandbox.
              </p>
              {captureId && (
                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  Capture ID: {captureId}
                </p>
              )}
            </div>

            <button
              onClick={handleModalClose}
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors"
            >
              Done & Return to Ledger
            </button>
          </div>
        )}

        {/* PayPal Smart Buttons Container (Shown when not in success state) */}
        {paymentStatus !== 'success' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 justify-center">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Direct Encrypted Checkout (Sandbox Environment)</span>
            </div>

            <div className="min-h-[140px] flex items-center justify-center bg-white p-2 rounded-xl border border-slate-200/80">
              {isClientIdConfigured ? (
                <div className="w-full">
                  <PayPalScriptProvider
                    options={{
                      clientId: clientId,
                      currency: 'USD',
                      intent: 'capture',
                    }}
                  >
                    <PayPalButtons
                      style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'pay',
                        height: 40,
                      }}
                      createOrder={handleCreateOrder}
                      onApprove={handleApprove}
                      onError={(err) => {
                        console.error('[PayPal SDK Error]', err);
                        setPaymentStatus('error');
                        setErrorMessage('PayPal Checkout window error occurred');
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Configure Sandbox Credentials in <code>.env</code> to activate live PayPal Smart
                  Buttons.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Security Badges */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            Server-verified capture
          </span>
          <span>No secrets in browser</span>
        </div>
      </div>
    </Modal>
  );
};

