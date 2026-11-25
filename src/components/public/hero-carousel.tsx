"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play, ArrowRight, Sparkles } from "lucide-react";
import { HeroCarouselSlide } from "@/lib/types";

const FALLBACK_SLIDES: HeroCarouselSlide[] = [
  {
    id: "slide-vision-therapy",
    title: "Vision Therapy",
    badge: "Clinical Therapy",
    subtitle: "Customized neuro-visual retraining for amblyopia, convergence, and binocular coordination.",
    imageUrl: "/images/hero-carousel/vision-therapy.webp",
    linkUrl: "/therapies",
    linkText: "Explore Vision Therapy",
    order: 1,
    active: true,
  },
  {
    id: "slide-sports-vision",
    title: "Sports Vision Training",
    badge: "Athletic Performance",
    subtitle: "Dynamic visual tracking, peripheral reaction speed, and hand-eye coordination for peak athletic response.",
    imageUrl: "/images/hero-carousel/sports-vision.webp",
    linkUrl: "/therapies",
    linkText: "Explore Sports Vision",
    order: 2,
    active: true,
  },
  {
    id: "slide-eye-yoga",
    title: "Conscious Eye Yoga",
    badge: "Holistic Wellness",
    subtitle: "Classical Bates ocular relaxation, mindful palming, and digital screen recovery for eye strain.",
    imageUrl: "/images/hero-carousel/eye-yoga.webp",
    linkUrl: "/therapies",
    linkText: "Explore Eye Yoga",
    order: 3,
    active: true,
  },
  {
    id: "slide-visual-skills",
    title: "Visual Skill Enhancement",
    badge: "Foundational Vision",
    subtitle: "Pediatric & adult therapies to strengthen stereopsis, depth perception, and Brock string fixation.",
    imageUrl: "/images/hero-carousel/visual-skills.webp",
    linkUrl: "/therapies",
    linkText: "Explore Visual Skills",
    order: 4,
    active: true,
  },
];

const SLIDE_DURATION_MS = 5500;

interface HeroCarouselProps {
  slides?: HeroCarouselSlide[];
  className?: string;
}

export function HeroCarousel({ slides, className = "" }: HeroCarouselProps) {
  const activeSlides = (slides && slides.length > 0 ? slides : FALLBACK_SLIDES)
    .filter((s) => s.active !== false)
    .sort((a, b) => a.order - b.order);

  const totalSlides = activeSlides.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isOutOfView, setIsOutOfView] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Single reliable animation clock tracking refs
  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const isExplicitlyPausedRef = useRef<boolean>(false);
  const prefersReducedMotionRef = useRef<boolean>(false);

  // Touch & gesture tracking refs
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);
  const isLongPressRef = useRef<boolean>(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTouchEndRef = useRef<number>(0);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      prefersReducedMotionRef.current = mediaQuery.matches;
      if (mediaQuery.matches) {
        setIsPlaying(false);
      }
      const handler = (e: MediaQueryListEvent) => {
        prefersReducedMotionRef.current = e.matches;
        if (e.matches) {
          setIsPlaying(false);
        }
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, []);

  // Synchronize all segmented progress bars deterministically whenever slide changes
  useEffect(() => {
    barRefs.current.forEach((bar, idx) => {
      if (!bar) return;
      if (idx < currentIndex) {
        bar.style.width = "100%";
        bar.style.opacity = "1";
      } else if (idx === currentIndex) {
        if (pausedElapsedRef.current === 0) {
          bar.style.width = "0%";
        }
        bar.style.opacity = "1";
      } else {
        bar.style.width = "0%";
        bar.style.opacity = "0";
      }
    });
  }, [currentIndex, totalSlides]);

  // Handle dynamic slide changes from CMS gracefully
  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      pausedElapsedRef.current = 0;
      startTimeRef.current = null;
      setCurrentIndex(0);
    }
  }, [totalSlides, currentIndex]);

  // Pause carousel when scrolled out of viewport
  useEffect(() => {
    if (!carouselRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsOutOfView(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(carouselRef.current);
    return () => observer.disconnect();
  }, []);

  // Browser tab visibility handling
  // Never automatically resume an explicitly paused carousel on visibility restore
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabHidden(true);
      } else {
        setIsTabHidden(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Navigation handlers
  const goToSlide = useCallback(
    (index: number) => {
      if (totalSlides <= 1) return;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pausedElapsedRef.current = 0;
      startTimeRef.current = null;
      const targetIndex = (index + totalSlides) % totalSlides;
      barRefs.current.forEach((bar, idx) => {
        if (!bar) return;
        if (idx < targetIndex) {
          bar.style.width = "100%";
          bar.style.opacity = "1";
        } else if (idx === targetIndex) {
          bar.style.width = "0%";
          bar.style.opacity = "1";
        } else {
          bar.style.width = "0%";
          bar.style.opacity = "0";
        }
      });
      setCurrentIndex(targetIndex);
    },
    [totalSlides]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      isExplicitlyPausedRef.current = !next;
      return next;
    });
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (totalSlides <= 1) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  // Single reliable animation clock: requestAnimationFrame with elapsed-time tracking
  const isPaused =
    !isPlaying ||
    isHovered ||
    isFocused ||
    isHolding ||
    isTabHidden ||
    isOutOfView ||
    totalSlides <= 1;

  useEffect(() => {
    if (totalSlides <= 1) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    if (isPaused) {
      // Pause: Save elapsed time up to this exact frame and cancel RAF
      if (startTimeRef.current !== null) {
        pausedElapsedRef.current += performance.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    // Resume/Start: Anchor startTime to current time
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = now;
      }
      const elapsed = now - startTimeRef.current + pausedElapsedRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION_MS) * 100, 100);

      // Performant direct DOM update of the active progress bar (no React re-renders per frame)
      const currentBar = barRefs.current[currentIndex];
      if (currentBar) {
        currentBar.style.width = `${pct}%`;
        currentBar.style.opacity = "1";
      }

      if (elapsed >= SLIDE_DURATION_MS) {
        // Slide duration elapsed: reset progress and advance immediately
        pausedElapsedRef.current = 0;
        startTimeRef.current = null;
        if (currentBar) {
          currentBar.style.width = "100%";
        }
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [currentIndex, isPaused, totalSlides]);

  // Touch gesture handling: Instagram Stories / WhatsApp Status interactions
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // CRITICAL: Never intercept interactions on buttons, links, or progress tabs
    if (target.closest("a, button")) {
      return;
    }

    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
    isSwipingRef.current = false;
    isLongPressRef.current = false;

    // Start long-press detection (Stories press-and-hold to pause)
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsHolding(true);
    }, 220);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    // If movement exceeds slight jitter threshold, cancel long press
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    // Determine if user is performing horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 25) {
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    lastTouchEndRef.current = Date.now();

    // If user was in a press-and-hold state, resume playback and DO NOT trigger tap navigation
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      setIsHolding(false);
      return;
    }

    if (e.changedTouches.length !== 1) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    const touchDuration = Date.now() - touchStartTimeRef.current;

    // 1. Horizontal swipe gesture detection (swipe left = next, swipe right = prev)
    // Must be predominantly horizontal to keep normal vertical page scrolling smooth
    if (
      Math.abs(deltaX) > 40 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.3 &&
      touchDuration < 600
    ) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      return;
    }

    // 2. Tap navigation (minimal movement, quick release)
    // Avoid triggering if user was scrolling vertically
    if (Math.abs(deltaX) < 18 && Math.abs(deltaY) < 18 && touchDuration < 350) {
      const rect = carouselRef.current?.getBoundingClientRect();
      if (!rect) return;

      const tapX = touch.clientX - rect.left;
      const width = rect.width;

      // Tap left 35% -> Previous slide; Tap right 65% -> Next slide (Instagram Stories behavior)
      if (tapX < width * 0.35) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
  };

  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      setIsHolding(false);
    }
  };

  // Click on non-interactive slide area (desktop mouse emulation or direct click)
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If click happened immediately following touch, ignore to prevent duplicate triggering
    if (Date.now() - lastTouchEndRef.current < 450) return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;

    const rect = carouselRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = e.clientX - rect.left;
    if (clickX < rect.width * 0.35) {
      prevSlide();
    } else {
      nextSlide();
    }
  };

  // Mouse hold-to-pause for desktop emulation
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Date.now() - lastTouchEndRef.current < 450) return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button")) return;

    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsHolding(true);
    }, 220);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      setIsHolding(false);
    }
  };

  if (totalSlides === 0) return null;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  return (
    <section
      ref={carouselRef}
      className={`relative mx-auto max-w-md lg:max-w-none ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Auro Perfect Vision Featured Therapies Carousel"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        if (isHolding) {
          setIsHolding(false);
          isLongPressRef.current = false;
        }
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
    >
      {/* 4:5 Card Container with Stories gestures and touch-action: pan-y for smooth vertical scrolling */}
      <div
        className="relative rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-brand-charcoal aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] select-none cursor-pointer"
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleContainerClick}
      >
        {/* Slides Background Image Layer (Smooth Crossfade) */}
        <div
          className="relative w-full h-full"
          aria-live={isPlaying && !isHovered && !isFocused && !isHolding ? "off" : "polite"}
        >
          {activeSlides.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${idx + 1} of ${totalSlides}: ${slide.title}`}
                aria-hidden={!isActive}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* Background Image */}
                <img
                  src={slide.imageUrl}
                  alt={slide.title}
                  className={`w-full h-full object-cover transition-transform duration-1000 ease-out ${
                    isActive ? "scale-100" : "scale-105"
                  }`}
                  loading={idx === 0 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* Persistent Multi-Stage Contrast Scrims (Prevents brightness flicker during image crossfades) */}
        <div className="absolute inset-0 z-[15] bg-gradient-to-t from-brand-charcoal/95 via-brand-charcoal/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 z-[15] bg-gradient-to-b from-brand-charcoal/40 via-transparent to-transparent pointer-events-none" />

        {/* Floating Top Badge (Rendered strictly for active slide — prevents overlapping badges) */}
        {currentSlide && (
          <div
            key={`badge-${currentSlide.id}`}
            className="absolute top-9 sm:top-10 left-5 z-20 pointer-events-none"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-sora font-bold text-brand-purple border border-white/60 shadow-card">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange shrink-0" />
              <span>{currentSlide.badge}</span>
            </span>
          </div>
        )}

        {/* Bottom Overlay Content (Rendered strictly for active slide — prevents overlapping titles & text bleed) */}
        {currentSlide && (
          <div
            key={`content-${currentSlide.id}`}
            className="absolute bottom-0 left-0 right-0 p-6 sm:p-7 z-20 flex flex-col justify-end pointer-events-none"
          >
            <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm mb-2">
              {currentSlide.title}
            </h3>

            <p className="font-inter text-xs sm:text-sm text-white/90 line-clamp-2 leading-relaxed max-w-sm mb-4">
              {currentSlide.subtitle}
            </p>

            <div className="flex items-center justify-between gap-3 pt-1">
              <Link
                href={currentSlide.linkUrl || "/therapies"}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-xs sm:text-sm font-bold tracking-wide shadow-orange-glow transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{currentSlide.linkText || "Explore Therapy"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Desktop Controls (Previous, Pause/Play, Next) — Completely hidden on mobile below 768px (md) */}
        {totalSlides > 1 && (
          <div className="hidden md:flex absolute top-9 sm:top-10 right-5 z-30 items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/20 text-white shadow-sm pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous therapy slide"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={isPlaying ? "Pause automatic slide rotation" : "Start automatic slide rotation"}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next therapy slide"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Instagram Stories / WhatsApp Status Segmented Progress Bar (Top Edge) */}
        {totalSlides > 1 && (
          <div
            className="absolute top-3 left-4 right-4 sm:top-4 sm:left-5 sm:right-5 z-30 flex items-center gap-1.5 pointer-events-auto"
            role="tablist"
            aria-label="Slide progress indicators"
          >
            {activeSlides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              const isCompleted = idx < currentIndex;

              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
                  className="group relative flex-1 h-1 sm:h-1.5 rounded-full bg-white/30 backdrop-blur-xs overflow-hidden focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer"
                >
                  <div
                    ref={(el) => {
                      barRefs.current[idx] = el;
                    }}
                    className="h-full bg-brand-orange rounded-full will-change-[width]"
                    style={{
                      width: isCompleted ? "100%" : "0%",
                      opacity: isCompleted || isActive ? 1 : 0,
                    }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
