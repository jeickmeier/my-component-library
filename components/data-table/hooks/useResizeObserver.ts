import { useEffect, useRef, useState } from 'react';

/**
 * Size information returned by the resize observer
 */
export interface DOMRectSize {
  width: number;
  height: number;
  x: number;
  y: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Hook that uses ResizeObserver to track element dimensions
 * 
 * @param targetRef - Optional ref to the element to observe. If not provided, 
 *                   the hook will create and return a ref that you should attach to the element.
 * @returns An object containing:
 *   - ref: A ref to attach to the element (if not provided)
 *   - size: The current dimensions of the element
 *   - isObserving: Whether observation has started
 * 
 * @example
 * // Using with an existing ref
 * const myRef = useRef(null);
 * const { size } = useResizeObserver({ targetRef: myRef });
 * 
 * @example
 * // Creating a ref automatically
 * const { ref, size } = useResizeObserver();
 * return <div ref={ref}>Resizable content</div>;
 */
export function useResizeObserver<T extends HTMLElement = HTMLElement>({
  targetRef,
}: {
  targetRef?: React.RefObject<T | null>;
} = {}) {
  // Create a ref if one wasn't provided
  const localRef = useRef<T>(null);
  const ref = targetRef || localRef;
  
  // Track the current size of the element
  const [size, setSize] = useState<DOMRectSize | null>(null);
  const [isObserving, setIsObserving] = useState(false);
  
  // Observer instance, kept in a ref to avoid recreation
  const observerRef = useRef<ResizeObserver | null>(null);
  
  useEffect(() => {
    // The element being observed
    const element = ref.current;
    if (!element) {
      return;
    }
    
    const updateSize = (entries: ResizeObserverEntry[]) => {
      // In case multiple elements are observed, we find the one we care about
      const entry = entries.find(entry => entry.target === element);
      if (entry) {
        // Get the content box size
        const { x, y, width, height, top, right, bottom, left } = entry.contentRect;
        setSize({ width, height, x, y, top, right, bottom, left });
        
        if (!isObserving) {
          setIsObserving(true);
        }
      }
    };
    
    // Cleanup previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create a new ResizeObserver
    try {
      observerRef.current = new ResizeObserver(updateSize);
      observerRef.current.observe(element);
      
      // Get initial size
      const { x, y, width, height, top, right, bottom, left } = element.getBoundingClientRect();
      setSize({ width, height, x, y, top, right, bottom, left });
    } catch (error) {
      // ResizeObserver may not be supported in all environments
      console.error('ResizeObserver failed:', error);
    }
    
    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [ref, isObserving]);
  
  return { ref: localRef, size, isObserving };
} 