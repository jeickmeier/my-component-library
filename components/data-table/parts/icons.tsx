/**
 * Data Table Icons Module
 * 
 * This module provides optimized, memoized SVG icons used throughout the data table
 * components. Centralizing icons improves performance by:
 * 
 * 1. Reducing SVG duplication in the bundle
 * 2. Ensuring consistent memoization across components
 * 3. Improving render performance with proper React.memo usage
 * 4. Adding proper accessibility attributes
 * 
 * Each icon is created as a separate component with proper display names
 * to help with debugging and profiling.
 */

import React from "react";

// --- Expand/Collapse Icons ---

/**
 * Expand icon (right-facing chevron)
 */
export const ExpandIcon = React.memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className="h-3 w-3"
    aria-hidden="true"
    role="img"
  >
    <path 
      fillRule="evenodd" 
      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" 
      clipRule="evenodd" 
    />
  </svg>
));
ExpandIcon.displayName = 'ExpandIcon';

/**
 * Collapse icon (down-facing chevron)
 */
export const CollapseIcon = React.memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 20 20" 
    fill="currentColor" 
    className="h-3 w-3"
    aria-hidden="true"
    role="img"
  >
    <path 
      fillRule="evenodd" 
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" 
      clipRule="evenodd" 
    />
  </svg>
));
CollapseIcon.displayName = 'CollapseIcon';

// --- Pagination Icons ---

/**
 * Previous page navigation icon
 */
export const PreviousPageIcon = React.memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-3 w-3"
    aria-hidden="true"
    role="img"
  >
    <path d="m15 18-6-6 6-6"></path>
  </svg>
));
PreviousPageIcon.displayName = 'PreviousPageIcon';

/**
 * Next page navigation icon
 */
export const NextPageIcon = React.memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-3 w-3"
    aria-hidden="true"
    role="img"
  >
    <path d="m9 18 6-6-6-6"></path>
  </svg>
));
NextPageIcon.displayName = 'NextPageIcon';

// --- Filter & Sort Icons ---

/**
 * Filter icon for column headers
 */
export const FilterIcon = React.memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-3.5 w-3.5"
    aria-hidden="true"
    role="img"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
));
FilterIcon.displayName = 'FilterIcon';

/**
 * Sort ascending icon (up arrow)
 */
export const SortAscIcon = React.memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-3.5 w-3.5"
    aria-hidden="true"
    role="img"
  >
    <path d="m18 15-6-6-6 6"></path>
  </svg>
));
SortAscIcon.displayName = 'SortAscIcon';

/**
 * Sort descending icon (down arrow)
 */
export const SortDescIcon = React.memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-3.5 w-3.5"
    aria-hidden="true"
    role="img"
  >
    <path d="m6 9 6 6 6-6"></path>
  </svg>
));
SortDescIcon.displayName = 'SortDescIcon';

/**
 * Sort both direction icon (up/down arrows)
 */
export const SortBothIcon = React.memo(() => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="h-4 w-4 opacity-50"
    aria-hidden="true"
    role="img"
  >
    <path d="m7 15 5 5 5-5"></path>
    <path d="m7 9 5-5 5 5"></path>
  </svg>
));
SortBothIcon.displayName = 'SortBothIcon'; 