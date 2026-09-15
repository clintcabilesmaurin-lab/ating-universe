import React from 'react';

/**
 * Safely navigates the parent window to an outside URL, replacing the parent
 * browsing context without opening a new tab.
 */
export function openInParent(url: string, e?: React.MouseEvent | React.SyntheticEvent) {
  if (e) {
    e.stopPropagation();
  }

  // 1. Attempt to navigate parent window (replaces parent iframe or outer container)
  try {
    if (window.parent && window.parent !== window) {
      window.parent.location.href = url;
      if (e) e.preventDefault();
      return;
    }
  } catch {
    // Cross-origin restriction may prevent direct assignment to parent.location
  }

  // 2. Attempt to navigate top window if different from current
  try {
    if (window.top && window.top !== window) {
      window.top.location.href = url;
      if (e) e.preventDefault();
      return;
    }
  } catch {
    // Cross-origin restriction
  }

  // 3. Fallback: navigate the current window directly
  try {
    window.location.href = url;
    if (e) e.preventDefault();
  } catch {
    // Let native anchor target="_parent" proceed
  }
}
