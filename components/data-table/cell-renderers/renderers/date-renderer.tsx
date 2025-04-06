import React from "react";
import { CellRendererProps, DateRendererConfig } from "../core/types";

/**
 * Renders a date value with customizable formatting
 * @param props - Cell renderer props
 * @param config - Date renderer configuration
 * @returns Rendered date cell
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