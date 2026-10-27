'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Save, Home, MapPin, DollarSign,
  User, Image as ImageIcon, CheckCircle, AlertCircle,
  Upload, X, Star, Loader2, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PROPERTY_CATEGORIES, TRANSACTION_TYPES, AREA_UNITS,
  SELLER_TYPES, FURNISHING_TYPES, BHK_TYPES,
} from '@/lib/constants';
import {
  BLOCKS_AND_PANCHAYATS,
  ALL_KOTTAYAM_LOCATIONS,
  MUNICIPALITIES,
  TALUKS,
} from '@/lib/constants/kottayam-locations';

interface UploadedImage {
  id?: string;          // existing DB media id
  url: string;          // final URL (CDN or blob)
  name: string;
  preview: string;      // local blob or same as url for existing
  uploading?: boolean;
  error?: string;
  isExisting?: boolean; // came from DB
}

type FormState = {
  title: string; description: string; transaction_type: string;
  category_slug: string; price: string; price_unit: string;
  negotiable: boolean; area: string; area_unit: string;
  taluk: string; city: string; locality: string; address_line: string;
  seller_name: string; seller_phone: string; seller_type: string;
  bedrooms: string; bathrooms: string; floor: string; total_floors: string;
  furnishing: string; parking: string; facing: string; age: string;
  status: string; is_featured: boolean; is_verified: boolean;
};

const EMPTY_FORM: FormState = {
  title: '', description: '', transaction_type: 'sale', category_slug: 'apartments',
  price: '', price_unit: 'total', negotiable: false, area: '', area_unit: 'sqft',
  taluk: '', city: '', locality: '', address_line: '',
  seller_name: '', seller_phone: '', seller_type: 'owner',
  bedrooms: '', bathrooms: '', floor: '', total_floors: '',
  furnishing: '', parking: '', facing: '', age: '',
  status: 'published', is_featured: false, is_verified: false,
};

export default function AdminEditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // ── Load existing listing data ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/listings/${id}`)
      .then(r => r.json())
      .then(({ listing }) => {
        if (!listing) { setNotFound(true); return; }

        const attrs = (listing.attributes as Record<string, string>) ?? {};

        setForm({
          title:            listing.title ?? '',
          description:      listing.description ?? '',
          transaction_type: listing.transaction_type ?? 'sale',
          category_slug:    listing.category_slug ?? 'apartments',
          price:            String(listing.price ?? ''),
          price_unit:       listing.price_unit ?? 'total',
          negotiable:       Boolean(listing.negotiable),
          area:             String(listing.area ?? ''),
          area_unit:        listing.area_unit ?? 'sqft',
          taluk:            listing.taluk ?? '',
          city:             listing.town_panchayat ?? listing.city ?? '',
          locality:         listing.locality ?? '',
          address_line:     listing.address_line ?? '',
          seller_name:      listing.seller_name ?? '',
          seller_phone:     listing.seller_phone ?? '',
          seller_type:      listing.seller_type ?? 'owner',
          bedrooms:         attrs.bedrooms  ?? '',
          bathrooms:        attrs.bathrooms ?? '',
          floor:            attrs.floor     ?? '',
          total_floors:     attrs.total_floors ?? '',
          furnishing:       attrs.furnishing ?? '',
          parking:          attrs.parking   ?? '',
          facing:           attrs.facing    ?? '',
          age:              attrs.age       ?? '',
          status:           listing.status  ?? 'published',
          is_featured:      Boolean(listing.is_featured),
          is_verified:      Boolean(listing.is_verified),
        });

        // Load existing media
        const media = (listing.media ?? []) as { id?: string; url: string; is_primary?: boolean; sort_order?: number }[];
        const sorted = [...media].sort((a, b) => {
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;
          return (a.sort_order ?? 0) - (b.sort_order ?? 0);
        });
        setImages(sorted.map(m => ({
          id: m.id,
          url: m.url,
          name: m.url.split('/').pop() ?? 'image',
          preview: m.url,
          isExisting: true,
        })));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Image upload ────────────────────────────────────────────────────────────
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json.url;
  }, []);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const valid = Array.from(files).filter(
      f => ['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type) && f.size <= 10*1024*1024
    );
    if (!valid.length) return;

    const placeholders: UploadedImage[] = valid.map(f => ({
      url: '', name: f.name, preview: URL.createObjectURL(f), uploading: true,
    }));
    setImages(prev => [...prev, ...placeholders]);

    for (let i = 0; i < valid.length; i++) {
      try {
        const url = await uploadFile(valid[i]);
        setImages(prev => prev.map(img =>
          img.preview === placeholders[i].preview
            ? { ...img, url: url ?? '', uploading: false }
            : img
        ));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setImages(prev => prev.map(img =>
          img.preview === placeholders[i].preview
            ? { ...img, uploading: false, error: msg }
            : img
        ));
      }
    }
  }, [uploadFile]);

  const removeImage = (index: number) => {
    setImages(prev => {
      const img = prev[index];
      if (img.isExisting && img.id) setRemovedMediaIds(r => [...r, img.id!]);
      if (!img.isExisting && img.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setPrimary = (index: number) => {
    setImages(prev => {
      const arr = [...prev];
      const [item] = arr.splice(index, 1);
      return [item, ...arr];
    });
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.some(i => i.uploading)) {
      setError('Please wait — images are still uploading'); return;
    }
    setSaving(true); setError('');
    try {
      // Remove media that was deleted
      if (removedMediaIds.length > 0) {
        await Promise.all(removedMediaIds.map(mid =>
          fetch(`/api/admin/listings/${id}/media/${mid}`, { method: 'DELETE' }).catch(() => {})
        ));
      }

      // New images (not existing)
      const newImageUrls = images
        .filter(i => !i.isExisting && i.url && !i.error)
        .map(i => i.url);

      const body = {
        title:            form.title,
        description:      form.description,
        transaction_type: form.transaction_type,
        category_slug:    form.category_slug,
        price:            Number(form.price),
        price_unit:       form.price_unit,
        negotiable:       form.negotiable,
        area:             Number(form.area),
        area_unit:        form.area_unit,
        taluk:            form.taluk,
        town_panchayat:   form.city,
        city:             form.city,
        locality:         form.locality,
        address_line:     form.address_line,
        seller_name:      form.seller_name,
        seller_phone:     form.seller_phone,
        seller_type:      form.seller_type,
        bedrooms:         form.bedrooms,
        bathrooms:        form.bathrooms,
        floor:            form.floor,
        total_floors:     form.total_floors,
        furnishing:       form.furnishing,
        parking:          form.parking,
        facing:           form.facing,
        age:              form.age,
        status:           form.status,
        is_featured:      form.is_featured,
        is_verified:      form.is_verified,
        image_urls:       newImageUrls,
        replace_images:   false,  // always append new; removals handled above
      };

      const res = await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Update failed');

      setSaved(true);
      setTimeout(() => router.push('/admin/listings'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const uploadingCount = images.filter(i => i.uploading).length;

  // ── Loading / Not Found ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-brand-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading property data…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-900 mb-2">Listing not found</p>
          <Link href="/admin/listings" className="text-brand-600 hover:underline">← Back to listings</Link>
        </div>
      </div>
    );
  }

  // ── Form UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin/listings" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-xl text-slate-900">Edit Property</h1>
            <p className="text-sm text-slate-500 truncate max-w-xs">{form.title || 'Loading…'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/listings" className="btn-secondary btn-md">Cancel</Link>
          <button
            type="submit"
            form="edit-property-form"
            disabled={saving || uploadingCount > 0}
            className="btn-primary btn-md"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4" />Saved!</>
            ) : uploadingCount > 0 ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Uploading {uploadingCount}…</>
            ) : (
              <><Save className="w-4 h-4" />Save Changes</>
            )}
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
          <CheckCircle className="w-5 h-5 flex-shrink-0" />Changes saved! Redirecting…
        </div>
      )}

      <form id="edit-property-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 space-y-6">

        {/* ── Basic Info ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-brand-600" />Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Property Title *</label>
              <input required className="input" value={form.title} onChange={e => set('title', e.target.value)} />
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
              <textarea className="input min-h-[120px] resize-y" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Images ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-1 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-600" />Property Images
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Existing images are shown. Remove any, add new ones. First image is the cover photo.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
              dragOver ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50'
            )}
          >
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              multiple className="hidden"
              onChange={e => e.target.files && handleFiles(e.target.files)} />
            <Upload className={cn('w-7 h-7 mx-auto mb-2', dragOver ? 'text-brand-600' : 'text-slate-400')} />
            <p className="font-medium text-slate-700 text-sm">{dragOver ? 'Drop images here' : 'Add more images'}</p>
            <p className="text-xs text-slate-400 mt-1">or <span className="text-brand-600 font-medium">click to browse</span> · JPG, PNG, WebP · Max 10 MB</p>
          </div>

          {uploadingCount > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-brand-600">
              <Loader2 className="w-4 h-4 animate-spin" />Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}…
            </div>
          )}

          {/* Image grid */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div
                  key={img.preview || img.url}
                  className={cn(
                    'relative group rounded-xl overflow-hidden border-2 aspect-[4/3] bg-slate-100',
                    index === 0 ? 'border-brand-500' : 'border-slate-200',
                    img.error ? 'border-red-300 bg-red-50' : ''
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview} alt={img.name}
                    className={cn('w-full h-full object-cover', img.uploading && 'opacity-50')} />

                  {img.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                    </div>
                  )}
                  {img.error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/90 p-2">
                      <AlertCircle className="w-5 h-5 text-red-500 mb-1" />
                      <p className="text-xs text-red-600 text-center">{img.error}</p>
                    </div>
                  )}

                  {/* Cover badge */}
                  {index === 0 && !img.uploading && !img.error && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-brand-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5 fill-current" />Cover
                    </div>
                  )}
                  {/* Existing badge */}
                  {img.isExisting && !img.uploading && !img.error && index !== 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-slate-700/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                      Saved
                    </div>
                  )}

                  {/* Hover controls */}
                  {!img.uploading && !img.error && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {index !== 0 && (
                        <button type="button" onClick={() => setPrimary(index)}
                          title="Set as cover" className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white transition-colors">
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => removeImage(index)}
                        title="Remove" className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-white transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {img.error && (
                    <button type="button" onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-white text-red-500 shadow">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-slate-50 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-brand-600">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Add more</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Price & Area ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-brand-600" />Price & Area
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Price *</label>
              <input required type="number" min="0" className="input" value={form.price} onChange={e => set('price', e.target.value)} />
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
              <input required type="number" min="0" className="input" value={form.area} onChange={e => set('area', e.target.value)} />
            </div>
            <div>
              <label className="label">Area Unit</label>
              <select className="input" value={form.area_unit} onChange={e => set('area_unit', e.target.value)}>
                {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Location ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600" />Location
          </h2>
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg text-sm text-brand-700">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span><strong>Phase 1:</strong> Properties accepted in <strong>Kottayam District, Kerala</strong> only.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">State</label>
              <input className="input bg-slate-50 text-slate-500 cursor-not-allowed" value="Kerala" readOnly />
            </div>
            <div>
              <label className="label">District</label>
              <input className="input bg-slate-50 text-slate-500 cursor-not-allowed" value="Kottayam" readOnly />
            </div>
            <div>
              <label className="label">Taluk *</label>
              <select required className="input" value={form.taluk} onChange={e => { set('taluk', e.target.value); set('city', ''); }}>
                <option value="">Select Taluk</option>
                {TALUKS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Town / Panchayat *</label>
              <select required className="input" value={form.city}
                onChange={e => set('city', e.target.value)} disabled={!form.taluk}>
                <option value="">{form.taluk ? 'Select Town / Panchayat' : 'Select a Taluk first'}</option>
                {form.taluk && (() => {
                  const munis = MUNICIPALITIES.filter(m => m.taluk === form.taluk);
                  const blocks = BLOCKS_AND_PANCHAYATS.filter(b => b.taluk === form.taluk);
                  return (
                    <>
                      {munis.length > 0 && (
                        <optgroup label="Municipalities">
                          {munis.map(m => (
                            <option key={m.name} value={m.name.replace(' Municipality', '')}>
                              {m.name.replace(' Municipality', '')} (Municipality)
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {blocks.map(b => (
                        <optgroup key={b.block} label={`${b.block} Block`}>
                          {b.panchayats.map(p => <option key={p} value={p}>{p}</option>)}
                        </optgroup>
                      ))}
                    </>
                  );
                })()}
              </select>
            </div>
            <div>
              <label className="label">Locality / Ward</label>
              <input className="input" list="locality-list" placeholder="e.g. Town Junction…"
                value={form.locality} onChange={e => set('locality', e.target.value)} />
              <datalist id="locality-list">
                {ALL_KOTTAYAM_LOCATIONS.map(l => <option key={l} value={l} />)}
              </datalist>
            </div>
            <div className="md:col-span-3">
              <label className="label">Full Address / Landmark</label>
              <input className="input" placeholder="House no., street, junction, landmark…"
                value={form.address_line} onChange={e => set('address_line', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Property Details ── */}
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
              <input type="number" min="0" className="input" placeholder="e.g. 7"
                value={form.floor} onChange={e => set('floor', e.target.value)} />
            </div>
            <div>
              <label className="label">Total Floors</label>
              <input type="number" min="1" className="input" placeholder="e.g. 14"
                value={form.total_floors} onChange={e => set('total_floors', e.target.value)} />
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
                {['none','open','covered','2 cars','3 cars'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Facing</label>
              <select className="input" value={form.facing} onChange={e => set('facing', e.target.value)}>
                <option value="">Select</option>
                {['East','West','North','South','North-East','North-West','South-East','South-West'].map(f =>
                  <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Property Age</label>
              <select className="input" value={form.age} onChange={e => set('age', e.target.value)}>
                <option value="">Select</option>
                {['New','1 year','1-3 years','3-5 years','5-10 years','10+ years'].map(v =>
                  <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Seller Info ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />Seller Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Seller Name *</label>
              <input required className="input" value={form.seller_name} onChange={e => set('seller_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone Number *</label>
              <input required className="input" maxLength={15} value={form.seller_phone} onChange={e => set('seller_phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Seller Type</label>
              <select className="input" value={form.seller_type} onChange={e => set('seller_type', e.target.value)}>
                {SELLER_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Admin Controls ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-4">Admin Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Listing Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="published">Published (Live)</option>
                <option value="pending">Pending Review</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="paused">Paused</option>
                <option value="rejected">Rejected</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div className="flex items-end pb-1 gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} />
                <span className="text-sm text-slate-700">⭐ Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.is_verified} onChange={e => set('is_verified', e.target.checked)} />
                <span className="text-sm text-slate-700">✅ Verified</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex justify-end gap-3 pb-8">
          <Link href="/admin/listings" className="btn-secondary btn-lg">Cancel</Link>
          <button type="submit" disabled={saving || uploadingCount > 0} className="btn-primary btn-lg">
            {saving
              ? <><Loader2 className="w-5 h-5 animate-spin" />Saving…</>
              : <><Save className="w-5 h-5" />Save Changes</>
            }
          </button>
        </div>

      </form>
    </div>
  );
}
