'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Home, MapPin, DollarSign,
  User, Image as ImageIcon, CheckCircle, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PROPERTY_CATEGORIES, TRANSACTION_TYPES, AREA_UNITS,
  SELLER_TYPES, FURNISHING_TYPES, BHK_TYPES, POPULAR_CITIES, INDIAN_STATES
} from '@/lib/constants';

export default function AdminAddPropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    transaction_type: 'sale',
    category_slug: 'apartments',
    price: '',
    price_unit: 'total',
    negotiable: false,
    area: '',
    area_unit: 'sqft',
    state: '',
    city: '',
    locality: '',
    address_line: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    total_floors: '',
    furnishing: '',
    parking: '',
    facing: '',
    age: '',
    seller_name: '',
    seller_phone: '',
    seller_type: 'owner',
    status: 'published',
    is_featured: false,
    is_verified: false,
    image_urls: '',
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const slug = form.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') + '-' + Date.now().toString(36);
      const images = form.image_urls.split('\n').map(u => u.trim()).filter(Boolean);
      const body = {
        title: form.title,
        slug,
        description: form.description,
        transaction_type: form.transaction_type,
        category_id: form.category_slug,
        price: Number(form.price),
        price_unit: form.price_unit,
        negotiable: form.negotiable,
        area: Number(form.area),
        area_unit: form.area_unit,
        address_line: form.address_line,
        seller_name: form.seller_name,
        seller_phone: form.seller_phone,
        seller_type: form.seller_type,
        status: form.status,
        is_featured: form.is_featured,
        is_verified: form.is_verified,
        show_exact_location: false,
        views_count: 0,
        enquiries_count: 0,
        listing_id: 'QK-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        attributes: {
          bedrooms: form.bedrooms,
          bathrooms: form.bathrooms,
          floor: form.floor,
          total_floors: form.total_floors,
          furnishing: form.furnishing,
          parking: form.parking,
          facing: form.facing,
          age: form.age,
        },
        media: images.map((url, i) => ({ url, type: 'image', sort_order: i, is_primary: i === 0 })),
      };

      const res = await fetch('/api/admin/add-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add property');
      setSaved(true);
      setTimeout(() => router.push('/admin/listings'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/listings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-slate-900">Add New Property</h1>
            <p className="text-sm text-slate-500">Admin — publish directly to the website</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/listings" className="btn-secondary btn-md">Cancel</Link>
          <button
            type="submit"
            form="add-property-form"
            disabled={saving}
            className="btn-primary btn-md"
          >
            {saving ? 'Saving…' : saved ? '✓ Saved!' : <><Save className="w-4 h-4" />Save Property</>}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
        </div>
      )}
      {saved && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />Property saved! Redirecting to listings…
        </div>
      )}

      <form id="add-property-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 space-y-6">

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-brand-600" />Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Property Title *</label>
              <input required className="input" placeholder="e.g. 3 BHK Luxury Apartment in Whitefield, Bangalore" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label className="label">Transaction Type *</label>
              <select required className="input" value={form.transaction_type} onChange={e => set('transaction_type', e.target.value)}>
                {TRANSACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Category *</label>
              <select required className="input" value={form.category_slug} onChange={e => set('category_slug', e.target.value)}>
                {PROPERTY_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input min-h-[120px] resize-y" placeholder="Describe the property — location advantages, amenities, nearby landmarks…" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Price & Area */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-600" />Price & Area
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Price *</label>
              <input required type="number" min="0" className="input" placeholder="e.g. 8500000" value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
            <div>
              <label className="label">Price Unit</label>
              <select className="input" value={form.price_unit} onChange={e => set('price_unit', e.target.value)}>
                <option value="total">Total Price</option>
                <option value="per_sqft">Per Sq.Ft</option>
                <option value="per_month">Per Month</option>
                <option value="per_year">Per Year</option>
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.negotiable} onChange={e => set('negotiable', e.target.checked)} />
                <span className="text-sm text-slate-700">Price Negotiable</span>
              </label>
            </div>
            <div>
              <label className="label">Area *</label>
              <input required type="number" min="0" className="input" placeholder="e.g. 1650" value={form.area} onChange={e => set('area', e.target.value)} />
            </div>
            <div>
              <label className="label">Area Unit</label>
              <select className="input" value={form.area_unit} onChange={e => set('area_unit', e.target.value)}>
                {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600" />Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">State *</label>
              <select required className="input" value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select State</option>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">City *</label>
              <input required className="input" list="cities-list" placeholder="e.g. Bangalore" value={form.city} onChange={e => set('city', e.target.value)} />
              <datalist id="cities-list">{POPULAR_CITIES.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className="label">Locality / Area</label>
              <input className="input" placeholder="e.g. Whitefield, Koramangala" value={form.locality} onChange={e => set('locality', e.target.value)} />
            </div>
            <div className="md:col-span-3">
              <label className="label">Full Address</label>
              <input className="input" placeholder="Building name, street, landmark…" value={form.address_line} onChange={e => set('address_line', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4">Property Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Bedrooms</label>
              <select className="input" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
                <option value="">Select</option>
                {BHK_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Bathrooms</label>
              <select className="input" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}>
                <option value="">Select</option>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Floor No.</label>
              <input type="number" min="0" className="input" placeholder="e.g. 7" value={form.floor} onChange={e => set('floor', e.target.value)} />
            </div>
            <div>
              <label className="label">Total Floors</label>
              <input type="number" min="1" className="input" placeholder="e.g. 14" value={form.total_floors} onChange={e => set('total_floors', e.target.value)} />
            </div>
            <div>
              <label className="label">Furnishing</label>
              <select className="input" value={form.furnishing} onChange={e => set('furnishing', e.target.value)}>
                <option value="">Select</option>
                {FURNISHING_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Parking</label>
              <select className="input" value={form.parking} onChange={e => set('parking', e.target.value)}>
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="open">Open</option>
                <option value="covered">Covered</option>
                <option value="2 cars">2 Cars</option>
                <option value="3 cars">3 Cars</option>
              </select>
            </div>
            <div>
              <label className="label">Facing</label>
              <select className="input" value={form.facing} onChange={e => set('facing', e.target.value)}>
                <option value="">Select</option>
                {['East','West','North','South','North-East','North-West','South-East','South-West'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Property Age</label>
              <select className="input" value={form.age} onChange={e => set('age', e.target.value)}>
                <option value="">Select</option>
                <option value="New">New / Under Construction</option>
                <option value="1 year">Less than 1 year</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5-10 years">5-10 years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-2 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-600" />Property Images
          </h2>
          <p className="text-sm text-slate-500 mb-4">Enter one image URL per line (from Unsplash, Cloudinary, or any direct image link)</p>
          <textarea
            className="input min-h-[120px] font-mono text-xs resize-y"
            placeholder={`https://images.unsplash.com/photo-xxx?w=800\nhttps://images.unsplash.com/photo-yyy?w=800`}
            value={form.image_urls}
            onChange={e => set('image_urls', e.target.value)}
          />
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />Seller Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Seller Name *</label>
              <input required className="input" placeholder="Full name" value={form.seller_name} onChange={e => set('seller_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input required className="input" placeholder="10-digit mobile" maxLength={10} value={form.seller_phone} onChange={e => set('seller_phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Seller Type</label>
              <select className="input" value={form.seller_type} onChange={e => set('seller_type', e.target.value)}>
                {SELLER_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4">Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Listing Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="published">Published (Live on website)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="pending">Pending Review</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="flex items-end pb-1 gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
                <span className="text-sm text-slate-700">⭐ Featured Listing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.is_verified} onChange={e => set('is_verified', e.target.checked)} />
                <span className="text-sm text-slate-700">✅ Verified</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/admin/listings" className="btn-secondary btn-lg">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary btn-lg">
            {saving ? 'Saving…' : <><Save className="w-5 h-5" />Save & Publish Property</>}
          </button>
        </div>

      </form>
    </div>
  );
}
