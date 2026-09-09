import { useState, useEffect } from 'react'

/**
 * ImageWithSkeleton component displays a pulsing skeleton shimmer screen
 * until the image successfully finishes loading, then smoothly fades it in.
 */
export function ImageWithSkeleton({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  skeletonClassName = '',
  loading = 'lazy',
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
    <div className={`img-skeleton-wrapper ${wrapperClassName}`}>
      {!isLoaded && !hasError && (
        <div className={`img-skeleton-pulse ${skeletonClassName}`} aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoaded ? 'img-skeleton-loaded' : 'img-skeleton-loading'}`}
        {...props}
      />
    </div>
  )
}

export default ImageWithSkeleton
