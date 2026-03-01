import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — UpgradeKit',
  description: 'Simple, transparent pricing. Start free. Upgrade when you grow.',
};

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for solo projects and early-stage products.',
    cta: 'Get Started Free',
    highlight: false,
    features: [
      '1,000 impressions / mo',
      '3 active gates',
      'Basic analytics',
      'UpgradeKit branding',
      'Community support',
    ],
    missing: ['Custom branding', 'Priority support'],
  },
  {
    name: 'Indie',
    price: '$9',
    period: 'per month',
    desc: 'For indie makers and growing SaaS products.',
    cta: 'Start Indie',
    highlight: true,
    features: [
      '25,000 impressions / mo',
      '20 active gates',
      'Full analytics + revenue tracking',
      'Custom branding',
      'Email support',
    ],
    missing: ['Priority support'],
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    desc: 'For teams serious about monetization.',
    cta: 'Start Pro',
    highlight: false,
    features: [
      'Unlimited impressions',
      'Unlimited gates',
      'Full analytics + revenue tracking',
      'Custom branding',
      'Priority support',
    ],
    missing: [],
  },
];

const FAQ = [
  {
    q: "What's the difference from a signup wall?",
    a: "A signup wall blocks access until users register. UpgradeKit gates target specific features — showing upgrade prompts only when users try to access premium functionality. This is less intrusive and converts better because users already understand the value.",
  },
  {
    q: 'Does it work with Stripe?',
    a: "Yes. Your CTA button points to any URL — your Stripe Checkout link, billing portal, or custom upgrade page. UpgradeKit handles the gate and tracking; payment processing is up to you.",
  },
  {
    q: 'React only?',
    a: "Not at all. UpgradeKit works via a single script tag, so it's compatible with any frontend stack — React, Vue, Svelte, Angular, plain HTML, or even no framework at all.",
  },
  {
    q: 'Can I cancel anytime?',
    a: "Absolutely. No long-term contracts. Cancel your subscription at any time and your account will revert to the Free tier at the end of the billing period.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Zap className="w-5 h-5 text-[#3b82f6]" />
            UpgradeKit
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/docs" className="text-slate-400 hover:text-white transition-colors">Docs</Link>
            <Link href="/pricing" className="text-white font-medium">Pricing</Link>
          </div>
          <Link
            href="/signup"
            className="px-4 py-2 bg-[#3b82f6] hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-12 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Simple, honest pricing</h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Start free. No hidden fees. Upgrade when your product grows.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? 'bg-[#3b82f6]/10 border-2 border-[#3b82f6]'
                  : 'bg-slate-900/60 border border-slate-800'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 bg-[#3b82f6] text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-slate-400 text-sm">/ {plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm">{plan.desc}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.missing.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center leading-none">—</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-[#3b82f6] hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 pb-24 border-t border-slate-800">
        <div className="max-w-3xl mx-auto pt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">{q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Zap className="w-4 h-4 text-[#3b82f6]" />
            <span className="font-semibold text-white">UpgradeKit</span>
            <span>by ThreeStack</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          </div>
          <p className="text-slate-600 text-sm">© {new Date().getFullYear()} ThreeStack</p>
        </div>
      </footer>
    </div>
  );
}
