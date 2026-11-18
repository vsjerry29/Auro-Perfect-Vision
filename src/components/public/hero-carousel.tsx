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
  const [progress, setProgress] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);
  const progressStartTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setIsPlaying(false);
      }
    }
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      if (totalSlides <= 1) return;
      setCurrentIndex((index + totalSlides) % totalSlides);
      setProgress(0);
      progressStartTimeRef.current = Date.now();
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
    setIsPlaying((prev) => !prev);
    progressStartTimeRef.current = Date.now() - (progress / 100) * SLIDE_DURATION_MS;
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

  // Pause on tab switch (visibility change)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        progressStartTimeRef.current = Date.now() - (progress / 100) * SLIDE_DURATION_MS;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [progress]);

  // Coordinated slide auto-advance and smooth Instagram-style progress fill
  useEffect(() => {
    if (totalSlides <= 1) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const isPaused = !isPlaying || isHovered || isFocused;

    if (isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Set start time anchored to current progress so resume is continuous
    progressStartTimeRef.current = Date.now() - (progress / 100) * SLIDE_DURATION_MS;

    const updateProgress = () => {
      const elapsed = Date.now() - progressStartTimeRef.current;
      const currentProgress = Math.min((elapsed / SLIDE_DURATION_MS) * 100, 100);

      setProgress(currentProgress);

      if (elapsed >= SLIDE_DURATION_MS) {
        setProgress(0);
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
        progressStartTimeRef.current = Date.now();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentIndex, isPlaying, isHovered, isFocused, totalSlides, progress]);

  if (totalSlides === 0) return null;

  return (
    <section
      ref={carouselRef}
      className={`relative mx-auto max-w-md lg:max-w-none ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Auro Perfect Vision Featured Therapies Carousel"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
    >
      {/* 4:5 Card Container */}
      <div className="relative rounded-3xl overflow-hidden shadow-elevated border-4 border-white bg-brand-charcoal aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] select-none">
        {/* Slides Layer */}
        <div
          className="relative w-full h-full"
          aria-live={isPlaying && !isHovered && !isFocused ? "off" : "polite"}
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
                />

                {/* Multi-stage contrast overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/95 via-brand-charcoal/40 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Top Badge (positioned below Instagram progress bars) */}
                <div className="absolute top-9 sm:top-10 left-5 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-xs font-sora font-bold text-brand-purple border border-white/60 shadow-card">
                    <Sparkles className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                    <span>{slide.badge}</span>
                  </span>
                </div>

                {/* Bottom Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7 z-20 flex flex-col justify-end">
                  <h3 className="font-sora text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm mb-2">
                    {slide.title}
                  </h3>

                  <p className="font-inter text-xs sm:text-sm text-white/90 line-clamp-2 leading-relaxed max-w-sm mb-4">
                    {slide.subtitle}
                  </p>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <Link
                      href={slide.linkUrl || "/therapies"}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white font-sora text-xs sm:text-sm font-bold tracking-wide shadow-orange-glow transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                      <span>{slide.linkText || "Explore Therapy"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Top-Right Control Bar (Pause/Play & Arrows) — Hidden if only 1 slide */}
        {totalSlides > 1 && (
          <div className="absolute top-9 sm:top-10 right-5 z-30 flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-full border border-white/20 text-white shadow-sm">
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous therapy slide"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause automatic slide rotation" : "Start automatic slide rotation"}
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next therapy slide"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Instagram Stories-Style Segmented Progress Bar (Top Edge) — Hidden if only 1 slide */}
        {totalSlides > 1 && (
          <div
            className="absolute top-3 left-4 right-4 sm:top-4 sm:left-5 sm:right-5 z-30 flex items-center gap-1.5"
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
                  onClick={() => goToSlide(idx)}
                  aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
                  className="group relative flex-1 h-1 sm:h-1.5 rounded-full bg-white/30 backdrop-blur-xs overflow-hidden transition-all focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer"
                >
                  <div
                    className={`h-full bg-brand-orange rounded-full ${
                      isActive
                        ? "opacity-100"
                        : isCompleted
                        ? "w-full opacity-100"
                        : "w-0 opacity-0"
                    }`}
                    style={{
                      width: isActive ? `${progress}%` : isCompleted ? "100%" : "0%",
                      transition: isActive ? "width 50ms linear" : "none",
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
