import React from "react";
import { CellRendererProps, CurrencyRendererConfig } from "../core/types";

/**
 * Currency Cell Renderer
 * 
 * Renders numeric values as formatted currency amounts using Intl.NumberFormat.
 * This renderer provides locale-aware currency formatting with configurable options
 * for precision, currency code, and display style.
 * 
 * Features:
 * - Locale-aware currency formatting
 * - Configurable currency code (ISO 4217)
 * - Customizable decimal places
 * - Automatic symbol placement based on locale
 * - Fallback handling for invalid values
 * - Custom CSS class support
 * 
 * @param props - Cell renderer props containing the numeric value
 * @param config - Configuration options for currency formatting
 * 
 * @example
 * ```tsx
 * // Basic usage (defaults to USD)
 * currencyRenderer(props)
 * 
 * // Euro with German locale
 * currencyRenderer(props, {
 *   currency: 'EUR',
 *   locale: 'de-DE'
 * })
 * 
 * // Custom formatting
 * currencyRenderer(props, {
 *   currency: 'JPY',
 *   locale: 'ja-JP',
 *   options: {
 *     minimumFractionDigits: 0,
 *     currencyDisplay: 'name'
 *   }
 * })
 * ```
 * 
 * @returns A div element containing the formatted currency value
 */
export function currencyRenderer(
  props: CellRendererProps,
  config?: CurrencyRendererConfig
): React.ReactNode {
  // Get value and parse as float
  const rawValue = props.row?.getValue(props.column?.id as string);
  const value = typeof rawValue === 'number' 
    ? rawValue 
    : parseFloat(String(rawValue));
  
  // Handle invalid values
  if (isNaN(value)) return <div className={config?.className}>-</div>;
  
  // Default currency and locale
  const currency = config?.currency || "USD";
  const locale = config?.locale || "en-US";
  
  // Default formatting options
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  
  // Merge default options with custom options
  const options = {
    ...defaultOptions,
    ...(config?.options || {})
  };
  
  // Format the currency value
  const formatted = new Intl.NumberFormat(locale, options).format(value);
  
  // Base class plus any custom classes from config
  const baseClass = "font-medium";
  const className = config?.className 
    ? `${baseClass} ${config.className}`
    : baseClass;
  
  return <div className={className}>{formatted}</div>;
} 