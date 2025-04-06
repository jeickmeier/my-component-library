/**
 * Aggregation Registry Module
 * 
 * This module provides a central registry system for managing aggregation functions
 * in the data table. It implements a flexible and type-safe registry pattern that
 * allows for dynamic registration and management of aggregation functions.
 * 
 * Key Features:
 * - Type-safe function registration and retrieval
 * - Configuration management for each function
 * - Default function fallback mechanism
 * - Registry state management
 * - Method chaining support
 * 
 * The registry is designed to be used both as a global singleton (via the core/index
 * module) and as individual instances for specialized use cases.
 * 
 * @module aggregation/registry
 */

import { AggregationFunction, AggregationFunctionConfig } from "./types"

/**
 * Registry class for managing aggregation functions.
 * 
 * The registry maintains a collection of aggregation functions and their configurations,
 * providing a centralized system for registering, retrieving, and managing them.
 * 
 * Features:
 * - Type-safe function registration and retrieval
 * - Configuration management for each function
 * - Default function fallback
 * - Method chaining for fluent API
 * - Registry state management
 * 
 * The registry is typically used through the global instance, but can also be
 * instantiated separately for specialized use cases or testing.
 * 
 * @example
 * ```ts
 * // Create a new registry
 * const registry = new AggregationFunctionRegistry();
 * 
 * // Register a sum function
 * registry.register('sum', (columnId, leafRows) => {
 *   return leafRows.reduce((sum, row) => {
 *     const value = row.getValue(columnId);
 *     return sum + (typeof value === 'number' ? value : 0);
 *   }, 0);
 * }, {
 *   label: 'Sum',
 *   description: 'Adds up all values in the group'
 * });
 * 
 * // Use the function
 * const sumFn = registry.get('sum');
 * const total = sumFn?.(columnId, rows);
 * ```
 */
export class AggregationFunctionRegistry {
  /**
   * Map of registered aggregation functions.
   * Keys are function type identifiers, values are the function implementations.
   * @private
   */
  private functions: Record<string, AggregationFunction> = {}
  
  /**
   * Map of configurations for registered functions.
   * Keys are function type identifiers, values are the configuration objects.
   * @private
   */
  private configs: Record<string, AggregationFunctionConfig> = {}
  
  /**
   * Optional default function used when requested function is not found.
   * This provides a fallback mechanism for handling unknown function types.
   * @private
   */
  private defaultFunction?: AggregationFunction

  /**
   * Registers a new aggregation function with the registry.
   * 
   * This method adds a new function to the registry or updates an existing one.
   * It supports method chaining for registering multiple functions in sequence.
   * 
   * Features:
   * - Type-safe function registration
   * - Configuration management
   * - Overwrite protection with warning
   * - Method chaining support
   * 
   * @param type - Unique identifier for the aggregation function
   * @param fn - The aggregation function implementation
   * @param config - Optional configuration for the function
   * @returns The registry instance for method chaining
   * 
   * @example
   * ```ts
   * registry
   *   .register('sum', sumFn, { label: 'Sum' })
   *   .register('avg', avgFn, { label: 'Average' })
   *   .register('max', maxFn, { label: 'Maximum' });
   * ```
   * 
   * @throws {Warning} If a function with the same type already exists
   */
  register(
    type: string,
    fn: AggregationFunction,
    config: AggregationFunctionConfig = {}
  ): AggregationFunctionRegistry {
    if (this.has(type)) {
      console.warn(`Aggregation function "${type}" is already registered. It will be overwritten.`)
    }
    this.functions[type] = fn
    this.configs[type] = config
    return this
  }

  /**
   * Sets the default aggregation function to use when a requested function is not found.
   * 
   * The default function serves as a fallback when get() is called with an
   * unregistered function type. This is useful for providing graceful degradation
   * or default behavior for unknown aggregation types.
   * 
   * @param fn - The fallback aggregation function
   * @returns The registry instance for method chaining
   * 
   * @example
   * ```ts
   * // Set a default function that returns null for unknown types
   * registry.setDefaultFunction((columnId, rows) => null);
   * 
   * // Set a default function that uses 'count' for unknown types
   * registry.setDefaultFunction((columnId, rows) => rows.length);
   * ```
   */
  setDefaultFunction(fn: AggregationFunction): AggregationFunctionRegistry {
    this.defaultFunction = fn
    return this
  }

  /**
   * Retrieves an aggregation function by its type.
   * 
   * This method returns the requested function or the default function if:
   * 1. The requested type is not found
   * 2. A default function has been set
   * 
   * @param type - The unique identifier of the aggregation function
   * @returns The requested aggregation function or the default function
   * 
   * @example
   * ```ts
   * // Get and use a registered function
   * const sumFn = registry.get('sum');
   * if (sumFn) {
   *   const total = sumFn(columnId, rows);
   *   console.log('Sum:', total);
   * }
   * 
   * // Handle case where function might not exist
   * const unknownFn = registry.get('unknown');
   * const result = unknownFn?.(columnId, rows) ?? 0;
   * ```
   */
  get(type: string): AggregationFunction | undefined {
    const fn = this.functions[type] || this.defaultFunction
    return fn
  }

  /**
   * Retrieves the configuration for an aggregation function.
   * 
   * The configuration contains metadata about the function such as its
   * display label, description, and any function-specific settings.
   * 
   * @param type - The unique identifier of the aggregation function
   * @returns The configuration object for the function or undefined if not found
   * 
   * @example
   * ```ts
   * const config = registry.getConfig('sum');
   * if (config) {
   *   console.log('Label:', config.label);
   *   console.log('Description:', config.description);
   * }
   * ```
   */
  getConfig(type: string): AggregationFunctionConfig | undefined {
    return this.configs[type]
  }

  /**
   * Checks if an aggregation function is registered.
   * 
   * This method verifies whether a function type exists in the registry,
   * not counting the default function.
   * 
   * @param type - The unique identifier of the aggregation function
   * @returns True if the function exists in the registry
   * 
   * @example
   * ```ts
   * if (registry.has('sum')) {
   *   const sumFn = registry.get('sum');
   *   // Use sumFn...
   * } else {
   *   console.log('Sum function not available');
   * }
   * ```
   */
  has(type: string): boolean {
    return !!this.functions[type]
  }

  /**
   * Returns an array of all registered aggregation function types.
   * 
   * This method provides a way to discover all available aggregation functions
   * in the registry. Useful for building UIs or validating configurations.
   * 
   * @returns Array of registered function type identifiers
   * 
   * @example
   * ```ts
   * // List all available aggregation types
   * const types = registry.getTypes();
   * console.log('Available aggregations:', types);
   * 
   * // Create a selection UI
   * const options = types.map(type => {
   *   const config = registry.getConfig(type);
   *   return {
   *     value: type,
   *     label: config?.label || type
   *   };
   * });
   * ```
   */
  getTypes(): string[] {
    return Object.keys(this.functions)
  }

  /**
   * Removes all registered aggregation functions and configurations.
   * 
   * This method completely resets the registry state by:
   * 1. Clearing all registered functions
   * 2. Clearing all function configurations
   * 3. Removing the default function
   * 
   * Useful for testing or when needing to rebuild the registry from scratch.
   * 
   * @example
   * ```ts
   * // In a test setup
   * beforeEach(() => {
   *   registry.clear();
   *   // Register test-specific functions...
   * });
   * 
   * // When switching configurations
   * registry.clear();
   * loadNewConfiguration(registry);
   * ```
   */
  clear(): void {
    this.functions = {}
    this.configs = {}
    this.defaultFunction = undefined
  }
} 