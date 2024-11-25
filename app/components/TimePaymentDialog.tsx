'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Timer,
  X,
  Wallet,
  Bitcoin,
  CreditCard,
  Key,
  Upload,
  Image,
  UserCircle2,
  Clock,
} from 'lucide-react';
import { Button } from '@getalby/bitcoin-connect-react';
import { paymentManager } from '../lib/paymentManager';
import { guestTrialManager } from '../lib/guestTrialManager';
import { db } from '../lib/db';

interface TimePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: (duration: number) => void;
  isWalletConnected: boolean;
}

const TIME_PACKAGES = [
  { duration: 5, price: 2000, priceUSD: 3, label: '5 min', productId: '2wOUu' },
  {
    duration: 10,
    price: 4000,
    priceUSD: 5,
    label: '10 min',
    productId: 'cThEx',
  },
  {
    duration: 30,
    price: 6000,
    priceUSD: 7,
    label: '30 min',
    productId: 'CAtN2',
  },
  {
    duration: 60,
    price: 10000,
    priceUSD: 10,
    label: '60 min',
    productId: 'Dm7O3',
  },
];

export function TimePaymentDialog({
  isOpen,
  onClose,
  onPurchaseSuccess,
  isWalletConnected,
}: TimePaymentDialogProps) {
  const [selectedPackage, setSelectedPackage] = useState(TIME_PACKAGES[0]);
  const [paymentMethod, setPaymentMethod] = useState<'bitcoin' | 'card'>(
    'bitcoin'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [trialInfo, setTrialInfo] = useState(guestTrialManager.getTrialInfo());

  useEffect(() => {
    if (isOpen) {
      setTrialInfo(guestTrialManager.getTrialInfo());
    }
  }, [isOpen]);

  const handleBitcoinPurchase = async () => {
    if (!isWalletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await paymentManager.makePayment(
        selectedPackage.price,
        `N.I.D.A.M Access: ${selectedPackage.duration} minutes`
      );

      if (result.success) {
        onPurchaseSuccess(selectedPackage.duration * 60);
        onClose();
      } else {
        setError(result.error || 'Payment failed - please try again');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Payment system error - please try again'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardPayment = () => {
    window.open(`https://payhip.com/b/${selectedPackage.productId}`, '_blank');
    setShowLicenseInput(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setProofImage(event.target?.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const verifyLicenseKey = async () => {
    if (!licenseKey) {
      setError('Please enter your license key');
      return;
    }

    if (!proofImage) {
      setError('Please upload your proof of payment');
      return;
    }

    const isValidFormat =
      /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/.test(licenseKey);

    if (!isValidFormat) {
      setError('Please enter the key in format: XXXXX-XXXXX-XXXXX-XXXXX');
      return;
    }

    try {
      const isUsed = await db.isLicenseUsed(licenseKey);
      if (isUsed) {
        setError('This license key has already been used');
        return;
      }

      await db.saveLicense({
        licenseKey,
        productId: selectedPackage.productId,
        proofImage,
        timestamp: Date.now(),
      });

      onPurchaseSuccess(selectedPackage.duration * 60);
      onClose();
    } catch (err) {
      console.error('License verification error:', err);
      setError('Failed to verify license. Please try again.');
    }
  };

  const handleGuestAccess = () => {
    if (!trialInfo.isAvailable) {
      setError(
        `Trial not available. Please wait ${guestTrialManager.formatCooldown(
          trialInfo.remainingCooldown
        )}`
      );
      return;
    }

    const duration = guestTrialManager.startTrial();
    onPurchaseSuccess(duration);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-[400px] border border-[#ff0000] bg-black p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#ff0000] text-lg font-mono flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Purchase Access Time
          </h2>
          <button onClick={onClose} className="text-[#ff0000] hover:opacity-80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {!showLicenseInput ? (
            <>
              <div className="flex justify-center gap-4 mb-6">
                <button
                  onClick={() => {
                    setPaymentMethod('bitcoin');
                    setError(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 border border-[#ff0000] ${
                    paymentMethod === 'bitcoin'
                      ? 'bg-[#ff0000] text-black'
                      : 'text-[#ff0000]'
                  }`}
                >
                  <Bitcoin size={16} />
                  Bitcoin
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod('card');
                    setError(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 border border-[#ff0000] ${
                    paymentMethod === 'card'
                      ? 'bg-[#ff0000] text-black'
                      : 'text-[#ff0000]'
                  }`}
                >
                  <CreditCard size={16} />
                  Card
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TIME_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.duration}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setError(null);
                    }}
                    className={`p-4 border border-[#ff0000] font-mono text-sm ${
                      selectedPackage.duration === pkg.duration
                        ? 'bg-[#ff0000] text-black'
                        : 'text-[#ff0000]'
                    }`}
                  >
                    <div className="text-lg mb-1">{pkg.label}</div>
                    <div>
                      {paymentMethod === 'bitcoin'
                        ? `${pkg.price} sats`
                        : `$${pkg.priceUSD.toFixed(2)}`}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {paymentMethod === 'bitcoin' ? (
                  !isWalletConnected ? (
                    <Button
                      onConnect={() => {}}
                      className="w-full py-3 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 flex items-center justify-center gap-2"
                    >
                      <Wallet size={16} />
                      Connect Wallet
                    </Button>
                  ) : (
                    <button
                      onClick={handleBitcoinPurchase}
                      disabled={isProcessing}
                      className="w-full py-3 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 disabled:opacity-50"
                    >
                      {isProcessing
                        ? 'Processing...'
                        : `Purchase ${selectedPackage.duration} minutes`}
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleCardPayment}
                    className="w-full py-3 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10"
                  >
                    Pay with Card
                  </button>
                )}

                <button
                  onClick={handleGuestAccess}
                  disabled={!trialInfo.isAvailable}
                  className="w-full py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {trialInfo.isAvailable ? (
                    <>
                      <UserCircle2 size={16} />
                      Continue as Guest (10 min trial)
                    </>
                  ) : (
                    <>
                      <Clock size={16} />
                      Trial available in{' '}
                      {guestTrialManager.formatCooldown(
                        trialInfo.remainingCooldown
                      )}
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#ff0000] font-mono">
                <Key size={16} />
                Enter License Key
              </div>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  const formatted =
                    value
                      .replace(/[^A-Z0-9]/g, '')
                      .match(/.{1,5}/g)
                      ?.join('-') || value;
                  setLicenseKey(formatted.slice(0, 23));
                }}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                className="w-full bg-black border border-[#ff0000] p-2 text-[#ff0000] font-mono placeholder-[#ff0000]/50"
              />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#ff0000] font-mono">
                  <Image size={16} />
                  Upload Proof of Payment
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10 flex items-center justify-center gap-2"
                >
                  <Upload size={16} />
                  {proofImage ? 'Change Image' : 'Select Image'}
                </button>
                {proofImage && (
                  <div className="border border-[#ff0000] p-2">
                    <img
                      src={proofImage}
                      alt="Proof of Payment"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={verifyLicenseKey}
                className="w-full py-3 border border-[#ff0000] text-[#ff0000] font-mono hover:bg-[#ff0000]/10"
              >
                Verify License
              </button>
              <button
                onClick={() => {
                  setShowLicenseInput(false);
                  setProofImage(null);
                  setLicenseKey('');
                  setError(null);
                }}
                className="w-full py-2 text-[#ff0000]/70 font-mono hover:text-[#ff0000]"
              >
                Back to Payment Options
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 text-[#ff0000] font-mono text-sm">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
