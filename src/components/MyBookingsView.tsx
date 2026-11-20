import { User } from 'firebase/auth';
import { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  PackageCheck,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { BookingRequest, BookingStatus, RentalItem } from '../types';
import {
  buildWhatsAppUrl,
  formatINR,
  getTierShortLabel,
  getTierUnitLabel,
} from '../utils/formatters';
import { GoogleAuthCard } from './GoogleAuthCard';
import { ProductImage } from './ProductImage';

interface MyBookingsViewProps {
  user: User | null;
  isSigningIn: boolean;
  authError?: string;
  bookings: BookingRequest[];
  listings: RentalItem[];
  onSignIn: () => void;
  onRebookItem: (item: RentalItem) => void;
  onExploreRentals: () => void;
}

const STATUS_TABS: ('All' | BookingStatus)[] = [
  'All',
  'Pending Confirmation',
  'Approved',
  'Active Rental',
  'Returned',
];

function getStatusPresentation(status: BookingStatus) {
  switch (status) {
    case 'Pending Confirmation':
      return {
        icon: Clock,
        textClass: 'text-[#B45309] dark:text-amber-300',
        bgClass: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/70',
      };
    case 'Approved':
      return {
        icon: CheckCircle2,
        textClass: 'text-[#0D9488] dark:text-teal-300',
        bgClass: 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800/70',
      };
    case 'Active Rental':
      return {
        icon: PackageCheck,
        textClass: 'text-[#1E3A8A] dark:text-blue-300',
        bgClass: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/70',
      };
    case 'Returned':
      return {
        icon: CheckCircle2,
        textClass: 'text-slate-600 dark:text-slate-300',
        bgClass: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      };
    case 'Declined':
      return {
        icon: XCircle,
        textClass: 'text-red-700 dark:text-red-300',
        bgClass: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/70',
      };
  }
}

export function MyBookingsView({
  user,
  isSigningIn,
  authError,
  bookings,
  listings,
  onSignIn,
  onRebookItem,
  onExploreRentals,
}: MyBookingsViewProps) {
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');

  if (!user) {
    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GoogleAuthCard
          title="Sign in to view My Bookings"
          description="Sign in with Google to view your submitted rental tickets, track vendor approvals, and re-book items across devices."
          isSigningIn={isSigningIn}
          errorMessage={authError}
          onSignIn={onSignIn}
        />
      </section>
    );
  }

  const filteredBookings =
    statusFilter === 'All'
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            My Bookings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Track your DGU campus rental requests, pickup details, and quickly re-book past items.
          </p>
        </div>

        <button
          type="button"
          onClick={onExploreRentals}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          Browse More Rentals
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-5">
        {STATUS_TABS.map((tab) => {
          const count =
            tab === 'All'
              ? bookings.length
              : bookings.filter((b) => b.status === tab).length;
          const isActive = statusFilter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer ${
                isActive
                  ? 'bg-[#1E3A8A] dark:bg-blue-600 text-white border-[#1E3A8A] dark:border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
          <CalendarCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-slate-800 dark:text-slate-200">
            No bookings in this view
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Explore verified bikes, hostel appliances, or study furniture near DGU campus to submit your first rental request.
          </p>
          <button
            type="button"
            onClick={onExploreRentals}
            className="mt-5 min-h-[44px] px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Explore Campus Rentals
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const statusUI = getStatusPresentation(booking.status);
            const StatusIcon = statusUI.icon;
            const matchedItem = listings.find((i) => i.id === booking.itemId);

            return (
              <article
                key={booking.requestId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start"
              >
                <div className="w-full sm:w-36 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0">
                  <ProductImage
                    src={booking.itemImage}
                    alt={booking.itemTitle}
                    category={booking.itemCategory}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                      {booking.requestId}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${statusUI.bgClass} ${statusUI.textClass}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{booking.status}</span>
                    </span>
                  </div>

                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-1.5">
                    {booking.itemTitle}
                  </h3>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Duration: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                        {booking.durationCount}{' '}
                        {getTierUnitLabel(booking.durationTier, booking.durationCount)}{' '}
                        ({formatINR(booking.unitRate)}/{getTierShortLabel(booking.durationTier)})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Pickup Date: </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                        {booking.pickupDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Estimated Total: </span>
                      <span className="font-mono font-bold text-[#1E3A8A] dark:text-blue-400 tabular-nums">
                        {formatINR(booking.estimatedRentalCost)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0D9488] dark:text-teal-400 shrink-0" />
                    <span className="truncate">
                      {booking.providerName} · {booking.pickupLandmark}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
                    <a
                      href={buildWhatsAppUrl(booking)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0D9488]/10 dark:bg-teal-500/15 hover:bg-[#0D9488]/15 dark:hover:bg-teal-500/25 text-[#0D9488] dark:text-teal-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Provider</span>
                    </a>

                    {matchedItem && (
                      <button
                        type="button"
                        onClick={() => onRebookItem(matchedItem)}
                        className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Re-book Item</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
