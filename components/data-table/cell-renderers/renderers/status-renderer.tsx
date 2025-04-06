import React from "react";
import { CellRendererProps, StatusRendererConfig } from "../core/types";

/**
 * Default color map for common status values
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
 * Renders a status value with a color indicator
 * @param props - Cell renderer props
 * @param config - Status renderer configuration
 * @returns Rendered status cell
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