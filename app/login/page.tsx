'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Shield, ArrowLeft, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep]         = useState<Step>('phone');
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState(['','','','','','']);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = phone.replace(/\D/g,'');
    if (clean.length !== 10) { setError('Please enter a valid 10-digit mobile number'); return; }
    setError('');
    setLoading(true);
    // Simulate OTP send
    setTimeout(() => { setLoading(false); setStep('otp'); }, 1200);
  }

  function handleOtpChange(idx: number, val: string) {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) (document.getElementById(`otp-${idx+1}`) as HTMLInputElement)?.focus();
  }

  function handleOtpKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) (document.getElementById(`otp-${idx-1}`) as HTMLInputElement)?.focus();
  }

  function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Please enter the complete 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    // Simulate verification
    setTimeout(() => { setLoading(false); router.push('/dashboard'); }, 1500);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm">
          <div className="card p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="font-heading font-bold text-white text-2xl">q</span>
              </div>
              <h1 className="font-heading font-bold text-2xl text-slate-900">
                {step === 'phone' ? 'Welcome to qkit' : 'Verify Your Number'}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {step === 'phone'
                  ? 'Login or create your account in seconds'
                  : `OTP sent to +91 ${phone}`}
              </p>
            </div>

            {step === 'phone' ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="label">Mobile Number</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent bg-white overflow-hidden">
                    <span className="pl-4 text-sm font-medium text-slate-500 flex-shrink-0">+91</span>
                    <input
                      type="tel" inputMode="numeric" maxLength={10}
                      value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                      placeholder="9XXXXXXXXX"
                      className="flex-1 py-3 pr-4 text-sm text-slate-900 outline-none bg-transparent"
                      autoFocus required
                    />
                    <Phone className="w-4 h-4 text-slate-400 mr-3" />
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
                </button>
                <p className="text-xs text-slate-400 text-center">
                  By continuing you agree to our{' '}
                  <Link href="/terms" className="underline hover:text-slate-600">Terms</Link> and{' '}
                  <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <button type="button" onClick={() => { setStep('phone'); setOtp(['','','','','','']); }}
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-2">
                  <ArrowLeft className="w-4 h-4" />Change number
                </button>
                <div>
                  <label className="label text-center block">Enter 6-digit OTP</label>
                  <div className="flex gap-2 justify-center mt-2">
                    {otp.map((d, i) => (
                      <input
                        key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                        maxLength={1} value={d}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-11 h-12 text-center text-xl font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        autoFocus={i===0}
                      />
                    ))}
                  </div>
                </div>
                {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Login'}
                </button>
                <button type="button" className="text-xs text-brand-600 hover:underline w-full text-center">
                  Resend OTP (30s)
                </button>
              </form>
            )}

            <div className="flex items-center gap-2 mt-6 p-3 bg-slate-50 rounded-xl">
              <Shield className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <p className="text-xs text-slate-500">Your phone number is safe. We never share it without your consent.</p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Looking to list a property?{' '}
            <Link href="/post-property" className="text-brand-600 font-medium hover:underline">Post for free</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
