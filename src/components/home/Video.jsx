import React, { useRef, useEffect, useState } from 'react';

const Video = () => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Detect mobile devices for optimized video serving
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || 
                           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced video load and play handling
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // OPTIMIZATION 1: Immediate video setup for faster playback
    const setupVideoForImmediatePlay = () => {
      video.muted = true; // CRITICAL: Must be set before autoplay
      video.playsInline = true;
      video.setAttribute('webkit-playsinline', 'true');
      video.setAttribute('x-webkit-airplay', 'allow');
      video.defaultMuted = true;
      video.volume = 0;
      // OPTIMIZATION 2: Hardware acceleration for smooth playback
      video.style.transform = 'translate3d(0,0,0)';
      video.style.webkitTransform = 'translate3d(0,0,0)';
      video.style.backfaceVisibility = 'hidden';
      video.style.webkitBackfaceVisibility = 'hidden';
    };

    // Handle video load events
    const handleLoadedData = () => {
      setupVideoForImmediatePlay();
      setIsLoaded(true);
      
      // OPTIMIZATION 3: Multiple immediate play attempts
      attemptImmediatePlay();
    };

    // OPTIMIZATION 4: Aggressive immediate playback strategy
    const attemptImmediatePlay = () => {
      const playStrategies = [
        () => directPlay(),
        () => setTimeout(() => directPlay(), 50),
        () => setTimeout(() => directPlay(), 100),
        () => setTimeout(() => directPlay(), 200)
      ];
      
      playStrategies.forEach(strategy => strategy());
    };

    const directPlay = () => {
      if (video.paused) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video autoplay successful');
              setIsPlaying(true);
            })
            .catch(error => {
              console.warn('Video autoplay failed:', error);
              handleAutoplayFailure();
            });
        }
      }
    };

    // Handle autoplay policy restrictions
    const handleAutoplayFailure = () => {
      const playOnInteraction = () => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(error => {
              console.warn('Manual video play failed:', error);
            });
        }
        
        // Remove event listeners after successful play
        document.removeEventListener('touchstart', playOnInteraction);
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
      };

      // Add multiple interaction listeners for iOS
      document.addEventListener('touchstart', playOnInteraction, { passive: true, once: true });
      document.addEventListener('click', playOnInteraction, { passive: true, once: true });
      document.addEventListener('scroll', playOnInteraction, { passive: true, once: true });
    };

    // Handle video errors
    const handleError = (error) => {
      console.error('Video loading error:', error);
      setHasError(true);
    };

    // Handle video metadata load
    const handleLoadedMetadata = () => {
      setupVideoForImmediatePlay();
      // Ensure proper aspect ratio is maintained
      if (video.videoWidth && video.videoHeight) {
        const aspectRatio = video.videoWidth / video.videoHeight;
        video.style.aspectRatio = aspectRatio.toString();
      }
      // OPTIMIZATION 5: Immediate play attempt on metadata load
      setTimeout(() => attemptImmediatePlay(), 10);
    };

    // OPTIMIZATION 6: Track playing state for glow effects
    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    // Add event listeners
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    // Initial setup
    setupVideoForImmediatePlay();
    
    // OPTIMIZATION 7: Immediate setup attempt
    setTimeout(() => attemptImmediatePlay(), 0);

    // Cleanup
    return () => {
      if (video) {
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('error', handleError);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
      }
    };
  }, []);

  // Intersection Observer for performance optimization
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is visible, ensure it's playing
            if (video.paused && isLoaded) {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  console.warn('Intersection observer play failed:', error);
                });
              }
            }
          } else {
            // Video is not visible, pause to save resources
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isLoaded]);

  return (
    <div 
      ref={containerRef}
      className={`hero-video-container h-full w-full relative overflow-hidden ${isPlaying ? 'video-playing' : ''}`}
      style={{
        // Prevent layout shift during load
        minHeight: '100vh',
        backgroundColor: '#000'
      }}
    >
      {/* Fallback image - loads immediately to prevent layout shift */}
      <img
        className="hero-fallback-image absolute inset-0 w-full h-full object-cover z-0"
        src="/video-fallback.jpg"
        alt="Wedding videography background"
        loading="eager"
        style={{
          objectFit: 'cover',
          objectPosition: 'center center',
          width: '100%',
          height: '100%',
          opacity: isLoaded && !hasError ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />

      {/* Main background video with multiple sources for cross-browser compatibility */}
      <video
        ref={videoRef}
        className={`hero-background-video absolute inset-0 w-full h-full object-cover z-10 ${isPlaying ? 'playing' : ''}`}
        style={{
          objectFit: 'cover',
          objectPosition: 'center center',
          width: '100%',
          height: '100%',
          opacity: isLoaded && !hasError ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out',
          // OPTIMIZATION 8: Hardware acceleration
          transform: 'translate3d(0,0,0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform'
        }}
        // CRITICAL iOS Safari attributes - order matters!
        muted
        defaultMuted
        autoPlay
        playsInline
        loop
        preload="auto"
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onError={(e) => {
          console.warn('Video element error:', e);
          setHasError(true);
        }}
      >
        {/* WebM for modern browsers - best compression */}
        {!isMobile && (
          <source
            src="/video.webm"
            type="video/webm"
          />
        )}
        
        {/* Mobile-optimized MP4 for devices < 768px */}
        <source
          src="/video.mp4"
          type="video/mp4"
        />
        
        {/* Fallback message for browsers that don't support video */}
        Your browser does not support the video tag.
      </video>

      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className="hero-video-loading absolute inset-0 z-20 flex items-center justify-center bg-black/50">
          <div className="loading-spinner w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="hero-video-error absolute inset-0 z-20 flex items-center justify-center bg-black/70">
          <p className="text-white text-sm opacity-50">Video unavailable</p>
        </div>
      )}
    </div>
  );
};

export default Video;
