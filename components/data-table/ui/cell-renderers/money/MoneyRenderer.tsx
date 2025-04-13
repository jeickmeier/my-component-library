/**
 * Money cell renderer that formats and displays monetary values in the table.
 * Supports different currencies, localization, value abbreviation, and custom
 * formatting options with proper number handling and display.
 */

import * as React from "react";
import { CellRenderer, MoneyFormatterOptions } from "../types";

const DEFAULT_CURRENCY = "USD";
const DEFAULT_LOCALE = "en-US";
const DEFAULT_DIGITS = 2;
const DEFAULT_CLASS_NAME = "text-right font-medium";
const DEFAULT_ABBREVIATE = false;
const DEFAULT_ABBREVIATION_DIVIDER = 'M';
const DEFAULT_SHOW_CURRENCY_SYMBOL = true;

const formatAbbreviatedNumber = (value: number, divider: 'K' | 'M' | 'B' | 'T'): number => {
  const dividers = {
    'K': 1_000,
    'M': 1_000_000,
    'B': 1_000_000_000,
    'T': 1_000_000_000_000
  };
  return value / dividers[divider];
};

const MoneyComponent = ({ value, options }: { value: number | null; options: MoneyFormatterOptions }) => {
  if (value == null) return null;

  const {
    currency = DEFAULT_CURRENCY,
    locale = DEFAULT_LOCALE,
    digits = DEFAULT_DIGITS,
    className = DEFAULT_CLASS_NAME,
    abbreviate = DEFAULT_ABBREVIATE,
    abbreviationDivider = DEFAULT_ABBREVIATION_DIVIDER,
    showCurrencySymbol = DEFAULT_SHOW_CURRENCY_SYMBOL
  } = options;

  const displayValue = abbreviate ? formatAbbreviatedNumber(value, abbreviationDivider) : value;
  const formattedValue = new Intl.NumberFormat(locale, {
    style: showCurrencySymbol ? 'currency' : 'decimal',
    ...(showCurrencySymbol && { currency }),
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(displayValue);

  return (
    <div className={className}>
      {formattedValue}{abbreviate ? abbreviationDivider : ''}
    </div>
  );
};
MoneyComponent.displayName = 'MoneyComponent';

export function createMoneyRenderer<TData>(options: MoneyFormatterOptions = {}): CellRenderer<TData, number> {
  const MoneyRenderer = ({ value }: { value: number | null }) => (
    <MoneyComponent value={value} options={options} />
  );
  MoneyRenderer.displayName = 'MoneyRenderer';
  return MoneyRenderer;
} 