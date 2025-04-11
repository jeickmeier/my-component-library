import * as React from "react"
import { Row } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

interface UseTableVirtualizationOptions<TData> {
  rows: Row<TData>[];
  tableContainerRef: React.RefObject<HTMLDivElement>;
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>;
  isMountedRef: React.RefObject<boolean>;
}

export function useTableVirtualization<TData>({
  rows,
  tableContainerRef,
  rowRefsMap,
  isMountedRef,
}: UseTableVirtualizationOptions<TData>) {
  const getScrollElement = React.useCallback(
    () => tableContainerRef.current,
    [tableContainerRef]
  );

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    getScrollElement,
    estimateSize: () => 35,
    overscan: 20,
    measureElement: (el) => el?.getBoundingClientRect().height || 35,
    onChange: (instance) => {
      requestAnimationFrame(() => {
        if (!isMountedRef.current) return;
        
        instance.getVirtualItems().forEach(virtualRow => {
          const rowRef = rowRefsMap.current?.get(virtualRow.index);
          if (!rowRef) return;
          
          // Only transform rows that aren't sticky
          if (!rowRef.classList.contains('sticky-group-header')) {
            rowRef.style.transform = `translateY(${virtualRow.start}px)`;
          }
        });
      });
    }
  });
  
  // Re-measure when layout changes
  React.useLayoutEffect(() => {
    virtualizer.measure();
  }, [virtualizer]);

  return virtualizer;
} 