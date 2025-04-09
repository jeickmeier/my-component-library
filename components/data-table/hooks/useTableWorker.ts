import * as React from "react";

// Types for the worker messages
type WorkerOperation = 'sort' | 'filter' | 'group' | 'process';

interface WorkerRequest {
  operation: WorkerOperation;
  data: Record<string, unknown>[];
  params: Record<string, unknown>;
  id?: string;
}

interface WorkerResponse {
  result: Record<string, unknown>[];
  operation: string;
  id?: string;
  error?: string;
  performance?: {
    totalTime: number;
    recordCount: number;
  };
}

interface WorkerHandler {
  processData: (data: Record<string, unknown>[], params: {
    sorts?: Array<{ columnId: string; desc: boolean }>;
    filters?: Array<{ id: string; value: unknown; type: string }>;
  }) => Promise<WorkerResponse>;
  sortData: (data: Record<string, unknown>[], params: { 
    columnId: string; 
    desc: boolean 
  }) => Promise<WorkerResponse>;
  filterData: (data: Record<string, unknown>[], params: { 
    filters: Array<{ id: string; value: unknown; type: string }> 
  }) => Promise<WorkerResponse>;
  terminateWorker: () => void;
  isProcessing: boolean;
}

let workerInstance: Worker | null = null;
const pendingRequests = new Map<string, (value: WorkerResponse) => void>();

/**
 * Hook for using a web worker to process table data
 * 
 * This hook provides methods to offload data processing tasks to a web worker,
 * keeping the main UI thread responsive even with large datasets.
 * 
 * @returns Object with methods to interact with the worker
 */
export function useTableWorker(): WorkerHandler {
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  // Initialize the worker
  React.useEffect(() => {
    // Create the worker if it doesn't exist yet
    if (!workerInstance) {
      try {
        workerInstance = new Worker(new URL('../workers/table-worker.ts', import.meta.url));
        
        // Set up the message handler
        workerInstance.onmessage = (event: MessageEvent<WorkerResponse>) => {
          const { id } = event.data;
          
          // Resolve the pending promise for this request
          if (id && pendingRequests.has(id)) {
            const resolve = pendingRequests.get(id)!;
            resolve(event.data);
            pendingRequests.delete(id);
          }
          
          // If there are no more pending requests, we're not processing
          if (pendingRequests.size === 0) {
            setIsProcessing(false);
          }
        };
        
        // Handle worker errors
        workerInstance.onerror = (error) => {
          console.error('Worker error:', error);
          setIsProcessing(false);
          
          // Reject all pending promises
          pendingRequests.forEach((resolve) => {
            resolve({
              result: [],
              operation: 'error',
              error: error.message,
            });
          });
          pendingRequests.clear();
        };
      } catch (error) {
        console.error('Failed to create worker:', error);
      }
    }
    
    // Clean up when the component unmounts
    return () => {
      // Don't terminate the worker here to allow it to be reused
    };
  }, []);
  
  // Send a request to the worker and return a promise
  const sendRequest = React.useCallback((request: WorkerRequest): Promise<WorkerResponse> => {
    if (!workerInstance) {
      return Promise.reject(new Error('Worker not initialized'));
    }
    
    setIsProcessing(true);
    
    // Generate a unique ID for this request
    const id = `${request.operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a promise that will be resolved when the worker responds
    return new Promise((resolve) => {
      pendingRequests.set(id, resolve);
      workerInstance!.postMessage({ ...request, id });
    });
  }, []);
  
  // Process data with multiple operations
  const processData = React.useCallback(
    (data: Record<string, unknown>[], params: {
      sorts?: Array<{ columnId: string; desc: boolean }>;
      filters?: Array<{ id: string; value: unknown; type: string }>;
    }): Promise<WorkerResponse> => {
      return sendRequest({
        operation: 'process',
        data,
        params,
      });
    },
    [sendRequest]
  );
  
  // Sort data
  const sortData = React.useCallback(
    (data: Record<string, unknown>[], params: { columnId: string; desc: boolean }): Promise<WorkerResponse> => {
      return sendRequest({
        operation: 'sort',
        data,
        params,
      });
    },
    [sendRequest]
  );
  
  // Filter data
  const filterData = React.useCallback(
    (data: Record<string, unknown>[], params: { 
      filters: Array<{ id: string; value: unknown; type: string }> 
    }): Promise<WorkerResponse> => {
      return sendRequest({
        operation: 'filter',
        data,
        params,
      });
    },
    [sendRequest]
  );
  
  // Terminate the worker
  const terminateWorker = React.useCallback(() => {
    if (workerInstance) {
      workerInstance.terminate();
      workerInstance = null;
      pendingRequests.clear();
      setIsProcessing(false);
    }
  }, []);
  
  return {
    processData,
    sortData,
    filterData,
    terminateWorker,
    isProcessing,
  };
} 