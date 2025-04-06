import React from "react";
import { CellRendererProps, CurrencyRendererConfig } from "../core/types";

/**
 * Renders a currency value with proper formatting
 * @param props - Cell renderer props 
 * @param config - Currency renderer configuration
 * @returns Rendered currency cell
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