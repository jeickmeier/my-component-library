import { CellRendererFunction } from "./types";

/**
 * Registry to map cell renderer types to implementations
 */
export class CellRendererRegistry {
  private renderers: Record<string, CellRendererFunction> = {};
  private defaultRenderer?: CellRendererFunction;

  /**
   * Register a cell renderer with the registry
   * @param type - The unique identifier for this renderer
   * @param renderer - The renderer function implementation
   * @returns The registry instance for chaining
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
   * Set the default renderer to use when a requested type is not found
   * @param renderer - The default renderer function
   * @returns The registry instance for chaining
   */
  setDefaultRenderer(renderer: CellRendererFunction): CellRendererRegistry {
    this.defaultRenderer = renderer;
    return this;
  }

  /**
   * Get a renderer by type
   * @param type - The unique identifier for the renderer
   * @returns The renderer function or the default renderer if not found
   */
  get(type: string): CellRendererFunction | undefined {
    return this.renderers[type] || this.defaultRenderer;
  }

  /**
   * Check if a renderer exists
   * @param type - The unique identifier to check
   * @returns True if the renderer exists
   */
  has(type: string): boolean {
    return !!this.renderers[type];
  }

  /**
   * Get all registered renderer types
   * @returns Array of registered renderer type names
   */
  getTypes(): string[] {
    return Object.keys(this.renderers);
  }

  /**
   * Clear all registered renderers
   */
  clear(): void {
    this.renderers = {};
    this.defaultRenderer = undefined;
  }
} 