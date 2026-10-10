export default function PropertyCardSkeleton({ view = 'grid' }: { view?: 'grid' | 'list' }) {
  if (view === 'list') {
    return (
      <div className="card flex flex-col sm:flex-row overflow-hidden animate-pulse">
        <div className="skeleton w-full sm:w-64 h-48 sm:h-full flex-shrink-0 rounded-none" />
        <div className="flex-1 p-5 space-y-3">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          <div className="flex gap-3"><div className="skeleton h-4 w-16 rounded" /><div className="skeleton h-4 w-12 rounded" /></div>
          <div className="flex justify-between items-end pt-4">
            <div className="skeleton h-7 w-28 rounded" />
            <div className="flex gap-2"><div className="skeleton h-8 w-20 rounded-xl" /><div className="skeleton h-8 w-16 rounded-xl" /></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="skeleton h-52 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between"><div className="skeleton h-6 w-24 rounded" /><div className="skeleton h-5 w-16 rounded-full" /></div>
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="flex gap-3"><div className="skeleton h-3 w-16 rounded" /><div className="skeleton h-3 w-12 rounded" /></div>
        <div className="border-t border-slate-100 pt-3 flex justify-between"><div className="skeleton h-3 w-20 rounded" /><div className="skeleton h-3 w-12 rounded" /></div>
        <div className="flex gap-2"><div className="skeleton h-9 flex-1 rounded-xl" /><div className="skeleton h-9 flex-1 rounded-xl" /></div>
      </div>
    </div>
  );
}
