'use client'

import { useEffect, useRef, useCallback } from 'react'

// Hook for managing event listeners with automatic cleanup
export function useEventListener<T extends keyof WindowEventMap>(
  eventName: T,
  handler: (event: WindowEventMap[T]) => void,
  element?: Element | Window | null,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef<(event: WindowEventMap[T]) => void | undefined>(undefined)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const targetElement = element ?? window
    if (!targetElement?.addEventListener) return

    const eventListener = (event: WindowEventMap[T]) => {
      savedHandler.current?.(event)
    }

    targetElement.addEventListener(eventName, eventListener as EventListener, options)

    return () => {
      targetElement.removeEventListener(eventName, eventListener as EventListener, options)
    }
  }, [eventName, element, options])
}

// Hook for managing intervals with automatic cleanup
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const tick = () => {
      savedCallback.current?.()
    }

    const id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay])
}

// Hook for managing timeouts with automatic cleanup
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const tick = () => {
      savedCallback.current?.()
    }

    const id = setTimeout(tick, delay)
    return () => clearTimeout(id)
  }, [delay])
}

// Hook for managing canvas memory efficiently
export function useCanvasMemoryManagement(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const imageDataCache = useRef<Map<string, ImageData>>(new Map())
  const maxCacheSize = 10 // Limit cache size to prevent memory bloat

  const getContext = useCallback(() => {
    if (!contextRef.current && canvasRef.current) {
      contextRef.current = canvasRef.current.getContext('2d', {
        // Optimize context for performance
        alpha: false, // Disable alpha channel if not needed
        desynchronized: true, // Allow desynchronized rendering
        willReadFrequently: false, // Optimize for write-heavy operations
      })
    }
    return contextRef.current
  }, [canvasRef])

  const clearCanvas = useCallback(() => {
    const ctx = getContext()
    const canvas = canvasRef.current
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [getContext, canvasRef])

  const cacheImageData = useCallback((key: string, imageData: ImageData) => {
    const cache = imageDataCache.current
    
    // Remove oldest entries if cache is full
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value
      if (firstKey !== undefined) {
        cache.delete(firstKey)
      }
    }
    
    cache.set(key, imageData)
  }, [])

  const getCachedImageData = useCallback((key: string) => {
    return imageDataCache.current.get(key)
  }, [])

  const clearImageCache = useCallback(() => {
    imageDataCache.current.clear()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      contextRef.current = null
      imageDataCache.current.clear()
    }
  }, [])

  return {
    getContext,
    clearCanvas,
    cacheImageData,
    getCachedImageData,
    clearImageCache,
  }
}

// Hook for monitoring memory usage (development only)
export function useMemoryMonitor(componentName: string) {
  const startMemory = useRef<number>(0)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      startMemory.current = (performance as any).memory.usedJSHeapSize
    }
  }, [])

  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
        const endMemory = (performance as any).memory.usedJSHeapSize
        const memoryDiff = endMemory - startMemory.current
        
        if (Math.abs(memoryDiff) > 1024 * 1024) { // Log if > 1MB difference
          console.log(`🧠 ${componentName} memory impact: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`)
        }
      }
    }
  }, [componentName])
}

// Hook for managing object URLs with automatic cleanup
export function useObjectURL() {
  const urlsRef = useRef<Set<string>>(new Set())

  const createObjectURL = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob)
    urlsRef.current.add(url)
    return url
  }, [])

  const revokeObjectURL = useCallback((url: string) => {
    URL.revokeObjectURL(url)
    urlsRef.current.delete(url)
  }, [])

  const revokeAllObjectURLs = useCallback(() => {
    urlsRef.current.forEach(url => {
      URL.revokeObjectURL(url)
    })
    urlsRef.current.clear()
  }, [])

  // Cleanup all URLs on unmount
  useEffect(() => {
    return () => {
      revokeAllObjectURLs()
    }
  }, [revokeAllObjectURLs])

  return {
    createObjectURL,
    revokeObjectURL,
    revokeAllObjectURLs,
  }
}

// Hook for managing WeakMap-based caches
export function useWeakMapCache<K extends object, V>() {
  const cacheRef = useRef<WeakMap<K, V>>(new WeakMap())

  const get = useCallback((key: K): V | undefined => {
    return cacheRef.current.get(key)
  }, [])

  const set = useCallback((key: K, value: V): void => {
    cacheRef.current.set(key, value)
  }, [])

  const has = useCallback((key: K): boolean => {
    return cacheRef.current.has(key)
  }, [])

  const delete_ = useCallback((key: K): boolean => {
    return cacheRef.current.delete(key)
  }, [])

  return { get, set, has, delete: delete_ }
}

// Hook for managing ResizeObserver with cleanup
export function useResizeObserver(
  callback: (entries: ResizeObserverEntry[]) => void,
  element?: Element | null
) {
  const observerRef = useRef<ResizeObserver | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!element) return

    observerRef.current = new ResizeObserver((entries) => {
      callbackRef.current(entries)
    })

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [element])
}

// Hook for managing IntersectionObserver with cleanup
export function useIntersectionObserverCleanup(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
  element?: Element | null
) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!element) return

    observerRef.current = new IntersectionObserver((entries) => {
      callbackRef.current(entries)
    }, options)

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [element, options])
}

// Utility for detecting memory leaks in development
export function detectMemoryLeaks() {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory
    
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    }
  }
  
  return null
}

// Hook for automatic garbage collection hints
export function useGarbageCollectionHints() {
  const forceGC = useCallback(() => {
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      (window as any).gc()
    }
  }, [])

  const scheduleGC = useCallback((delay: number = 5000) => {
    setTimeout(forceGC, delay)
  }, [forceGC])

  return { forceGC, scheduleGC }
}