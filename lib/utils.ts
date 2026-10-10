import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in Indian number system with lakh/crore notation
 */
export function formatIndianPrice(amount: number, unit: 'total' | 'per_sqft' | 'per_month' | 'per_year' = 'total'): string {
  if (!amount || isNaN(amount)) return 'Price on request';

  let formatted: string;
  let suffix = '';

  if (amount >= 10_000_000) {
    const crore = amount / 10_000_000;
    formatted = crore % 1 === 0 ? crore.toString() : crore.toFixed(2).replace(/\.?0+$/, '');
    suffix = ' Cr';
  } else if (amount >= 100_000) {
    const lakh = amount / 100_000;
    formatted = lakh % 1 === 0 ? lakh.toString() : lakh.toFixed(2).replace(/\.?0+$/, '');
    suffix = ' L';
  } else if (amount >= 1_000) {
    const thou = amount / 1_000;
    formatted = thou % 1 === 0 ? thou.toString() : thou.toFixed(1).replace(/\.?0+$/, '');
    suffix = 'K';
  } else {
    formatted = amount.toString();
  }

  const unitLabel = unit === 'per_sqft' ? '/sqft' : unit === 'per_month' ? '/mo' : unit === 'per_year' ? '/yr' : '';

  return `₹${formatted}${suffix}${unitLabel}`;
}

/**
 * Convert area between units
 */
export function convertArea(value: number, from: string, to: string): number {
  const toSqFt: Record<string, number> = {
    sqft:   1,
    sqmt:   10.7639,
    cent:   435.56,
    acre:   43560,
    ground: 2400,
    bigha:  26910,
    marla:  272.25,
  };
  const sqft = value * (toSqFt[from] || 1);
  return sqft / (toSqFt[to] || 1);
}

export function formatArea(value: number, unit: string): string {
  const unitLabels: Record<string, string> = {
    sqft:   'sq.ft',
    sqmt:   'sq.mt',
    cent:   'cent',
    acre:   'acre',
    ground: 'ground',
    bigha:  'bigha',
    marla:  'marla',
  };
  const rounded = value % 1 === 0 ? value.toString() : value.toFixed(2).replace(/\.?0+$/, '');
  return `${rounded} ${unitLabels[unit] || unit}`;
}

/**
 * Generate a unique human-readable listing ID like QK-ABC123
 */
export function generateListingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'QK-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

/**
 * Relative time (e.g. "2 days ago")
 */
export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60)   return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(str: string, max: number): string {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

/**
 * Build a WhatsApp enquiry URL
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/\D/g, '');
  const normalized = clean.startsWith('91') ? clean : `91${clean}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/**
 * Slugify a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function formatPhoneDisplay(phone: string): string {
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) return `+91 ${clean.slice(0,5)} ${clean.slice(5)}`;
  if (clean.length === 12 && clean.startsWith('91')) {
    return `+91 ${clean.slice(2,7)} ${clean.slice(7)}`;
  }
  return phone;
}

export function maskPhone(phone: string): string {
  if (!phone) return '';
  return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
}
