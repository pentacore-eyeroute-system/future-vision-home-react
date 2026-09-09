import { useState, useEffect } from 'react'

/**
 * ImageWithSkeleton component displays a pulsing skeleton shimmer screen
 * until the image successfully finishes loading, then smoothly fades it in.
 * Does NOT force hardcoded background or aspect ratio after image is loaded.
 */
export function ImageWithSkeleton({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  skeletonClassName = '',
  loading = 'lazy',
  width,
  height,
  onError,
  onLoad,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
  }, [src])

  const handleLoad = (e) => {
    setIsLoaded(true)
    if (onLoad) onLoad(e)
  }

  const handleError = (e) => {
    setHasError(true)
    setIsLoaded(true)
    if (onError) onError(e)
  }

  return (
    <div
      className={`img-skeleton-wrapper ${wrapperClassName}`}
      style={width && height ? { width, height } : undefined}
    >
      {!isLoaded && !hasError && (
        <div className={`img-skeleton-pulse ${skeletonClassName}`} aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${
          isLoaded ? 'img-skeleton-loaded' : 'img-skeleton-loading'
        }`}
        {...props}
      />
    </div>
  )
}

export default ImageWithSkeleton
