/**
 * Aggregation Utilities Module
 * 
 * This module provides utility functions for common operations used across
 * different aggregation functions, helping to reduce duplication and
 * standardize calculations.
 */

import { Row } from "@tanstack/react-table"
import { getUniqueValues as getUniqueValuesFromArray } from "../utils"

/**
 * Extracts numeric values from a column in the given rows.
 * Filters out non-numeric values.
 */
export function getNumericValues<TData>(
  columnId: string, 
  rows: Row<TData>[]
): number[] {
  return rows
    .map(row => row.getValue(columnId))
    .filter((value): value is number => typeof value === 'number');
}

/**
 * Calculates the mean (average) of an array of numeric values.
 * Returns null if the array is empty.
 */
export function calculateMean(values: number[]): number | null {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
}

/**
 * Calculates the median of an array of numeric values.
 * Returns null if the array is empty.
 */
export function calculateMedian(values: number[]): number | null {
  if (!values.length) return null;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Gets the unique values from a column in the given rows.
 * Filters out null and undefined values.
 */
export function getUniqueValuesFromRows<TData>(
  columnId: string, 
  rows: Row<TData>[]
): unknown[] {
  const allValues: unknown[] = [];
  rows.forEach(row => {
    const value = row.getValue(columnId);
    if (value !== undefined && value !== null) {
      allValues.push(value);
    }
  });
  
  return getUniqueValuesFromArray(allValues);
}

/**
 * Safely converts a value to a string representation.
 * Handles null, undefined, and complex objects.
 */
export function safeToString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return Object.prototype.toString.call(value);
    }
  }
  
  return String(value);
} 