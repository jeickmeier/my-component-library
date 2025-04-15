"use client";

import React, { useMemo } from "react";
import { Bar, BarChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent, // Import tooltip components
} from "@/components/ui/chart";

interface SparklineHistogramProps {
  data: number[];
  numBins?: number; // Number of bins for the histogram
  height?: string; // e.g., "h-[50px]"
  width?: string; // e.g., "w-full" or "w-[100px]"
  barColor?: string; // CSS color value, e.g., "hsl(var(--primary))" or "#3b82f6"
  formatTooltipValue?: (value: number) => string; // Optional formatter for bin range values
  showTooltip?: boolean; // Optional flag to disable tooltips
}

// Define the shape of the data returned by the histogram function
interface HistogramBin {
  name: string; // Identifier for the bin (e.g., "bin-0")
  value: number; // Count of items in the bin
  start: number; // Start value of the bin range
  end: number; // End value of the bin range
}

// Helper function to create histogram data, now returning range info
function createHistogramData(data: number[], numBins: number): HistogramBin[] {
  if (!data || data.length === 0 || numBins <= 0) {
    return [];
  }

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);

  // Handle edge case where all values are the same
  if (minVal === maxVal) {
    return [{ name: `bin-0`, value: data.length, start: minVal, end: maxVal }];
  }

  const binWidth = (maxVal - minVal) / numBins;
  const bins = Array(numBins)
    .fill(0)
    .map((_, i) => {
      const start = minVal + i * binWidth;
      // Ensure the last bin includes the max value exactly
      const end = i === numBins - 1 ? maxVal : start + binWidth;
      return { name: `bin-${i}`, value: 0, start, end };
    });

  for (const value of data) {
    let binIndex = Math.floor((value - minVal) / binWidth);

    if (value === maxVal) {
      binIndex = numBins - 1;
    }
    binIndex = Math.max(0, Math.min(binIndex, numBins - 1));

    bins[binIndex].value++; // Increment count for the correct bin object
  }

  return bins; // Return the array of bin objects
}

export const SparklineHistogram = React.memo(
  ({
    data,
    numBins = 10,
    height = "h-[50px]",
    width = "w-full",
    barColor = "hsl(var(--primary))",
    formatTooltipValue = (value) => value.toFixed(1), // Default formatting
    showTooltip = true,
  }: SparklineHistogramProps) => {
    const chartData = useMemo(
      () => createHistogramData(data, numBins),
      [data, numBins],
    );

    const chartConfig = useMemo(
      () => ({
        value: {
          // 'value' represents the count
          label: "Count",
          color: barColor,
        },
      }),
      [barColor],
    ) as ChartConfig;

    if (chartData.length === 0) {
      return (
        <div
          className={`${height} ${width} flex items-center justify-center text-xs text-muted-foreground`}
        >
          No data
        </div>
      );
    }

    return (
      <ChartContainer config={chartConfig} className={`${height} ${width}`}>
        <BarChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }} // Increased margin slightly for tooltip visibility
          barGap={1}
        >
          {/* Add the Tooltip component only if showTooltip is true */}
          {showTooltip && (
            <ChartTooltip
              cursor={false} // Hide the default cursor line
              content={
                <ChartTooltipContent
                  hideLabel // Hide the default label (bin name)
                  formatter={(value, name, props) => {
                    // Access the full payload for the bin range
                    const binData = props.payload as HistogramBin | undefined;
                    if (binData) {
                      const formattedStart = formatTooltipValue(binData.start);
                      const formattedEnd = formatTooltipValue(binData.end);

                      const formatLargeNumber = (num: string) => {
                        // Remove commas from input before parsing
                        const cleanNum = num.replace(/,/g, "");
                        const numValue = parseFloat(cleanNum);
                        if (numValue >= 1_000_000_000) {
                          return `${(numValue / 1_000_000_000).toFixed(2)}B`;
                        } else if (numValue >= 1_000_000) {
                          return `${(numValue / 1_000_000).toFixed(2)}M`;
                        } else if (numValue >= 1_000) {
                          return `${(numValue / 1_000).toFixed(2)}K`;
                        }
                        return num;
                      };

                      const displayStart = formatLargeNumber(formattedStart);
                      const displayEnd = formatLargeNumber(formattedEnd);
                      // Display Range and Count
                      return (
                        <div className="flex flex-col text-xs">
                          <span>
                            {displayStart} to {displayEnd} | Count: {value}
                          </span>
                        </div>
                      );
                    }
                    return value; // Fallback
                  }}
                  // Style the tooltip box
                  className="min-w-[120px] rounded-md border bg-background p-2 text-foreground shadow-sm"
                />
              }
            />
          )}
          <Bar dataKey="value" fill={`var(--color-value)`} radius={1} />
        </BarChart>
      </ChartContainer>
    );
  },
);

SparklineHistogram.displayName = "SparklineHistogram";
