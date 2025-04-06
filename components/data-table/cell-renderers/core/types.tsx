/**
 * Core Types Module
 * 
 * This module defines the fundamental types and interfaces used by the cell renderer system.
 * It provides type definitions for renderer functions, their props, and configuration options.
 */

import React from "react";

/**
 * Base props passed to all cell renderer functions.
 * These props provide access to the cell's value and context.
 * 
 * @property row Optional row context with methods to access row data
 * @property column Optional column context with column identifier
 * @property table Optional table-wide context
 * @property getValue Function to get the current cell's value
 */
export type CellRendererProps = {
  row?: {
    getValue: (columnId: string) => unknown;
    [key: string]: unknown;
  };
  column?: {
    id: string;
    [key: string]: unknown;
  };
  table?: Record<string, unknown>;
  getValue: () => unknown;
  [key: string]: unknown;
};

/**
 * Base configuration interface for all renderers.
 * Provides common styling options that all renderers can use.
 * 
 * @property className Optional CSS class name to apply to the rendered element
 */
export interface BaseRendererConfig {
  className?: string;
}

/**
 * Configuration options for the text renderer.
 * Controls how text content is displayed and truncated.
 * 
 * @property truncate Whether to truncate text that exceeds maxLength
 * @property maxLength Maximum number of characters before truncation
 */
export interface TextRendererConfig extends BaseRendererConfig {
  truncate?: boolean;
  maxLength?: number;
}

/**
 * Configuration options for the status renderer.
 * Maps status values to their display colors.
 * 
 * @property colorMap Object mapping status values to color values
 * @example
 * ```ts
 * {
 *   active: 'green',
 *   inactive: 'red',
 *   pending: 'yellow'
 * }
 * ```
 */
export interface StatusRendererConfig extends BaseRendererConfig {
  colorMap?: Record<string, string>;
}

/**
 * Configuration options for the currency renderer.
 * Controls how currency values are formatted.
 * 
 * @property currency ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @property locale BCP 47 language tag for localization
 * @property options Additional Intl.NumberFormat options
 * 
 * @example
 * ```ts
 * {
 *   currency: 'USD',
 *   locale: 'en-US',
 *   options: { minimumFractionDigits: 2 }
 * }
 * ```
 */
export interface CurrencyRendererConfig extends BaseRendererConfig {
  currency?: string;
  locale?: string;
  options?: Intl.NumberFormatOptions;
}

/**
 * Configuration options for the date renderer.
 * Controls how dates are formatted and localized.
 * 
 * @property locale BCP 47 language tag for localization
 * @property options Intl.DateTimeFormat options for customizing the format
 * 
 * @example
 * ```ts
 * {
 *   locale: 'en-US',
 *   options: { 
 *     dateStyle: 'full',
 *     timeStyle: 'short'
 *   }
 * }
 * ```
 */
export interface DateRendererConfig extends BaseRendererConfig {
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}

/**
 * Configuration options for the boolean renderer.
 * Customizes how boolean values are displayed.
 * 
 * @property yesText Text to display for true values
 * @property noText Text to display for false values
 * @property yesIcon Icon to display for true values
 * @property noIcon Icon to display for false values
 * 
 * @example
 * ```ts
 * {
 *   yesText: 'Active',
 *   noText: 'Inactive',
 *   yesIcon: '✓',
 *   noIcon: '✗'
 * }
 * ```
 */
export interface BooleanRendererConfig extends BaseRendererConfig {
  yesText?: string;
  noText?: string;
  yesIcon?: string;
  noIcon?: string;
}

/**
 * Function type for cell renderers.
 * Defines the signature that all cell renderer functions must implement.
 * 
 * @template TConfig Type of the configuration object, must extend BaseRendererConfig
 * @param props Props containing cell value and context
 * @param config Optional configuration object
 * @returns React node to render in the cell
 * 
 * @example
 * ```tsx
 * const myRenderer: CellRendererFunction<MyConfig> = (props, config) => {
 *   const value = props.getValue();
 *   return <div className={config?.className}>{value}</div>;
 * };
 * ```
 */
export type CellRendererFunction<TConfig extends BaseRendererConfig = BaseRendererConfig> = (
  props: CellRendererProps,
  config?: TConfig
) => React.ReactNode; 