import React, { useState, useEffect, useRef, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number; 
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  gap?: number;
  className?: string;
}

export function VirtualList<T>({ items, itemHeight, renderItem, overscan = 5, gap = 0, className = "" }: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollTop(window.scrollY);
    };

    const handleResize = () => {
      setContainerHeight(window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    setContainerHeight(window.innerHeight);
    setScrollTop(window.scrollY);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const totalItemHeight = itemHeight + gap;

  const { startIndex, endIndex, totalHeight, offsetY } = useMemo(() => {
    const count = items.length;
    const totalHeight = count * totalItemHeight;
    
    const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0 };
    const viewportHeight = containerHeight;
    
    const offsetTop = -containerRect.top;
    const start = Math.floor(Math.max(0, offsetTop) / totalItemHeight);
    const visibleCount = Math.ceil(viewportHeight / totalItemHeight);
    
    const startIndex = Math.max(0, start - overscan);
    const endIndex = Math.min(count - 1, start + visibleCount + overscan);
    
    const offsetY = startIndex * totalItemHeight;

    return { startIndex, endIndex, totalHeight, offsetY };
  }, [items.length, itemHeight, gap, scrollTop, containerHeight, overscan, totalItemHeight]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => {
      return (
        <div key={startIndex + index} style={{ height: itemHeight, marginBottom: gap }}>
          {renderItem(item, startIndex + index)}
        </div>
      );
    });
  }, [items, startIndex, endIndex, renderItem, itemHeight, gap]);

  return (
    <div ref={containerRef} className={className} style={{ height: totalHeight, position: 'relative' }}>
      <div style={{ transform: `translateY(${offsetY}px)`, display: 'flex', flexDirection: 'column' }}>
        {visibleItems}
      </div>
    </div>
  );
}
