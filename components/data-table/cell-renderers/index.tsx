/**
 * Cell Renderers Module
 * 
 * A comprehensive system for rendering table cell content with different formats and styles.
 * This module implements a registry pattern that allows for:
 * 
 * - Easy registration of custom cell renderers
 * - Built-in renderers for common data types
 * - Global and local registry instances
 * - Configurable rendering behavior
 * 
 * Built-in renderers include:
 * - text: Basic text display with optional truncation
 * - status: Status indicators with configurable colors
 * - currency: Formatted currency values
 * - date: Localized date formatting
 * - boolean: Yes/No or custom boolean representations
 * - null: Customizable null value display
 * 
 * @module cell-renderers
 */

// Export all core types and utilities
export * from './core';

// Export all renderers
export * from './renderers';

// Re-export specific renderers for backward compatibility
import { 
  textRenderer,
  statusRenderer,
  currencyRenderer, 
  dateRenderer,
  booleanRenderer,
  nullRenderer
} from './renderers';

import { 
  CellRendererRegistry, 
  getGlobalRegistry 
} from './core';

/**
 * Creates a new cell renderer registry pre-loaded with common renderers.
 * 
 * This is the recommended way to create a new registry instance when you need
 * a separate registry from the global one. The registry comes pre-configured with
 * all built-in renderers.
 * 
 * @example
 * ```tsx
 * const registry = createCellRendererRegistry();
 * 
 * // Add a custom renderer
 * registry.register('custom', (props, config) => {
 *   return <div className={config.className}>{props.getValue()}</div>
 * });
 * ```
 * 
 * @returns A new CellRendererRegistry instance with built-in renderers
 */
export function createCellRendererRegistry(): CellRendererRegistry {
  const registry = new CellRendererRegistry();
  
  // Register all renderers
  registry.register('text', textRenderer);
  registry.register('status', statusRenderer);
  registry.register('currency', currencyRenderer);
  registry.register('date', dateRenderer);
  registry.register('boolean', booleanRenderer);
  registry.register('null', nullRenderer);
  
  return registry;
}

/**
 * Returns the global singleton instance of the cell renderer registry.
 * 
 * The global registry is useful when you want to share the same set of renderers
 * across different parts of your application. It's pre-loaded with all built-in
 * renderers and can be extended with custom ones.
 * 
 * @example
 * ```tsx
 * const globalRegistry = getGlobalCellRendererRegistry();
 * 
 * // Register a custom renderer globally
 * globalRegistry.register('custom', myCustomRenderer);
 * ```
 * 
 * @returns The global CellRendererRegistry instance
 */
export function getGlobalCellRendererRegistry(): CellRendererRegistry {
  return getGlobalRegistry();
} 