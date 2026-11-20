import { User, signInWithPopup, signOut } from 'firebase/auth';
import {
  Timestamp,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { INITIAL_LISTINGS } from '../data/initialListings';
import { OperationType, auth, db, googleProvider, handleFirestoreError } from '../firebase';
import {
  AvailabilityStatus,
  BookingRequest,
  BookingStatus,
  RentalItem,
  ThemeMode,
  UserDefaults,
} from '../types';

export const BOOTSTRAPPED_ADMIN_EMAIL = 'abhisheknegii6396@gmail.com';

export function isBootstrappedAdminUser(user: User | null): boolean {
  return Boolean(user?.emailVerified && user.email === BOOTSTRAPPED_ADMIN_EMAIL);
}

function clampText(value: string, maxLen: number, fallback = ''): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
}

function sanitizeId(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned || `id-${Date.now()}`;
}

function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

export async function signInWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

export function subscribePublicListings(
  onData: (items: RentalItem[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const path = 'listings';
  const q = query(collection(db, path), where('isPublic', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: RentalItem[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: String(d.id ?? docSnap.id),
          title: String(d.title ?? ''),
          category: d.category,
          description: String(d.description ?? ''),
          specs: Array.isArray(d.specs) ? d.specs.map(String) : ['DGU Student Ready'],
          condition: String(d.condition ?? 'Good'),
          rates: {
            daily: Number(d.rates?.daily ?? 100),
            weekly: Number(d.rates?.weekly ?? 500),
            monthly: Number(d.rates?.monthly ?? 1500),
          },
          securityDeposit: Number(d.securityDeposit ?? 0),
          distanceKm: Number(d.distanceKm ?? 1),
          pickupLandmark: String(d.pickupLandmark ?? ''),
          provider: {
            name: String(d.provider?.name ?? 'Local Vendor'),
            proximity: String(d.provider?.proximity ?? 'Near DGU Campus'),
            responseTime: String(d.provider?.responseTime ?? 'Replies in ~15 mins'),
            whatsappPhone: String(d.provider?.whatsappPhone ?? '919897012345'),
            verified: Boolean(d.provider?.verified ?? true),
          },
          availability: d.availability === 'Booked' ? 'Booked' : 'Available Now',
          imageUrl: String(d.imageUrl ?? ''),
          ownerUid: typeof d.ownerUid === 'string' ? d.ownerUid : undefined,
          isPublic: Boolean(d.isPublic ?? true),
          isCustom: Boolean(d.isCustom ?? false),
        };
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function seedInitialListingsIfEmpty(ownerUid: string): Promise<boolean> {
  const path = 'listings';
  try {
    const existingSnap = await getDocs(
      query(collection(db, path), where('isPublic', '==', true), limit(1))
    );
    if (!existingSnap.empty) {
      return false;
    }

    const batch = writeBatch(db);
    for (const item of INITIAL_LISTINGS) {
      const docRef = doc(db, path, sanitizeId(item.id));
      batch.set(docRef, {
        id: sanitizeId(item.id),
        title: clampText(item.title, 120, 'Rental Item'),
        category: item.category,
        description: clampText(item.description, 800, 'Campus rental item'),
        specs: item.specs.slice(0, 8).map((s) => clampText(s, 120, 'Verified')),
        condition: clampText(item.condition, 100, 'Good'),
        rates: {
          daily: Math.max(1, item.rates.daily),
          weekly: Math.max(1, item.rates.weekly),
          monthly: Math.max(1, item.rates.monthly),
        },
        securityDeposit: Math.max(0, item.securityDeposit),
        distanceKm: Math.max(0.1, Math.min(50, item.distanceKm)),
        pickupLandmark: clampText(item.pickupLandmark, 160, 'Near DGU Campus'),
        provider: {
          name: clampText(item.provider.name, 120, 'DGU Vendor'),
          proximity: clampText(item.provider.proximity, 120, 'Near DGU'),
          responseTime: clampText(item.provider.responseTime, 80, 'Replies in ~15 mins'),
          whatsappPhone: clampText(item.provider.whatsappPhone, 20, '919897012345'),
          verified: Boolean(item.provider.verified),
        },
        availability: item.availability,
        imageUrl: clampText(item.imageUrl, 500, '/src/assets/images/item_activa_scooter_1795162969115.jpg'),
        ownerUid: sanitizeId(ownerUid),
        isPublic: true,
        isCustom: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function createListingInFirestore(
  item: RentalItem,
  ownerUid: string
): Promise<void> {
  const safeId = sanitizeId(item.id);
  const path = `listings/${safeId}`;
  try {
    await setDoc(doc(db, 'listings', safeId), {
      id: safeId,
      title: clampText(item.title, 120, 'Campus Rental'),
      category: item.category,
      description: clampText(item.description, 800, 'Available for DGU students.'),
      specs: (item.specs.length > 0 ? item.specs : ['DGU Student Friendly'])
        .slice(0, 8)
        .map((s) => clampText(s, 120, 'Verified')),
      condition: clampText(item.condition, 100, 'Good'),
      rates: {
        daily: Math.min(50000, Math.max(1, Number(item.rates.daily) || 100)),
        weekly: Math.min(200000, Math.max(1, Number(item.rates.weekly) || 500)),
        monthly: Math.min(500000, Math.max(1, Number(item.rates.monthly) || 1500)),
      },
      securityDeposit: Math.min(100000, Math.max(0, Number(item.securityDeposit) || 0)),
      distanceKm: Math.min(50, Math.max(0.1, Number(item.distanceKm) || 1)),
      pickupLandmark: clampText(item.pickupLandmark, 160, 'Prem Nagar, Near DGU Campus'),
      provider: {
        name: clampText(item.provider.name, 120, 'DGU Vendor'),
        proximity: clampText(item.provider.proximity, 120, 'Near DGU Campus'),
        responseTime: clampText(item.provider.responseTime, 80, 'Replies in ~15 mins'),
        whatsappPhone: clampText(item.provider.whatsappPhone, 20, '919897012345'),
        verified: true,
      },
      availability: item.availability,
      imageUrl: clampText(item.imageUrl, 500, '/src/assets/images/item_dslr_camera_1795162967382.jpg'),
      ownerUid: sanitizeId(ownerUid),
      isPublic: true,
      isCustom: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleListingAvailabilityInFirestore(
  listingId: string,
  nextAvailability: AvailabilityStatus
): Promise<void> {
  const safeId = sanitizeId(listingId);
  const path = `listings/${safeId}`;
  try {
    await updateDoc(doc(db, 'listings', safeId), {
      availability: nextAvailability,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteListingInFirestore(listingId: string): Promise<void> {
  const safeId = sanitizeId(listingId);
  const path = `listings/${safeId}`;
  try {
    await deleteDoc(doc(db, 'listings', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

function mapBookingDoc(docSnap: { id: string; data: () => Record<string, unknown> }): BookingRequest {
  const d = docSnap.data();
  return {
    requestId: String(d.requestId ?? docSnap.id),
    itemId: String(d.itemId ?? ''),
    itemTitle: String(d.itemTitle ?? ''),
    itemCategory: d.itemCategory as BookingRequest['itemCategory'],
    itemImage: String(d.itemImage ?? ''),
    providerName: String(d.providerName ?? ''),
    providerPhone: String(d.providerPhone ?? '919897012345'),
    providerUid: typeof d.providerUid === 'string' ? d.providerUid : undefined,
    pickupLandmark: String(d.pickupLandmark ?? ''),
    durationTier: d.durationTier as BookingRequest['durationTier'],
    durationCount: Number(d.durationCount ?? 1),
    unitRate: Number(d.unitRate ?? 0),
    securityDeposit: Number(d.securityDeposit ?? 0),
    estimatedRentalCost: Number(d.estimatedRentalCost ?? 0),
    studentUid: typeof d.studentUid === 'string' ? d.studentUid : undefined,
    studentName: String(d.studentName ?? ''),
    hostelOrPg: String(d.hostelOrPg ?? ''),
    studentPhone: String(d.studentPhone ?? ''),
    pickupDate: String(d.pickupDate ?? ''),
    notes: String(d.notes ?? ''),
    status: d.status as BookingStatus,
    createdAt: timestampToIso(d.createdAt),
  };
}

export function subscribeStudentBookings(
  studentUid: string,
  onData: (bookings: BookingRequest[]) => void
): () => void {
  const path = 'bookings';
  const q = query(collection(db, path), where('studentUid', '==', studentUid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs
        .map(mapBookingDoc)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export function subscribeProviderBookings(
  providerUid: string,
  isAdmin: boolean,
  onData: (bookings: BookingRequest[]) => void
): () => void {
  const path = 'bookings';
  const q = isAdmin
    ? query(collection(db, path))
    : query(collection(db, path), where('providerUid', '==', providerUid));

  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs
        .map(mapBookingDoc)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createBookingInFirestore(
  booking: BookingRequest,
  studentUid: string
): Promise<void> {
  const safeRequestId = sanitizeId(booking.requestId);
  const safeItemId = sanitizeId(booking.itemId);
  const path = `bookings/${safeRequestId}`;

  try {
    // Ensure providerUid matches the authoritative ownerUid in Firestore listings
    const listingSnap = await getDoc(doc(db, 'listings', safeItemId));
    const authoritativeProviderUid = listingSnap.exists()
      ? String(listingSnap.data().ownerUid ?? booking.providerUid ?? studentUid)
      : sanitizeId(booking.providerUid ?? studentUid);

    await setDoc(doc(db, 'bookings', safeRequestId), {
      requestId: safeRequestId,
      itemId: safeItemId,
      itemTitle: clampText(booking.itemTitle, 120, 'Rental Item'),
      itemCategory: booking.itemCategory,
      itemImage: clampText(booking.itemImage, 500, '/src/assets/images/item_activa_scooter_1795162969115.jpg'),
      providerName: clampText(booking.providerName, 120, 'Local Vendor'),
      providerPhone: clampText(booking.providerPhone, 20, '919897012345'),
      providerUid: sanitizeId(authoritativeProviderUid),
      pickupLandmark: clampText(booking.pickupLandmark, 160, 'Near DGU Campus'),
      durationTier: booking.durationTier,
      durationCount: Math.min(36, Math.max(1, Number(booking.durationCount) || 1)),
      unitRate: Math.min(500000, Math.max(1, Number(booking.unitRate) || 100)),
      securityDeposit: Math.min(100000, Math.max(0, Number(booking.securityDeposit) || 0)),
      estimatedRentalCost: Math.min(
        2000000,
        Math.max(1, Number(booking.estimatedRentalCost) || 100)
      ),
      studentUid: sanitizeId(studentUid),
      studentName: clampText(booking.studentName, 100, 'DGU Student'),
      hostelOrPg: clampText(booking.hostelOrPg, 140, 'DGU Hostel'),
      studentPhone: clampText(booking.studentPhone, 20, '9876543210'),
      pickupDate: /^\d{4}-\d{2}-\d{2}$/.test(booking.pickupDate)
        ? booking.pickupDate
        : new Date().toISOString().split('T')[0],
      notes: clampText(booking.notes, 400, ''),
      status: 'Pending Confirmation',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBookingStatusInFirestore(
  requestId: string,
  status: BookingStatus
): Promise<void> {
  const safeId = sanitizeId(requestId);
  const path = `bookings/${safeId}`;
  try {
    await updateDoc(doc(db, 'bookings', safeId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function syncUserPublicProfile(
  user: User,
  themePreference: ThemeMode
): Promise<ThemeMode> {
  const safeUid = sanitizeId(user.uid);
  const publicPath = `users/${safeUid}`;
  const privatePath = `users/${safeUid}/private/profile`;

  try {
    const userRef = doc(db, 'users', safeUid);
    const snap = await getDoc(userRef);

    let resolvedTheme = themePreference;
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: safeUid,
        displayName: clampText(user.displayName || 'DGU Student', 100, 'DGU Student'),
        photoURL: clampText(user.photoURL || '', 500, ''),
        themePreference,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const existingData = snap.data();
      if (
        existingData.themePreference === 'light' ||
        existingData.themePreference === 'dark'
      ) {
        resolvedTheme = existingData.themePreference;
      }
      await updateDoc(userRef, {
        displayName: clampText(user.displayName || 'DGU Student', 100, 'DGU Student'),
        photoURL: clampText(user.photoURL || '', 500, ''),
        updatedAt: serverTimestamp(),
      });
    }

    // Also ensure private profile email is recorded (strictly owner-isolated)
    const privateRef = doc(db, 'users', safeUid, 'private', 'profile');
    const privateSnap = await getDoc(privateRef);
    if (!privateSnap.exists()) {
      await setDoc(privateRef, {
        uid: safeUid,
        email: clampText(user.email || 'student@dgu.ac.in', 160, 'student@dgu.ac.in'),
        defaultHostelOrPg: '',
        defaultPhone: '',
        updatedAt: serverTimestamp(),
      });
    }

    return resolvedTheme;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${publicPath} | ${privatePath}`);
  }
}

export async function saveUserThemePreference(
  uid: string,
  themePreference: ThemeMode
): Promise<void> {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}`;
  try {
    await updateDoc(doc(db, 'users', safeUid), {
      themePreference,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function loadUserPrivateDefaults(uid: string): Promise<UserDefaults> {
  const safeUid = sanitizeId(uid);
  const path = `users/${safeUid}/private/profile`;
  try {
    const snap = await getDoc(doc(db, 'users', safeUid, 'private', 'profile'));
    if (!snap.exists()) {
      return { defaultHostelOrPg: '', defaultPhone: '' };
    }
    const data = snap.data();
    return {
      defaultHostelOrPg: String(data.defaultHostelOrPg ?? ''),
      defaultPhone: String(data.defaultPhone ?? ''),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserPrivateDefaults(
  user: User,
  hostelOrPg: string,
  phone: string
): Promise<void> {
  const safeUid = sanitizeId(user.uid);
  const path = `users/${safeUid}/private/profile`;
  try {
    await setDoc(
      doc(db, 'users', safeUid, 'private', 'profile'),
      {
        uid: safeUid,
        email: clampText(user.email || 'student@dgu.ac.in', 160, 'student@dgu.ac.in'),
        defaultHostelOrPg: clampText(hostelOrPg, 140, ''),
        defaultPhone: clampText(phone, 20, ''),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
