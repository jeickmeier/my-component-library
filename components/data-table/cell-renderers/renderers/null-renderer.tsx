import React from "react";
import { BaseRendererConfig, CellRendererProps } from "../core/types";

/**
 * Null Cell Renderer
 * 
 * A special renderer that always returns null, effectively hiding the cell content.
 * This renderer is useful for temporarily hiding columns or conditionally
 * suppressing cell content without removing the column definition.
 * 
 * Use cases:
 * - Hiding sensitive data in certain views
 * - Temporarily disabling column display
 * - Creating placeholder columns
 * - Supporting conditional column visibility
 * 
 * @param _ - Cell renderer props (unused)
 * @param __ - Configuration options (unused)
 * 
 * @example
 * ```tsx
 * // Basic usage
 * nullRenderer(props)
 * 
 * // In column definition
 * const columns = [{
 *   id: 'sensitive',
 *   cellRenderer: {
 *     type: 'null'
 *   }
 * }]
 * 
 * // Conditional usage
 * const columns = [{
 *   id: 'data',
 *   cellRenderer: {
 *     type: hasPermission ? 'text' : 'null'
 *   }
 * }]
 * ```
 * 
 * @returns null - Always returns null regardless of input
 */
export function nullRenderer(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _: CellRendererProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __?: BaseRendererConfig
): React.ReactNode {
  return null;
} 