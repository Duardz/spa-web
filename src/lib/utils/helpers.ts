// lib/utils/helpers.ts

// Debounce function for search and other inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
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

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Format bytes to human readable
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Chunk array for batch processing
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Retry function with exponential backoff
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    retries = 3,
    delay = 1000,
    backoff = 2,
    onRetry
  } = options;
  
  let lastError: Error;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < retries - 1) {
        if (onRetry) {
          onRetry(lastError, i + 1);
        }
        
        const waitTime = delay * Math.pow(backoff, i);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError!;
}

// Memoize function results
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    ttl?: number; // Time to live in milliseconds
    keyFn?: (...args: Parameters<T>) => string;
  } = {}
): T {
  const { ttl, keyFn = (...args) => JSON.stringify(args) } = options;
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn(...args);
    const cached = cache.get(key);
    
    if (cached) {
      if (!ttl || Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
    }
    
    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    
    // Clean up old entries if TTL is set
    if (ttl) {
      setTimeout(() => cache.delete(key), ttl);
    }
    
    return result;
  }) as T;
}

// Queue for batch processing
export class ProcessingQueue<T> {
  private queue: T[] = [];
  private processing = false;
  private batchSize: number;
  private processInterval: number;
  private processFn: (items: T[]) => Promise<void>;
  private timer?: NodeJS.Timeout;
  
  constructor(options: {
    batchSize: number;
    processInterval: number;
    processFn: (items: T[]) => Promise<void>;
  }) {
    this.batchSize = options.batchSize;
    this.processInterval = options.processInterval;
    this.processFn = options.processFn;
  }
  
  add(item: T): void {
    this.queue.push(item);
    this.scheduleProcess();
  }
  
  addBatch(items: T[]): void {
    this.queue.push(...items);
    this.scheduleProcess();
  }
  
  private scheduleProcess(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    // Process immediately if batch size is reached
    if (this.queue.length >= this.batchSize) {
      this.process();
    } else {
      // Otherwise, schedule processing
      this.timer = setTimeout(() => this.process(), this.processInterval);
    }
  }
  
  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    try {
      const batch = this.queue.splice(0, this.batchSize);
      await this.processFn(batch);
    } catch (error) {
      console.error('Queue processing error:', error);
    } finally {
      this.processing = false;
      
      // Process next batch if queue is not empty
      if (this.queue.length > 0) {
        this.scheduleProcess();
      }
    }
  }
  
  clear(): void {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
  
  get size(): number {
    return this.queue.length;
  }
}

// Local storage with expiry
export class CachedStorage {
  private prefix: string;
  
  constructor(prefix = 'app_cache_') {
    this.prefix = prefix;
  }
  
  set<T>(key: string, value: T, ttlMinutes = 60): void {
    const item = {
      value,
      expiry: Date.now() + ttlMinutes * 60 * 1000
    };
    
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      // Handle quota exceeded
      console.error('LocalStorage error:', error);
      this.cleanup();
    }
  }
  
  get<T>(key: string): T | null {
    const itemStr = localStorage.getItem(this.prefix + key);
    if (!itemStr) return null;
    
    try {
      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }
      return item.value;
    } catch {
      return null;
    }
  }
  
  remove(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }
  
  cleanup(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '{}');
          if (item.expiry && now > item.expiry) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  clear(): void {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}