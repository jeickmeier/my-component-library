/**
 * Cell Renderers Module
 * 
 * A comprehensive system for rendering table cell content with different formats and styles.
 * This module implements a simplified approach using React Context and hooks.
 */

import * as React from 'react';
import { createContext, useContext, useState } from 'react';

// Import types and renderers
import type { CellRendererProps, CellRendererFunction, BaseRendererConfig } from './types';
import { 
  textRenderer,
  statusRenderer,
  currencyRenderer, 
  dateRenderer,
  booleanRenderer,
  nullRenderer
} from './renderers';

// Export for external use
export * from './types';
export * from './renderers';

// Context for cell renderers
type CellRendererContextType = {
  getRenderer: (type: string) => CellRendererFunction | undefined;
  registerRenderer: (type: string, renderer: CellRendererFunction) => void;
};

const CellRendererContext = createContext<CellRendererContextType | undefined>(undefined);

// Global registry (singleton) for backward compatibility
let globalRegistry: Record<string, CellRendererFunction> = {
  text: textRenderer,
  status: statusRenderer,
  currency: currencyRenderer,
  date: dateRenderer,
  boolean: booleanRenderer,
  null: nullRenderer
};

/**
 * Gets the global renderer registry instance
 * @deprecated Use the React Context API and hooks instead
 */
export function getGlobalCellRendererRegistry() {
  return {
    get: (type: string) => globalRegistry[type],
    register: (type: string, renderer: CellRendererFunction) => {
      globalRegistry[type] = renderer;
    },
    clear: () => {
      globalRegistry = {
        text: textRenderer,
        status: statusRenderer,
        currency: currencyRenderer,
        date: dateRenderer,
        boolean: booleanRenderer,
        null: nullRenderer
      };
    }
  };
}

/**
 * Provider component for cell renderers
 */
export function CellRendererProvider({ children, initialRenderers = {} }: { 
  children: React.ReactNode; 
  initialRenderers?: Record<string, CellRendererFunction>;
}) {
  const [renderers, setRenderers] = useState<Record<string, CellRendererFunction>>({
    ...globalRegistry,
    ...initialRenderers
  });
  
  const registerRenderer = (type: string, renderer: CellRendererFunction) => {
    setRenderers(prev => ({
      ...prev,
      [type]: renderer
    }));
  };
  
  const getRenderer = (type: string) => renderers[type];
  
  return (
    <CellRendererContext.Provider value={{ getRenderer, registerRenderer }}>
      {children}
    </CellRendererContext.Provider>
  );
}

/**
 * Hook to use and register cell renderers
 */
export function useCellRenderers() {
  const context = useContext(CellRendererContext);
  
  if (!context) {
    throw new Error('useCellRenderers must be used within a CellRendererProvider');
  }
  
  return context;
}

/**
 * Hook to render a cell with the appropriate renderer
 */
export function useCellRenderer(type: string, defaultRenderer?: CellRendererFunction) {
  const { getRenderer } = useCellRenderers();
  
  return (props: CellRendererProps, config?: BaseRendererConfig) => {
    const renderer = getRenderer(type) || defaultRenderer;
    if (!renderer) {
      console.warn(`No renderer found for type: ${type}`);
      return props.getValue();
    }
    
    return renderer(props, config);
  };
}

/**
 * Creates and returns a pre-configured CellRendererProvider with all built-in renderers
 */
export function createDefaultCellRendererProvider(children: React.ReactNode) {
  return (
    <CellRendererProvider 
      initialRenderers={{
        text: textRenderer,
        status: statusRenderer,
        currency: currencyRenderer,
        date: dateRenderer,
        boolean: booleanRenderer,
        null: nullRenderer
      }}
    >
      {children}
    </CellRendererProvider>
  );
} 