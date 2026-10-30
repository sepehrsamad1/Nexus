'use client';

import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  fallbackLabel?: string;
  priority?: boolean;
}

export function MediaImage({ src, alt, className, fallbackClassName, fallbackLabel = 'Image unavailable', priority = false }: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackLabel}
        className={cn('flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500', fallbackClassName)}
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <ImageOff className="h-7 w-7" aria-hidden="true" />
          <span className="text-xs font-semibold">{fallbackLabel}</span>
        </div>
      </div>
    );
  }

  return (
    // These catalog/media URLs are intentionally external and come from curated public sources.
    // next/image would require maintaining a growing remote-host allowlist, so this bounded wrapper
    // keeps graceful error handling while preserving the existing responsive object-fit behavior.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('block h-full w-full object-cover', className)}
    />
  );
}
