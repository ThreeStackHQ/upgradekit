/**
 * UpgradeKit Embed Widget
 * 
 * This package will contain the embeddable JavaScript widget
 * that shows upgrade prompts when users hit feature gates.
 * 
 * Coming soon in future sprints.
 */

export const UPGRADEKIT_WIDGET_VERSION = "0.1.0";

export interface WidgetConfig {
  gateId: string;
  projectId: string;
  endUserId?: string;
  apiUrl?: string;
}

// Placeholder - full widget implementation coming in future sprints
export function initWidget(_config: WidgetConfig): void {
  console.log("[UpgradeKit] Widget initialized - coming soon");
}
