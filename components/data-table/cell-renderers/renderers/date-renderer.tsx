import React from "react";
import { CellRendererProps, DateRendererConfig } from "../core/types";

/**
 * Date Cell Renderer
 * 
 * Renders date values with localized formatting using Intl.DateTimeFormat.
 * This renderer handles various date formats and provides extensive
 * configuration options for date and time display.
 * 
 * Features:
 * - Locale-aware date formatting
 * - Configurable date/time components
 * - Multiple date format styles
 * - Timezone support
 * - Invalid date handling
 * - Custom CSS class support
 * 
 * @param props - Cell renderer props containing the date value
 * @param config - Configuration options for date formatting
 * 
 * @example
 * ```tsx
 * // Basic usage (defaults to short date format)
 * dateRenderer(props)
 * 
 * // Full date and time in French
 * dateRenderer(props, {
 *   locale: 'fr-FR',
 *   options: {
 *     dateStyle: 'full',
 *     timeStyle: 'long'
 *   }
 * })
 * 
 * // Custom format
 * dateRenderer(props, {
 *   locale: 'en-US',
 *   options: {
 *     weekday: 'long',
 *     year: 'numeric',
 *     month: 'long',
 *     day: 'numeric',
 *     hour: '2-digit',
 *     minute: '2-digit',
 *     timeZone: 'UTC'
 *   }
 * })
 * ```
 * 
 * @returns A div element containing the formatted date
 */
export function dateRenderer(
  props: CellRendererProps,
  config?: DateRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  // Handle empty values
  if (!value) return <div className={config?.className}>-</div>;
  
  try {
    const date = new Date(value as string);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    // Default date format options
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    // Use provided options or defaults
    const options = config?.options || defaultOptions;
    
    return (
      <div className={config?.className}>
        {date.toLocaleDateString(config?.locale, options)}
      </div>
    );
  } catch {
    // Fallback for invalid dates
    return <div className={config?.className}>{String(value)}</div>;
  }
} 