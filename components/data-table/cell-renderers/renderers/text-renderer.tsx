import React from "react";
import { CellRendererProps, TextRendererConfig } from "../core/types";

/**
 * Text Cell Renderer
 * 
 * Renders a cell value as text with optional truncation support.
 * This is the most basic renderer and serves as the default for most text-based content.
 * 
 * Features:
 * - Basic text rendering
 * - Optional text truncation with ellipsis
 * - Tooltip showing full text when truncated
 * - Custom CSS class support
 * - Empty value handling
 * 
 * @param props - Cell renderer props containing the value to render
 * @param config - Configuration options for text rendering
 * 
 * @example
 * ```tsx
 * // Basic usage
 * textRenderer(props)
 * 
 * // With truncation
 * textRenderer(props, {
 *   truncate: true,
 *   maxLength: 50,
 *   className: 'my-text-cell'
 * })
 * ```
 * 
 * @returns A div element containing the rendered text
 */
export function textRenderer(
  props: CellRendererProps,
  config?: TextRendererConfig
): React.ReactNode {
  const value = props.getValue();
  const text = String(value || '');
  
  // Handle empty values with a placeholder
  if (!text) return <div className={config?.className}>-</div>;
  
  // Apply truncation if configured
  if (config?.truncate && config?.maxLength && text.length > config.maxLength) {
    return (
      <div className={config?.className} title={text}>
        {text.substring(0, config.maxLength)}...
      </div>
    );
  }
  
  // Render full text
  return <div className={config?.className}>{text}</div>;
} 