import React from "react";
import { CellRendererProps, StatusRendererConfig } from "../core/types";

/**
 * Default color mappings for common status values.
 * These colors use Tailwind CSS classes and provide a sensible default
 * for common status states.
 * 
 * @example
 * ```ts
 * // Override or extend these defaults in your config:
 * {
 *   colorMap: {
 *     ...DEFAULT_COLOR_MAP,
 *     'custom-status': 'bg-purple-500'
 *   }
 * }
 * ```
 */
const DEFAULT_COLOR_MAP: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500", 
  success: "bg-green-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
  error: "bg-red-500",
  canceled: "bg-gray-500"
};

/**
 * Status Cell Renderer
 * 
 * Renders a status value with a colored indicator dot and capitalized text.
 * This renderer is ideal for displaying state, status, or progress indicators
 * in a visually appealing and consistent way.
 * 
 * Features:
 * - Colored dot indicator
 * - Capitalized status text
 * - Configurable color mapping
 * - Default colors for common statuses
 * - Custom CSS class support
 * - Empty value handling
 * 
 * @param props - Cell renderer props containing the status value
 * @param config - Configuration options for status rendering
 * 
 * @example
 * ```tsx
 * // Basic usage with default colors
 * statusRenderer(props)
 * 
 * // With custom color mapping
 * statusRenderer(props, {
 *   colorMap: {
 *     active: 'bg-green-500',
 *     inactive: 'bg-red-500',
 *     maintenance: 'bg-yellow-500'
 *   },
 *   className: 'my-status-cell'
 * })
 * ```
 * 
 * @returns A div element containing the status indicator and text
 */
export function statusRenderer(
  props: CellRendererProps,
  config?: StatusRendererConfig
): React.ReactNode {
  const value = props.row?.getValue(props.column?.id as string) as string;
  
  // If no value, display a placeholder
  if (!value) return <div className={config?.className}>-</div>;
  
  // Use custom color map or default
  const colorMap = config?.colorMap || DEFAULT_COLOR_MAP;
  
  // Normalize the status value for matching
  const normalizedValue = String(value).toLowerCase();
  
  // Select color based on value or use gray as fallback
  const statusColor = colorMap[normalizedValue] || "bg-gray-500";
  
  // Base class plus any custom classes from config
  const baseClass = "flex items-center";
  const className = config?.className 
    ? `${baseClass} ${config.className}`
    : baseClass;
  
  return (
    <div className={className}>
      <span className={`mr-2 h-2 w-2 rounded-full ${statusColor}`} />
      <span className="capitalize">{value}</span>
    </div>
  );
} 