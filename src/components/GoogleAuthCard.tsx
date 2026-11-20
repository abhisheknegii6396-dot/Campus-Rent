import { ShieldCheck } from 'lucide-react';

interface GoogleAuthCardProps {
  title: string;
  description: string;
  isSigningIn: boolean;
  errorMessage?: string;
  onSignIn: () => void;
}

export function GoogleAuthCard({
  title,
  description,
  isSigningIn,
  errorMessage,
  onSignIn,
}: GoogleAuthCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-xl bg-[#1E3A8A]/10 dark:bg-blue-500/15 text-[#1E3A8A] dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
        <ShieldCheck className="w-6 h-6" />
      </div>

      <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
        {description}
      </p>

      {errorMessage && (
        <p className="mt-4 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl px-3 py-2">
          {errorMessage}
        </p>
      )}

      <button
        type="button"
        onClick={onSignIn}
        disabled={isSigningIn}
        className="mt-6 w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#172e6e] dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-3 transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#FFFFFF"
            d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
          />
        </svg>
        <span>{isSigningIn ? 'Signing in...' : 'Continue with Google'}</span>
      </button>
    </div>
  );
}
