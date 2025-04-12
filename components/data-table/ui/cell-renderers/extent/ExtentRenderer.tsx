import * as React from "react";
import { CellRenderer, ExtentOptions } from "../types";
import { cn } from "@/lib/utils";

export type ExtentValue = [number | Date, number | Date] | Date | number;

const DEFAULT_SEPARATOR = " - ";
const DEFAULT_CLASS_NAME = "";
const DEFAULT_SHOW_LABELS = false;
const DEFAULT_MIN_LABEL = "Min";
const DEFAULT_MAX_LABEL = "Max";

const ExtentComponent = ({ value, options }: { value: ExtentValue | null; options: ExtentOptions }) => {
  if (!value) {
    return null;
  }

  const {
    dateOptions,
    numberOptions,
    separator = DEFAULT_SEPARATOR,
    className = DEFAULT_CLASS_NAME,
    showLabels = DEFAULT_SHOW_LABELS,
    minLabel = DEFAULT_MIN_LABEL,
    maxLabel = DEFAULT_MAX_LABEL
  } = options;

  // Handle the case when value is a single Date or number
  if (!Array.isArray(value)) {
    const isDate = value instanceof Date;
    const formattedValue = formatSingleValue(value, isDate, dateOptions, numberOptions);
    return (
      <div className={cn("flex items-center", className)}>
        <span>{formattedValue}</span>
      </div>
    );
  }

  // For array values, ensure we have exactly 2 items
  if (value.length !== 2) {
    return null;
  }

  const [min, max] = value;
  const isDate = min instanceof Date;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {showLabels && (
        <span className="text-muted-foreground text-sm font-medium">
          {minLabel}:
        </span>
      )}
      <span>{formatSingleValue(min, isDate, dateOptions, numberOptions)}</span>
      <span className="text-muted-foreground">{separator}</span>
      {showLabels && (
        <span className="text-muted-foreground text-sm font-medium">
          {maxLabel}:
        </span>
      )}
      <span>{formatSingleValue(max, isDate, dateOptions, numberOptions)}</span>
    </div>
  );
};

// Helper function to format a single value
function formatSingleValue(
  val: number | Date, 
  isDate: boolean,
  dateOptions?: ExtentOptions['dateOptions'],
  numberOptions?: ExtentOptions['numberOptions']
): string {
  if (isDate && val instanceof Date) {
    return new Intl.DateTimeFormat(
      dateOptions?.locale, 
      dateOptions?.formatOptions
    ).format(val);
  }
  if (!isDate && typeof val === 'number') {
    return new Intl.NumberFormat(numberOptions?.locale, {
      style: numberOptions?.showCurrencySymbol ? 'currency' : 'decimal',
      currency: numberOptions?.currency,
      minimumFractionDigits: numberOptions?.digits,
      maximumFractionDigits: numberOptions?.digits,
    }).format(val);
  }
  return String(val);
}

ExtentComponent.displayName = 'ExtentComponent';

export function createExtentRenderer<TData>(options: ExtentOptions = {}): CellRenderer<TData, ExtentValue> {
  const ExtentRenderer = ({ value }: { value: ExtentValue | null }) => (
    <ExtentComponent value={value} options={options} />
  );
  ExtentRenderer.displayName = 'ExtentRenderer';
  return ExtentRenderer;
} 