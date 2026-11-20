import { CheckCircle2, Clock, Scale, ShieldCheck, X } from 'lucide-react';
import { RentalItem } from '../types';
import { formatINR } from '../utils/formatters';
import { ProductImage } from './ProductImage';

interface CompareTrayProps {
  items: RentalItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onOpenModal: () => void;
}

export function CompareTray({
  items,
  onRemoveItem,
  onClearAll,
  onOpenModal,
}: CompareTrayProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-5 left-3 right-3 md:left-auto md:right-6 z-30 md:max-w-xl bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-xl border border-slate-800 dark:border-slate-700 px-3.5 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar">
        <Scale className="w-4 h-4 text-[#0D9488] dark:text-teal-400 shrink-0" />
        <div className="flex items-center gap-1.5 min-w-0">
          {items.map((item) => (
            <div
              key={item.id}
              className="inline-flex items-center gap-1.5 bg-slate-800 dark:bg-slate-900 rounded-lg pl-2 pr-1 py-1 text-xs shrink-0"
            >
              <span className="truncate max-w-[90px] sm:max-w-[120px] font-medium">
                {item.title}
              </span>
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`Remove ${item.title} from comparison`}
                className="w-5 h-5 rounded hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-slate-400 hover:text-white px-2 py-1.5 cursor-pointer whitespace-nowrap"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onOpenModal}
          disabled={items.length < 2}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            items.length >= 2
              ? 'bg-[#0D9488] hover:bg-[#0b7f75] text-white cursor-pointer'
              : 'bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {items.length < 2
            ? 'Pick 1 More'
            : `Compare (${items.length}/3)`}
        </button>
      </div>
    </div>
  );
}

interface CompareModalProps {
  isOpen: boolean;
  items: RentalItem[];
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onSelectForBooking: (item: RentalItem) => void;
}

export function CompareModal({
  isOpen,
  items,
  onClose,
  onRemoveItem,
  onSelectForBooking,
}: CompareModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-5xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h2
              id="compare-modal-title"
              className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              Side-by-Side Rental Comparison
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Compare rates, deposits, campus distance, and provider turnaround before requesting.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <Scale className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="font-display text-base font-semibold text-slate-800 dark:text-slate-200">
                No items selected for comparison
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                Click the Compare checkbox on 2 or 3 rental cards in the catalog to evaluate them side by side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 align-top">
                    <th className="w-40 py-3 pr-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Rental Item
                    </th>
                    {items.map((item) => (
                      <th key={item.id} className="w-60 py-3 px-3 font-normal">
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 mb-3">
                          <ProductImage
                            src={item.imageUrl}
                            alt={item.title}
                            category={item.category}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            aria-label={`Remove ${item.title}`}
                            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.category}
                        </div>
                        <div className="font-display text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                          {item.title}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Availability
                    </td>
                    {items.map((item) => {
                      const avail = item.availability === 'Available Now';
                      return (
                        <td key={item.id} className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                              avail
                                ? 'text-[#0D9488] dark:text-teal-400'
                                : 'text-[#B45309] dark:text-amber-400'
                            }`}
                          >
                            {avail ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                            {item.availability}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Daily Rate
                    </td>
                    {items.map((item) => (
                      <td
                        key={item.id}
                        className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums"
                      >
                        {formatINR(item.rates.daily)} / day
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Weekly Rate
                    </td>
                    {items.map((item) => (
                      <td
                        key={item.id}
                        className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums"
                      >
                        {formatINR(item.rates.weekly)} / wk
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Monthly Rate
                    </td>
                    {items.map((item) => (
                      <td
                        key={item.id}
                        className="py-3 px-3 font-mono font-semibold text-[#1E3A8A] dark:text-blue-400 tabular-nums"
                      >
                        {formatINR(item.rates.monthly)} / mo
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Security Deposit
                    </td>
                    {items.map((item) => (
                      <td
                        key={item.id}
                        className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 tabular-nums"
                      >
                        {item.securityDeposit > 0
                          ? `${formatINR(item.securityDeposit)} (Refundable)`
                          : 'Zero Deposit'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Distance from DGU
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                          {item.distanceKm} km
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.pickupLandmark}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Condition
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="py-3 px-3 text-xs text-slate-700 dark:text-slate-300">
                        {item.condition}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Key Specs
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="py-3 px-3">
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                          {item.specs.slice(0, 3).map((spec) => (
                            <li key={spec}>• {spec}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      Provider
                    </td>
                    {items.map((item) => (
                      <td key={item.id} className="py-3 px-3">
                        <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-slate-100 text-xs">
                          {item.provider.verified && (
                            <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488] dark:text-teal-400 shrink-0" />
                          )}
                          <span>{item.provider.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.provider.responseTime}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 pr-4" />
                    {items.map((item) => (
                      <td key={item.id} className="py-4 px-3">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectForBooking(item);
                          }}
                          className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Request Booking
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
