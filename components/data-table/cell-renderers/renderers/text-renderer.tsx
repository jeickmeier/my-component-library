import React from "react";
import { CellRendererProps, TextRendererConfig } from "../core/types";

/**
 * Renders a cell value as text with optional truncation
 * @param props - Cell renderer props
 * @param config - Text renderer configuration
 * @returns Rendered text cell
 */
export function textRenderer(
  props: CellRendererProps,
  config?: TextRendererConfig
): React.ReactNode {
  const value = props.getValue();
  const text = String(value || '');
  
  if (!text) return <div className={config?.className}>-</div>;
  
  // Apply truncation if configured
  if (config?.truncate && config?.maxLength && text.length > config.maxLength) {
    return (
      <div className={config?.className} title={text}>
        {text.substring(0, config.maxLength)}...
      </div>
    );
  }
  
  return <div className={config?.className}>{text}</div>;
} 