import { FormEvent, useState } from 'react';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { HERO_IMAGE_URL } from '../data/initialListings';

interface HeroSectionProps {
  searchQuery: string;
  totalAvailableCount: number;
  onSearchChange: (value: string) => void;
  onExploreClick: () => void;
}

export function HeroSection({
  searchQuery,
  totalAvailableCount,
  onSearchChange,
  onExploreClick,
}: HeroSectionProps) {
  const [heroImageError, setHeroImageError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onExploreClick();
  };

  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 sm:pt-10 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Content Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#0D9488] dark:text-teal-400 mb-3">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>DBS Global University (DGU) · Dehradun Campus Corridor</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.14] text-balance max-w-2xl">
              Need something temporarily? Rent it near DGU campus instead of buying it.
            </h1>

            <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Compare verified scooters, hostel appliances, study desks, cameras, and weekend gear from trusted Prem Nagar and Sudhowala vendors—without hunting through WhatsApp groups.
            </p>

            {/* Quick Search & Primary CTA */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search Activa, mini fridge, DSLR, heater, study table..."
                  aria-label="Search campus rentals"
                  className="w-full h-12 pl-10 pr-4 bg-[#F8FAFC] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-400 focus:ring-2 focus:ring-[#1E3A8A]/15 dark:focus:ring-blue-400/20 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="h-12 px-5 bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore Rentals</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Media Column */}
          <div className="lg:col-span-5 flex">
            <div className="relative w-full aspect-[16/10] lg:aspect-auto lg:h-full min-h-[220px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              {!heroImageError ? (
                <img
                  src={HERO_IMAGE_URL}
                  alt="Students near DBS Global University campus gate in Dehradun with a scooter and bicycle"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImageError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1E3A8A] via-slate-800 to-[#0D9488] flex items-end p-6 text-white">
                  <div>
                    <p className="font-display text-lg font-bold">Prem Nagar & DGU Campus Hub</p>
                    <p className="text-sm text-slate-200 mt-1">
                      Short-term student rentals within 10 minutes of hostel gates.
                    </p>
                  </div>
                </div>
              )}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent pointer-events-none"
              />
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-white text-xs font-medium">
                <span>Prem Nagar · Sudhowala · Chakrata Rd</span>
                <span className="font-mono tabular-nums text-amber-300">
                  From ₹50/day
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Trust & Pilot Summary Strip */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <div className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {totalAvailableCount} Items Ready
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Verified local inventory near DGU
            </p>
          </div>
          <div>
            <div className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              0.3 – 3.2 km
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Walkable pickup from hostel gates
            </p>
          </div>
          <div>
            <div className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              Daily · Weekly · Monthly
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Transparent INR pricing & deposits
            </p>
          </div>
          <div>
            <div className="font-display text-lg sm:text-xl font-bold text-[#0D9488] dark:text-teal-400">
              WhatsApp Confirmation
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Instant request ticket, zero gateway fees
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
