/**
 * Cell Renderers
 * 
 * A collection of reusable cell renderers for data tables with a registry
 * pattern for easy extension and configuration.
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
 * Create a registry with common built-in renderers
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
 * Get or create the global cell renderer registry
 * @returns The global cell renderer registry
 */
export function getGlobalCellRendererRegistry(): CellRendererRegistry {
  return getGlobalRegistry();
} 