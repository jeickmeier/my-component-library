export * from './types';
export * from './registry';

/**
 * Creates a registry service instance
 */
let globalRegistryInstance: CellRendererRegistry | null = null;

import { CellRendererRegistry } from './registry';

/**
 * Get or lazily creates the global cell renderer registry
 */
export function getGlobalRegistry(): CellRendererRegistry {
  if (!globalRegistryInstance) {
    globalRegistryInstance = new CellRendererRegistry();
  }
  return globalRegistryInstance;
}

/**
 * Clear the global registry (useful for testing)
 */
export function clearGlobalRegistry(): void {
  if (globalRegistryInstance) {
    globalRegistryInstance.clear();
  }
  globalRegistryInstance = null;
} 