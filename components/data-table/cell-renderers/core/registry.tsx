/**
 * Registry Module
 * 
 * This module provides a registry system for managing cell renderers.
 * It allows for dynamic registration and retrieval of renderers, with support
 * for default fallback rendering when a specific renderer is not found.
 */

import { CellRendererFunction } from "./types";

/**
 * Registry class for managing cell renderers.
 * 
 * The registry maintains a collection of named renderer functions and provides
 * methods to register, retrieve, and manage them. It supports:
 * - Registration of new renderers
 * - Default fallback renderer
 * - Type-safe renderer retrieval
 * - Registry state management
 * 
 * @example
 * ```tsx
 * // Create a new registry
 * const registry = new CellRendererRegistry();
 * 
 * // Register a custom renderer
 * registry.register('custom', (props, config) => {
 *   return <MyCustomComponent value={props.getValue()} {...config} />;
 * });
 * 
 * // Set a default renderer
 * registry.setDefaultRenderer((props) => String(props.getValue()));
 * 
 * // Use a renderer
 * const renderer = registry.get('custom');
 * ```
 */
export class CellRendererRegistry {
  /** Map of registered renderer functions by type */
  private renderers: Record<string, CellRendererFunction> = {};
  
  /** Optional default renderer used when requested type is not found */
  private defaultRenderer?: CellRendererFunction;

  /**
   * Registers a new cell renderer function.
   * If a renderer with the same type already exists, it will be overwritten.
   * 
   * @param type - Unique identifier for the renderer
   * @param renderer - The renderer function implementation
   * @returns The registry instance for method chaining
   * 
   * @example
   * ```tsx
   * registry.register('currency', (props, config) => {
   *   const value = props.getValue() as number;
   *   return new Intl.NumberFormat(config?.locale).format(value);
   * });
   * ```
   * 
   * @throws {Warning} If a renderer with the same type already exists
   */
  register(
    type: string, 
    renderer: CellRendererFunction
  ): CellRendererRegistry {
    if (this.has(type)) {
      console.warn(`Renderer type "${type}" is already registered. It will be overwritten.`);
    }
    this.renderers[type] = renderer;
    return this;
  }

  /**
   * Sets the default renderer to use when a requested type is not found.
   * This provides a fallback for handling unknown renderer types.
   * 
   * @param renderer - The default renderer function
   * @returns The registry instance for method chaining
   * 
   * @example
   * ```tsx
   * registry.setDefaultRenderer((props) => {
   *   return <div className="default-cell">{String(props.getValue())}</div>;
   * });
   * ```
   */
  setDefaultRenderer(renderer: CellRendererFunction): CellRendererRegistry {
    this.defaultRenderer = renderer;
    return this;
  }

  /**
   * Retrieves a renderer function by its type.
   * Returns the default renderer if the requested type is not found and a default is set.
   * 
   * @param type - The unique identifier of the renderer
   * @returns The renderer function or the default renderer if not found
   * 
   * @example
   * ```tsx
   * const renderer = registry.get('currency');
   * if (renderer) {
   *   return renderer(props, { locale: 'en-US' });
   * }
   * ```
   */
  get(type: string): CellRendererFunction | undefined {
    return this.renderers[type] || this.defaultRenderer;
  }

  /**
   * Checks if a renderer is registered with the given type.
   * 
   * @param type - The unique identifier to check
   * @returns True if the renderer exists
   * 
   * @example
   * ```tsx
   * if (registry.has('currency')) {
   *   const renderer = registry.get('currency');
   * }
   * ```
   */
  has(type: string): boolean {
    return !!this.renderers[type];
  }

  /**
   * Returns an array of all registered renderer type identifiers.
   * Useful for introspection and debugging.
   * 
   * @returns Array of registered renderer type names
   * 
   * @example
   * ```tsx
   * const types = registry.getTypes();
   * console.log('Available renderers:', types);
   * // ['text', 'currency', 'date', ...]
   * ```
   */
  getTypes(): string[] {
    return Object.keys(this.renderers);
  }

  /**
   * Removes all registered renderers and the default renderer.
   * Useful when you need to reset the registry to a clean state.
   * 
   * @example
   * ```tsx
   * registry.clear();
   * console.log(registry.getTypes()); // []
   * ```
   */
  clear(): void {
    this.renderers = {};
    this.defaultRenderer = undefined;
  }
} 