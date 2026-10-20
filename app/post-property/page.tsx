'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useDropzone } from 'react-dropzone';
import {
  ChevronRight, ChevronLeft, MapPin, Upload, Image as ImageIcon,
  X, Plus, Check, Loader2, AlertCircle, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROPERTY_CATEGORIES, POST_TRANSACTION_TYPES, AREA_UNITS, SELLER_TYPES } from '@/lib/constants';
import {
  TALUKS,
  MUNICIPALITIES,
  BLOCKS_AND_PANCHAYATS,
  KOTTAYAM_KEY_LOCALITIES,
  DISTRICT,
  STATE,
} from '@/lib/constants/kottayam-locations';

type Step = 1 | 2;

interface FormData {
  transaction_type: string;
  category_slug: string;
  // Kottayam location hierarchy
  taluk: string;
  town_panchayat: string;
  locality: string;
  pincode: string;
  price: string;
  area: string;
  area_unit: string;
  seller_name: string;
  seller_phone: string;
  seller_type: string;
  // Dynamic fields
  bedrooms: string;
  bathrooms: string;
  floor: string;
  total_floors: string;
  furnishing: string;
  parking: string;
  title: string;
  description: string;
}

const DEFAULT_FORM: FormData = {
  transaction_type: 'sale', category_slug: '',
  taluk: '', town_panchayat: '', locality: '',
  pincode: '', price: '', area: '', area_unit: 'sqft', seller_name: '', seller_phone: '',
  seller_type: 'owner', bedrooms: '', bathrooms: '', floor: '', total_floors: '',
  furnishing: '', parking: '', title: '', description: '',
};

const CATEGORY_GROUPS: Record<string, string[]> = {
  apartments:   ['bedrooms','bathrooms','floor','total_floors','furnishing','parking'],
  houses:       ['bedrooms','bathrooms','floor','furnishing','parking'],
  commercial:   ['floor','total_floors','parking'],
  'office-spaces': ['floor','total_floors','parking'],
};

export default function PostPropertyPage() {
  const router = useRouter();
  const [step, setStep]       = useState<Step>(1);
  const [form, setForm]       = useState<FormData>(DEFAULT_FORM);
  const [images, setImages]   = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors]   = useState<Partial<FormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 20,
    maxSize: 5 * 1024 * 1024,
    onDrop: (accepted) => {
      setImages(prev => [...prev, ...accepted].slice(0,20));
      const urls = accepted.map(f => URL.createObjectURL(f));
      setPreviews(prev => [...prev, ...urls].slice(0,20));
    },
  });

  function setField(key: keyof FormData, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validateStep1(): boolean {
    const e: Partial<FormData> = {};
    if (!form.transaction_type) e.transaction_type = 'Required';
    if (!form.category_slug)    e.category_slug    = 'Required';
    if (!form.taluk)            e.taluk            = 'Required';
    if (!form.town_panchayat)   e.town_panchayat   = 'Required';
    if (!form.price)            e.price            = 'Required';
    if (!form.area)             e.area             = 'Required';
    if (!form.seller_name)      e.seller_name      = 'Required';
    if (!form.seller_phone || form.seller_phone.replace(/\D/g,'').length !== 10) e.seller_phone = 'Valid 10-digit number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goToStep2() {
    if (validateStep1()) {
      // Auto-generate title
      const cat = PROPERTY_CATEGORIES.find(c => c.slug === form.category_slug);
      const title = [
        form.bedrooms ? `${form.bedrooms} BHK` : '',
        cat?.label ?? '',
        form.transaction_type === 'sale' ? 'for Sale' : form.transaction_type === 'rent' ? 'for Rent' : 'for Lease',
        form.town_panchayat ? `in ${form.town_panchayat}` : '',
      ].filter(Boolean).join(' ');
      setField('title', title || 'Property Listing');
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (images.length === 0 && !confirm('Continue without photos? Listings with photos get 5x more enquiries.')) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    setSubmitting(false);
    setSubmitted(true);
  }

  function removeImage(idx: number) {
    setImages(p => p.filter((_,i) => i !== idx));
    setPreviews(p => p.filter((_,i) => i !== idx));
  }

  const showFields = CATEGORY_GROUPS[form.category_slug] ?? [];

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center py-20 px-4">
          <div className="card p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-brand-600" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-slate-900 mb-3">Listing Submitted!</h2>
            <p className="text-slate-500 text-sm mb-6">Your property has been submitted for review. It will be published within 24 hours.</p>
            <div className="flex gap-3">
              <Link href="/dashboard" className="flex-1 btn-secondary btn-md">My Dashboard</Link>
              <Link href="/post-property" className="flex-1 btn-primary btn-md"><Plus className="w-4 h-4" />Post Another</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              {[1,2].map(s => (
                <div key={s} className={cn('flex items-center gap-2', s < step ? 'text-brand-600' : s === step ? 'text-slate-900' : 'text-slate-400')}>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all',
                    s < step  ? 'bg-brand-600 border-brand-600 text-white' :
                    s === step ? 'border-brand-600 text-brand-600' : 'border-slate-200 text-slate-400')}>
                    {s < step ? <Check className="w-4 h-4" /> : s}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {s === 1 ? 'Basic Details' : 'Photos & Publish'}
                  </span>
                </div>
              ))}
              <div className="flex-1 h-0.5 bg-slate-200 mx-2">
                <div className={cn('h-full bg-brand-600 transition-all', step === 2 ? 'w-full' : 'w-0')} />
              </div>
            </div>
            <p className="text-xs text-slate-400">Step {step} of 2 — {step === 1 ? 'Tell us about your property' : 'Add photos and publish'}</p>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="card p-7 space-y-6">
              <h1 className="font-heading font-bold text-xl text-slate-900">Basic Property Details</h1>

              {/* Transaction type */}
              <div>
                <label className="label">I want to *</label>
                <div className="flex gap-3">
                  {POST_TRANSACTION_TYPES.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => setField('transaction_type', t.value)}
                      className={cn('flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
                        form.transaction_type === t.value ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="label">Property Category *</label>
                <select className={cn('input', errors.category_slug && 'border-red-400')}
                  value={form.category_slug} onChange={e => setField('category_slug', e.target.value)}>
                  <option value="">Select category…</option>
                  {PROPERTY_CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
                {errors.category_slug && <Error msg={errors.category_slug} />}
              </div>

              {/* Location — Kottayam District only */}
              <div>
                {/* District lock banner */}
                <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-4 py-2.5 mb-4">
                  <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <p className="text-sm text-brand-700 font-medium">
                    Phase 1: Properties in <strong>{DISTRICT} District, {STATE}</strong> only.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Taluk */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">Taluk *</label>
                    <select
                      className={cn('input', errors.taluk && 'border-red-400')}
                      value={form.taluk}
                      onChange={e => {
                        setField('taluk', e.target.value);
                        setField('town_panchayat', ''); // reset dependent
                      }}
                    >
                      <option value="">Select Taluk…</option>
                      {TALUKS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.taluk && <Error msg={errors.taluk} />}
                  </div>

                  {/* Town / Municipality / Panchayat */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">Town / Panchayat *</label>
                    <select
                      className={cn('input', errors.town_panchayat && 'border-red-400')}
                      value={form.town_panchayat}
                      onChange={e => setField('town_panchayat', e.target.value)}
                      disabled={!form.taluk}
                    >
                      <option value="">{form.taluk ? 'Select…' : 'Select Taluk first'}</option>
                      {form.taluk && (() => {
                        const munis = MUNICIPALITIES
                          .filter(m => m.taluk === form.taluk)
                          .map(m => m.name);
                        const panchayats = BLOCKS_AND_PANCHAYATS
                          .filter(b => b.taluk === form.taluk)
                          .flatMap(b => b.panchayats);
                        const all = [...new Set([...munis, ...panchayats])].sort();
                        return all.map(p => <option key={p} value={p}>{p}</option>);
                      })()}
                    </select>
                    {errors.town_panchayat && <Error msg={errors.town_panchayat} />}
                  </div>

                  {/* Locality / Area (optional free-text) */}
                  <div className="col-span-2">
                    <label className="label">Locality / Area <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input
                      className="input"
                      placeholder="e.g. Baker Junction, MC Road, Peroor Junction"
                      value={form.locality}
                      onChange={e => setField('locality', e.target.value)}
                      list="kottayam-localities"
                    />
                    <datalist id="kottayam-localities">
                      {KOTTAYAM_KEY_LOCALITIES.map(l => <option key={l} value={l} />)}
                    </datalist>
                  </div>

                  {/* PIN Code */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">PIN Code</label>
                    <input
                      className="input"
                      placeholder="686001"
                      maxLength={6}
                      inputMode="numeric"
                      value={form.pincode}
                      onChange={e => setField('pincode', e.target.value.replace(/\D/g,'').slice(0,6))}
                    />
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">{form.transaction_type === 'sale' ? 'Asking Price (₹)' : 'Monthly Rent (₹)'} *</label>
                  <input className={cn('input', errors.price && 'border-red-400')}
                    type="number" placeholder="e.g. 5000000" inputMode="numeric"
                    value={form.price} onChange={e => setField('price', e.target.value)} />
                  {errors.price && <Error msg={errors.price} />}
                </div>
              </div>

              {/* Area */}
              <div>
                <label className="label">Property Area *</label>
                <div className="flex gap-2">
                  <input className={cn('input flex-1', errors.area && 'border-red-400')}
                    type="number" placeholder="e.g. 1200" inputMode="numeric"
                    value={form.area} onChange={e => setField('area', e.target.value)} />
                  <select className="input w-32 flex-shrink-0" value={form.area_unit}
                    onChange={e => setField('area_unit', e.target.value)}>
                    {AREA_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
                {errors.area && <Error msg={errors.area} />}
              </div>

              {/* Dynamic fields */}
              {showFields.length > 0 && (
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Property Specifications</p>
                  <div className="grid grid-cols-2 gap-4">
                    {showFields.includes('bedrooms') && (
                      <div>
                        <label className="label">Bedrooms</label>
                        <select className="input" value={form.bedrooms} onChange={e => setField('bedrooms', e.target.value)}>
                          <option value="">Select…</option>
                          {['1 RK','1','2','3','4','4+'].map(v => <option key={v} value={v}>{v} {v!=='1 RK'?'BHK':''}</option>)}
                        </select>
                      </div>
                    )}
                    {showFields.includes('bathrooms') && (
                      <div>
                        <label className="label">Bathrooms</label>
                        <select className="input" value={form.bathrooms} onChange={e => setField('bathrooms', e.target.value)}>
                          <option value="">Select…</option>
                          {['1','2','3','4','4+'].map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    )}
                    {showFields.includes('floor') && (
                      <div>
                        <label className="label">Floor</label>
                        <input className="input" type="number" placeholder="e.g. 3"
                          value={form.floor} onChange={e => setField('floor', e.target.value)} />
                      </div>
                    )}
                    {showFields.includes('total_floors') && (
                      <div>
                        <label className="label">Total Floors</label>
                        <input className="input" type="number" placeholder="e.g. 10"
                          value={form.total_floors} onChange={e => setField('total_floors', e.target.value)} />
                      </div>
                    )}
                    {showFields.includes('furnishing') && (
                      <div>
                        <label className="label">Furnishing</label>
                        <select className="input" value={form.furnishing} onChange={e => setField('furnishing', e.target.value)}>
                          <option value="">Select…</option>
                          <option value="unfurnished">Unfurnished</option>
                          <option value="semi-furnished">Semi-Furnished</option>
                          <option value="fully-furnished">Fully Furnished</option>
                        </select>
                      </div>
                    )}
                    {showFields.includes('parking') && (
                      <div>
                        <label className="label">Parking</label>
                        <select className="input" value={form.parking} onChange={e => setField('parking', e.target.value)}>
                          <option value="">Select…</option>
                          <option value="none">None</option>
                          <option value="open">Open</option>
                          <option value="covered">Covered</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="border-t border-slate-100 pt-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-4">Your Contact Details</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">Your Name *</label>
                    <input className={cn('input', errors.seller_name && 'border-red-400')}
                      placeholder="Full name" value={form.seller_name}
                      onChange={e => setField('seller_name', e.target.value)} />
                    {errors.seller_name && <Error msg={errors.seller_name} />}
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="label">Mobile Number *</label>
                    <input className={cn('input', errors.seller_phone && 'border-red-400')}
                      type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit number"
                      value={form.seller_phone}
                      onChange={e => setField('seller_phone', e.target.value.replace(/\D/g,'').slice(0,10))} />
                    {errors.seller_phone && <Error msg={errors.seller_phone} />}
                  </div>
                  <div className="col-span-2">
                    <label className="label">I am a</label>
                    <div className="flex gap-3">
                      {SELLER_TYPES.map(s => (
                        <button key={s.value} type="button"
                          onClick={() => setField('seller_type', s.value)}
                          className={cn('flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                            form.seller_type === s.value ? 'border-brand-600 bg-brand-50 text-brand-600' : 'border-slate-200 text-slate-600 hover:border-slate-300')}>
                          {s.icon} {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" onClick={goToStep2} className="btn-primary btn-lg w-full">
                Next: Add Photos <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="card p-7">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-5">
                  <ChevronLeft className="w-4 h-4" />Back to details
                </button>
                <h1 className="font-heading font-bold text-xl text-slate-900 mb-6">Add Photos &amp; Publish</h1>

                {/* Image upload */}
                <div className="mb-6">
                  <label className="label">Property Photos (up to 20)</label>
                  <div {...getRootProps()} className={cn(
                    'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
                    isDragActive ? 'border-brand-400 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                  )}>
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="font-medium text-slate-600 text-sm">
                      {isDragActive ? 'Drop photos here…' : 'Click to upload or drag & drop'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — max 5 MB each · Up to 20 photos</p>
                  </div>

                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-4">
                      {previews.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt={`Upload ${i+1}`} className="w-full h-full object-cover" />
                          {i===0 && <span className="absolute top-1 left-1 bg-brand-600 text-white text-xs rounded-md px-1.5 py-0.5 font-medium">Cover</span>}
                          <button type="button" onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-brand-300 transition-colors">
                        <Plus className="w-5 h-5 text-slate-400" />
                        <span className="text-xs text-slate-400 mt-1">Add more</span>
                        <input type="file" accept="image/*" multiple className="hidden"
                          onChange={e => { if (e.target.files) { const files = Array.from(e.target.files); setImages(p=>[...p,...files].slice(0,20)); const urls=files.map(f=>URL.createObjectURL(f)); setPreviews(p=>[...p,...urls].slice(0,20)); } }} />
                      </label>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="label">Property Title</label>
                  <input className="input" value={form.title} onChange={e => setField('title', e.target.value)}
                    placeholder="Auto-generated — you can edit this" />
                  <p className="text-xs text-slate-400 mt-1">A clear title helps buyers find your property faster.</p>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="label">Description (optional)</label>
                  <textarea className="input min-h-[100px] resize-none" value={form.description}
                    onChange={e => setField('description', e.target.value)}
                    placeholder="Describe the property — location highlights, nearby facilities, special features…" />
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 mb-6 cursor-pointer">
                  <input type="checkbox" required className="accent-brand-600 mt-0.5" />
                  <span className="text-xs text-slate-500">
                    I confirm that I am the owner or authorised representative of this property and agree to qkit's{' '}
                    <Link href="/terms" className="text-brand-600 underline">Terms of Service</Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-brand-600 underline">Privacy Policy</Link>.
                    I will not post false or misleading information.
                  </span>
                </label>

                <button type="submit" disabled={submitting} className="btn-primary btn-xl w-full">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing…</> : <><Check className="w-5 h-5" />Publish Listing</>}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Error({ msg }: { msg: string }) {
  return <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="w-3 h-3" />{msg}</p>;
}
