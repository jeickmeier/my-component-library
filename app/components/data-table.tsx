"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  getGroupedRowModel,
  getExpandedRowModel,
  ExpandedState,
  GroupingState,
  Row,
  Table as ReactTable,
} from "@tanstack/react-table"
import { useVirtualizer, VirtualItem, Virtualizer } from "@tanstack/react-virtual"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react"
import { DataTableColumnHeader } from "@/app/components/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { GroupingPanel } from "@/app/components/data-table-grouping-panel"

interface FilterOption {
  label: string
  value: string
}

interface SelectColumnFilter {
  type: 'select'
  column: string
  label: string
  options: FilterOption[]
}

interface RangeColumnFilter {
  type: 'range'
  column: string
  label: string
  min?: number
  max?: number
}

type ColumnFilter = SelectColumnFilter | RangeColumnFilter

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  columnFilters?: ColumnFilter[]
  enableGrouping?: boolean
  groupableColumns?: string[]
}

// Define props for DataTableFilters
interface DataTableFiltersProps<TData> {
  table: ReactTable<TData>
  columnFilters: ColumnFilter[]
  globalFilter: string
  setGlobalFilter: (value: string) => void
}

// New DataTableFilters component
function DataTableFilters<TData>({
  table,
  columnFilters,
  globalFilter,
  setGlobalFilter,
}: DataTableFiltersProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      {/* Global Filter */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Filter all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-64"
        />
        {/* Grouping Button will be moved later */}
      </div>

      {/* Column Filters */}
      <div className="flex items-center space-x-2">
        {columnFilters.map((filter) => (
          <div key={filter.column} className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              {filter.label}:
            </p>
            {filter.type === 'select' && (
              <Select
                value={table.getColumn(filter.column)?.getFilterValue() as string || "all"}
                onValueChange={(value) => {
                  table.getColumn(filter.column)?.setFilterValue(value === "all" ? undefined : value)
                }}
              >
                <SelectTrigger className="h-8 w-36">
                  <SelectValue placeholder={`All ${filter.label}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {filter.type === 'range' && (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder={`Min ${filter.label}`}
                  className="h-8 w-24"
                  value={(table.getColumn(filter.column)?.getFilterValue() as [number, number])?.[0] ?? ""}
                  onChange={(event) => {
                    const value = event.target.value ? Number(event.target.value) : undefined;
                    const maxValue = (table.getColumn(filter.column)?.getFilterValue() as [number, number])?.[1];
                    
                    table.getColumn(filter.column)?.setFilterValue(
                      value !== undefined || maxValue !== undefined 
                        ? [value, maxValue] 
                        : undefined
                    );
                  }}
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder={`Max ${filter.label}`}
                  className="h-8 w-24"
                  value={(table.getColumn(filter.column)?.getFilterValue() as [number, number])?.[1] ?? ""}
                  onChange={(event) => {
                    const value = event.target.value ? Number(event.target.value) : undefined;
                    const minValue = (table.getColumn(filter.column)?.getFilterValue() as [number, number])?.[0];
                    
                    table.getColumn(filter.column)?.setFilterValue(
                      minValue !== undefined || value !== undefined 
                        ? [minValue, value] 
                        : undefined
                    );
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Define props for DataTableGroupingControl
interface DataTableGroupingControlProps {
  grouping: GroupingState
  setGrouping: (updater: React.SetStateAction<GroupingState>) => void
  groupableColumnObjects: { id: string; label: string }[]
  isGroupingDialogOpen: boolean
  setIsGroupingDialogOpen: (open: boolean) => void
}

// New DataTableGroupingControl component
function DataTableGroupingControl({
  grouping,
  setGrouping,
  groupableColumnObjects,
  isGroupingDialogOpen,
  setIsGroupingDialogOpen,
}: DataTableGroupingControlProps) {
  return (
    <Dialog open={isGroupingDialogOpen} onOpenChange={setIsGroupingDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5"
        >
          <Layers className="h-4 w-4" />
          Group By
          {grouping.length > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-1 rounded-sm px-1 font-normal"
            >
              {grouping.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Table Grouping</DialogTitle>
          <DialogDescription>
            Group your data by one or more columns to create hierarchical views. Drag to reorder groups.
          </DialogDescription>
        </DialogHeader>
        <GroupingPanel
          availableColumns={groupableColumnObjects}
          grouping={grouping}
          onGroupingChange={setGrouping}
        />
      </DialogContent>
    </Dialog>
  )
}

// Define props for DataTableStructure
interface DataTableStructureProps<TData, TValue> {
  table: ReactTable<TData>
  columns: ColumnDef<TData, TValue>[]
  isClient: boolean
  rows: Row<TData>[],
  tableContainerRef: React.RefObject<HTMLDivElement | null>
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>
  isMountedRef: React.RefObject<boolean>
  grouping: GroupingState
  stickyGroupHeaders: number[]
  setStickyGroupHeaders: React.Dispatch<React.SetStateAction<number[]>>
  headerRef: React.RefObject<HTMLTableSectionElement | null>
}

// New DataTableStructure component
function DataTableStructure<TData, TValue>({
  table,
  columns,
  isClient,
  rows,
  tableContainerRef,
  rowRefsMap,
  isMountedRef,
  grouping,
  stickyGroupHeaders,
  setStickyGroupHeaders,
  headerRef,
}: DataTableStructureProps<TData, TValue>) {
  return (
    <div className="rounded-md border">
      {/* Always render the fixed table header */}
      <Table 
        style={{ 
          width: '100%', 
          tableLayout: 'fixed',
          borderCollapse: 'separate',
          borderSpacing: 0
        }}
      >
        <TableHeader
          ref={headerRef}
          className="sticky-table-header"
          style={{
            width: '100%',
            position: 'sticky',
            top: 0,
            zIndex: 2000,
          }}
        >
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow 
              key={headerGroup.id}
              style={{ 
                display: 'flex', 
                width: '100%',
              }}
            >
              {headerGroup.headers.map((header) => (
                <TableHead 
                  key={header.id}
                  style={{
                    flex: header.column.getSize() ? `${header.column.getSize()} 0 0` : 1,
                    width: header.column.getSize() ? `${header.column.getSize()}px` : 'auto',
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <DataTableColumnHeader 
                      column={header.column} 
                      title={flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
      </Table>
      
      {/* Scrollable table body - client-only virtualized or simple server version */}
      <div 
        ref={tableContainerRef} 
        className="virtualized-table-container" 
        style={{ 
          height: '400px',
          position: 'relative',
          willChange: 'transform',
          overflowX: 'auto',
          overflowY: 'auto'
        }}
      >
        <Table 
          style={{ 
            width: '100%', 
            tableLayout: 'fixed',
            borderCollapse: 'separate',
            borderSpacing: 0
          }}
        >
          {isClient ? (
            <ClientTableBody<TData, TValue>
              rows={rows}
              tableContainerRef={tableContainerRef as React.RefObject<HTMLDivElement>}
              rowRefsMap={rowRefsMap}
              isMountedRef={isMountedRef}
              grouping={grouping}
              stickyGroupHeaders={stickyGroupHeaders}
              setStickyGroupHeaders={setStickyGroupHeaders}
              columns={columns}
            />
          ) : (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading table data...
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  )
}

// Update ClientTableBody props to be generic
interface ClientTableBodyProps<TData, TValue> {
  rows: Row<TData>[];
  tableContainerRef: React.RefObject<HTMLDivElement>;
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>;
  isMountedRef: React.RefObject<boolean>;
  grouping: GroupingState;
  stickyGroupHeaders: number[];
  setStickyGroupHeaders: React.Dispatch<React.SetStateAction<number[]>>;
  columns: ColumnDef<TData, TValue>[];
}

// Create a client-only component for virtualized table body
function ClientTableBody<TData, TValue>({
  rows,
  tableContainerRef,
  rowRefsMap,
  isMountedRef,
  grouping,
  stickyGroupHeaders,
  setStickyGroupHeaders,
  columns,
}: ClientTableBodyProps<TData, TValue>) {
  const getScrollElement = React.useCallback(() => tableContainerRef.current, [tableContainerRef]);
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
  
  const virtualRows = virtualizer.getVirtualItems();
  
  // Compute sticky group headers when scrolling
  React.useEffect(() => {
    if (!rows.length || grouping.length === 0) {
      setStickyGroupHeaders([]);
      return;
    }
    
    const handleScroll = () => {
      if (!isMountedRef.current || !tableContainerRef.current) return;
      
      const scrollTop = tableContainerRef.current.scrollTop;
      const visibleVirtualRows = virtualizer.getVirtualItems();
      
      if (!visibleVirtualRows.length) {
        setStickyGroupHeaders([]);
        return;
      }
      
      // Find the first visible row index
      const firstVisibleIndex = visibleVirtualRows[0].index;
      
      // Find all parent group rows that are ancestors of currently visible rows
      const parentIndices: number[] = [];
      
      // Process each visible row to find its parent groups
      for (const virtualRow of visibleVirtualRows) {
        const currentRow = rows[virtualRow.index];
        
        // Skip if already processed
        if (parentIndices.includes(virtualRow.index)) continue;
        
        // Only process rows that have parents
        if (currentRow.depth > 0) {
          // Start with current row and walk up the parent chain
          let rowToCheck = currentRow;
          while (rowToCheck.depth > 0) {
            const parentRow = rowToCheck.getParentRow?.();
            if (parentRow) {
              const parentIndex = rows.findIndex(r => r.id === parentRow.id);
              if (parentIndex >= 0 && !parentIndices.includes(parentIndex)) {
                parentIndices.push(parentIndex);
              }
              rowToCheck = parentRow;
            } else {
              break;
            }
          }
        }
      }
      
      // A parent row should be sticky if:
      // 1. It's a parent of currently visible rows
      // 2. It's not currently visible itself or is at the very top of the viewport
      const stickyHeaders = parentIndices.filter(index => {
        return index < firstVisibleIndex || 
               (index === firstVisibleIndex && scrollTop > 0);
      });
      
      // Sort by depth to ensure proper stacking
      const sortedHeaders = [...stickyHeaders].sort((a, b) => {
        // First by depth (to keep hierarchical structure)
        const depthDiff = rows[a].depth - rows[b].depth;
        if (depthDiff !== 0) return depthDiff;
        
        // Then by row index
        return a - b;
      });
      
      // Update state using functional update to avoid dependency loop
      setStickyGroupHeaders(currentStickyHeaders => {
        if (JSON.stringify(sortedHeaders) !== JSON.stringify(currentStickyHeaders)) {
          return sortedHeaders;
        }
        return currentStickyHeaders;
      });
    };
    
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial calculation
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [rows, grouping, setStickyGroupHeaders, virtualizer, tableContainerRef, isMountedRef]);
  
  // Re-measure when layout changes
  React.useLayoutEffect(() => {
    virtualizer.measure();
  }, [virtualizer]);
  
  // Add CSS for sticky headers
  React.useEffect(() => {
    if (!document.getElementById('sticky-group-header-styles')) {
      const styleSheet = document.createElement('style');
      styleSheet.id = 'sticky-group-header-styles';
      styleSheet.innerHTML = `
        /* Sticky header styling */
        .sticky-table-header {
          position: sticky !important;
          top: 0;
          z-index: 2000; 
          background-color: var(--background);
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          width: 100%;
        }
        
        /* Sticky group row styling */
        .sticky-group-header {
          position: sticky !important;
          z-index: 1000;
          backdrop-filter: blur(4px);
          background-color: var(--background);
        }
        
        .sticky-group-header:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border);
          z-index: 1;
        }
        
        /* Container stacking context */
        .virtualized-table-container {
          position: relative;
          z-index: 0;
          overflow: auto;
        }
        
        /* Ensure correct stacking of elements */
        thead {
          z-index: 3;
        }
        
        tbody {
          z-index: 1;
          position: relative;
        }
      `;
      document.head.appendChild(styleSheet);
      
      return () => {
        const style = document.getElementById('sticky-group-header-styles');
        if (style) document.head.removeChild(style);
      };
    }
  }, []);
  
  if (rows.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="h-24 text-center"
          >
            No results.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }
  
  return (
    <TableBody
      style={{
        display: 'block',
        position: 'relative',
        height: `${virtualizer.getTotalSize()}px`,
        width: '100%',
        minWidth: '100%',
        contain: 'strict',
        zIndex: 1
      }}
    >
      {virtualRows.map(virtualRow => {
        const row = rows[virtualRow.index]
        return (
          <TableRowComponent
            key={row.id}
            row={row}
            rows={rows}
            virtualRow={virtualRow}
            rowRefsMap={rowRefsMap}
            virtualizer={virtualizer}
            grouping={grouping}
            stickyGroupHeaders={stickyGroupHeaders}
          />
        )
      })}
    </TableBody>
  );
}

// Update the TableRowProps interface to include all rows
interface TableRowProps<TData> {
  row: Row<TData>
  rows: Row<TData>[]
  virtualRow: VirtualItem
  rowRefsMap: React.RefObject<Map<number, HTMLTableRowElement>>
  virtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>
  grouping: GroupingState
  stickyGroupHeaders?: number[]
}

// Update the TableRowComponent function
function TableRowComponent<TData>({
  row,
  rows,
  virtualRow,
  rowRefsMap,
  virtualizer,
  grouping,
  stickyGroupHeaders = [],
}: TableRowProps<TData>) {
  // Determine if this row should be sticky
  const isParentRow = row.subRows && row.subRows.length > 0 && grouping.length > 0;
  const rowIndex = rows.findIndex((r: Row<TData>) => r.id === row.id);
  const isSticky = isParentRow && stickyGroupHeaders.includes(rowIndex);
  
  // Find the position in the sticky stack (0 = top, 1 = second from top, etc.)
  const stickyPosition = isSticky 
    ? stickyGroupHeaders.findIndex(index => index === rowIndex)
    : -1;
  
  // Calculate the top position based on stack position
  const stickyTop = isSticky
    ? stickyGroupHeaders
        .slice(0, stickyPosition)
        .reduce((total, idx) => {
          const el = rowRefsMap.current?.get(idx);
          return total + (el?.offsetHeight || 35); // Use 35 as fallback height
        }, 0)
    : undefined;
  
  // Z-index needs to be lower than the table header but still stacking properly
  const stickyZIndex = isSticky 
    ? 1000 - stickyPosition // High z-index but lower than header's 2000
    : undefined;
  
  return (
    <TableRow
      data-index={virtualRow.index}
      data-state={row.getIsSelected() && "selected"}
      className={isSticky ? "sticky-group-header" : ""}
      ref={(node: HTMLTableRowElement | null) => {
        if (node) {
          // Measure the element for dynamic height
          virtualizer.measureElement?.(node);
          // Store reference to update position later
          rowRefsMap.current?.set(virtualRow.index, node);
        }
      }}
      style={{
        position: isSticky ? 'sticky' : 'absolute',
        top: isSticky ? stickyTop : 0, 
        left: 0,
        width: '100%',
        height: `${virtualRow.size}px`,
        transform: isSticky ? 'none' : `translateY(${virtualRow.start}px)`,
        display: 'flex',
        alignItems: 'center',
        zIndex: stickyZIndex,
        backgroundColor: isSticky ? 'var(--background)' : undefined,
        boxShadow: isSticky ? '0 1px 3px rgba(0,0,0,0.1)' : undefined,
        borderBottom: isSticky ? '1px solid var(--border)' : undefined,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell 
          key={cell.id}
          className={grouping.includes(cell.column.id) ? "font-medium" : ""}
          style={{ 
            flex: cell.column.getSize() ? `${cell.column.getSize()} 0 0` : 1,
            width: cell.column.getSize() ? `${cell.column.getSize()}px` : 'auto',
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {grouping.includes(cell.column.id) && row.subRows?.length > 0 ? (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="mr-1 h-4 w-4 p-0"
                onClick={() => {
                  row.toggleExpanded()
                }}
              >
                {row.getIsExpanded() ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              <span 
                style={{ 
                  paddingLeft: `${row.depth * 2}rem`,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext()
                )}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({row.subRows.length})
              </span>
            </div>
          ) : (
            <span 
              style={{ 
                paddingLeft: `${row.depth * 2}rem`,
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {flexRender(
                cell.column.columnDef.cell,
                cell.getContext()
              )}
            </span>
          )}
        </TableCell>
      ))}
    </TableRow>
  )
}

// Define props for DataTableFooter
interface DataTableFooterProps<TData> {
  table: ReactTable<TData>
  dataLength: number
  grouping: GroupingState
  groupableColumnObjects: { id: string; label: string }[]
}

// New DataTableFooter component
function DataTableFooter<TData>({
  table,
  dataLength,
  grouping,
  groupableColumnObjects,
}: DataTableFooterProps<TData>) {
  return (
    <div className="flex items-center">
      <div className="flex-1 text-sm text-muted-foreground">
        Showing {table.getFilteredRowModel().rows.length} of {dataLength} entries
        {grouping.length > 0 && (
          <span className="ml-2">
            (Grouped by{" "}
            {grouping.map((columnId, index) => {
              const column = groupableColumnObjects.find(c => c.id === columnId)
              return (
                <React.Fragment key={columnId}>
                  <span className="font-medium">
                    {column?.label || columnId}
                  </span>
                  {index < grouping.length - 1 ? " → " : ""}
                </React.Fragment>
              )
            })}
            )
          </span>
        )}
      </div>
    </div>
  )
}

// --- Custom Hook: useDataTableLogic ---
function useDataTableLogic<TData, TValue>({
  data,
  columns,
  enableGrouping = false,
  groupableColumns = [],
}: DataTableProps<TData, TValue>) {
  // State
  const [isClient, setIsClient] = React.useState(false);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFiltersState, setColumnFiltersState] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [grouping, setGrouping] = React.useState<GroupingState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });
  const [isGroupingDialogOpen, setIsGroupingDialogOpen] = React.useState(false);
  const [stickyGroupHeaders, setStickyGroupHeaders] = React.useState<number[]>([]);

  // Refs
  const isMountedRef = React.useRef(false);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLTableSectionElement>(null);
  const rowRefsMap = React.useRef<Map<number, HTMLTableRowElement>>(new Map());

  // Effects
  React.useEffect(() => {
    isMountedRef.current = true;
    setIsClient(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memos
  const groupableColumnObjects = React.useMemo(() => {
    return groupableColumns.map(columnId => {
      const col = columns.find(c => c.id === columnId || ('accessorKey' in c && c.accessorKey === columnId));
      return {
        id: columnId,
        label: typeof col?.header === 'string'
          ? col.header
          : (columnId.charAt(0).toUpperCase() + columnId.slice(1)),
      };
    });
  }, [columns, groupableColumns]);

  // Table Instance
  const table = useReactTable<TData>({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFiltersState,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: (updater) => {
      if (isMountedRef.current) {
        setGrouping(updater);
      } else {
        if (typeof updater === 'function') {
          setGrouping(prev => updater(prev));
        } else {
          setGrouping(updater);
        }
      }
    },
    getGroupedRowModel: enableGrouping ? getGroupedRowModel() : undefined,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    onPaginationChange: (updater) => {
      if (isMountedRef.current) {
        setPagination(updater);
      } else {
        if (typeof updater === 'function') {
          setPagination(prev => updater(prev));
        } else {
          setPagination(updater);
        }
      }
    },
    state: {
      sorting,
      columnFilters: columnFiltersState,
      globalFilter,
      columnVisibility,
      grouping,
      expanded,
      pagination,
    },
    enableGrouping,
    manualGrouping: !enableGrouping,
    debugTable: true,
    defaultColumn: {
      size: 150,
      minSize: 50,
      maxSize: 500,
    },
    autoResetPageIndex: false,
  });

  const { rows } = table.getRowModel();

  return {
    table,
    rows,
    isClient,
    grouping,
    setGrouping,
    globalFilter,
    setGlobalFilter,
    isGroupingDialogOpen,
    setIsGroupingDialogOpen,
    stickyGroupHeaders,
    setStickyGroupHeaders,
    tableContainerRef,
    headerRef,
    rowRefsMap,
    isMountedRef,
    groupableColumnObjects,
  };
}

// --- Main DataTable Component ---
export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const {
    table,
    rows,
    isClient,
    grouping,
    setGrouping,
    globalFilter,
    setGlobalFilter,
    isGroupingDialogOpen,
    setIsGroupingDialogOpen,
    stickyGroupHeaders,
    setStickyGroupHeaders,
    tableContainerRef,
    headerRef,
    rowRefsMap,
    isMountedRef,
    groupableColumnObjects,
  } = useDataTableLogic(props); // Use the hook

  const { columns, data, columnFilters = [], enableGrouping = false, groupableColumns = [] } = props;
  
  return (
    <div className="space-y-4">
      {/* Toolbar Area */}
      <div className="flex items-center justify-between">
        {/* Filters Section */}
        <div className="flex-grow">
          <DataTableFilters 
            table={table}
            columnFilters={columnFilters} // Pass from props
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
        
        {/* Grouping Section */}
        <div className="flex items-center pl-2">
          {enableGrouping && groupableColumns.length > 0 && (
            <DataTableGroupingControl 
              grouping={grouping}
              setGrouping={setGrouping}
              groupableColumnObjects={groupableColumnObjects}
              isGroupingDialogOpen={isGroupingDialogOpen}
              setIsGroupingDialogOpen={setIsGroupingDialogOpen}
            />
          )}
        </div>
      </div>
      
      {/* Table Structure Area */}
      <DataTableStructure<TData, TValue>
        table={table}
        columns={columns} // Pass from props
        isClient={isClient}
        rows={rows}
        tableContainerRef={tableContainerRef}
        rowRefsMap={rowRefsMap}
        isMountedRef={isMountedRef}
        grouping={grouping}
        stickyGroupHeaders={stickyGroupHeaders}
        setStickyGroupHeaders={setStickyGroupHeaders}
        headerRef={headerRef}
      />
      
      {/* Footer Area */}
      <DataTableFooter 
        table={table}
        dataLength={data.length} // Pass from props
        grouping={grouping}
        groupableColumnObjects={groupableColumnObjects}
      />
    </div>
  )
}
