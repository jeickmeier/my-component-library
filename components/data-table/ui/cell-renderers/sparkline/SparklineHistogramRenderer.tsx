/**
 * Sparkline histogram cell renderer for displaying aggregated numeric data as a histogram.
 * Visualizes distribution of values in grouped data rows using small, inline histograms
 * that are perfect for data tables with aggregated values.
 */

import * as React from "react";
import { CellRenderer } from "../types";
import { SparklineHistogram } from "@/components/charts/sparkline-histogram";
import { CellContext, Cell, Row } from "@tanstack/react-table";

export interface SparklineHistogramOptions<TData = unknown> {
  numBins?: number;
  height?: string;
  width?: string;
  barColor?: string;
  formatTooltipValue?: (value: number) => string;
  showTooltip?: boolean;
  // Add options for different renderers used in multi-logic aggregation
  countRenderer?: CellRenderer<TData, number>;
  aggregatedRenderer?: CellRenderer<TData, number>;
}

const DEFAULT_NUM_BINS = 8;
const DEFAULT_HEIGHT = "h-[28px]";
const DEFAULT_WIDTH = "w-full";
const DEFAULT_BAR_COLOR = "hsl(var(--primary))";
const DEFAULT_SHOW_TOOLTIP = true;

// Default formatter - uses appropriate number formatting
const defaultFormatter = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  } else {
    return value.toFixed(1);
  }
};

const SparklineHistogramComponent = <TData,>({
  value,
  options,
}: {
  value: number[] | null;
  options: SparklineHistogramOptions<TData>;
}) => {
  if (!value || !Array.isArray(value) || value.length === 0) {
    return (
      <div className="text-center text-xs text-muted-foreground">No data</div>
    );
  }

  const {
    numBins = DEFAULT_NUM_BINS,
    height = DEFAULT_HEIGHT,
    width = DEFAULT_WIDTH,
    barColor = DEFAULT_BAR_COLOR,
    formatTooltipValue = defaultFormatter,
    showTooltip = DEFAULT_SHOW_TOOLTIP,
  } = options;

  return (
    <SparklineHistogram
      data={value}
      numBins={numBins}
      height={height}
      width={width}
      barColor={barColor}
      formatTooltipValue={formatTooltipValue}
      showTooltip={showTooltip}
    />
  );
};

SparklineHistogramComponent.displayName = "SparklineHistogramComponent";

export function createSparklineHistogramRenderer<TData>(
  options: SparklineHistogramOptions<TData> = {},
): CellRenderer<TData, number[]> {
  const SparklineHistogramRenderer = ({
    value,
  }: {
    value: number[] | null;
  }) => <SparklineHistogramComponent<TData> value={value} options={options} />;

  SparklineHistogramRenderer.displayName = "SparklineHistogramRenderer";
  return SparklineHistogramRenderer;
}

// Helper type for cell renderer input
interface CellRenderProps<TData, TValue> {
  cell: Cell<TData, TValue>;
  row: Row<TData>;
  value: TValue;
}

/**
 * Creates an aggregated cell renderer that handles multiple aggregation types:
 * - For 'sparkline' aggregation, renders a histogram visualization
 * - For 'count'/'uniqueCount' aggregations, uses a specialized count renderer
 * - For all other aggregations (sum, mean, etc), uses a different renderer
 */
export function createMultiAggregationRenderer<TData>(
  options: SparklineHistogramOptions<TData>,
): (props: CellContext<TData, unknown>) => React.ReactNode {
  const countRenderer = options.countRenderer;
  const aggregatedRenderer = options.aggregatedRenderer;

  const MultiAggregationRenderer = (props: CellContext<TData, unknown>) => {
    const value = props.getValue();
    const column = props.column;
    const aggFn =
      column && typeof column.columnDef.aggregationFn === "string"
        ? column.columnDef.aggregationFn
        : "custom";

    // Handle sparkline aggregation (returns array of numbers)
    if (aggFn === "sparkline" && Array.isArray(value)) {
      return (
        <SparklineHistogramComponent<TData>
          value={value as number[]}
          options={options}
        />
      );
    }

    // For count aggregations, use the count renderer if provided
    if (
      (aggFn === "count" || aggFn === "uniqueCount") &&
      countRenderer &&
      typeof value === "number"
    ) {
      const cellProps: CellRenderProps<TData, number> = {
        cell: props.cell as Cell<TData, number>,
        row: props.row,
        value,
      };
      return countRenderer(cellProps);
    }

    // For all other numeric aggregations (sum, mean, etc.) use the aggregated renderer
    if (aggregatedRenderer && typeof value === "number") {
      const cellProps: CellRenderProps<TData, number> = {
        cell: props.cell as Cell<TData, number>,
        row: props.row,
        value,
      };
      return aggregatedRenderer(cellProps);
    }

    // Fallback to just displaying the value
    return String(value);
  };

  MultiAggregationRenderer.displayName = "MultiAggregationRenderer";
  return MultiAggregationRenderer;
}
