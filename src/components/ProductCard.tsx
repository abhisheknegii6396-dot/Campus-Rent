import { Check, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { DurationTier, RentalItem } from '../types';
import {
  formatINR,
  getRateForTier,
  getTierShortLabel,
} from '../utils/formatters';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  item: RentalItem;
  durationTier: DurationTier;
  isCompared: boolean;
  onToggleCompare: (item: RentalItem) => void;
  onOpenDetail: (item: RentalItem) => void;
}

export function ProductCard({
  item,
  durationTier,
  isCompared,
  onToggleCompare,
  onOpenDetail,
}: ProductCardProps) {
  const activeRate = getRateForTier(item, durationTier);
  const isAvailable = item.availability === 'Available Now';

  return (
    <article className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-slate-950/50">
      {/* Media Region */}
      <button
        type="button"
        onClick={() => onOpenDetail(item)}
        className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1E3A8A] dark:focus-visible:ring-blue-400"
      >
        <ProductImage
          src={item.imageUrl}
          alt={item.title}
          category={item.category}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </button>

      {/* Content Region */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="text-slate-500 dark:text-slate-400 truncate">
            <span className="font-medium text-slate-700 dark:text-slate-200">{item.category}</span>
            <span className="mx-1.5" aria-hidden="true">
              ·
            </span>
            <span className="tabular-nums">{item.distanceKm} km from DGU</span>
          </div>

          <span
            className={`inline-flex items-center gap-1 font-semibold whitespace-nowrap shrink-0 ${
              isAvailable
                ? 'text-[#0D9488] dark:text-teal-400'
                : 'text-[#B45309] dark:text-amber-400'
            }`}
          >
            {isAvailable ? (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <Clock className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{item.availability}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-2 font-display text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">
          <button
            type="button"
            onClick={() => onOpenDetail(item)}
            className="text-left hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors cursor-pointer focus:outline-none focus-visible:underline"
          >
            {item.title}
          </button>
        </h3>

        {/* Verified Provider Line */}
        <div className="mt-1 mb-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          {item.provider.verified && (
            <ShieldCheck
              className="w-3.5 h-3.5 text-[#0D9488] dark:text-teal-400 shrink-0"
              aria-label="Verified Provider"
            />
          )}
          <span className="truncate">
            {item.provider.name} · Verified Provider
          </span>
        </div>

        {/* Bottom Price & Action Footer */}
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatINR(activeRate)}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                /{getTierShortLabel(durationTier)}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              {item.securityDeposit > 0
                ? `Deposit ${formatINR(item.securityDeposit)}`
                : 'Zero deposit'}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleCompare(item)}
              aria-pressed={isCompared}
              className={`min-h-[40px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                isCompared
                  ? 'bg-[#0D9488]/10 dark:bg-teal-500/15 border-[#0D9488] dark:border-teal-400 text-[#0D9488] dark:text-teal-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  isCompared
                    ? 'bg-[#0D9488] border-[#0D9488] text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'
                }`}
              >
                {isCompared && <Check className="w-3 h-3" strokeWidth={3} />}
              </span>
              <span>Compare</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenDetail(item)}
              className="min-h-[40px] px-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
            >
              {isAvailable ? 'Book Now' : 'View'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
