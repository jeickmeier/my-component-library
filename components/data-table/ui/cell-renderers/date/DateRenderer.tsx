import * as React from "react";
import { CellRenderer, DateOptions } from "../types";

const DEFAULT_LOCALE = "sv-SE";
const DEFAULT_FORMAT_OPTIONS = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};
const DateComponent = ({ value, options }: { value: Date | null; options: DateOptions }) => {
  if (!value) return null;

  const {
    locale = DEFAULT_LOCALE,
    formatOptions = DEFAULT_FORMAT_OPTIONS,
    className
  } = options;

  return (
    <div className={className}>
      {value.toLocaleDateString(locale, formatOptions as Intl.DateTimeFormatOptions)}
    </div>
  );
};
DateComponent.displayName = 'DateComponent';

export function createDateRenderer<TData>(options: DateOptions = {}): CellRenderer<TData, Date> {
  const DateRenderer = ({ value }: { value: Date | null }) => (
    <DateComponent value={value} options={options} />
  );
  DateRenderer.displayName = 'DateRenderer';
  return DateRenderer;
} 