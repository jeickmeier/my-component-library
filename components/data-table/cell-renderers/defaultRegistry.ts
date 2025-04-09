/**
 * Default Cell Renderer Registry
 *
 * Provides a pre-configured object containing the standard cell renderers
 * for use in schema deserialization or other scenarios where a simple
 * registry is needed without relying on React Context or deprecated globals.
 */

import {
    CellRendererFunction
  } from "./types";
  import {
    textRenderer,
    statusRenderer,
    currencyRenderer,
    dateRenderer,
    booleanRenderer,
    nullRenderer,
    decimalRenderer,
    starRatingRenderer,
    sparklineHistogramRenderer
  } from "./renderers";
  
  // Define the structure expected by deserializeSchema
  interface CellRendererRegistryLike {
    get: (type: string) => CellRendererFunction | undefined;
  }
  
  // Create the map of standard renderers
  const standardRenderers: Record<string, CellRendererFunction> = {
    text: textRenderer,
    status: statusRenderer,
    currency: currencyRenderer,
    date: dateRenderer,
    boolean: booleanRenderer,
    null: nullRenderer,
    decimal: decimalRenderer,
    starRating: starRatingRenderer,
    sparklineHistogram: sparklineHistogramRenderer
    // Add other standard renderers if necessary
  };
  
  // Export the registry object conforming to the required interface
  export const defaultCellRendererRegistry: CellRendererRegistryLike = {
    get: (type: string): CellRendererFunction | undefined => {
      return standardRenderers[type];
    }
  };