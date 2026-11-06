'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Permanently delete this listing? This cannot be undone — the ad and all its photos will be removed.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json() as { error?: string };
        alert(data.error ?? 'Failed to delete. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="Delete listing permanently"
      className="flex items-center justify-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap w-full bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      {loading
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : <Trash2 className="w-3 h-3" />
      }
      Delete
    </button>
  );
}
