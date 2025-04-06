/**
 * Aggregation Core Module
 * 
 * This module provides the core functionality for managing aggregation functions in the data table.
 * It includes a global registry system that maintains a singleton instance of the aggregation
 * function registry, ensuring consistent access to aggregation functions throughout the application.
 * 
 * Key Features:
 * - Global registry management
 * - Automatic initialization with standard functions
 * - Circular dependency protection
 * - Registry state management utilities
 * 
 * @module aggregation/core
 */

export * from './types'
export * from './registry'

import { AggregationFunctionRegistry } from './registry'
import { createAggregationFunctionRegistry } from '..'

/**
 * Global singleton instance of the aggregation function registry.
 * @private
 */
let globalRegistryInstance: AggregationFunctionRegistry | null = null

/**
 * Flag to prevent circular initialization of the registry.
 * @private
 */
let isInitializing = false

/**
 * Gets or creates the global aggregation function registry.
 * 
 * This function ensures that only one registry instance exists globally and
 * automatically initializes it with standard aggregation functions if needed.
 * It includes protection against circular dependencies during initialization.
 * 
 * @returns The global aggregation function registry instance
 * 
 * @example
 * ```ts
 * const registry = getGlobalRegistry();
 * const sumFn = registry.get('sum');
 * ```
 * 
 * @throws {Warning} If initialization with standard functions fails
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
 * Sets the global registry instance.
 * 
 * This function allows replacing the global registry with a custom instance,
 * useful for testing or specialized configurations.
 * 
 * @param registry - The new registry instance to use globally
 * 
 * @example
 * ```ts
 * const customRegistry = new AggregationFunctionRegistry();
 * customRegistry.register('custom', myCustomFn);
 * setGlobalRegistry(customRegistry);
 * ```
 */
export function setGlobalRegistry(registry: AggregationFunctionRegistry): void {
  globalRegistryInstance = registry
}

/**
 * Clears the global registry instance.
 * 
 * This function removes all registered functions and resets the global registry
 * to null. Particularly useful in testing scenarios or when needing to reset
 * the application state.
 * 
 * @example
 * ```ts
 * // In a test setup
 * beforeEach(() => {
 *   clearGlobalRegistry();
 * });
 * ```
 */
export function clearGlobalRegistry(): void {
  if (globalRegistryInstance) {
    globalRegistryInstance.clear()
  }
  globalRegistryInstance = null
} 