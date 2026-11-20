import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  AvailabilityStatus,
  CategoryFilter,
  DurationTier,
  SortOption,
} from '../types';
import { formatINR } from '../utils/formatters';

export const CATEGORY_OPTIONS: CategoryFilter[] = [
  'All',
  'Bikes & Scooters',
  'Electronics',
  'Appliances',
  'Furniture',
  'Sports Equipment',
  'Hostel Essentials',
];

interface CatalogControlsProps {
  selectedCategory: CategoryFilter;
  availabilityFilter: 'All' | AvailabilityStatus;
  durationTier: DurationTier;
  maxPrice: number;
  priceCeiling: number;
  maxDistanceKm: number;
  sortBy: SortOption;
  resultCount: number;
  onCategoryChange: (cat: CategoryFilter) => void;
  onAvailabilityChange: (status: 'All' | AvailabilityStatus) => void;
  onDurationTierChange: (tier: DurationTier) => void;
  onMaxPriceChange: (price: number) => void;
  onMaxDistanceChange: (km: number) => void;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
}

export function CatalogControls({
  selectedCategory,
  availabilityFilter,
  durationTier,
  maxPrice,
  priceCeiling,
  maxDistanceKm,
  sortBy,
  resultCount,
  onCategoryChange,
  onAvailabilityChange,
  onDurationTierChange,
  onMaxPriceChange,
  onMaxDistanceChange,
  onSortChange,
  onResetFilters,
}: CatalogControlsProps) {
  const hasActiveFilters =
    selectedCategory !== 'All' ||
    availabilityFilter !== 'All' ||
    maxPrice < priceCeiling ||
    maxDistanceKm < 10;

  return (
    <div className="space-y-4">
      {/* Category Filter Pills (Interactive Filter Controls) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORY_OPTIONS.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                isActive
                  ? 'bg-[#1E3A8A] dark:bg-blue-600 text-white border-[#1E3A8A] dark:border-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Filter & Sort Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <SlidersHorizontal className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
            <span>Filter & Rate Preferences</span>
            <span className="text-slate-400 font-normal">·</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              Showing {resultCount} {resultCount === 1 ? 'listing' : 'listings'}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 hover:text-[#0D9488] dark:hover:text-teal-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
          {/* Duration Tier Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Pricing Tier
            </label>
            <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {(['Daily', 'Weekly', 'Monthly'] as DurationTier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onDurationTierChange(tier)}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    durationTier === tier
                      ? 'bg-white dark:bg-slate-900 text-[#1E3A8A] dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <label
              htmlFor="filter-availability"
              className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Availability
            </label>
            <select
              id="filter-availability"
              value={availabilityFilter}
              onChange={(e) =>
                onAvailabilityChange(e.target.value as 'All' | AvailabilityStatus)
              }
              className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
            >
              <option value="All">All Statuses</option>
              <option value="Available Now">Available Now</option>
              <option value="Booked">Currently Booked</option>
            </select>
          </div>

          {/* Max Price Range */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="filter-price" className="font-medium text-slate-500 dark:text-slate-400">
                Max {durationTier} Rate
              </label>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {maxPrice >= priceCeiling ? `${formatINR(priceCeiling)}+` : formatINR(maxPrice)}
              </span>
            </div>
            <input
              id="filter-price"
              type="range"
              min={100}
              max={priceCeiling}
              step={durationTier === 'Daily' ? 50 : 100}
              value={Math.min(maxPrice, priceCeiling)}
              onChange={(e) => onMaxPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1E3A8A] dark:accent-blue-500 mt-2"
            />
          </div>

          {/* Distance from DGU Campus */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="filter-distance" className="font-medium text-slate-500 dark:text-slate-400">
                Distance from DGU
              </label>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {maxDistanceKm >= 10 ? 'Up to 10 km' : `Within ${maxDistanceKm} km`}
              </span>
            </div>
            <input
              id="filter-distance"
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={maxDistanceKm}
              onChange={(e) => onMaxDistanceChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0D9488] dark:accent-teal-400 mt-2"
            />
          </div>

          {/* Sort By */}
          <div>
            <label
              htmlFor="filter-sort"
              className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5"
            >
              Sort Listings
            </label>
            <select
              id="filter-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400"
            >
              <option value="nearest">Nearest to DGU Campus</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
