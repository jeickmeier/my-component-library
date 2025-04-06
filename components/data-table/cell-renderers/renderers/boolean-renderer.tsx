import React from "react";
import { BooleanRendererConfig, CellRendererProps } from "../core/types";

/**
 * Boolean Cell Renderer
 * 
 * Renders boolean values with customizable icons and text labels.
 * This renderer provides a visually appealing way to display true/false
 * values with configurable representations and styling.
 * 
 * Features:
 * - Customizable true/false text labels
 * - Configurable icons for each state
 * - Color-coded indicators (green for true, red for false)
 * - Accessible visual representation
 * - Flexible layout with icon and text
 * - Custom CSS class support
 * 
 * @param props - Cell renderer props containing the boolean value
 * @param config - Configuration options for boolean display
 * 
 * @example
 * ```tsx
 * // Basic usage (defaults to Yes/No with checkmark/x)
 * booleanRenderer(props)
 * 
 * // Custom text labels
 * booleanRenderer(props, {
 *   yesText: 'Active',
 *   noText: 'Inactive'
 * })
 * 
 * // Custom icons and styling
 * booleanRenderer(props, {
 *   yesText: 'Online',
 *   noText: 'Offline',
 *   yesIcon: '🟢',
 *   noIcon: '🔴',
 *   className: 'my-boolean-cell'
 * })
 * ```
 * 
 * @returns A div element containing the boolean indicator and label
 */
export function booleanRenderer(
  props: CellRendererProps,
  config?: BooleanRendererConfig
): React.ReactNode {
  const value = props.row?.getValue(props.column?.id as string) as boolean;
  
  // Extract configuration or use defaults
  const yesText = config?.yesText || "Yes";
  const noText = config?.noText || "No";
  const yesIcon = config?.yesIcon || "✓";
  const noIcon = config?.noIcon || "✗";
  
  // Base class plus any custom classes from config
  const baseClass = "flex items-center";
  const className = config?.className 
    ? `${baseClass} ${config.className}`
    : baseClass;
  
  return (
    <div className={className}>
      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
        value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}>
        {value ? yesIcon : noIcon}
      </span>
      <span className="ml-2">{value ? yesText : noText}</span>
    </div>
  );
} 