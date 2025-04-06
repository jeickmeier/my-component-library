import React from "react";
import { BooleanRendererConfig, CellRendererProps } from "../core/types";

/**
 * Renders a boolean value with customizable icons and text
 * @param props - Cell renderer props
 * @param config - Boolean renderer configuration
 * @returns Rendered boolean cell
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