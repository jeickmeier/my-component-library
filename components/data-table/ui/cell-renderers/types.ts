import { Cell, Row } from "@tanstack/react-table";

// Type for cell renderer function
export type CellRenderer<TData, TValue> = (props: {
  cell: Cell<TData, TValue>;
  row: Row<TData>;
  value: TValue;
}) => React.ReactNode;

// Interface for money formatter options
export interface MoneyFormatterOptions {
  currency?: string;
  locale?: string;
  digits?: number;
  className?: string;
  abbreviate?: boolean;
  abbreviationDivider?: 'K' | 'M' | 'B' | 'T';
  showCurrencySymbol?: boolean;
}

// Interface for rating options
export interface RatingOptions {
  maxStars?: number;
  starChar?: string;
  emptyChar?: string;
  showNumeric?: boolean;
  starClassName?: string;
  emptyStarClassName?: string;
}

type CategoryStyle<T extends string> = {
  [K in T]: {
    label?: string;
  } & (
    | { type: 'color'; color: string }
    | { type: 'icon'; icon: React.ReactNode }
  );
};

// Interface for category options
export interface CategoryOptions<T extends string> {
  categories: CategoryStyle<T>;
  capitalize?: boolean;
  className?: string;
  dotClassName?: string;
}

// Interface for date options
export interface DateOptions {
  locale?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
  className?: string;
} 

export interface ExtentOptions {
    // Date formatting options if the extent is for dates
    dateOptions?: DateOptions;
    // Number formatting options if the extent is for numbers
    numberOptions?: MoneyFormatterOptions;
    // Separator between min and max values
    separator?: string;
    // Custom class name for the container
    className?: string;
    // Whether to show labels for min/max
    showLabels?: boolean;
    // Custom labels (defaults to "Min" and "Max")
    minLabel?: string;
    maxLabel?: string;
  } 