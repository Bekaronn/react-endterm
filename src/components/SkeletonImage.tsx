import React from 'react';
import { useImageLoaded } from '../hooks/useImageLoaded';
import { cn } from '@/lib/utils'; 

interface SkeletonImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: React.ReactNode; 
}

export const SkeletonImage = ({ src, alt, className, fallback }: SkeletonImageProps) => {
  const { isLoaded, hasError } = useImageLoaded(src);

  if (hasError || !src) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-muted", className)}>
      {/* 1. Скелет (показываем, пока не загрузилось) */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}

      {/* 2. Картинка (плавное появление) */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
};