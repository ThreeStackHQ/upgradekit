import type { Metadata } from 'next';
import Link from 'next/link';
import { Zap, Code2, BarChart2, Lock, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'UpgradeKit — Monetize every locked feature',
  description:
    'Add upgrade prompts to any feature in minutes. No coding required. Tracks conversions and drives revenue automatically.',
  openGraph: {
    title: 'UpgradeKit — Monetize every locked feature',
    description:
      'Add upgrade prompts to any feature in minutes. No coding required.',
    url: 'https://upgradekit.threestack.io',
    siteName: 'UpgradeKit',
    type: 'website',
    images: [
      {
        url: 'https://upgradekit.threestack.io/og.png',
        width: 1200,
        height: 630,
        alt: 'UpgradeKit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UpgradeKit — Monetize every locked feature',
    description: 'Add upgrade prompts to any feature in minutes.',
    images: ['https://upgradekit.threestack.io/og.png'],
  },
  alternates: {
    canonical: 'https://upgradekit.threestack.io',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'UpgradeKit',
  applicationCategory: 'BusinessApplication',
  description:
    'UpgradeKit lets SaaS teams add upgrade prompts to locked features without writing a single modal.',
  url: 'https://upgradekit.threestack.io',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
};

const FEATURES = [
  {
    icon: Layers,
    title: 'Works With Any Stack',
    desc: 'Drop in a single script tag. Works with React, Vue, Svelte, plain HTML — any framework.',
  },
  {
    icon: Code2,
    title: '2-Line Install',
    desc: 'One script tag. One data attribute. You\'re live in under 60 seconds.',
  },
  {
    icon: BarChart2,
    title: 'Tracks Conversions',
    desc: 'See exactly which features drive upgrades. Impressions, clicks, revenue — all in one dashboard.',
  },
  {
    icon: Lock,
    title: 'No-Code Paywall',
    desc: 'Build and deploy upgrade gates from the dashboard. No dev deploy required.',
  },
];

const COMPARISON = [
  { feature: 'Free tier', uk: '✅ Free forever', appcues: '❌ No free tier', userflow: '❌ No free tier' },
  { feature: 'Gate builder', uk: '✅ Drag & drop', appcues: '✅ Yes', userflow: '✅ Yes' },
  { feature: 'Script tag install', uk: '✅ 1 line', appcues: '❌ SDK setup', userflow: '❌ SDK setup' },
  { feature: 'Conversion tracking', uk: '✅ Built-in', appcues: '✅ Yes', userflow: '⚠️ Limited' },
  { feature: 'Revenue attribution', uk: '✅ Included', appcues: '⚠️ Enterprise', userflow: '❌ No' },
  { feature: 'Price', uk: '$0 – $29/mo', appcues: 'From $249/mo', userflow: 'From $300/mo' },
];

const TRUSTS = ['Next.js', 'React', 'Vue', 'Svelte'];

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#0f172a] text-white">
        {/* Sticky Nav */}
        <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Zap className="w-5 h-5 text-[#3b82f6]" />
              UpgradeKit
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/docs" className="text-slate-400 hover:text-white transition-colors">Docs</Link>
              <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link>
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
        <section className="pt-24 pb-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3b82f6]/10 text-[#3b82f6] rounded-full text-sm font-medium mb-6 border border-[#3b82f6]/20">
              <Zap className="w-3.5 h-3.5" />
              Built for SaaS teams
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Monetize every locked feature —{' '}
              <span className="text-[#3b82f6]">without writing a single modal.</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Drop in one script tag. Build upgrade gates from a dashboard. Watch free users convert to paid — automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-[#3b82f6] hover:bg-blue-500 text-white rounded-xl font-semibold text-base transition-colors shadow-lg shadow-blue-500/25"
              >
                Start Free
              </Link>
              <Link
                href="/demo"
                className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl font-semibold text-base transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Modal mockup */}
          <div className="max-w-sm mx-auto mt-16">
            <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#3b82f6]" />
                </div>
                <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">Pro Feature</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Upgrade to access this feature</h3>
              <p className="text-slate-400 text-sm mb-5">
                Get unlimited exports, advanced analytics, and team collaboration with Pro.
              </p>
              <button className="w-full py-2.5 bg-[#3b82f6] hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors">
                Upgrade Now →
              </button>
              <p className="text-center text-xs text-slate-600 mt-3">No credit card required</p>
            </div>
            <p className="text-center text-xs text-slate-600 mt-3">
              ↑ This is what your users see
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 border-t border-slate-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
            <p className="text-slate-400 text-center mb-12">Drop-in paywalls that actually convert.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
                  <div className="w-10 h-10 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 px-6 border-t border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">How we compare</h2>
            <p className="text-slate-400 text-center mb-12">90% cheaper. Equally powerful.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium w-1/3">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold text-[#3b82f6] bg-[#3b82f6]/5 rounded-t-lg">UpgradeKit</th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Appcues<br /><span className="text-slate-600 font-normal text-xs">$249/mo</span></th>
                    <th className="text-center py-3 px-4 text-slate-400 font-medium">Userflow<br /><span className="text-slate-600 font-normal text-xs">$300/mo</span></th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-3.5 px-4 text-slate-400">{row.feature}</td>
                      <td className="py-3.5 px-4 text-center text-white bg-[#3b82f6]/5 font-medium">{row.uk}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{row.appcues}</td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{row.userflow}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trust section */}
        <section className="py-16 px-6 border-t border-slate-800">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-slate-500 text-sm mb-8 uppercase tracking-wider">Works with your stack</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {TRUSTS.map(name => (
                <div key={name} className="text-slate-400 font-semibold text-lg hover:text-white transition-colors">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 border-t border-slate-800">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold mb-4">Ready to upgrade your revenue?</h2>
            <p className="text-slate-400 mb-8">
              Start free. Add upgrade gates to any feature in minutes. No credit card required.
            </p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-[#3b82f6] hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-colors shadow-xl shadow-blue-500/25"
            >
              Get Started Free
            </Link>
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
    </>
  );
}
