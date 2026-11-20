# CampusRent Security Specification (Payload-First TDD)

## 1. Data Invariants
1. **Default-Deny Catch-All**: All paths not explicitly matched deny both read and write.
2. **Listing Ownership & Integrity**:
   - Every listing requires `ownerUid == request.auth.uid`, valid category/availability enums, bounded string lengths, positive rates, and server timestamps (`createdAt == request.time`, `updatedAt == request.time`).
   - Only the listing owner (`ownerUid == request.auth.uid`) or a verified admin (`isAdmin()`) may update or delete a listing.
3. **Booking Relational & Temporal Integrity**:
   - Every booking request requires a verified Google account (`request.auth.token.email_verified == true`), `studentUid == request.auth.uid`, `status == 'Pending Confirmation'` on creation, server timestamps (`request.time`), and `exists(/databases/$(database)/documents/listings/$(incoming().itemId))`.
   - `providerUid` on creation must match the `ownerUid` stored on the referenced listing (`get(...).data.ownerUid == incoming().providerUid`).
   - PII Isolation: Only the student (`studentUid`), the listing provider (`providerUid`), or an admin (`isAdmin()`) can `get` or `list` booking documents.
   - Terminal State Locking: Once `status` reaches `Returned` or `Declined`, non-admin updates are blocked.
4. **User PII Split**:
   - `/users/{userId}` stores only non-PII display preferences; `/users/{userId}/private/{docId}` stores `email`, `defaultHostelOrPg`, and `defaultPhone`, strictly locked to `request.auth.uid == userId`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Listing Create**: Anonymous client writes to `/listings/cr-attack-1`.
2. **Identity Spoofing on Listing**: Authenticated user creates listing with `ownerUid: "someone-else"`.
3. **Ghost Field Shadow Injection**: Authenticated user adds `isAdminApproved: true` to `/listings/{id}`.
4. **ID Poisoning**: Client writes `/listings/${'a'.repeat(200)}` exceeding 128 chars or containing invalid symbols.
5. **Client Timestamp Forgery**: Booking create sends `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
6. **Orphan Booking**: Booking references `itemId: "non-existent-item"`.
7. **Provider Spoofing on Booking**: Student sets `providerUid` to their own UID when booking someone else's listing to self-approve.
8. **State Shortcutting on Booking Create**: Student submits booking with `status: "Approved"` instead of `"Pending Confirmation"`.
9. **Unauthorized Status Escalation**: Random authenticated student updates another student's booking to `"Approved"`.
10. **Terminal State Re-opening**: Provider attempts to change `"Returned"` booking back to `"Pending Confirmation"`.
11. **PII Scraping List Query**: Authenticated user runs `getDocs(collection(db, "bookings"))` without matching `studentUid`/`providerUid`.
12. **Private Profile Read/Write Intrusion**: User A attempts to read or overwrite `/users/userB/private/profile`.
