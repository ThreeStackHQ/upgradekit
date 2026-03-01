# @upgradekit/react

React components and hooks for UpgradeKit feature gating.

## Installation

```bash
npm install @upgradekit/react
```

## Usage

```tsx
import { UpgradeGate, useGate } from "@upgradekit/react";

// Component usage
function AnalyticsPage() {
  return (
    <UpgradeGate
      gateId="advanced-analytics"
      projectId="your-project-id"
      userId={user.id}
    >
      <AdvancedAnalyticsDashboard />
    </UpgradeGate>
  );
}

// Hook usage
function ExportButton() {
  const { isLocked, isLoading } = useGate("csv-export", projectId, userId);

  if (isLoading) return null;
  if (isLocked) return <UpgradePrompt />;
  return <button onClick={handleExport}>Export CSV</button>;
}
```
