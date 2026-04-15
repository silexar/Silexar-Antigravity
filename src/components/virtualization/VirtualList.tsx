/**
 * Virtual List Component - Fortune 10 Grade Performance
 * 
 * Uses @tanstack/react-virtual for efficient rendering of large lists
 * Prevents render blocking with lists >50 items
 * 
 * @performance Virtualizes lists for 60fps scrolling
 * @module VirtualList
 */

'use client';

import React, { useRef, useCallback } from 'react';
import { useVirtualizer, VirtualItem, Virtualizer } from '@tanstack/react-virtual';
import { cn } from '@/lib/utils';

interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Height of each item in pixels (default: 80) */
  itemHeight?: number;
  /** Height of the container (default: 600px) */
  containerHeight?: number | string;
  /** Number of items to render outside viewport (default: 5) */
  overscan?: number;
  /** Additional class for the container */
  className?: string;
  /** Additional class for each item */
  itemClassName?: string;
  /** Callback when scroll reaches end (for infinite scroll) */
  onEndReached?: () => void;
  /** Distance from end to trigger onEndReached (default: 200) */
  endReachedThreshold?: number;
  /** Custom scrollbar styling */
  customScrollbar?: boolean;
  /** Empty state component */
  emptyComponent?: React.ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Loading component */
  loadingComponent?: React.ReactNode;
}

/**
 * Virtual List Component
 * 
 * Efficiently renders large lists by only mounting visible items.
 * Essential for lists with >50 items to maintain 60fps scrolling.
 * 
 * @example
 * ```tsx
 * <VirtualList
 *   items={cunas}
 *   itemHeight={120}
 *   renderItem={(cuna) => <CunaRow cuna={cuna} />}
 * />
 * ```
 */
export function VirtualList<T>({
  items,
  renderItem,
  itemHeight = 80,
  containerHeight = 600,
  overscan = 5,
  className,
  itemClassName,
  onEndReached,
  endReachedThreshold = 200,
  customScrollbar = true,
  emptyComponent,
  isLoading,
  loadingComponent,
}: VirtualListProps<T>): React.ReactElement {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
    onChange: useCallback((instance: Virtualizer<HTMLDivElement, Element>) => {
      if (!onEndReached) return;
      
      const lastItem = instance.getVirtualItems().at(-1);
      if (!lastItem) return;
      
      const totalSize = instance.getTotalSize();
      const scrollOffset = instance.scrollOffset ?? 0;
      const scrollHeight = instance.scrollRect?.height ?? 0;
      
      if (totalSize - scrollOffset - scrollHeight < endReachedThreshold) {
        onEndReached();
      }
    }, [onEndReached, endReachedThreshold]),
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  if (items.length === 0 && !isLoading) {
    return (
      <div 
        className={cn("flex items-center justify-center", className)}
        style={{ height: containerHeight }}
      >
        {emptyComponent || (
          <div className="text-center text-slate-400">
            <p>No hay elementos para mostrar</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn(
        "overflow-auto",
        customScrollbar && "scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent",
        className
      )}
      style={{ height: containerHeight }}
      role="list"
      aria-label="Virtual list"
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem: VirtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={cn("absolute left-0 w-full", itemClassName)}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              role="listitem"
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
      
      {isLoading && (
        <div className="py-4">
          {loadingComponent || (
            <div className="flex items-center justify-center">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VirtualList;
