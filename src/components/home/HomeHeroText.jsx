import React from 'react';
import { useState, useRef, useEffect } from 'react';

const HomeHeroText = () => {
  const [isInlineVideoPlaying, setIsInlineVideoPlaying] = useState(false);
  const inlineVideoRef = useRef(null);

  useEffect(() => {
    const video = inlineVideoRef.current;
    if (!video) return;

    // OPTIMIZATION 9: Inline video immediate setup
    const setupInlineVideo = () => {
      video.muted = true;
      video.playsInline = true;
      video.volume = 0;
      video.style.transform = 'translate3d(0,0,0)';
      video.style.backfaceVisibility = 'hidden';
    };

    const handleInlinePlay = () => setIsInlineVideoPlaying(true);
    const handleInlinePause = () => setIsInlineVideoPlaying(false);

    video.addEventListener('play', handleInlinePlay);
    video.addEventListener('pause', handleInlinePause);
    video.addEventListener('loadeddata', setupInlineVideo);

    setupInlineVideo();

    // OPTIMIZATION 10: Immediate play attempt for inline video
    setTimeout(() => {
      if (video.paused) {
        video.play().catch(e => console.warn('Inline video play failed:', e));
      }
    }, 100);

    return () => {
      video.removeEventListener('play', handleInlinePlay);
      video.removeEventListener('pause', handleInlinePause);
      video.removeEventListener('loadeddata', setupInlineVideo);
    };
  }, []);

  return (
    <div className="font-[font1] text-center relative depth-4 px-4 flex-1 flex items-center justify-center">
      <div className="w-full">
        <div className="text-[12vw] sm:text-[9vw] lg:text-[9.5vw] justify-center flex items-center uppercase leading-[10vw] sm:leading-[7.5vw] lg:leading-[8vw] text-layer-3 mb-2 sm:mb-0">
          You do the work
        </div>
        <div className="text-[12vw] sm:text-[9vw] lg:text-[9.5vw] justify-center flex items-center uppercase leading-[10vw] sm:leading-[7.5vw] lg:leading-[8vw] text-layer-3 flex-wrap justify-center mb-2 sm:mb-0">
          <span>we</span>
          <div className={`h-[8vw] w-[20vw] sm:h-[7vw] sm:w-[16vw] rounded-full overflow-hidden mx-2 sm:mx-2 glass flex-shrink-0 my-1 sm:my-0 inline-video-container ${isInlineVideoPlaying ? 'video-playing' : ''}`}>
            <video
              ref={inlineVideoRef}
              className="h-full w-full object-cover hero-inline-video"
              style={{
                objectFit: 'cover',
                objectPosition: 'center center',
                // OPTIMIZATION 11: Enhanced iOS Safari optimizations
                WebkitTransform: 'translate3d(0,0,0)',
                transform: 'translate3d(0,0,0)',
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                opacity: 1,
                visibility: 'visible',
                willChange: 'transform'
              }}
              // OPTIMIZATION 12: Optimized attributes for immediate playback
              muted
              defaultMuted
              autoPlay
              playsInline
              loop
              preload="auto"
              webkit-playsinline
              x-webkit-airplay="allow"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              onLoadedData={(e) => {
                // OPTIMIZATION 13: Enhanced video handling
                const video = e.target;
                video.style.opacity = '1';
                video.style.visibility = 'visible';
                video.muted = true;
                video.volume = 0;
                video.playsInline = true;
                video.style.transform = 'translate3d(0,0,0)';
                
                const playPromise = video.play();
                if (playPromise !== undefined) {
                  playPromise.catch(error => {
                    console.warn('Inline video autoplay failed:', error.name);
                    setTimeout(() => {
                      video.style.opacity = '1';
                      video.load();
                      video.play().catch(e => console.warn('Inline video reload failed:', e));
                    }, 50);
                  });
                }
              }}
              onError={(e) => {
                console.warn('Inline video error:', e.target.error);
                e.target.style.opacity = '1';
              }}
            >
              {/* Multiple sources for cross-browser compatibility */}
              <source src="/video.mp4" type="video/mp4" />
            </video>
          </div>
          <span>do the</span>
        </div>
        <div className="text-[12vw] sm:text-[9vw] lg:text-[9.5vw] justify-center flex items-center uppercase leading-[10vw] sm:leading-[7.5vw] lg:leading-[8vw] text-layer-3">
          stitches
        </div>
      </div>
    </div>
  );
};

export default HomeHeroText;