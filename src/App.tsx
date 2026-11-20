import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw, SearchX } from 'lucide-react';
import { CatalogControls } from './components/CatalogControls';
import { CompareModal, CompareTray } from './components/CompareDrawer';
import { HeroSection } from './components/HeroSection';
import { MyBookingsView } from './components/MyBookingsView';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProviderPortalView } from './components/ProviderPortalView';
import { INITIAL_LISTINGS } from './data/initialListings';
import { auth } from './firebase';
import {
  createBookingInFirestore,
  createListingInFirestore,
  deleteListingInFirestore,
  isBootstrappedAdminUser,
  loadUserPrivateDefaults,
  saveUserPrivateDefaults,
  saveUserThemePreference,
  seedInitialListingsIfEmpty,
  signInWithGooglePopup,
  signOutFirebaseUser,
  subscribeProviderBookings,
  subscribePublicListings,
  subscribeStudentBookings,
  syncUserPublicProfile,
  toggleListingAvailabilityInFirestore,
  updateBookingStatusInFirestore,
} from './services/firestoreService';
import {
  AppView,
  AvailabilityStatus,
  BookingRequest,
  BookingStatus,
  CategoryFilter,
  DurationTier,
  RentalItem,
  SortOption,
  StudentTab,
  ThemeMode,
  UserDefaults,
} from './types';
import { generateRequestId, getRateForTier } from './utils/formatters';

const THEME_STORAGE_KEY = 'campusrent_theme';

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
  } catch {
    // Ignore storage errors
  }
  return 'light';
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [userDefaults, setUserDefaults] = useState<UserDefaults>({
    defaultHostelOrPg: '',
    defaultPhone: '',
  });

  const [listings, setListings] = useState<RentalItem[]>(INITIAL_LISTINGS);
  const [studentBookings, setStudentBookings] = useState<BookingRequest[]>([]);
  const [providerBookings, setProviderBookings] = useState<BookingRequest[]>([]);

  const [appView, setAppView] = useState<AppView>('student');
  const [studentTab, setStudentTab] = useState<StudentTab>('explore');

  // Discovery Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<'All' | AvailabilityStatus>('All');
  const [durationTier, setDurationTier] = useState<DurationTier>('Daily');
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(10);
  const [sortBy, setSortBy] = useState<SortOption>('nearest');

  // Comparison & Detail Modals
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [activeDetailItem, setActiveDetailItem] = useState<RentalItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  const catalogRef = useRef<HTMLElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? '' : curr));
    }, 3200);
  };

  // Sync Tailwind dark class & localStorage whenever theme changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  // Subscribe to public listings in Firestore
  useEffect(() => {
    const unsubscribe = subscribePublicListings((remoteItems) => {
      if (remoteItems.length > 0) {
        setListings(remoteItems);
      } else {
        setListings(INITIAL_LISTINGS);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firebase Auth state & sync profile/bookings
  useEffect(() => {
    let unsubStudent: (() => void) | undefined;
    let unsubProvider: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      if (unsubStudent) {
        unsubStudent();
        unsubStudent = undefined;
      }
      if (unsubProvider) {
        unsubProvider();
        unsubProvider = undefined;
      }

      if (!firebaseUser) {
        setStudentBookings([]);
        setProviderBookings([]);
        setUserDefaults({ defaultHostelOrPg: '', defaultPhone: '' });
        return;
      }

      const adminFlag = isBootstrappedAdminUser(firebaseUser);

      // Seed initial 12 Dehradun listings into Firestore if collection is empty
      void seedInitialListingsIfEmpty(firebaseUser.uid).catch((err) => {
        console.error('Seed listings check failed:', err);
      });

      // Sync public profile & saved theme preference + private defaults
      void syncUserPublicProfile(firebaseUser, theme)
        .then((savedTheme) => {
          if (savedTheme !== theme) {
            setTheme(savedTheme);
          }
        })
        .catch((err) => console.error('User profile sync error:', err));

      void loadUserPrivateDefaults(firebaseUser.uid)
        .then((defaults) => setUserDefaults(defaults))
        .catch((err) => console.error('Private defaults error:', err));

      // Attach authenticated Firestore listeners
      unsubStudent = subscribeStudentBookings(firebaseUser.uid, (data) => {
        setStudentBookings(data);
      });

      unsubProvider = subscribeProviderBookings(
        firebaseUser.uid,
        adminFlag,
        (data) => {
          setProviderBookings(data);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubStudent) unsubStudent();
      if (unsubProvider) unsubProvider();
    };
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (user) {
      void saveUserThemePreference(user.uid, nextTheme).catch((err) =>
        console.error('Theme preference save error:', err)
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setIsSigningIn(true);
    try {
      const signedUser = await signInWithGooglePopup();
      showToast(`Signed in as ${signedUser.displayName || signedUser.email}`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Google sign-in was cancelled or blocked.';
      setAuthError(msg);
      showToast('Google sign-in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutFirebaseUser();
    showToast('Signed out of CampusRent.');
  };

  const priceCeiling = useMemo(() => {
    if (durationTier === 'Daily') return 1500;
    if (durationTier === 'Weekly') return 3500;
    return 8000;
  }, [durationTier]);

  const handleDurationTierChange = (tier: DurationTier) => {
    setDurationTier(tier);
    if (tier === 'Daily') setMaxPrice(1500);
    else if (tier === 'Weekly') setMaxPrice(3500);
    else setMaxPrice(8000);
  };

  const filteredListings = useMemo(() => {
    const queryText = searchQuery.trim().toLowerCase();

    return listings
      .filter((item) => {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        if (
          availabilityFilter !== 'All' &&
          item.availability !== availabilityFilter
        ) {
          return false;
        }
        if (item.distanceKm > maxDistanceKm) {
          return false;
        }
        const rate = getRateForTier(item, durationTier);
        if (maxPrice < priceCeiling && rate > maxPrice) {
          return false;
        }
        if (queryText) {
          const hay = `${item.title} ${item.category} ${item.description} ${item.provider.name} ${item.pickupLandmark}`.toLowerCase();
          if (!hay.includes(queryText)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'nearest') return a.distanceKm - b.distanceKm;
        const rateA = getRateForTier(a, durationTier);
        const rateB = getRateForTier(b, durationTier);
        return sortBy === 'price-asc' ? rateA - rateB : rateB - rateA;
      });
  }, [
    listings,
    searchQuery,
    selectedCategory,
    availabilityFilter,
    maxDistanceKm,
    durationTier,
    maxPrice,
    priceCeiling,
    sortBy,
  ]);

  const comparedItems = useMemo(
    () =>
      compareIds
        .map((id) => listings.find((item) => item.id === id))
        .filter((item): item is RentalItem => Boolean(item)),
    [compareIds, listings]
  );

  const handleToggleCompare = (item: RentalItem) => {
    setCompareIds((prev) => {
      if (prev.includes(item.id)) {
        return prev.filter((id) => id !== item.id);
      }
      if (prev.length >= 3) {
        showToast('You can compare up to 3 rental items side by side.');
        return prev;
      }
      return [...prev, item.id];
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setAvailabilityFilter('All');
    setMaxPrice(priceCeiling);
    setMaxDistanceKm(10);
    setSortBy('nearest');
  };

  const handleExploreScroll = () => {
    setAppView('student');
    setStudentTab('explore');
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmitBooking = async (payload: {
    item: RentalItem;
    durationTier: DurationTier;
    durationCount: number;
    studentName: string;
    hostelOrPg: string;
    studentPhone: string;
    pickupDate: string;
    notes: string;
  }): Promise<BookingRequest> => {
    if (!user) {
      throw new Error('Please sign in with Google before submitting a booking.');
    }

    const unitRate = getRateForTier(payload.item, payload.durationTier);
    const existingIds = [
      ...studentBookings.map((b) => b.requestId),
      ...providerBookings.map((b) => b.requestId),
    ];
    const requestId = generateRequestId(existingIds);

    const newBooking: BookingRequest = {
      requestId,
      itemId: payload.item.id,
      itemTitle: payload.item.title,
      itemCategory: payload.item.category,
      itemImage: payload.item.imageUrl,
      providerName: payload.item.provider.name,
      providerPhone: payload.item.provider.whatsappPhone,
      providerUid: payload.item.ownerUid || user.uid,
      pickupLandmark: payload.item.pickupLandmark,
      durationTier: payload.durationTier,
      durationCount: payload.durationCount,
      unitRate,
      securityDeposit: payload.item.securityDeposit,
      estimatedRentalCost: unitRate * payload.durationCount,
      studentUid: user.uid,
      studentName: payload.studentName,
      hostelOrPg: payload.hostelOrPg,
      studentPhone: payload.studentPhone,
      pickupDate: payload.pickupDate,
      notes: payload.notes,
      status: 'Pending Confirmation',
      createdAt: new Date().toISOString(),
    };

    await createBookingInFirestore(newBooking, user.uid);
    void saveUserPrivateDefaults(user, payload.hostelOrPg, payload.studentPhone).then(
      () =>
        setUserDefaults({
          defaultHostelOrPg: payload.hostelOrPg,
          defaultPhone: payload.studentPhone,
        })
    );

    showToast(`Booking ${requestId} saved to Firestore.`);
    return newBooking;
  };

  const handleUpdateBookingStatus = async (
    requestId: string,
    status: BookingStatus
  ) => {
    await updateBookingStatusInFirestore(requestId, status);

    const target = providerBookings.find((b) => b.requestId === requestId);
    if (target) {
      const matchedItem = listings.find((i) => i.id === target.itemId);
      const canEditItem =
        matchedItem &&
        user &&
        (isBootstrappedAdminUser(user) || matchedItem.ownerUid === user.uid);
      if (canEditItem) {
        if (status === 'Active Rental') {
          await toggleListingAvailabilityInFirestore(target.itemId, 'Booked');
        } else if (status === 'Returned') {
          await toggleListingAvailabilityInFirestore(
            target.itemId,
            'Available Now'
          );
        }
      }
    }

    showToast(`Request ${requestId} updated to ${status}.`);
  };

  const handleToggleAvailability = async (itemId: string) => {
    const item = listings.find((i) => i.id === itemId);
    if (!item) return;
    const nextStatus: AvailabilityStatus =
      item.availability === 'Available Now' ? 'Booked' : 'Available Now';
    await toggleListingAvailabilityInFirestore(itemId, nextStatus);
    showToast(`${item.title} marked ${nextStatus}.`);
  };

  const handleAddListing = async (newItem: RentalItem) => {
    if (!user) return;
    await createListingInFirestore(newItem, user.uid);
  };

  const handleDeleteCustomListing = async (itemId: string) => {
    await deleteListingInFirestore(itemId);
    setCompareIds((prev) => prev.filter((id) => id !== itemId));
    showToast('Listing removed from Firestore.');
  };

  const totalAvailableCount = listings.filter(
    (i) => i.availability === 'Available Now'
  ).length;

  const pendingProviderCount = providerBookings.filter(
    (b) => b.status === 'Pending Confirmation'
  ).length;

  const isAdmin = isBootstrappedAdminUser(user);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 lg:pb-0 transition-colors duration-150">
      <Navbar
        appView={appView}
        studentTab={studentTab}
        compareCount={comparedItems.length}
        bookingsCount={studentBookings.length}
        pendingProviderCount={pendingProviderCount}
        theme={theme}
        user={user}
        authLoading={authLoading}
        onToggleTheme={handleToggleTheme}
        onSignIn={() => void handleGoogleSignIn()}
        onSignOut={() => void handleSignOut()}
        onChangeAppView={setAppView}
        onChangeStudentTab={setStudentTab}
        onOpenCompare={() => setIsCompareModalOpen(true)}
      />

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-18 right-4 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 dark:border-slate-700"
        >
          {toastMessage}
        </div>
      )}

      <main className="flex-1">
        {appView === 'provider' ? (
          <ProviderPortalView
            user={user}
            isAdmin={isAdmin}
            isSigningIn={isSigningIn}
            authError={authError}
            listings={listings}
            bookings={providerBookings}
            onSignIn={() => void handleGoogleSignIn()}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onToggleAvailability={handleToggleAvailability}
            onAddListing={handleAddListing}
            onDeleteCustomListing={handleDeleteCustomListing}
          />
        ) : studentTab === 'bookings' ? (
          <MyBookingsView
            user={user}
            isSigningIn={isSigningIn}
            authError={authError}
            bookings={studentBookings}
            listings={listings}
            onSignIn={() => void handleGoogleSignIn()}
            onRebookItem={(item) => setActiveDetailItem(item)}
            onExploreRentals={() => setStudentTab('explore')}
          />
        ) : (
          <>
            <HeroSection
              searchQuery={searchQuery}
              totalAvailableCount={totalAvailableCount}
              onSearchChange={setSearchQuery}
              onExploreClick={handleExploreScroll}
            />

            <section
              ref={catalogRef}
              aria-label="Campus Rental Catalog"
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6"
            >
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                    Rentals Near DGU Campus
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Select up to 3 items to compare rates side by side, or sign in with Google to request a booking.
                  </p>
                </div>
              </div>

              <CatalogControls
                selectedCategory={selectedCategory}
                availabilityFilter={availabilityFilter}
                durationTier={durationTier}
                maxPrice={maxPrice}
                priceCeiling={priceCeiling}
                maxDistanceKm={maxDistanceKm}
                sortBy={sortBy}
                resultCount={filteredListings.length}
                onCategoryChange={setSelectedCategory}
                onAvailabilityChange={setAvailabilityFilter}
                onDurationTierChange={handleDurationTierChange}
                onMaxPriceChange={setMaxPrice}
                onMaxDistanceChange={setMaxDistanceKm}
                onSortChange={setSortBy}
                onResetFilters={handleResetFilters}
              />

              {/* Product Grid */}
              {filteredListings.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 sm:p-14 text-center">
                  <SearchX className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="font-display text-lg font-bold text-slate-800 dark:text-slate-200">
                    No matching rentals found
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                    Try widening your distance radius, increasing the max rate, or clearing your search filter.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-5 min-h-[42px] px-4 py-2 bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      durationTier={durationTier}
                      isCompared={compareIds.includes(item.id)}
                      onToggleCompare={handleToggleCompare}
                      onOpenDetail={(selected) => setActiveDetailItem(selected)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span className="font-display font-bold text-[#1E3A8A] dark:text-blue-400">
              CampusRent
            </span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Built for DBS Global University (DGU) Students, Dehradun</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => {
                setAppView('student');
                setStudentTab('explore');
              }}
              className="hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            >
              Explore Rentals
            </button>
            <button
              type="button"
              onClick={() => {
                setAppView('student');
                setStudentTab('bookings');
              }}
              className="hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            >
              My Bookings
            </button>
            <button
              type="button"
              onClick={() => setAppView('provider')}
              className="hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
            >
              Provider Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Compare Tray (Student Explore View) */}
      {appView === 'student' && (
        <CompareTray
          items={comparedItems}
          onRemoveItem={(id) =>
            setCompareIds((prev) => prev.filter((item) => item !== id))
          }
          onClearAll={() => setCompareIds([])}
          onOpenModal={() => setIsCompareModalOpen(true)}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        items={comparedItems}
        onClose={() => setIsCompareModalOpen(false)}
        onRemoveItem={(id) =>
          setCompareIds((prev) => prev.filter((item) => item !== id))
        }
        onSelectForBooking={(item) => setActiveDetailItem(item)}
      />

      {/* Product Detail & Booking Request Modal */}
      <ProductDetailModal
        item={activeDetailItem}
        initialTier={durationTier}
        user={user}
        userDefaults={userDefaults}
        isSigningIn={isSigningIn}
        authError={authError}
        onSignIn={() => void handleGoogleSignIn()}
        onClose={() => setActiveDetailItem(null)}
        onSubmitBooking={handleSubmitBooking}
        onGoToBookings={() => {
          setAppView('student');
          setStudentTab('bookings');
        }}
      />
    </div>
  );
}
