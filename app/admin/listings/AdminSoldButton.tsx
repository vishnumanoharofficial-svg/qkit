'use client';

import { useState } from 'react';
import { BadgeCheck, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminSoldButton({
  id, currentStatus,
}: { id: string; currentStatus: string }) {
  const [status, setStatus]   = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const isSold = status === 'sold';

  async function toggle() {
    const next = isSold ? 'published' : 'sold';
    if (!isSold && !confirm('Mark this property as Sold? It will no longer show in active listings.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) setStatus(next);
      else alert('Failed to update. Please try again.');
    } catch {
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
        isSold
          ? 'bg-green-50 text-green-700 hover:bg-green-100'
          : 'bg-red-50 text-red-700 hover:bg-red-100'
      }`}
    >
      {loading
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : isSold
          ? <CheckCircle className="w-3 h-3" />
          : <BadgeCheck className="w-3 h-3" />
      }
      {isSold ? 'Re-list' : 'Mark Sold'}
    </button>
  );
}
