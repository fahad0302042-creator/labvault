"use client";

/**
 * Haptic feedback for mobile devices.
 * Uses the Vibration API (navigator.vibrate).
 * Silently no-ops on devices that don't support vibration (desktop, iOS Safari).
 *
 * iOS Safari doesn't support navigator.vibrate, but we can use a
 * fallback: briefly toggling a CSS class that triggers a subtle animation.
 */

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error" | "warning" | "selection";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,           // very short tap — button presses
  medium: 20,          // short tap — modal open, tab switch
  heavy: 40,           // longer buzz — form submit
  success: [10, 30, 10],  // double tap — successful action (consume, restock)
  error: [40, 20, 40],    // buzz-buzz — error/destructive action
  warning: [20, 40, 20],  // warning pattern — low stock alert
  selection: 5,        // micro tap — list item select, filter change
};

/**
 * Trigger haptic feedback. Safe to call anywhere — no-ops if unsupported.
 */
export function haptic(pattern: HapticPattern = "light"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;

  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Silently ignore — some browsers throw if vibration is disabled
  }
}

/**
 * Hook-friendly haptic trigger. Use in onClick handlers.
 * @example onClick={() => { hapticTap("success"); doAction(); }}
 */
export function hapticTap(pattern: HapticPattern = "light"): void {
  haptic(pattern);
}
