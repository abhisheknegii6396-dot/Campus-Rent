import { User } from 'firebase/auth';
import { FormEvent, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  IndianRupee,
  PackagePlus,
  Trash2,
  X,
} from 'lucide-react';
import { CATEGORY_FALLBACK_IMAGES } from '../data/initialListings';
import {
  AvailabilityStatus,
  BookingRequest,
  BookingStatus,
  RentalCategory,
  RentalItem,
} from '../types';
import { formatINR, getTierUnitLabel } from '../utils/formatters';
import { GoogleAuthCard } from './GoogleAuthCard';
import { ProductImage } from './ProductImage';

interface ProviderPortalViewProps {
  user: User | null;
  isAdmin: boolean;
  isSigningIn: boolean;
  authError?: string;
  listings: RentalItem[];
  bookings: BookingRequest[];
  onSignIn: () => void;
  onUpdateBookingStatus: (requestId: string, status: BookingStatus) => Promise<void>;
  onToggleAvailability: (itemId: string) => Promise<void>;
  onAddListing: (item: RentalItem) => Promise<void>;
  onDeleteCustomListing: (itemId: string) => Promise<void>;
}

const CATEGORIES: RentalCategory[] = [
  'Bikes & Scooters',
  'Electronics',
  'Appliances',
  'Furniture',
  'Sports Equipment',
  'Hostel Essentials',
];

export function ProviderPortalView({
  user,
  isAdmin,
  isSigningIn,
  authError,
  listings,
  bookings,
  onSignIn,
  onUpdateBookingStatus,
  onToggleAvailability,
  onAddListing,
  onDeleteCustomListing,
}: ProviderPortalViewProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'inventory'>('requests');
  const [showAddForm, setShowAddForm] = useState(false);

  // Add Listing Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RentalCategory>('Electronics');
  const [dailyPrice, setDailyPrice] = useState('200');
  const [weeklyPrice, setWeeklyPrice] = useState('1000');
  const [monthlyPrice, setMonthlyPrice] = useState('2800');
  const [deposit, setDeposit] = useState('500');
  const [distanceKm, setDistanceKm] = useState('0.8');
  const [providerName, setProviderName] = useState('Prem Nagar Student Rentals');
  const [pickupLandmark, setPickupLandmark] = useState('Near DGU Main Gate, Prem Nagar');
  const [condition, setCondition] = useState('Very Good · Checked');
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState<AvailabilityStatus>('Available Now');
  const [isPublishing, setIsPublishing] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  if (!user) {
    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <GoogleAuthCard
          title="Sign in to access Provider Portal"
          description="Authenticate with Google to publish new rental listings near DGU campus, toggle item availability, and approve incoming student requests."
          isSigningIn={isSigningIn}
          errorMessage={authError}
          onSignIn={onSignIn}
        />
      </section>
    );
  }

  // Pilot Metrics
  const totalListings = listings.length;
  const availableCount = listings.filter((i) => i.availability === 'Available Now').length;
  const activeRequestsCount = bookings.filter(
    (b) => b.status === 'Pending Confirmation' || b.status === 'Approved' || b.status === 'Active Rental'
  ).length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending Confirmation').length;
  const grossBookingValue = bookings
    .filter((b) => b.status !== 'Declined')
    .reduce((sum, b) => sum + b.estimatedRentalCost, 0);

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !providerName.trim()) return;

    setIsPublishing(true);
    try {
      const newItem: RentalItem = {
        id: `cr-custom-${Date.now()}`,
        title: title.trim(),
        category,
        description:
          description.trim() ||
          `${title.trim()} available for short- or long-term rental near DBS Global University, Dehradun.`,
        specs: ['DGU Student Friendly', 'Verified Local Pickup', condition.trim() || 'Checked'],
        condition: condition.trim() || 'Good',
        rates: {
          daily: Math.max(20, Number(dailyPrice) || 100),
          weekly: Math.max(50, Number(weeklyPrice) || 500),
          monthly: Math.max(100, Number(monthlyPrice) || 1500),
        },
        securityDeposit: Math.max(0, Number(deposit) || 0),
        distanceKm: Math.max(0.1, Math.min(15, Number(distanceKm) || 1)),
        pickupLandmark: pickupLandmark.trim() || 'Prem Nagar, Near DGU Campus',
        provider: {
          name: providerName.trim(),
          proximity: `${distanceKm} km from DGU Campus`,
          responseTime: 'Replies in ~15 mins',
          whatsappPhone: '919897012345',
          verified: true,
        },
        availability,
        imageUrl: CATEGORY_FALLBACK_IMAGES[category],
        ownerUid: user.uid,
        isPublic: true,
        isCustom: true,
      };

      await onAddListing(newItem);
      setTitle('');
      setDescription('');
      setShowAddForm(false);
      setActiveTab('inventory');
      setFormSuccess(`Published "${newItem.title}" to Firestore DGU catalog.`);
      setTimeout(() => setFormSuccess(''), 3500);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            Provider & Campus Admin Portal
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Signed in as <strong className="text-slate-800 dark:text-slate-200">{user.email}</strong>
            {isAdmin ? ' · Campus Admin' : ' · Verified Provider'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveTab('inventory');
            setShowAddForm((v) => !v);
          }}
          className="min-h-[42px] px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PackagePlus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Form' : 'Add New Listing'}</span>
        </button>
      </div>

      {/* Pilot Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total Campus Listings
          </div>
          <div className="mt-2 font-display text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {totalListings}
          </div>
          <div className="mt-1 text-xs text-[#0D9488] dark:text-teal-400 font-medium tabular-nums">
            {availableCount} Available Now · {totalListings - availableCount} Booked
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active & Pending Requests
          </div>
          <div className="mt-2 font-display text-3xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {activeRequestsCount}
          </div>
          <div className="mt-1 text-xs text-[#B45309] dark:text-amber-400 font-medium tabular-nums">
            {pendingCount} awaiting confirmation
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Estimated Gross Booking Value
          </div>
          <div className="mt-2 font-mono text-3xl font-bold text-[#1E3A8A] dark:text-blue-400 tabular-nums flex items-center gap-1">
            <span>{formatINR(grossBookingValue)}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across {bookings.filter((b) => b.status !== 'Declined').length} managed tickets
          </div>
        </div>
      </div>

      {formSuccess && (
        <div className="bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-[#0D9488] dark:text-teal-300 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Add New Listing Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                Publish New Rental Listing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Saved directly to Firestore so DGU students can discover and book it live.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              aria-label="Close form"
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Bajaj Induction Stove 2000W"
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RentalCategory)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Provider / Shop Name *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Price (₹) *
              </label>
              <input
                type="number"
                min={20}
                max={50000}
                required
                value={dailyPrice}
                onChange={(e) => setDailyPrice(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Weekly Price (₹) *
              </label>
              <input
                type="number"
                min={50}
                max={200000}
                required
                value={weeklyPrice}
                onChange={(e) => setWeeklyPrice(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Price (₹) *
              </label>
              <input
                type="number"
                min={100}
                max={500000}
                required
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                min={0}
                max={100000}
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Distance from DGU (km) *
              </label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                max={15}
                required
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Availability
              </label>
              <select
                value={availability}
                onChange={(e) =>
                  setAvailability(e.target.value as AvailabilityStatus)
                }
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              >
                <option value="Available Now">Available Now</option>
                <option value="Booked">Booked</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pickup Landmark near DGU *
              </label>
              <input
                type="text"
                required
                maxLength={160}
                value={pickupLandmark}
                onChange={(e) => setPickupLandmark(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Condition Note
              </label>
              <input
                type="text"
                maxLength={100}
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Description (Optional)
              </label>
              <input
                type="text"
                maxLength={800}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention accessories included, power specs, or hostel room suitability..."
                className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPublishing}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0b7f75] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold cursor-pointer"
            >
              {isPublishing ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      )}

      {/* Portal Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer tabular-nums ${
            activeTab === 'requests'
              ? 'border-[#1E3A8A] dark:border-blue-400 text-[#1E3A8A] dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Incoming Booking Requests ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer tabular-nums ${
            activeTab === 'inventory'
              ? 'border-[#1E3A8A] dark:border-blue-400 text-[#1E3A8A] dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Manage Inventory ({listings.length})
        </button>
      </div>

      {/* Tab 1: Incoming Booking Requests */}
      {activeTab === 'requests' ? (
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-sm text-slate-500 dark:text-slate-400">
              No incoming booking requests for your listings yet. Publish a new listing or submit a booking from Student View.
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.requestId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-[#1E3A8A] dark:text-blue-400 tabular-nums">
                      {booking.requestId}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {booking.status}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      Pickup: {booking.pickupDate}
                    </span>
                  </div>

                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
                    {booking.itemTitle}
                  </h3>

                  <div className="text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      Student: <strong className="text-slate-800 dark:text-slate-200">{booking.studentName}</strong>
                    </span>
                    <span>Hostel/PG: {booking.hostelOrPg}</span>
                    <span className="font-mono">Phone: {booking.studentPhone}</span>
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      “{booking.notes}”
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left lg:text-right">
                    <div className="font-mono text-base font-bold text-slate-900 dark:text-slate-100 tabular-nums flex items-center lg:justify-end">
                      <IndianRupee className="w-3.5 h-3.5 mr-0.5 text-slate-500 dark:text-slate-400" />
                      {booking.estimatedRentalCost.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      {booking.durationCount}{' '}
                      {getTierUnitLabel(booking.durationTier, booking.durationCount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'Pending Confirmation' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            void onUpdateBookingStatus(booking.requestId, 'Approved')
                          }
                          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0b7f75] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void onUpdateBookingStatus(booking.requestId, 'Declined')
                          }
                          className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-300 hover:border-red-200 dark:hover:border-red-800 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {booking.status === 'Approved' && (
                      <button
                        type="button"
                        onClick={() =>
                          void onUpdateBookingStatus(booking.requestId, 'Active Rental')
                        }
                        className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                      >
                        Mark Handed Over (Active)
                      </button>
                    )}

                    {booking.status === 'Active Rental' && (
                      <button
                        type="button"
                        onClick={() =>
                          void onUpdateBookingStatus(booking.requestId, 'Returned')
                        }
                        className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold cursor-pointer"
                      >
                        Mark Returned
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Tab 2: Inventory Manager */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Item & Provider</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Rates (Day / Wk / Mo)</th>
                  <th className="py-3 px-4">Distance</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {listings.map((item) => {
                  const isAvail = item.availability === 'Available Now';
                  const canManage = isAdmin || item.ownerUid === user.uid;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                            <ProductImage
                              src={item.imageUrl}
                              alt={item.title}
                              category={item.category}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[230px]">
                              {item.title}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {item.provider.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-800 dark:text-slate-200 tabular-nums">
                        {formatINR(item.rates.daily)} / {formatINR(item.rates.weekly)} /{' '}
                        {formatINR(item.rates.monthly)}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                        {item.distanceKm} km
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            isAvail
                              ? 'text-[#0D9488] dark:text-teal-400'
                              : 'text-[#B45309] dark:text-amber-400'
                          }`}
                        >
                          {isAvail ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Clock className="w-3.5 h-3.5" />
                          )}
                          {item.availability}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManage ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => void onToggleAvailability(item.id)}
                              className="min-h-[36px] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer whitespace-nowrap"
                            >
                              Set {isAvail ? 'Booked' : 'Available'}
                            </button>

                            {item.isCustom && (
                              <button
                                type="button"
                                onClick={() => void onDeleteCustomListing(item.id)}
                                aria-label={`Delete ${item.title}`}
                                className="min-h-[36px] min-w-[36px] rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-200 dark:hover:border-red-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-300 flex items-center justify-center cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Partner Listing
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
