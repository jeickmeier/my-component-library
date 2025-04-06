/**
 * Cell Renderers
 * 
 * A collection of cell renderer functions for different data types.
 * Each renderer has a specific purpose and configuration options.
 */

import * as React from "react";
import { 
  CellRendererProps, 
  TextRendererConfig,
  StatusRendererConfig,
  CurrencyRendererConfig,
  DateRendererConfig,
  BooleanRendererConfig,
  NullRendererConfig,
  DecimalRendererConfig
} from "./types";

/**
 * Text Cell Renderer
 * 
 * Renders a cell value as text with optional truncation support.
 */
export function textRenderer(
  props: CellRendererProps,
  config?: TextRendererConfig
): React.ReactNode {
  const value = props.getValue();
  const text = String(value || '');
  
  // Handle empty values with a placeholder
  if (!text) return <div className={config?.className}>-</div>;
  
  // Apply truncation if configured
  if (config?.truncate && config?.maxLength && text.length > config.maxLength) {
    return (
      <div className={config?.className} title={text}>
        {text.substring(0, config.maxLength)}...
      </div>
    );
  }
  
  // Render full text
  return <div className={config?.className}>{text}</div>;
}

/**
 * Status Cell Renderer
 * 
 * Renders a status indicator with color coding.
 */
export function statusRenderer(
  props: CellRendererProps,
  config?: StatusRendererConfig
): React.ReactNode {
  const value = String(props.getValue() || '');
  if (!value) return <div className={config?.className}>-</div>;
  
  const colorMap = config?.colorMap || {
    active: 'green',
    inactive: 'red',
    pending: 'yellow',
    completed: 'blue',
    error: 'red',
  };
  
  const color = colorMap[value.toLowerCase()] || 'gray';
  
  return (
    <div className={config?.className}>
      <span
        style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: color,
          marginRight: '6px',
        }}
      />
      {value}
    </div>
  );
}

/**
 * Currency Cell Renderer
 * 
 * Formats and displays monetary values.
 */
export function currencyRenderer(
  props: CellRendererProps,
  config?: CurrencyRendererConfig
): React.ReactNode {
  const value = props.getValue();
  if (value === null || value === undefined) {
    return <div className={config?.className}>-</div>;
  }
  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return <div className={config?.className}>{String(value)}</div>;
  }
  
  const currency = config?.currency || 'USD';
  const locale = config?.locale || 'en-US';
  
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...config?.options
  }).format(numValue);
  
  return <div className={config?.className}>{formatted}</div>;
}

/**
 * Date Cell Renderer
 * 
 * Formats and displays date values.
 */
export function dateRenderer(
  props: CellRendererProps,
  config?: DateRendererConfig
): React.ReactNode {
  const value = props.getValue();
  if (value === null || value === undefined) {
    return <div className={config?.className}>-</div>;
  }
  
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  } else {
    return <div className={config?.className}>{String(value)}</div>;
  }
  
  if (isNaN(date.getTime())) {
    return <div className={config?.className}>{String(value)}</div>;
  }
  
  const locale = config?.locale || 'en-US';
  const options = config?.options || { 
    dateStyle: 'medium',
  };
  
  const formatted = new Intl.DateTimeFormat(locale, options).format(date);
  
  return <div className={config?.className}>{formatted}</div>;
}

/**
 * Boolean Cell Renderer
 * 
 * Displays boolean values as text or icons.
 */
export function booleanRenderer(
  props: CellRendererProps,
  config?: BooleanRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <div className={config?.className}>-</div>;
  }
  
  const boolValue = Boolean(value);
  
  const yesText = config?.yesText || 'Yes';
  const noText = config?.noText || 'No';
  const yesIcon = config?.yesIcon || '✓';
  const noIcon = config?.noIcon || '✗';
  
  return (
    <div className={config?.className}>
      {boolValue ? (
        <>
          {yesIcon} {yesText}
        </>
      ) : (
        <>
          {noIcon} {noText}
        </>
      )}
    </div>
  );
}

/**
 * Null Cell Renderer
 * 
 * Displays a placeholder for null or undefined values.
 */
export function nullRenderer(
  props: CellRendererProps,
  config?: NullRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  if (value === null || value === undefined || value === '') {
    return <div className={config?.className}>{config?.placeholder || '-'}</div>;
  }
  
  return <div className={config?.className}>{String(value)}</div>;
}

/**
 * Decimal Cell Renderer
 * 
 * Formats and displays decimal numbers.
 */
export function decimalRenderer(
  props: CellRendererProps,
  config?: DecimalRendererConfig
): React.ReactNode {
  const value = props.getValue();
  if (value === null || value === undefined) {
    return <div className={config?.className}>-</div>;
  }

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return <div className={config?.className}>{String(value)}</div>;
  }

  const decimals = config?.decimals ?? 2;
  const useGrouping = config?.thousand_separator ?? true;
  const locale = config?.locale || 'en-US';

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: useGrouping,
  }).format(numValue);

  return <div className={config?.className}>{formatted}</div>;
} 