'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Save, Home, MapPin, DollarSign,
  User, Image as ImageIcon, CheckCircle, AlertCircle,
  Upload, X, Star, Loader2
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
  DISTRICT,
  STATE,
} from '@/lib/constants/kottayam-locations';

interface UploadedImage {
  url: string;
  name: string;
  preview: string;  // local object URL for display
  uploading?: boolean;
  error?: string;
}

export default function AdminAddPropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);

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
    state: 'Kerala',
    district: 'Kottayam',
    taluk: '',
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
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  // Upload a single file to the API
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData,
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Upload failed');
    return json.url;
  }, []);

  // Process dropped / selected files
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter(f => {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) return false;
      if (f.size > 10 * 1024 * 1024) return false;
      return true;
    });

    if (valid.length === 0) return;

    // Add placeholders with uploading state
    const placeholders: UploadedImage[] = valid.map(f => ({
      url: '',
      name: f.name,
      preview: URL.createObjectURL(f),
      uploading: true,
    }));

    setImages(prev => [...prev, ...placeholders]);

    // Upload each file
    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      try {
        const url = await uploadFile(file);
        setImages(prev =>
          prev.map(img =>
            img.preview === placeholders[i].preview
              ? { ...img, url: url || '', uploading: false }
              : img
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setImages(prev =>
          prev.map(img =>
            img.preview === placeholders[i].preview
              ? { ...img, uploading: false, error: msg }
              : img
          )
        );
      }
    }
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeImage = (index: number) => {
    setImages(prev => {
      const img = prev[index];
      if (img.preview) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setPrimary = (index: number) => {
    setImages(prev => {
      const newArr = [...prev];
      const [item] = newArr.splice(index, 1);
      return [item, ...newArr];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Check if any images are still uploading
      if (images.some(img => img.uploading)) {
        throw new Error('Please wait — images are still uploading');
      }

      const successfulImages = images.filter(img => img.url && !img.error);
      const imageUrls = successfulImages.map(img => img.url);

      const body = {
        title: form.title,
        description: form.description,
        transaction_type: form.transaction_type,
        category_slug: form.category_slug,
        price: Number(form.price),
        price_unit: form.price_unit,
        negotiable: form.negotiable,
        area: Number(form.area),
        area_unit: form.area_unit,
        state: form.state,
        city: form.city,
        locality: form.locality,
        address_line: form.address_line,
        seller_name: form.seller_name,
        seller_phone: form.seller_phone,
        seller_type: form.seller_type,
        status: form.status,
        is_featured: form.is_featured,
        is_verified: form.is_verified,
        image_urls: imageUrls,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        floor: form.floor,
        total_floors: form.total_floors,
        furnishing: form.furnishing,
        parking: form.parking,
        facing: form.facing,
        age: form.age,
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

  const uploadingCount = images.filter(i => i.uploading).length;
  const failedCount = images.filter(i => i.error).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
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
              <><Save className="w-4 h-4" />Save Property</>
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
          <CheckCircle className="w-5 h-5 flex-shrink-0" />Property saved! Redirecting…
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

        {/* Images — drag & drop uploader */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-1 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-600" />Property Images
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Upload JPG or PNG photos. First image will be the cover photo. Max 10 MB per image.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
              dragOver
                ? 'border-brand-500 bg-brand-50'
                : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleFiles(e.target.files)}
            />
            <Upload className={cn('w-8 h-8 mx-auto mb-3', dragOver ? 'text-brand-600' : 'text-slate-400')} />
            <p className="font-medium text-slate-700">
              {dragOver ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-slate-400 mt-1">or <span className="text-brand-600 font-medium">click to browse</span></p>
            <p className="text-xs text-slate-400 mt-2">JPG, PNG, WebP • Max 10 MB each • Multiple files allowed</p>
          </div>

          {/* Upload status bar */}
          {uploadingCount > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-brand-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}…
            </div>
          )}
          {failedCount > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {failedCount} image{failedCount > 1 ? 's' : ''} failed to upload
            </div>
          )}

          {/* Image previews */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, index) => (
                <div
                  key={img.preview}
                  className={cn(
                    'relative group rounded-xl overflow-hidden border-2 aspect-[4/3] bg-slate-100',
                    index === 0 ? 'border-brand-500' : 'border-slate-200',
                    img.error ? 'border-red-300 bg-red-50' : ''
                  )}
                >
                  {/* Image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.preview}
                    alt={img.name}
                    className={cn('w-full h-full object-cover', img.uploading && 'opacity-50')}
                  />

                  {/* Uploading overlay */}
                  {img.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                      <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
                    </div>
                  )}

                  {/* Error overlay */}
                  {img.error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/90 p-2">
                      <AlertCircle className="w-5 h-5 text-red-500 mb-1" />
                      <p className="text-xs text-red-600 text-center leading-tight">{img.error}</p>
                    </div>
                  )}

                  {/* Cover badge */}
                  {index === 0 && !img.uploading && !img.error && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-brand-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5 fill-current" />Cover
                    </div>
                  )}

                  {/* Hover controls */}
                  {!img.uploading && !img.error && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {index !== 0 && (
                        <button
                          type="button"
                          onClick={() => setPrimary(index)}
                          title="Set as cover photo"
                          className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:bg-white transition-colors"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        title="Remove image"
                        className="p-1.5 rounded-lg bg-white/90 text-red-600 hover:bg-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Remove button for error state */}
                  {img.error && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-white text-red-500 shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add more button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-slate-50 transition-all flex flex-col items-center justify-center text-slate-400 hover:text-brand-600"
              >
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Add more</span>
              </button>
            </div>
          )}
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

        {/* Location — Phase 1: Kottayam District only */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-heading font-semibold text-lg text-slate-900 mb-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600" />Location
          </h2>
          <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg text-sm text-brand-700">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span><strong>Phase 1:</strong> Properties accepted in <strong>Kottayam District, Kerala</strong> only.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* State — locked */}
            <div>
              <label className="label">State</label>
              <input className="input bg-slate-50 text-slate-500 cursor-not-allowed" value="Kerala" readOnly />
            </div>
            {/* District — locked */}
            <div>
              <label className="label">District</label>
              <input className="input bg-slate-50 text-slate-500 cursor-not-allowed" value="Kottayam" readOnly />
            </div>
            {/* Taluk */}
            <div>
              <label className="label">Taluk *</label>
              <select required className="input" value={form.taluk} onChange={e => { set('taluk', e.target.value); set('city', ''); }}>
                <option value="">Select Taluk</option>
                {TALUKS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Town / Panchayat — filtered by taluk */}
            <div>
              <label className="label">Town / Panchayat *</label>
              <select
                required
                className="input"
                value={form.city}
                onChange={e => set('city', e.target.value)}
                disabled={!form.taluk}
              >
                <option value="">{form.taluk ? 'Select Town / Panchayat' : 'Select a Taluk first'}</option>
                {/* Municipalities in this taluk */}
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
                          {b.panchayats.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </optgroup>
                      ))}
                    </>
                  );
                })()}
              </select>
            </div>
            {/* Locality / Ward */}
            <div>
              <label className="label">Locality / Area / Ward</label>
              <input
                className="input"
                list="locality-list"
                placeholder="e.g. Town Junction, Colony name…"
                value={form.locality}
                onChange={e => set('locality', e.target.value)}
              />
              <datalist id="locality-list">
                {ALL_KOTTAYAM_LOCATIONS.map(l => <option key={l} value={l} />)}
              </datalist>
            </div>
            {/* Full address */}
            <div className="md:col-span-3">
              <label className="label">Full Address / Landmark</label>
              <input className="input" placeholder="House no., street, junction, landmark…" value={form.address_line} onChange={e => set('address_line', e.target.value)} />
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
          <button type="submit" disabled={saving || uploadingCount > 0} className="btn-primary btn-lg">
            {saving ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Saving…</>
            ) : uploadingCount > 0 ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Uploading {uploadingCount} image{uploadingCount > 1 ? 's' : ''}…</>
            ) : (
              <><Save className="w-5 h-5" />Save & Publish Property</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
