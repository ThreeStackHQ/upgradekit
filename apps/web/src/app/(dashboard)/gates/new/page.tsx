'use client';

import { useState } from 'react';
import { Copy, Check, Save, X } from 'lucide-react';

const COLOR_SWATCHES = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

interface GateForm {
  headline: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  dismiss: 'allow' | 'always';
  trigger: 'page_load' | 'feature_click' | 'manual';
  color: string;
  customColor: string;
}

export default function NewGatePage() {
  const [form, setForm] = useState<GateForm>({
    headline: 'Upgrade to access this feature',
    body: 'Get unlimited access with Pro. Unlock advanced analytics, unlimited gates, custom branding, and priority support.',
    ctaText: 'Upgrade Now',
    ctaUrl: 'https://example.com/upgrade',
    dismiss: 'allow',
    trigger: 'page_load',
    color: '#3b82f6',
    customColor: '#3b82f6',
  });

  const [copied, setCopied] = useState(false);

  const activeColor = form.color === 'custom' ? form.customColor : form.color;

  const snippet = `<script src="https://cdn.upgradekit.io/v1/widget.js"
  data-gate-id="YOUR_GATE_ID"
  data-cta-text="${form.ctaText}"
  data-cta-url="${form.ctaUrl}"
  data-trigger="${form.trigger}"
  data-color="${activeColor}"
></script>`;

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function update<K extends keyof GateForm>(key: K, value: GateForm[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">New Gate</h1>
        <p className="text-slate-400 text-sm mt-1">Configure your upgrade gate widget</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* LEFT — Form */}
        <div className="flex-[3] space-y-6">
          {/* Headline */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Headline</label>
            <input
              type="text"
              value={form.headline}
              onChange={e => update('headline', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
              placeholder="Upgrade to access this feature"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Body Text <span className="text-slate-500 font-normal">(markdown supported)</span>
            </label>
            <textarea
              value={form.body}
              onChange={e => update('body', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] resize-none"
              placeholder="Describe the upgrade benefits..."
            />
          </div>

          {/* CTA row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">CTA Button Text</label>
              <input
                type="text"
                value={form.ctaText}
                onChange={e => update('ctaText', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">CTA URL</label>
              <input
                type="url"
                value={form.ctaUrl}
                onChange={e => update('ctaUrl', e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
              />
            </div>
          </div>

          {/* Dismiss */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Dismiss Option</label>
            <div className="flex gap-4">
              {(['allow', 'always'] as const).map(val => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dismiss"
                    value={val}
                    checked={form.dismiss === val}
                    onChange={() => update('dismiss', val)}
                    className="accent-[#3b82f6]"
                  />
                  <span className="text-sm text-slate-300">
                    {val === 'allow' ? 'Allow dismiss' : 'Always show'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Trigger Type</label>
            <select
              value={form.trigger}
              onChange={e => update('trigger', e.target.value as GateForm['trigger'])}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
            >
              <option value="page_load">Page Load</option>
              <option value="feature_click">Feature Click</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Primary Color</label>
            <div className="flex items-center gap-3 flex-wrap">
              {COLOR_SWATCHES.map(c => (
                <button
                  key={c}
                  onClick={() => update('color', c)}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                  }`}
                />
              ))}
              {/* Custom */}
              <button
                onClick={() => update('color', 'custom')}
                className={`w-8 h-8 rounded-full border-2 border-dashed border-slate-500 flex items-center justify-center text-slate-400 text-xs transition-transform ${
                  form.color === 'custom' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : ''
                }`}
              >
                +
              </button>
              {form.color === 'custom' && (
                <input
                  type="text"
                  value={form.customColor}
                  onChange={e => update('customColor', e.target.value)}
                  placeholder="#3b82f6"
                  className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm w-24 focus:outline-none focus:border-[#3b82f6]"
                />
              )}
            </div>
          </div>

          {/* Code snippet */}
          <div className="border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
              <span className="text-xs text-slate-400 font-mono">Install snippet</span>
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <pre className="px-4 py-3 text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto bg-[#0f172a]">
              {snippet}
            </pre>
          </div>

          {/* Save */}
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#3b82f6] hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
            <Save className="w-4 h-4" /> Save Gate
          </button>
        </div>

        {/* RIGHT — Preview */}
        <div className="flex-[2]">
          <div className="sticky top-8">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Live Preview</p>
            <div className="border border-slate-700 rounded-xl p-4 bg-slate-900/40">
              {/* Simulated page background */}
              <div className="relative rounded-lg bg-slate-800/50 min-h-[300px] flex items-center justify-center p-6">
                {/* Blurred background content */}
                <div className="absolute inset-0 rounded-lg overflow-hidden opacity-20">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 bg-slate-600 rounded mx-6 mt-4" style={{ width: `${70 + (i % 3) * 10}%` }} />
                  ))}
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-lg backdrop-blur-[2px]" />
                {/* Modal card */}
                <div className="relative z-10 w-full max-w-sm bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${activeColor}20` }}>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: activeColor }} />
                    </div>
                    {form.dismiss === 'allow' && (
                      <button className="text-slate-500 hover:text-slate-300">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-base mb-2 leading-tight">
                    {form.headline || 'Upgrade to access this feature'}
                  </h3>
                  <p className="text-slate-400 text-sm mb-5 leading-relaxed">
                    {form.body || 'Upgrade to unlock this feature.'}
                  </p>
                  <button
                    className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: activeColor }}
                  >
                    {form.ctaText || 'Upgrade Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
