import { AggregationFunction, AggregationFunctionConfig } from "./types"

/**
 * Registry for aggregation functions
 */
export class AggregationFunctionRegistry {
  private functions: Record<string, AggregationFunction> = {}
  private configs: Record<string, AggregationFunctionConfig> = {}
  private defaultFunction?: AggregationFunction

  /**
   * Register a aggregation function with the registry
   * @param type - The unique identifier for this aggregation function
   * @param fn - The aggregation function implementation
   * @returns The registry instance for chaining
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
   * Set the default aggregation function
   * @param fn - The default aggregation function
   * @returns The registry instance for chaining
   */
  setDefaultFunction(fn: AggregationFunction): AggregationFunctionRegistry {
    this.defaultFunction = fn
    return this
  }

  /**
   * Get a aggregation function by type
   * @param type - The unique identifier for the aggregation function
   * @returns The aggregation function or the default aggregation function if not found
   */
  get(type: string): AggregationFunction | undefined {
    const fn = this.functions[type] || this.defaultFunction
    return fn
  }

  /**
   * Get configuration for an aggregation function
   */
  getConfig(type: string): AggregationFunctionConfig | undefined {
    return this.configs[type]
  }

  /**
   * Check if an aggregation function exists
   */
  has(type: string): boolean {
    return !!this.functions[type]
  }

  /**
   * Get all registered aggregation function types
   */
  getTypes(): string[] {
    return Object.keys(this.functions)
  }

  /**
   * Clear all registered aggregation functions
   */
  clear(): void {
    this.functions = {}
    this.configs = {}
    this.defaultFunction = undefined
  }
} 