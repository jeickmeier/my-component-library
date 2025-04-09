import * as React from "react";

/**
 * Debounce utility
 * 
 * Creates a debounced version of a function that delays invocation until after
 * `wait` milliseconds have elapsed since the last time it was invoked.
 * 
 * This is particularly useful for filter inputs to prevent excessive re-renders
 * while the user is still typing.
 * 
 * @template T The function type to debounce
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced function
 * 
 * @example
 * // Debounce a filter change handler
 * const debouncedFilterChange = debounce((value: string) => {
 *   setFilter(value);
 * }, 300);
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  
  return function(...args: Parameters<T>): void {
    // Clear previous timeout
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    
    // Set new timeout
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * React hook version of debounce that properly memoizes the debounced function
 * 
 * This hook is designed to work with React's dependency system to ensure
 * that the debounced function is only recreated when dependencies change.
 * 
 * @template T The function type to debounce
 * @param callback The function to debounce
 * @param delay The number of milliseconds to delay
 * @param deps The dependencies array for the useMemo hook
 * @returns A memoized debounced function
 * 
 * @example
 * // In a React component
 * const handleFilterChange = useDebounce((value: string) => {
 *   column.setFilterValue(value);
 * }, 300, [column]);
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay = 300,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => debounce(callback, delay), deps);
} 