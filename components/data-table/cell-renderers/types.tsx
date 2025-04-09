/**
 * Core Types Module
 * 
 * This module defines the fundamental types and interfaces used by the cell renderer system.
 * It provides type definitions for renderer functions, their props, and configuration options.
 */

import * as React from "react";

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
 * @property positiveColor Color for positive values (e.g. 'green', '#00ff00')
 * @property negativeColor Color for negative values (e.g. 'red', '#ff0000')
 * 
 * @example
 * ```ts
 * {
 *   currency: 'USD',
 *   locale: 'en-US',
 *   options: { minimumFractionDigits: 2 },
 *   positiveColor: 'green',
 *   negativeColor: 'red'
 * }
 * ```
 */
export interface CurrencyRendererConfig extends BaseRendererConfig {
  currency?: string;
  locale?: string;
  options?: Intl.NumberFormatOptions;
  positiveColor?: string;
  negativeColor?: string;
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
 * Configuration options for the null renderer.
 * Controls how null or undefined values are displayed.
 * 
 * @property placeholder Text to display for null values
 */
export interface NullRendererConfig extends BaseRendererConfig {
  placeholder?: string;
}

/**
 * Function type for cell renderers.
 * Defines the signature that all cell renderer functions must implement.
 * 
 * @template TConfig Type of the configuration object, must extend BaseRendererConfig
 * @param props Props containing cell value and context
 * @param config Optional configuration object
 * @returns React node to render in the cell
 */
export type CellRendererFunction<TConfig extends BaseRendererConfig = BaseRendererConfig> = (
  props: CellRendererProps,
  config?: TConfig
) => React.ReactNode;

/**
 * Renderer Type
 * 
 * Defines the possible types of cell renderers.
 */
export type RendererType = 
  | 'text' 
  | 'status' 
  | 'currency' 
  | 'date' 
  | 'boolean' 
  | 'null'
  | 'decimal'
  | 'starRating'
  | 'sparklineHistogram';

/**
 * Renderer Configuration
 * 
 * Defines the configuration options for cell renderers.
 */
export interface RendererConfig {
  text?: TextRendererConfig;
  status?: StatusRendererConfig;
  currency?: CurrencyRendererConfig;
  date?: DateRendererConfig;
  boolean?: BooleanRendererConfig;
  null?: NullRendererConfig;
  decimal?: DecimalRendererConfig;
  starRating?: StarRatingRendererConfig;
  sparklineHistogram?: SparklineHistogramRendererConfig;
}

/**
 * Decimal Renderer Configuration
 * 
 * Configuration options for the decimal cell renderer.
 */
export interface DecimalRendererConfig {
  decimals?: number;           // Number of decimal places to display
  thousand_separator?: boolean; // Whether to use thousand separators
  className?: string;          // Optional CSS class for the cell
  locale?: string;             // Optional locale for number formatting
  positiveColor?: string;      // Color for positive values (e.g. 'green', '#00ff00')
  negativeColor?: string;      // Color for negative values (e.g. 'red', '#ff0000')
}

/**
 * Configuration options for the star rating renderer.
 * Controls how star ratings are displayed.
 */
export interface StarRatingRendererConfig extends BaseRendererConfig {
  maxRating?: number;          // Maximum rating value (default: 5)
  color?: string;              // Color of the stars (default: '#facc15')
}

/**
 * Configuration options for the sparkline histogram renderer.
 * Controls how the histogram is displayed.
 */
export interface SparklineHistogramRendererConfig extends BaseRendererConfig {
  numBins?: number;            // Number of bins for the histogram (default: 10)
  height?: string;             // Height of the chart (default: "h-[50px]")
  width?: string;              // Width of the chart (default: "w-full")
  barColor?: string;           // Color of the bars (default: "hsl(var(--primary))")
  formatTooltipValue?: (value: number) => string; // Optional formatter for bin range values
} 