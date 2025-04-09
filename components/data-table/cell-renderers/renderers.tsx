/**
 * Cell Renderers
 * 
 * A collection of cell renderer functions for different data types.
 * Each renderer has a specific purpose and configuration options.
 * All renderers are memoized for optimal performance.
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
  DecimalRendererConfig,
  StarRatingRendererConfig,
  SparklineHistogramRendererConfig
} from "./types";
import { StarRating } from "@/components/ui/star-rating";
import { SparklineHistogram } from "@/components/charts/sparkline-histogram";

/**
 * Text Cell Renderer - Raw Function
 */
export function textRendererFn(
  props: CellRendererProps,
  config?: TextRendererConfig
): React.ReactNode {
  const value = props.getValue();
  const text = String(value || '');
  
  // Handle empty values with a placeholder
  if (!text) return <React.Fragment>-</React.Fragment>;
  
  // Apply truncation if configured
  if (config?.truncate && config?.maxLength && text.length > config.maxLength) {
    return (
      <div className={config?.className} title={text}>
        {text.substring(0, config.maxLength)}...
      </div>
    );
  }
  
  // Render full text
  return config?.className 
    ? <div className={config.className}>{text}</div> 
    : <React.Fragment>{text}</React.Fragment>;
}

/**
 * Text Cell Renderer - Memoized Component
 */
export const textRenderer = React.memo(
  textRendererFn,
  (prevProps: CellRendererProps, nextProps: CellRendererProps) => {
    return prevProps.getValue() === nextProps.getValue();
  }
);

/**
 * Status Cell Renderer - Raw Function
 */
export function statusRendererFn(
  props: CellRendererProps,
  config?: StatusRendererConfig
): React.ReactNode {
  const value = String(props.getValue() || '');
  if (!value) return <React.Fragment>-</React.Fragment>;
  
  const colorMap = config?.colorMap || {
    active: 'green',
    inactive: 'red',
    pending: 'yellow',
    completed: 'blue',
    error: 'red',
  };
  
  const color = colorMap[value.toLowerCase()] || 'gray';
  
  // Status indicator with text
  const content = (
    <React.Fragment>
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
    </React.Fragment>
  );
  
  // Only wrap in div if className is provided
  return config?.className 
    ? <div className={config.className}>{content}</div>
    : content;
}

/**
 * Status Cell Renderer - Memoized Component
 */
export const statusRenderer = React.memo(
  statusRendererFn,
  (prevProps: CellRendererProps, nextProps: CellRendererProps) => {
    const prevValue = String(prevProps.getValue() || '').toLowerCase();
    const nextValue = String(nextProps.getValue() || '').toLowerCase();
    return prevValue === nextValue;
  }
);

/**
 * Currency Cell Renderer - Raw Function
 */
export function currencyRendererFn(
  props: CellRendererProps,
  config?: CurrencyRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <React.Fragment>-</React.Fragment>;
  }
  
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return <React.Fragment>{String(value)}</React.Fragment>;
  }
  
  const currency = config?.currency || 'USD';
  const locale = config?.locale || 'en-US';
  
  // Format the currency (no useMemo hooks in pure functions)
  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...config?.options
  }).format(numValue);
  
  // Style based on value
  const color = numValue >= 0 ? config?.positiveColor : config?.negativeColor;
  const style = color ? { color, display: 'inline-block' } : undefined;
  
  // Create content with or without styling
  const content = style 
    ? <span style={style}>{formatted}</span>
    : <React.Fragment>{formatted}</React.Fragment>;
  
  // Only wrap in div if className is provided
  return config?.className 
    ? <div className={config.className}>{content}</div>
    : content;
}

/**
 * Currency Cell Renderer - Memoized Component
 */
export const currencyRenderer = React.memo(
  currencyRendererFn,
  (prevProps: CellRendererProps, nextProps: CellRendererProps) => {
    const prevValue = prevProps.getValue();
    const nextValue = nextProps.getValue();
    
    // If both are null/undefined, they're equal
    if (prevValue == null && nextValue == null) return true;
    
    // If only one is null/undefined, they're not equal
    if (prevValue == null || nextValue == null) return false;
    
    // Convert to numbers for comparison
    const prevNum = Number(prevValue);
    const nextNum = Number(nextValue);
    
    // Handle NaN cases
    if (isNaN(prevNum) && isNaN(nextNum)) {
      return String(prevValue) === String(nextValue);
    }
    if (isNaN(prevNum) || isNaN(nextNum)) return false;
    
    // Compare the actual numbers
    return prevNum === nextNum;
  }
);

/**
 * Date Cell Renderer - Raw Function
 */
export function dateRendererFn(
  props: CellRendererProps,
  config?: DateRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <React.Fragment>-</React.Fragment>;
  }
  
  let date: Date;
  
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'string' || typeof value === 'number') {
    date = new Date(value);
  } else {
    return <React.Fragment>{String(value)}</React.Fragment>;
  }
  
  if (isNaN(date.getTime())) {
    return <React.Fragment>{String(value)}</React.Fragment>;
  }
  
  const locale = config?.locale || 'en-US';
  const options = config?.options || { 
    dateStyle: 'medium',
  };
  
  // Format the date (no useMemo hooks in pure functions)
  const formatted = new Intl.DateTimeFormat(locale, options).format(date);
  
  return config?.className 
    ? <div className={config.className}>{formatted}</div> 
    : <React.Fragment>{formatted}</React.Fragment>;
}

/**
 * Date Cell Renderer - Memoized Component
 */
export const dateRenderer = React.memo(
  dateRendererFn,
  (prevProps: CellRendererProps, nextProps: CellRendererProps) => {
    const prevValue = prevProps.getValue();
    const nextValue = nextProps.getValue();
    
    // Handle null/undefined cases
    if (prevValue == null && nextValue == null) return true;
    if (prevValue == null || nextValue == null) return false;
    
    // If both are Date objects
    if (prevValue instanceof Date && nextValue instanceof Date) {
      return prevValue.getTime() === nextValue.getTime();
    }
    
    // Convert to date times for comparison
    let prevDate: number, nextDate: number;
    
    try {
      // Only try to convert if the values are valid for Date constructor
      if (typeof prevValue === 'string' || typeof prevValue === 'number' || prevValue instanceof Date) {
        prevDate = new Date(prevValue).getTime();
      } else {
        return String(prevValue) === String(nextValue);
      }
      
      if (typeof nextValue === 'string' || typeof nextValue === 'number' || nextValue instanceof Date) {
        nextDate = new Date(nextValue).getTime();
      } else {
        return String(prevValue) === String(nextValue);
      }
      
      // If either is invalid date
      if (isNaN(prevDate) || isNaN(nextDate)) {
        return String(prevValue) === String(nextValue);
      }
      
      return prevDate === nextDate;
    } catch {
      // If conversion fails, compare as strings
      return String(prevValue) === String(nextValue);
    }
  }
);

/**
 * Boolean Cell Renderer - Raw Function
 */
export function booleanRendererFn(
  props: CellRendererProps,
  config?: BooleanRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <React.Fragment>-</React.Fragment>;
  }
  
  const boolValue = Boolean(value);
  
  const yesText = config?.yesText || 'Yes';
  const noText = config?.noText || 'No';
  const yesIcon = config?.yesIcon || '✓';
  const noIcon = config?.noIcon || '✗';
  
  const content = boolValue ? (
    <React.Fragment>
      {yesIcon} {yesText}
    </React.Fragment>
  ) : (
    <React.Fragment>
      {noIcon} {noText}
    </React.Fragment>
  );
  
  return config?.className 
    ? <div className={config.className}>{content}</div>
    : content;
}

/**
 * Boolean Cell Renderer - Memoized Component
 */
export const booleanRenderer = React.memo(
  booleanRendererFn,
  (prevProps: CellRendererProps, nextProps: CellRendererProps) => {
    const prevValue = prevProps.getValue();
    const nextValue = nextProps.getValue();
    
    // Handle null/undefined cases
    if (prevValue == null && nextValue == null) return true;
    if (prevValue == null || nextValue == null) return false;
    
    // Compare boolean values
    return Boolean(prevValue) === Boolean(nextValue);
  }
);

/**
 * Null Cell Renderer - Raw Function 
 */
export function nullRendererFn(
  props: CellRendererProps,
  config?: NullRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  if (value === null || value === undefined || value === '') {
    const placeholder = config?.placeholder || '-';
    return config?.className 
      ? <div className={config.className}>{placeholder}</div>
      : <React.Fragment>{placeholder}</React.Fragment>;
  }
  
  return config?.className 
    ? <div className={config.className}>{String(value)}</div>
    : <React.Fragment>{String(value)}</React.Fragment>;
}

/**
 * Null Cell Renderer - Memoized Component
 */
export const nullRenderer = React.memo(
  nullRendererFn,
  (prevProps: CellRendererProps, nextProps: CellRendererProps) => {
    const prevValue = prevProps.getValue();
    const nextValue = nextProps.getValue();
    
    // Special comparison for null renderer which treats null, undefined and '' as equivalent
    const prevEmpty = prevValue === null || prevValue === undefined || prevValue === '';
    const nextEmpty = nextValue === null || nextValue === undefined || nextValue === '';
    
    if (prevEmpty && nextEmpty) {
      return true;
    }
    
    if (prevEmpty || nextEmpty) return false;
    
    return String(prevValue) === String(nextValue);
  }
);

/**
 * Decimal Cell Renderer - Raw Function
 */
export function decimalRendererFn(
  props: CellRendererProps,
  config?: DecimalRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  if (value === null || value === undefined) {
    return <React.Fragment>-</React.Fragment>;
  }

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return <React.Fragment>{String(value)}</React.Fragment>;
  }

  const decimals = config?.decimals ?? 2;
  const useGrouping = config?.thousand_separator ?? true;
  const locale = config?.locale || 'en-US';

  // Format the number (no useMemo hooks in pure functions)
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: useGrouping,
  }).format(numValue);

  const color = numValue >= 0 ? config?.positiveColor : config?.negativeColor;
  const style = color ? { color } : undefined;

  return config?.className 
    ? <div className={config.className} style={style}>{formatted}</div>
    : <span style={style}>{formatted}</span>;
}

/**
 * Decimal Cell Renderer - Memoized Component
 */
export const decimalRenderer = React.memo(
  decimalRendererFn,
  (prevProps: CellRendererProps, nextProps: CellRendererProps) => {
    const prevValue = prevProps.getValue();
    const nextValue = nextProps.getValue();
    
    // Handle null/undefined cases
    if (prevValue == null && nextValue == null) return true;
    if (prevValue == null || nextValue == null) return false;
    
    // Compare numeric values
    const prevNum = Number(prevValue);
    const nextNum = Number(nextValue);
    
    // Handle NaN cases
    if (isNaN(prevNum) && isNaN(nextNum)) {
      return String(prevValue) === String(nextValue);
    }
    if (isNaN(prevNum) || isNaN(nextNum)) return false;
    
    return prevNum === nextNum;
  }
);

/**
 * Star Rating Cell Renderer - Raw Function
 */
export function starRatingRendererFn(
  props: CellRendererProps,
  config?: StarRatingRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  if (value === null || value === undefined) {
    return <React.Fragment>-</React.Fragment>;
  }

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return <React.Fragment>{String(value)}</React.Fragment>;
  }

  // The StarRating component is self-contained and doesn't need a wrapper
  // unless a className is provided
  const starRating = (
    <StarRating
      rating={numValue}
      maxRating={config?.maxRating}
      style={{ color: config?.color }}
    />
  );
  
  return config?.className 
    ? <div className={config.className}>{starRating}</div>
    : starRating;
}

/**
 * Star Rating Cell Renderer - Memoized Component
 */
export const starRatingRenderer = React.memo(
  starRatingRendererFn,
  (prevProps: CellRendererProps, nextProps: CellRendererProps) => {
    const prevValue = prevProps.getValue();
    const nextValue = nextProps.getValue();
    
    // Handle null/undefined cases
    if (prevValue == null && nextValue == null) return true;
    if (prevValue == null || nextValue == null) return false;
    
    // Compare numeric values for rating
    const prevNum = Number(prevValue);
    const nextNum = Number(nextValue);
    
    // Handle NaN cases
    if (isNaN(prevNum) && isNaN(nextNum)) {
      return String(prevValue) === String(nextValue);
    }
    if (isNaN(prevNum) || isNaN(nextNum)) return false;
    
    return prevNum === nextNum;
  }
);

/**
 * Sparkline Histogram Cell Renderer - Raw Function
 */
export function sparklineHistogramRendererFn(
  props: CellRendererProps,
  config?: SparklineHistogramRendererConfig
): React.ReactNode {
  const value = props.getValue();
  
  // Handle null/undefined/empty values
  if (!value || !Array.isArray(value)) {
    return <React.Fragment>-</React.Fragment>;
  }
  
  // Convert values to numbers and filter out invalid ones
  const numbers = value
    .map(v => {
      // If v is already a number, use it directly
      if (typeof v === 'number') return v;
      // Try to convert string/other types to number
      const num = Number(v);
      return isNaN(num) ? null : num;
    })
    .filter((v): v is number => v !== null);
    
  if (numbers.length === 0) {
    return <React.Fragment>-</React.Fragment>;
  }
  
  // Note: SparklineHistogram might require a wrapper for proper sizing
  // so we keep it wrapped even without a className
  const histogram = (
    <SparklineHistogram
      data={numbers}
      numBins={config?.numBins}
      height={config?.height}
      width={config?.width}
      barColor={config?.barColor}
      formatTooltipValue={config?.formatTooltipValue}
    />
  );
  
  return config?.className 
    ? <div className={config.className}>{histogram}</div>
    : histogram;
}

/**
 * Sparkline Histogram Cell Renderer - Memoized Component
 */
export const sparklineHistogramRenderer = React.memo(
  sparklineHistogramRendererFn,
  (prevProps: CellRendererProps, nextProps: CellRendererProps) => {
    const prevValue = prevProps.getValue();
    const nextValue = nextProps.getValue();
    
    // Handle null/undefined cases
    if (!prevValue && !nextValue) return true;
    if (!prevValue || !nextValue) return false;
    
    // Both must be arrays
    if (!Array.isArray(prevValue) || !Array.isArray(nextValue)) {
      return false;
    }
    
    // Quick length check
    if (prevValue.length !== nextValue.length) {
      return false;
    }
    
    // Check if each element is the same
    const areArraysEqual = prevValue.every((val, index) => {
      if (typeof val === 'number' && typeof nextValue[index] === 'number') {
        return val === nextValue[index];
      }
      return String(val) === String(nextValue[index]);
    });
    
    return areArraysEqual;
  }
); 