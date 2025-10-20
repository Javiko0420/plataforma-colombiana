'use client';

import { useEffect, useState } from 'react';

/**
 * Date Display Component
 * Client component to safely display dates without hydration mismatch
 */

interface DateDisplayProps {
  date: Date | string;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
}

export function DateDisplay({ 
  date, 
  locale = 'es-CO',
  options = {
    hour: '2-digit',
    minute: '2-digit',
  }
}: DateDisplayProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Show placeholder during SSR and initial render
  if (!mounted) {
    return <span className="inline-block w-16">--:--</span>;
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return (
    <span suppressHydrationWarning>
      {dateObj.toLocaleString(locale, options)}
    </span>
  );
}

