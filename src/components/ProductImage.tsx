import { useState } from 'react';
import {
  Bike,
  Camera,
  LampDesk,
  Package,
  Refrigerator,
  Trophy,
} from 'lucide-react';
import { RentalCategory } from '../types';

interface ProductImageProps {
  src: string;
  alt: string;
  category: RentalCategory;
  className?: string;
}

function getCategoryIcon(category: RentalCategory) {
  switch (category) {
    case 'Bikes & Scooters':
      return Bike;
    case 'Electronics':
      return Camera;
    case 'Appliances':
      return Refrigerator;
    case 'Furniture':
      return LampDesk;
    case 'Sports Equipment':
      return Trophy;
    case 'Hostel Essentials':
    default:
      return Package;
  }
}

export function ProductImage({
  src,
  alt,
  category,
  className = '',
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const Icon = getCategoryIcon(category);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/70 dark:from-slate-800 dark:via-slate-900 dark:to-blue-950/50 text-slate-500 dark:text-slate-400 p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-[#1E3A8A] dark:text-blue-400 mb-2 shadow-xs">
          <Icon className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 line-clamp-1 max-w-[180px]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
