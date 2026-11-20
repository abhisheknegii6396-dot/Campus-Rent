import { User } from 'firebase/auth';
import {
  CalendarCheck,
  Compass,
  LogOut,
  Moon,
  Scale,
  Store,
  Sun,
} from 'lucide-react';
import { AppView, StudentTab, ThemeMode } from '../types';

interface NavbarProps {
  appView: AppView;
  studentTab: StudentTab;
  compareCount: number;
  bookingsCount: number;
  pendingProviderCount: number;
  theme: ThemeMode;
  user: User | null;
  authLoading: boolean;
  onToggleTheme: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onChangeAppView: (view: AppView) => void;
  onChangeStudentTab: (tab: StudentTab) => void;
  onOpenCompare: () => void;
}

export function Navbar({
  appView,
  studentTab,
  compareCount,
  bookingsCount,
  pendingProviderCount,
  theme,
  user,
  authLoading,
  onToggleTheme,
  onSignIn,
  onSignOut,
  onChangeAppView,
  onChangeStudentTab,
  onOpenCompare,
}: NavbarProps) {
  const handleExploreClick = () => {
    onChangeAppView('student');
    onChangeStudentTab('explore');
  };

  const handleBookingsClick = () => {
    onChangeAppView('student');
    onChangeStudentTab('bookings');
  };

  const firstName = user?.displayName?.split(' ')[0] || 'Student';

  return (
    <>
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-6">
          {/* Zone 1: Single-element brand wordmark */}
          <button
            type="button"
            onClick={handleExploreClick}
            className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#1E3A8A] dark:text-blue-400 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A] rounded-md px-1 -ml-1 cursor-pointer"
          >
            CampusRent
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-6 text-sm font-medium"
          >
            <button
              type="button"
              onClick={handleExploreClick}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                appView === 'student' && studentTab === 'explore'
                  ? 'text-[#1E3A8A] dark:text-blue-400 border-[#1E3A8A] dark:border-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Explore Rentals
            </button>
            <button
              type="button"
              onClick={onOpenCompare}
              className="py-1 whitespace-nowrap shrink-0 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border-b-2 border-transparent transition-colors cursor-pointer tabular-nums"
            >
              Compare ({compareCount}/3)
            </button>
            <button
              type="button"
              onClick={handleBookingsClick}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 tabular-nums ${
                appView === 'student' && studentTab === 'bookings'
                  ? 'text-[#1E3A8A] dark:text-blue-400 border-[#1E3A8A] dark:border-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              My Bookings ({bookingsCount})
            </button>
          </nav>

          {/* Zone 3: Workspace toggle, theme toggle & Google Auth */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="flex items-center p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-xl shrink-0"
              role="group"
              aria-label="Workspace mode toggle"
            >
              <button
                type="button"
                onClick={() => onChangeAppView('student')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  appView === 'student'
                    ? 'bg-[#1E3A8A] dark:bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Student View
              </button>
              <button
                type="button"
                onClick={() => onChangeAppView('provider')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                  appView === 'provider'
                    ? 'bg-[#1E3A8A] dark:bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Provider Portal{pendingProviderCount > 0 ? ` (${pendingProviderCount})` : ''}
              </button>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {authLoading ? (
              <div className="h-9 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
            ) : user ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={firstName}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center">
                      {firstName[0]?.toUpperCase()}
                    </span>
                  )}
                  <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                    {firstName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onSignOut}
                  aria-label="Sign out"
                  title="Sign out"
                  className="min-h-[38px] min-w-[38px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="min-h-[38px] sm:min-h-[40px] px-3 py-1.5 rounded-xl bg-[#0D9488] hover:bg-[#0b7f75] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 grid grid-cols-4 items-center px-1"
      >
        <button
          type="button"
          onClick={handleExploreClick}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
            appView === 'student' && studentTab === 'explore'
              ? 'text-[#1E3A8A] dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" strokeWidth={2} />
          <span className="text-[11px] font-medium whitespace-nowrap">Explore</span>
        </button>

        <button
          type="button"
          onClick={onOpenCompare}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
            compareCount > 0 ? 'text-[#0D9488] dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Scale className="w-5 h-5" strokeWidth={2} />
          <span className="text-[11px] font-medium whitespace-nowrap tabular-nums">
            Compare ({compareCount})
          </span>
        </button>

        <button
          type="button"
          onClick={handleBookingsClick}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
            appView === 'student' && studentTab === 'bookings'
              ? 'text-[#1E3A8A] dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <CalendarCheck className="w-5 h-5" strokeWidth={2} />
          <span className="text-[11px] font-medium whitespace-nowrap tabular-nums">
            Bookings ({bookingsCount})
          </span>
        </button>

        <button
          type="button"
          onClick={() => onChangeAppView('provider')}
          className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
            appView === 'provider' ? 'text-[#1E3A8A] dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Store className="w-5 h-5" strokeWidth={2} />
          <span className="text-[11px] font-medium whitespace-nowrap tabular-nums">
            Provider{pendingProviderCount > 0 ? ` (${pendingProviderCount})` : ''}
          </span>
        </button>
      </nav>
    </>
  );
}
