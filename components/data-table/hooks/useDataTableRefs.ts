/**
 * Hook that manages React refs for the data table component, including references
 * to the table container, header, and body elements. Used for scroll synchronization
 * and dimension calculations.
 */

import * as React from "react";
import { Table as ReactTable } from "@tanstack/react-table";

interface UseDataTableRefsReturn<TData> {
  isClient: boolean;
  isMountedRef: React.RefObject<boolean>;
  tableContainerRef: React.RefObject<HTMLDivElement | null>;
  headerRef: React.RefObject<HTMLTableSectionElement | null>;
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>;
  tableRef: React.MutableRefObject<ReactTable<TData> | null>;
}

export function useDataTableRefs<TData>(): UseDataTableRefsReturn<TData> {
  // Client-side state
  const [isClient, setIsClient] = React.useState(false);

  // Refs
  const isMountedRef = React.useRef(false);
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
  const headerRef = React.useRef<HTMLTableSectionElement | null>(null);
  const rowRefsMap = React.useRef<Map<number, HTMLTableRowElement>>(new Map());
  const tableRef = React.useRef<ReactTable<TData> | null>(null);

  // Effect for client-side initialization
  React.useEffect(() => {
    isMountedRef.current = true;
    setIsClient(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    isClient,
    isMountedRef,
    tableContainerRef,
    headerRef,
    rowRefsMap,
    tableRef,
  };
}
