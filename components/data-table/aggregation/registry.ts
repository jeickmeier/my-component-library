/**
 * Aggregation Registry Module
 * 
 * This module provides a registry system for managing aggregation functions.
 * It implements a simplified registry pattern that allows for dynamic 
 * registration and retrieval of aggregation functions.
 */

import { AggregationFunction, AggregationFunctionConfig } from "./types"

/**
 * Registry class for managing aggregation functions.
 */
export class AggregationFunctionRegistry {
  private registry = new Map<string, {
    fn: AggregationFunction,
    config: AggregationFunctionConfig
  }>();
  
  private defaultFn?: AggregationFunction;

  /**
   * Registers a new aggregation function with the registry.
   */
  register(
    type: string,
    fn: AggregationFunction,
    config: AggregationFunctionConfig = {}
  ): AggregationFunctionRegistry {
    if (this.has(type)) {
      console.warn(`Aggregation function "${type}" is already registered. It will be overwritten.`);
    }
    
    this.registry.set(type, { fn, config });
    return this;
  }

  /**
   * Sets the default aggregation function to use when a requested function is not found.
   */
  setDefaultFunction(fn: AggregationFunction): AggregationFunctionRegistry {
    this.defaultFn = fn;
    return this;
  }

  /**
   * Retrieves an aggregation function by its type.
   */
  get(type: string): AggregationFunction | undefined {
    return this.registry.get(type)?.fn || this.defaultFn;
  }

  /**
   * Retrieves the configuration for an aggregation function.
   */
  getConfig(type: string): AggregationFunctionConfig | undefined {
    return this.registry.get(type)?.config;
  }

  /**
   * Checks if an aggregation function is registered.
   */
  has(type: string): boolean {
    return this.registry.has(type);
  }

  /**
   * Returns an array of all registered aggregation function types.
   */
  getTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Removes all registered aggregation functions and configurations.
   */
  clear(): void {
    this.registry.clear();
    this.defaultFn = undefined;
  }
} 