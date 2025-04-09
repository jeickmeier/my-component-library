"use client"

import * as React from "react"
import { useTableWorker } from "../hooks/useTableWorker"
import { 
  SortingState, 
  ColumnFiltersState,
  Table,
  ColumnDef,
} from "@tanstack/react-table"

interface WorkerDataProviderProps<TData> {
  children: React.ReactNode
  data: TData[]
  table: Table<TData>
  sorting: SortingState
  columnFilters: ColumnFiltersState
  globalFilter: string
  isWorkerEnabled?: boolean
  onDataProcessed?: (processedData: TData[]) => void
}

interface WorkerStatusContextValue {
  isProcessing: boolean
  processingTime?: number
  lastOperation?: string
  recordCount?: number
  processedData?: unknown[]
}

const WorkerStatusContext = React.createContext<WorkerStatusContextValue>({
  isProcessing: false,
})

export const useWorkerStatus = () => React.useContext(WorkerStatusContext)

/**
 * Higher-order component that processes data using web workers
 * 
 * This component offloads expensive data operations like sorting and filtering
 * to a web worker, keeping the UI responsive when working with large datasets.
 * 
 * @template TData The type of data being displayed
 */
export function WorkerDataProvider<TData extends Record<string, unknown>>({
  children,
  data,
  table,
  sorting,
  columnFilters,
  globalFilter,
  isWorkerEnabled = true,
  onDataProcessed,
}: WorkerDataProviderProps<TData>) {
  // Reference to the original data
  const originalData = React.useRef<TData[]>(data)
  
  // Track processed data
  const [processedData, setProcessedData] = React.useState<TData[]>(data)
  
  // Get worker functions
  const { processData, isProcessing } = useTableWorker()
  
  // Track processing metrics
  const [processingMetrics, setProcessingMetrics] = React.useState<{
    time?: number
    lastOperation?: string
    recordCount?: number
  }>({})
  
  // Update original data ref when data changes
  React.useEffect(() => {
    originalData.current = data
    // Also reset processed data if needed
    if (!isProcessing) {
      setProcessedData(data)
    }
  }, [data, isProcessing])
  
  // Process data when sorting or filters change
  React.useEffect(() => {
    // Skip if worker is disabled or we have no data
    if (!isWorkerEnabled || originalData.current.length === 0) {
      return
    }
    
    // Build filter array from column filters and global filter
    const filters: Array<{ id: string; value: unknown; type: string }> = []
    
    // Add column filters
    if (columnFilters.length > 0) {
      columnFilters.forEach(filter => {
        const column = table.getColumn(filter.id)
        const columnDef = column?.columnDef as ColumnDef<TData, unknown> & {
          meta?: { filter?: { type: string } }
        }
        const filterType = columnDef?.meta?.filter?.type || 'text'
        
        filters.push({
          id: filter.id,
          value: filter.value,
          type: filterType,
        })
      })
    }
    
    // Add global filter if present
    if (globalFilter) {
      // Apply global filter to all visible text columns
      table.getAllLeafColumns()
        .filter(column => column.getCanFilter())
        .forEach(column => {
          filters.push({
            id: column.id,
            value: globalFilter,
            type: 'text',
          })
        })
    }
    
    // Build sort array
    const sorts = sorting.map(sort => ({
      columnId: sort.id,
      desc: sort.desc,
    }))
    
    // Skip worker if no operations to perform
    if (sorts.length === 0 && filters.length === 0) {
      setProcessedData(originalData.current)
      if (onDataProcessed) {
        onDataProcessed(originalData.current)
      }
      return
    }
    
    // Use the worker to process data
    const processDataWithWorker = async () => {
      try {
        const result = await processData(originalData.current as Record<string, unknown>[], {
          sorts,
          filters,
        })
        
        // Update processed data
        const newProcessedData = result.result as TData[]
        setProcessedData(newProcessedData)
        
        // Call the callback if provided
        if (onDataProcessed) {
          onDataProcessed(newProcessedData)
        }
        
        // Update metrics
        if (result.performance) {
          setProcessingMetrics({
            time: result.performance.totalTime,
            lastOperation: result.operation,
            recordCount: result.performance.recordCount,
          })
        }
      } catch (error) {
        console.error('Error processing data with worker:', error)
        // Fall back to original data
        setProcessedData(originalData.current)
        if (onDataProcessed) {
          onDataProcessed(originalData.current)
        }
      }
    }
    
    processDataWithWorker()
  }, [isWorkerEnabled, sorting, columnFilters, globalFilter, table, processData, onDataProcessed])
  
  // Prepare context value
  const statusContextValue = React.useMemo(() => ({
    isProcessing,
    processingTime: processingMetrics.time,
    lastOperation: processingMetrics.lastOperation,
    recordCount: processingMetrics.recordCount,
    processedData,
  }), [isProcessing, processingMetrics, processedData])
  
  return (
    <WorkerStatusContext.Provider value={statusContextValue}>
      {children}
    </WorkerStatusContext.Provider>
  )
} 