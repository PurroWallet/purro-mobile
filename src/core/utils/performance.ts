/**
 * Performance Monitoring Utilities
 * Tools for measuring and optimizing app performance
 */

/**
 * Performance mark for measuring operation duration
 */
interface PerformanceMark {
  name: string;
  startTime: number;
}

/**
 * Performance metrics
 */
interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

/**
 * Performance monitor class
 */
class PerformanceMonitor {
  private marks: Map<string, PerformanceMark> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 100; // Keep last 100 metrics

  /**
   * Start measuring an operation
   */
  start(name: string): void {
    this.marks.set(name, {
      name,
      startTime: Date.now(),
    });
  }

  /**
   * End measuring an operation and record the duration
   */
  end(name: string): number | null {
    const mark = this.marks.get(name);
    if (!mark) {
      console.warn(`Performance mark "${name}" not found`);
      return null;
    }

    const duration = Date.now() - mark.startTime;
    this.marks.delete(name);

    // Record metric
    this.metrics.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    if (__DEV__) {
      console.log(`⏱️ Performance: ${name} took ${duration}ms`);
    }

    return duration;
  }

  /**
   * Measure an async operation
   */
  async measure<T>(name: string, operation: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await operation();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(name: string): PerformanceMetrics[] {
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.marks.clear();
    this.metrics = [];
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    if (!__DEV__) return;

    const operations = new Set(this.metrics.map((m) => m.name));
    console.log('📊 Performance Summary:');

    operations.forEach((name) => {
      const avg = this.getAverageDuration(name);
      const metrics = this.getMetrics(name);
      const min = Math.min(...metrics.map((m) => m.duration));
      const max = Math.max(...metrics.map((m) => m.duration));

      console.log(`  ${name}:`);
      console.log(`    Average: ${avg.toFixed(2)}ms`);
      console.log(`    Min: ${min}ms, Max: ${max}ms`);
      console.log(`    Samples: ${metrics.length}`);
    });
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * Debounce function for performance optimization
 * Delays function execution until after a specified wait time has elapsed
 * since the last time it was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 * Ensures function is called at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize function results for performance optimization
 * Caches function results based on arguments
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Batch multiple operations to reduce overhead
 * Collects operations and executes them together after a delay
 */
export function batchOperations<T>(
  operation: (items: T[]) => Promise<void>,
  delay: number = 100,
): (item: T) => void {
  let batch: T[] = [];
  let timeout: NodeJS.Timeout | null = null;

  return (item: T) => {
    batch.push(item);

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(async () => {
      const itemsToProcess = [...batch];
      batch = [];
      timeout = null;

      try {
        await operation(itemsToProcess);
      } catch (error) {
        console.error('Batch operation failed:', error);
      }
    }, delay);
  };
}

/**
 * Check if app is running in low-memory mode
 * Can be used to adjust caching strategies
 */
export function isLowMemoryMode(): boolean {
  // This is a placeholder - in a real app, you'd check device memory
  // and adjust behavior accordingly
  return false;
}

/**
 * Get recommended cache size based on device capabilities
 */
export function getRecommendedCacheSize(): number {
  if (isLowMemoryMode()) {
    return 50; // Smaller cache for low-memory devices
  }
  return 200; // Standard cache size
}

/**
 * Performance optimization tips
 */
export const PERFORMANCE_TIPS = {
  // List rendering
  LIST_RENDERING: {
    useVirtualization: 'Use FlatList with windowSize prop for long lists',
    useKeyExtractor: 'Always provide stable key extractors',
    useMemo: 'Memoize expensive computations in renderItem',
    avoidInlineStyles: 'Define styles outside render function',
  },

  // Image optimization
  IMAGE_OPTIMIZATION: {
    useFastImage: 'Use react-native-fast-image for better performance',
    resizeImages: 'Resize images to display size',
    cacheImages: 'Enable image caching',
    lazyLoad: 'Lazy load images outside viewport',
  },

  // State management
  STATE_MANAGEMENT: {
    useCallback: 'Wrap callbacks with useCallback to prevent re-renders',
    useMemo: 'Memoize expensive computations',
    splitState: 'Split state to minimize re-renders',
    useReducer: 'Use useReducer for complex state logic',
  },

  // API calls
  API_CALLS: {
    batchRequests: 'Batch multiple API requests when possible',
    cacheResponses: 'Cache API responses with appropriate TTL',
    useParallel: 'Use Promise.all for independent requests',
    implementRetry: 'Implement exponential backoff for retries',
  },

  // Navigation
  NAVIGATION: {
    lazyLoad: 'Lazy load screens not in initial route',
    preload: 'Preload next screen data',
    optimizeTransitions: 'Use simple transitions for better performance',
  },
};
