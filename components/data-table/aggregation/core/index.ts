export * from './types'
export * from './registry'

import { AggregationFunctionRegistry } from './registry'
import { createAggregationFunctionRegistry } from '..'

/**
 * Global registry instance
 */
let globalRegistryInstance: AggregationFunctionRegistry | null = null

/**
 * Flag to prevent circular initialization
 */
let isInitializing = false

/**
 * Get or create the global aggregation function registry
 * 
 * Note: This automatically populates the registry with standard functions if it's empty.
 */
export function getGlobalRegistry(): AggregationFunctionRegistry {
  if (!globalRegistryInstance && !isInitializing) {
    isInitializing = true;
    try {
      // Create a registry with standard functions
      globalRegistryInstance = createAggregationFunctionRegistry();
    } catch (error) {
      // Fallback to empty registry if we hit circular dependency
      console.warn('Failed to initialize registry with standard functions, creating empty registry', error);
      globalRegistryInstance = new AggregationFunctionRegistry();
    } finally {
      isInitializing = false;
    }
  }
  return globalRegistryInstance as AggregationFunctionRegistry
}

/**
 * Set the global registry instance
 */
export function setGlobalRegistry(registry: AggregationFunctionRegistry): void {
  globalRegistryInstance = registry
}

/**
 * Clear the global registry (useful for testing)
 */
export function clearGlobalRegistry(): void {
  if (globalRegistryInstance) {
    globalRegistryInstance.clear()
  }
  globalRegistryInstance = null
} 