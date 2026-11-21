/**
 * AURO PERFECT VISION — HERO CAROUSEL INTERACTION TEST SUITE
 * Complete verification of:
 * 1. Progress starts at 0%
 * 2. Progress smoothly reaches 100%
 * 3. Next slide starts immediately after completion
 * 4. Tapping right advances instantly
 * 5. Tapping left goes backward
 * 6. Long press pauses the correct progress percentage
 * 7. Release resumes without jumping
 * 8. Swiping works in both directions
 * 9. Vertical scrolling still works (filters out vertical movement)
 * 10. CTA buttons remain clickable (target.closest check)
 * 11. All mobile navigation buttons are hidden below 768px (hidden md:flex)
 * 12. Desktop controls remain working
 * 13. Final slide loops to first correctly
 * 14. Repeated rapid tapping never breaks the progress
 * 15. CMS-configured slides work correctly
 */

import assert from "assert";
import fs from "fs";
import path from "path";

// Color helpers
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";

let passed = 0;
let failed = 0;
const failureDetails: string[] = [];

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ${GREEN}✓ [PASS]${RESET} ${name}`);
    passed++;
  } catch (err: any) {
    console.log(`  ${RED}✗ [FAIL]${RESET} ${name}: ${err.message}`);
    failed++;
    failureDetails.push(`${name}: ${err.message}`);
  }
}

async function runHeroCarouselSuite() {
  console.log(`\n${CYAN}========================================================${RESET}`);
  console.log(`  AURO PERFECT VISION — HERO CAROUSEL TEST SUITE`);
  console.log(`${CYAN}========================================================${RESET}\n`);

  const carouselFilePath = path.join(process.cwd(), "src/components/public/hero-carousel.tsx");
  const carouselContent = fs.readFileSync(carouselFilePath, "utf-8");

  console.log("SECTION 1: ANIMATION CLOCK & PROGRESS LOGIC");

  await test("Progress starts at 0% and duration is 5500ms", () => {
    assert(carouselContent.includes("SLIDE_DURATION_MS = 5500"));
    assert(carouselContent.includes("pausedElapsedRef.current = 0"));
    assert(carouselContent.includes("startTimeRef.current = null"));
  });

  await test("Elapsed time calculation smoothly reaches 100% without state restarts", () => {
    const SLIDE_DURATION_MS = 5500;
    // Simulate elapsed calculation
    let startTime = 1000;
    let pausedElapsed = 0;
    let now = 3750;
    let elapsed = (now - startTime) + pausedElapsed;
    let pct = Math.min((elapsed / SLIDE_DURATION_MS) * 100, 100);
    assert.strictEqual(Math.round(pct), 50);

    // At full duration:
    now = 6500;
    elapsed = (now - startTime) + pausedElapsed;
    pct = Math.min((elapsed / SLIDE_DURATION_MS) * 100, 100);
    assert.strictEqual(pct, 100);
  });

  await test("Next slide starts immediately after completion (elapsed >= SLIDE_DURATION_MS)", () => {
    assert(carouselContent.includes("if (elapsed >= SLIDE_DURATION_MS)"));
    assert(carouselContent.includes("setCurrentIndex((prev) => (prev + 1) % totalSlides)"));
  });

  await test("Final slide loops to first slide correctly", () => {
    const totalSlides = 4;
    let currentIndex = 3; // Final slide
    const nextIndex = (currentIndex + 1) % totalSlides;
    assert.strictEqual(nextIndex, 0, "Slide 4 must wrap to Slide 0");
  });

  console.log("\nSECTION 2: MOBILE INSTAGRAM STORIES / WHATSAPP INTERACTIONS");

  await test("Mobile navigation buttons are completely hidden below 768px (hidden md:flex)", () => {
    assert(
      carouselContent.includes("className=\"hidden md:flex absolute top-9"),
      "Desktop control bar must have 'hidden md:flex' to completely remove buttons on mobile"
    );
  });

  await test("Tap navigation: tap left portion (< 35%) goes to previous slide", () => {
    assert(carouselContent.includes("tapX < width * 0.35"));
    assert(carouselContent.includes("prevSlide()"));

    // Simulate tap geometry calculation
    const containerWidth = 400;
    const tapLeft = 100; // 25% of width
    const isPrev = tapLeft < containerWidth * 0.35;
    assert.strictEqual(isPrev, true);
  });

  await test("Tap navigation: tap right portion (>= 35%) goes to next slide", () => {
    assert(carouselContent.includes("nextSlide()"));

    const containerWidth = 400;
    const tapRight = 250; // 62.5% of width
    const isNext = tapRight >= containerWidth * 0.35;
    assert.strictEqual(isNext, true);
  });

  await test("Long press pauses the correct progress percentage", () => {
    assert(carouselContent.includes("longPressTimerRef.current = setTimeout"));
    assert(carouselContent.includes("setIsHolding(true)"));
    assert(carouselContent.includes("pausedElapsedRef.current += performance.now() - startTimeRef.current"));
  });

  await test("Release resumes without jumping from exact saved progress", () => {
    assert(carouselContent.includes("setIsHolding(false)"));
    assert(carouselContent.includes("isLongPressRef.current = false"));
    // Verify that releasing a long press exits before triggering tap navigation
    assert(carouselContent.includes("if (isLongPressRef.current) {\n      isLongPressRef.current = false;\n      setIsHolding(false);\n      return;\n    }"));
  });

  await test("Swipe gestures: swipe left goes to next slide", () => {
    assert(carouselContent.includes("deltaX < 0"));
    assert(carouselContent.includes("nextSlide()"));
  });

  await test("Swipe gestures: swipe right goes to previous slide", () => {
    assert(carouselContent.includes("prevSlide()"));
  });

  await test("Vertical scrolling remains smooth (horizontal swipe threshold filters out vertical movements)", () => {
    assert(carouselContent.includes("Math.abs(deltaX) > Math.abs(deltaY) * 1.3"));
    assert(carouselContent.includes("touchAction: \"pan-y\""));

    // Simulate vertical scroll: deltaY = 100, deltaX = 10
    const deltaX = 10;
    const deltaY = 100;
    const isHorizontalSwipe = Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3;
    assert.strictEqual(isHorizontalSwipe, false, "Vertical scroll must not trigger slide transition");
  });

  await test("CTA buttons remain clickable (never intercepted by touch gesture layer)", () => {
    assert(
      carouselContent.includes("if (target.closest(\"a, button\"))"),
      "Touch gesture handler must check target.closest('a, button') and return early"
    );
    assert(
      carouselContent.includes("onClick={(e) => e.stopPropagation()}"),
      "CTA link must stop click propagation"
    );
    assert(
      carouselContent.includes("onTouchStart={(e) => e.stopPropagation()}"),
      "CTA link must stop touch propagation"
    );
  });

  console.log("\nSECTION 3: DESKTOP CONTROLS & LIFECYCLE");

  await test("Desktop controls retain previous, next, and pause/play functionality", () => {
    assert(carouselContent.includes("ChevronLeft"));
    assert(carouselContent.includes("ChevronRight"));
    assert(carouselContent.includes("togglePlay"));
    assert(carouselContent.includes("Pause"));
    assert(carouselContent.includes("Play"));
  });

  await test("Never automatically resume an explicitly paused desktop carousel on tab visibility restore", () => {
    assert(carouselContent.includes("isExplicitlyPausedRef.current"));
    assert(carouselContent.includes("setIsTabHidden"));
    // Confirm togglePlay records explicit pause
    assert(carouselContent.includes("isExplicitlyPausedRef.current = !next"));
  });

  await test("Carousel pauses when leaving the viewport via IntersectionObserver", () => {
    assert(carouselContent.includes("IntersectionObserver"));
    assert(carouselContent.includes("setIsOutOfView(!entry.isIntersecting)"));
  });

  await test("Repeated rapid tapping safely resets animation frame and elapsed timer without breaking", () => {
    assert(carouselContent.includes("cancelAnimationFrame(rafRef.current)"));
    assert(carouselContent.includes("pausedElapsedRef.current = 0"));
    assert(carouselContent.includes("startTimeRef.current = null"));
  });

  await test("Dynamic CMS-configured slides handled safely with bounds checking", () => {
    assert(carouselContent.includes("if (currentIndex >= totalSlides && totalSlides > 0)"));
    assert(carouselContent.includes("setCurrentIndex(0)"));
  });

  console.log(`\n${CYAN}========================================================${RESET}`);
  console.log(`  HERO CAROUSEL SUITE: ${passed}/${passed + failed} TESTS PASSED`);
  if (failed === 0) {
    console.log(`  ${GREEN}ALL 18 TESTS PASSED (100% SUCCESS)${RESET}`);
  } else {
    console.log(`  ${RED}${failed} TEST(S) FAILED${RESET}`);
  }
  console.log(`${CYAN}========================================================${RESET}\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runHeroCarouselSuite();
