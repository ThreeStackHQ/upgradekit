import React from "react";
import { useUpgradeKitContext } from "../context";

interface UpgradeButtonProps {
  /** The gate ID to track a conversion for when clicked */
  gateId: string;
  /** Override the button label (default: "Upgrade to Pro") */
  label?: string;
  /** Override the upgrade URL (default: gate's upgradeUrl) */
  href?: string;
  /** Additional CSS class names */
  className?: string;
}

const defaultStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "14px",
  fontWeight: 600,
  lineHeight: 1,
  textDecoration: "none",
  color: "#ffffff",
  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)",
  transition: "opacity 0.15s ease",
};

/**
 * A pre-styled "Upgrade to Pro" button that tracks a conversion event when
 * clicked and redirects the user to the upgrade URL.
 */
export function UpgradeButton({
  gateId,
  label = "Upgrade to Pro",
  href,
  className,
}: UpgradeButtonProps): React.ReactElement {
  const { gates, trackConversion } = useUpgradeKitContext();

  const gate = gates[gateId];
  const upgradeUrl = href ?? gate?.upgradeUrl ?? "#";

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>): void {
    e.preventDefault();
    trackConversion(gateId);
    window.location.href = upgradeUrl;
  }

  return (
    <a
      href={upgradeUrl}
      onClick={handleClick}
      className={className}
      style={className ? undefined : defaultStyle}
      role="button"
    >
      ⚡ {label}
    </a>
  );
}
