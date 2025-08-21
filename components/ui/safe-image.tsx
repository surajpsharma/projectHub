"use client";
import Image from "next/image";
import React, { useState } from "react";

interface SafeImageProps {
  src: string | null | undefined;
  alt: string;
  width: number | string;
  height: number | string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
  unoptimized?: boolean;
  onError?: () => void;
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = 'https://placehold.co/400x200/e2e8f0/64748b?text=No+Image',
  priority = false,
  unoptimized = false,
  onError,
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Function to determine if we should use proxy for external images
  const getImageSrc = (originalSrc: string | null | undefined) => {
    if (imageError || !originalSrc) return fallbackSrc;

    // If it's a local image (starts with / or relative path), use as is
    if (originalSrc.startsWith('/') || originalSrc.startsWith('./') || originalSrc.startsWith('../')) {
      return originalSrc;
    }

    // If it's an external image and not from trusted domains, use proxy
    const trustedDomains = ['placehold.co', 'placeholder.com', 'via.placeholder.com'];
    try {
      const url = new URL(originalSrc);
      const isTrusted = trustedDomains.some(domain => url.hostname.includes(domain));

      if (isTrusted) {
        return originalSrc;
      }

      // Use proxy for external images
      return `/api/image-proxy?url=${encodeURIComponent(originalSrc)}`;
    } catch {
      // If URL parsing fails, treat as local
      return originalSrc;
    }
  };

  const imageSrc = getImageSrc(src);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={typeof width === 'string' ? parseInt(width) : width}
        height={typeof height === 'string' ? parseInt(height) : height}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority={priority}
        unoptimized={unoptimized || imageError || !src}
      />
    </div>
  );
}