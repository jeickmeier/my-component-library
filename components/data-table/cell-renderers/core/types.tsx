import React from "react";

/**
 * Base props passed to all cell renderer functions
 */
export type CellRendererProps = {
  row?: {
    getValue: (columnId: string) => unknown;
    [key: string]: unknown;
  };
  column?: {
    id: string;
    [key: string]: unknown;
  };
  table?: Record<string, unknown>;
  getValue: () => unknown;
  [key: string]: unknown;
};

/**
 * Base renderer configuration interface
 */
export interface BaseRendererConfig {
  className?: string;
}

/**
 * Text renderer configuration
 */
export interface TextRendererConfig extends BaseRendererConfig {
  truncate?: boolean;
  maxLength?: number;
}

/**
 * Status renderer configuration
 */
export interface StatusRendererConfig extends BaseRendererConfig {
  colorMap?: Record<string, string>;
}

/**
 * Currency renderer configuration
 */
export interface CurrencyRendererConfig extends BaseRendererConfig {
  currency?: string;
  locale?: string;
  options?: Intl.NumberFormatOptions;
}

/**
 * Date renderer configuration
 */
export interface DateRendererConfig extends BaseRendererConfig {
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}

/**
 * Boolean renderer configuration
 */
export interface BooleanRendererConfig extends BaseRendererConfig {
  yesText?: string;
  noText?: string;
  yesIcon?: string;
  noIcon?: string;
}

/**
 * Function type for cell renderers
 */
export type CellRendererFunction<TConfig extends BaseRendererConfig = BaseRendererConfig> = (
  props: CellRendererProps,
  config?: TConfig
) => React.ReactNode; 