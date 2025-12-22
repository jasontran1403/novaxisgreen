import { useEffect, useState } from 'react';

function BannerCarousel({ images = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Set());

  // Preload images for faster carousel
  useEffect(() => {
    if (images.length === 0) return;

    // Preload all images
    images.forEach((imageSrc) => {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        setLoadedImages((prev) => new Set([...prev, imageSrc]));
      };
    });
  }, [images]);

  // Preload next image when slide changes
  useEffect(() => {
    if (images.length === 0) return;
    
    const nextIndex = (currentSlide + 1) % images.length;
    const nextImageSrc = images[nextIndex];
    
    if (!loadedImages.has(nextImageSrc)) {
      const img = new Image();
      img.src = nextImageSrc;
      img.onload = () => {
        setLoadedImages((prev) => new Set([...prev, nextImageSrc]));
      };
    }
  }, [currentSlide, images, loadedImages]);

  // Auto-play carousel
  useEffect(() => {
    if (images.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden md:rounded-none rounded-lg border border-emerald-500/50 dark:border-emerald-400/50 md:border-0 md:m-0 glow-border glow-border-hover">
      <div className="relative h-48 md:h-[calc(100vh-4rem)] md:min-h-[800px]">
        {/* Slides */}
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {loadedImages.has(image) || index === 0 ? (
              <img
                src={image}
                alt={`Nova Trading Banner ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
                decoding="async"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <div className="text-emerald-400">Loading...</div>
              </div>
            )}
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
          aria-label="Previous slide"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
          aria-label="Next slide"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-emerald-400 w-6'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default BannerCarousel;

