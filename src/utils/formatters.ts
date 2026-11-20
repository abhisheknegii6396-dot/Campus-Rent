import { BookingRequest, DurationTier, RentalItem } from '../types';

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function getRateForTier(item: RentalItem, tier: DurationTier): number {
  switch (tier) {
    case 'Daily':
      return item.rates.daily;
    case 'Weekly':
      return item.rates.weekly;
    case 'Monthly':
      return item.rates.monthly;
  }
}

export function getTierUnitLabel(tier: DurationTier, count = 1): string {
  if (tier === 'Daily') return count === 1 ? 'day' : 'days';
  if (tier === 'Weekly') return count === 1 ? 'week' : 'weeks';
  return count === 1 ? 'month' : 'months';
}

export function getTierShortLabel(tier: DurationTier): string {
  switch (tier) {
    case 'Daily':
      return 'day';
    case 'Weekly':
      return 'wk';
    case 'Monthly':
      return 'mo';
  }
}

export function generateRequestId(existingIds: string[]): string {
  let nextNum = 1042;
  const used = new Set(existingIds);
  while (used.has(`CR-DGU-${nextNum}`)) {
    nextNum += 1;
  }
  return `CR-DGU-${nextNum}`;
}

export function buildWhatsAppMessage(booking: BookingRequest): string {
  const unitWord = getTierUnitLabel(booking.durationTier, booking.durationCount);
  return [
    `Hi ${booking.providerName}, I just submitted a rental request on CampusRent (DGU Dehradun)!`,
    ``,
    `Request ID: ${booking.requestId}`,
    `Item: ${booking.itemTitle}`,
    `Duration: ${booking.durationCount} ${unitWord} (${formatINR(booking.unitRate)}/${getTierShortLabel(booking.durationTier)})`,
    `Estimated Rental: ${formatINR(booking.estimatedRentalCost)}`,
    booking.securityDeposit > 0
      ? `Refundable Deposit: ${formatINR(booking.securityDeposit)}`
      : `Security Deposit: Zero Deposit`,
    `Pickup Date: ${booking.pickupDate}`,
    `Pickup Point: ${booking.pickupLandmark}`,
    ``,
    `Student: ${booking.studentName}`,
    `Hostel / PG: ${booking.hostelOrPg}`,
    `Phone: ${booking.studentPhone}`,
    booking.notes ? `Note: ${booking.notes}` : null,
    ``,
    `Please confirm availability for pickup.`,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

export function buildWhatsAppUrl(booking: BookingRequest): string {
  const cleanPhone = booking.providerPhone.replace(/\D/g, '');
  const text = encodeURIComponent(buildWhatsAppMessage(booking));
  return `https://wa.me/${cleanPhone}?text=${text}`;
}

export function getTomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}
