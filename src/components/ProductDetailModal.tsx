import { User } from 'firebase/auth';
import { FormEvent, useEffect, useState } from 'react';
import {
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  BookingRequest,
  DurationTier,
  RentalItem,
  UserDefaults,
} from '../types';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatINR,
  getRateForTier,
  getTierShortLabel,
  getTierUnitLabel,
  getTomorrowDateString,
} from '../utils/formatters';
import { GoogleAuthCard } from './GoogleAuthCard';
import { ProductImage } from './ProductImage';

interface ProductDetailModalProps {
  item: RentalItem | null;
  initialTier: DurationTier;
  user: User | null;
  userDefaults: UserDefaults;
  isSigningIn: boolean;
  authError?: string;
  onSignIn: () => void;
  onClose: () => void;
  onSubmitBooking: (payload: {
    item: RentalItem;
    durationTier: DurationTier;
    durationCount: number;
    studentName: string;
    hostelOrPg: string;
    studentPhone: string;
    pickupDate: string;
    notes: string;
  }) => Promise<BookingRequest>;
  onGoToBookings: () => void;
}

export function ProductDetailModal({
  item,
  initialTier,
  user,
  userDefaults,
  isSigningIn,
  authError,
  onSignIn,
  onClose,
  onSubmitBooking,
  onGoToBookings,
}: ProductDetailModalProps) {
  const [durationTier, setDurationTier] = useState<DurationTier>(initialTier);
  const [durationCount, setDurationCount] = useState<number>(1);
  const [studentName, setStudentName] = useState('');
  const [hostelOrPg, setHostelOrPg] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [pickupDate, setPickupDate] = useState(getTomorrowDateString());
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<BookingRequest | null>(
    null
  );
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (item) {
      setDurationTier(initialTier);
      setDurationCount(1);
      setFormError('');
      setIsSubmitting(false);
      setConfirmedTicket(null);
      setCopiedMsg(false);
      if (user?.displayName && !studentName) {
        setStudentName(user.displayName);
      }
      if (userDefaults.defaultHostelOrPg && !hostelOrPg) {
        setHostelOrPg(userDefaults.defaultHostelOrPg);
      }
      if (userDefaults.defaultPhone && !studentPhone) {
        setStudentPhone(userDefaults.defaultPhone);
      }
    }
  }, [item, initialTier, user, userDefaults]);

  if (!item) return null;

  const unitRate = getRateForTier(item, durationTier);
  const estimatedRentalCost = unitRate * durationCount;
  const isAvailable = item.availability === 'Available Now';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanedPhone = studentPhone.replace(/\D/g, '');
    if (!studentName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!hostelOrPg.trim()) {
      setFormError('Please enter your DGU Hostel block or PG name.');
      return;
    }
    if (cleanedPhone.length < 10) {
      setFormError('Please enter a valid 10-digit WhatsApp / mobile number.');
      return;
    }
    if (!pickupDate) {
      setFormError('Please choose a preferred pickup date.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    try {
      const created = await onSubmitBooking({
        item,
        durationTier,
        durationCount,
        studentName: studentName.trim(),
        hostelOrPg: hostelOrPg.trim(),
        studentPhone: cleanedPhone,
        pickupDate,
        notes: notes.trim(),
      });
      setConfirmedTicket(created);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to submit booking request.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!confirmedTicket) return;
    try {
      await navigator.clipboard.writeText(buildWhatsAppMessage(confirmedTicket));
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    } catch {
      setCopiedMsg(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 lg:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {item.category} · {item.distanceKm} km from DGU Campus
            </span>
            <h2
              id="detail-modal-title"
              className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate"
            >
              {confirmedTicket
                ? `Booking Ticket · ${confirmedTicket.requestId}`
                : item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {confirmedTicket ? (
            /* Confirmation Ticket View */
            <div className="max-w-xl mx-auto py-2">
              <div className="bg-[#F8FAFC] dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                <div className="bg-[#1E3A8A] dark:bg-blue-700 text-white px-6 py-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Saved to Firestore · Request Submitted</span>
                    </div>
                    <div className="font-mono text-2xl font-bold tracking-tight mt-1 tabular-nums">
                      {confirmedTicket.requestId}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-200">Status</div>
                    <div className="text-sm font-semibold text-amber-300 mt-0.5">
                      {confirmedTicket.status}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-start gap-4 pb-5 border-b border-dashed border-slate-300 dark:border-slate-600">
                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0">
                      <ProductImage
                        src={confirmedTicket.itemImage}
                        alt={confirmedTicket.itemTitle}
                        category={confirmedTicket.itemCategory}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                        {confirmedTicket.itemTitle}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        Provider: <span className="font-medium">{confirmedTicket.providerName}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#0D9488] dark:text-teal-400 shrink-0" />
                        <span>{confirmedTicket.pickupLandmark}</span>
                      </p>
                    </div>
                  </div>

                  {/* Cost & Student Details Summary */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Duration</div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
                        {confirmedTicket.durationCount}{' '}
                        {getTierUnitLabel(
                          confirmedTicket.durationTier,
                          confirmedTicket.durationCount
                        )}{' '}
                        ({formatINR(confirmedTicket.unitRate)}/
                        {getTierShortLabel(confirmedTicket.durationTier)})
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Preferred Pickup</div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 tabular-nums">
                        {confirmedTicket.pickupDate}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Student</div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {confirmedTicket.studentName}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Hostel / PG</div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                        {confirmedTicket.hostelOrPg}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Estimated Rental Cost
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
                        {confirmedTicket.securityDeposit > 0
                          ? `+ ${formatINR(confirmedTicket.securityDeposit)} refundable deposit at pickup`
                          : 'Zero refundable deposit required'}
                      </div>
                    </div>
                    <div className="font-mono text-2xl font-bold text-[#1E3A8A] dark:text-blue-400 tabular-nums">
                      {formatINR(confirmedTicket.estimatedRentalCost)}
                    </div>
                  </div>

                  {/* Ticket Actions */}
                  <div className="space-y-2.5 pt-1">
                    <a
                      href={buildWhatsAppUrl(confirmedTicket)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full min-h-[48px] px-5 py-3 bg-[#0D9488] hover:bg-[#0b7f75] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Confirm via WhatsApp</span>
                    </a>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="min-h-[44px] px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedMsg ? (
                          <>
                            <Check className="w-4 h-4 text-[#0D9488] dark:text-teal-400" />
                            <span>Message Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy WhatsApp Text</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onGoToBookings();
                        }}
                        className="min-h-[44px] px-4 py-2.5 bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>View in My Bookings</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Item Detail & Booking Calculator Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left Column: Specs, Pricing Breakdown, Provider */}
              <div className="lg:col-span-6 space-y-5">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.title}
                    category={item.category}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      Condition: <strong className="text-slate-800 dark:text-slate-200">{item.condition}</strong>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isAvailable
                          ? 'text-[#0D9488] dark:text-teal-400'
                          : 'text-[#B45309] dark:text-amber-400'
                      }`}
                    >
                      {isAvailable ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {item.availability}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Specs List */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    Included & Key Specifications
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                    {item.specs.map((spec) => (
                      <li
                        key={spec}
                        className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 rounded-lg px-3 py-2"
                      >
                        <Check className="w-3.5 h-3.5 text-[#0D9488] dark:text-teal-400 shrink-0" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Transparent Rate Breakdown */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Transparent Rate Breakdown
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 text-center py-3">
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Daily</div>
                      <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                        {formatINR(item.rates.daily)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Weekly</div>
                      <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                        {formatINR(item.rates.weekly)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Monthly</div>
                      <div className="font-mono text-sm font-bold text-[#1E3A8A] dark:text-blue-400 tabular-nums mt-0.5">
                        {formatINR(item.rates.monthly)}
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-[#F8FAFC] dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Refundable Security Deposit</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                      {item.securityDeposit > 0
                        ? formatINR(item.securityDeposit)
                        : 'Zero Deposit'}
                    </span>
                  </div>
                </div>

                {/* Verified Provider & Pickup Location */}
                <div className="bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      <ShieldCheck className="w-4 h-4 text-[#0D9488] dark:text-teal-400" />
                      <span>{item.provider.name}</span>
                    </div>
                    <span className="text-xs font-medium text-[#0D9488] dark:text-teal-400">
                      {item.provider.responseTime}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400 mt-0.5 shrink-0" />
                    <span>
                      Pickup / Drop-off: {item.pickupLandmark} ({item.provider.proximity})
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Rental Calculator & Google Auth / Request Form */}
              <div className="lg:col-span-6 space-y-4">
                {/* Rental Calculator Card */}
                <div className="bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                      Calculate & Request Rental
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Pay directly on pickup after inspecting the item. No online gateway fee.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      {(['Daily', 'Weekly', 'Monthly'] as DurationTier[]).map(
                        (tier) => (
                          <button
                            key={tier}
                            type="button"
                            onClick={() => setDurationTier(tier)}
                            className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              durationTier === tier
                                ? 'bg-[#1E3A8A] dark:bg-blue-600 text-white'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            {tier === 'Daily'
                              ? 'Days'
                              : tier === 'Weekly'
                                ? 'Weeks'
                                : 'Months'}
                          </button>
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Number of {getTierUnitLabel(durationTier, 2)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          {formatINR(unitRate)} × {durationCount}{' '}
                          {getTierUnitLabel(durationTier, durationCount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setDurationCount((c) => Math.max(1, c - 1))
                          }
                          aria-label="Decrease duration"
                          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-mono text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                          {durationCount}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDurationCount((c) => Math.min(24, c + 1))
                          }
                          aria-label="Increase duration"
                          className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Total Estimated Rental Cost
                      </span>
                      <span className="font-mono text-xl font-bold text-[#1E3A8A] dark:text-blue-400 tabular-nums">
                        {formatINR(estimatedRentalCost)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Auth Gate or Student Form */}
                {!user ? (
                  <GoogleAuthCard
                    title="Sign in to submit your rental request"
                    description="Verify your student identity with Google so vendors can confirm your booking ticket and save it to your DGU account."
                    isSigningIn={isSigningIn}
                    errorMessage={authError}
                    onSignIn={onSignIn}
                  />
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="bg-[#F8FAFC] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3"
                  >
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Booking as <strong className="text-slate-800 dark:text-slate-200">{user.email}</strong>
                    </div>

                    <div>
                      <label
                        htmlFor="booking-student-name"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Full Name *
                      </label>
                      <input
                        id="booking-student-name"
                        type="text"
                        required
                        maxLength={100}
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="e.g., Rohan Bisht"
                        className="w-full h-11 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="booking-hostel"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        DGU Hostel / PG Name *
                      </label>
                      <input
                        id="booking-hostel"
                        type="text"
                        required
                        maxLength={140}
                        value={hostelOrPg}
                        onChange={(e) => setHostelOrPg(e.target.value)}
                        placeholder="e.g., DGU Boys Hostel Block B / Prem Nagar PG"
                        className="w-full h-11 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="booking-phone"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Phone / WhatsApp *
                        </label>
                        <input
                          id="booking-phone"
                          type="tel"
                          required
                          maxLength={20}
                          value={studentPhone}
                          onChange={(e) => setStudentPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full h-11 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="booking-date"
                          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                        >
                          Preferred Pickup Date *
                        </label>
                        <input
                          id="booking-date"
                          type="date"
                          required
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full h-11 px-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="booking-notes"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                      >
                        Pickup Timing or Note (Optional)
                      </label>
                      <textarea
                        id="booking-notes"
                        rows={2}
                        maxLength={400}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g., Can pick up after 5 PM classes near DGU gate"
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400 resize-none"
                      />
                    </div>

                    {formError && (
                      <p className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg px-3 py-2">
                        {formError}
                      </p>
                    )}

                    {!isAvailable && (
                      <p className="text-xs font-medium text-[#B45309] dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg px-3 py-2">
                        Note: This item is currently marked Booked. You can still submit a request for upcoming dates.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full min-h-[48px] px-5 py-3 bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      {isSubmitting
                        ? 'Submitting to Firestore...'
                        : `Submit Rental Request · ${formatINR(estimatedRentalCost)}`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
