# @upgradekit/react

React SDK for [UpgradeKit](https://upgradekit.io) — gate features behind upgrade prompts.

## Installation

```bash
npm install @upgradekit/react
# or
pnpm add @upgradekit/react
```

## Quick Start

Wrap your app with `UpgradeKitProvider`:

```tsx
import { UpgradeKitProvider } from "@upgradekit/react";

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <UpgradeKitProvider
      config={{
        apiUrl: "https://your-upgradekit-instance.com",
        apiKey: "uk_live_xxx",
        userId: "user_123",      // current user's ID
        plan: "free",            // "free" | "indie" | "pro"
      }}
    >
      {children}
    </UpgradeKitProvider>
  );
}
```

### Gate a feature

```tsx
import { UpgradeGate, UpgradeButton } from "@upgradekit/react";

function AdvancedAnalytics() {
  return (
    <UpgradeGate
      gateId="gate_advanced-analytics"
      fallback={
        <div className="upgrade-prompt">
          <h3>Advanced Analytics</h3>
          <p>Unlock powerful insights with a paid plan.</p>
          <UpgradeButton gateId="gate_advanced-analytics" />
        </div>
      }
    >
      {/* This content is only shown to paid users */}
      <AnalyticsDashboard />
    </UpgradeGate>
  );
}
```

### Use the hook directly

```tsx
import { useUpgradeKitContext } from "@upgradekit/react";

function MyFeature() {
  const { isGated, trackImpression, trackConversion } = useUpgradeKitContext();

  if (isGated("gate_my-feature")) {
    return <p>Upgrade required</p>;
  }

  return <div>Premium content</div>;
}
```

### Standalone hook (without provider)

```tsx
import { useUpgradeKit } from "@upgradekit/react";

function Page() {
  const { isGated, trackImpression } = useUpgradeKit({
    apiUrl: "https://your-upgradekit-instance.com",
    apiKey: "uk_live_xxx",
    userId: "user_123",
    plan: "free",
  });

  return isGated("gate_ai") ? <UpgradePrompt /> : <AIFeature />;
}
```

## API Reference

### `UpgradeKitProvider`

| Prop | Type | Description |
|------|------|-------------|
| `config` | `UpgradeKitConfig` | Provider configuration |
| `children` | `ReactNode` | App content |

### `UpgradeGate`

| Prop | Type | Description |
|------|------|-------------|
| `gateId` | `string` | Gate ID from the UpgradeKit dashboard |
| `fallback` | `ReactNode` | Content shown to blocked (free) users |
| `children` | `ReactNode` | Content shown to paid users |

Automatically tracks an impression when the gate is shown.

### `UpgradeButton`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gateId` | `string` | — | Gate ID to track conversion for |
| `label` | `string` | `"Upgrade to Pro"` | Button text |
| `href` | `string` | gate's `upgradeUrl` | Override URL |
| `className` | `string` | — | CSS class (removes default styles) |

### `useUpgradeKitContext()`

Returns the context value from the nearest `UpgradeKitProvider`:

```ts
{
  config: UpgradeKitConfig;
  gates: Record<string, GateConfig>;
  isLoading: boolean;
  isGated(gateId: string): boolean;
  trackImpression(gateId: string): void;
  trackConversion(gateId: string): void;
}
```

## License

MIT
