"use client";

import Image from "next/image";
import { forwardRef, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const TUNING = {
  desktop: {
    scrollDistance: 3400,
    scrub: 1.55,
    cameraScaleMid: 1.06,
    cameraScaleEnd: 1.14,
    cameraYPercentMid: -1.5,
    cameraYPercentEnd: -4,
    pointerShiftX: 7,
    pointerShiftY: 5,
    backgroundScale: 1.045,
    backgroundYPercent: -1.2,
    backTableScale: 1.06,
    backTableYPercent: -0.14,
    backTableXPercent: 0.14,
    middleTableScale: 1.12,
    middleTableYPercent: -0.24,
    middleTableXPercent: 0.42,
    foregroundScale: 1.24,
    foregroundYPercent: -0.7,
    foregroundXPercent: 1.65,
    textFadeStart: 0.16,
    textFadeEnd: 0.3,
    productsCtaIn: 0.33,
    productsCtaOut: 0.82,
    sceneRevealStart: 0.08,
    sceneRevealEnd: 0.58,
    washFadeStart: 0.22,
    washFadeEnd: 0.38,
    textCardOneIn: 0.34,
    textCardOneOut: 0.47,
    textCardTwoIn: 0.51,
    textCardTwoOut: 0.64,
    textCardThreeIn: 0.68,
    textCardThreeOut: 0.82,
    sceneExitStart: 0.84,
    sceneExitEnd: 1,
  },
  tablet: {
    scrollDistance: 3000,
    scrub: 1.45,
    cameraScaleMid: 1.05,
    cameraScaleEnd: 1.11,
    cameraYPercentMid: -1,
    cameraYPercentEnd: -3,
    pointerShiftX: 5,
    pointerShiftY: 4,
    backgroundScale: 1.03,
    backgroundYPercent: -0.8,
    backTableScale: 1.045,
    backTableYPercent: -0.13,
    backTableXPercent: 0.1,
    middleTableScale: 1.085,
    middleTableYPercent: -0.2,
    middleTableXPercent: 0.28,
    foregroundScale: 1.18,
    foregroundYPercent: -0.6,
    foregroundXPercent: 1.1,
    textFadeStart: 0.17,
    textFadeEnd: 0.31,
    productsCtaIn: 0.34,
    productsCtaOut: 0.82,
    sceneRevealStart: 0.08,
    sceneRevealEnd: 0.58,
    washFadeStart: 0.23,
    washFadeEnd: 0.39,
    textCardOneIn: 0.35,
    textCardOneOut: 0.48,
    textCardTwoIn: 0.52,
    textCardTwoOut: 0.65,
    textCardThreeIn: 0.69,
    textCardThreeOut: 0.82,
    sceneExitStart: 0.84,
    sceneExitEnd: 1,
  },
  mobile: {
    scrollDistance: 2600,
    scrub: 1.25,
    cameraScaleMid: 1.035,
    cameraScaleEnd: 1.08,
    cameraYPercentMid: -0.5,
    cameraYPercentEnd: -2,
    pointerShiftX: 0,
    pointerShiftY: 0,
    backgroundScale: 1.02,
    backgroundYPercent: -0.4,
    backTableScale: 1.03,
    backTableYPercent: -0.1,
    backTableXPercent: 0.05,
    middleTableScale: 1.055,
    middleTableYPercent: -0.14,
    middleTableXPercent: 0.12,
    foregroundScale: 1.12,
    foregroundYPercent: -0.45,
    foregroundXPercent: 0.55,
    textFadeStart: 0.15,
    textFadeEnd: 0.28,
    productsCtaIn: 0.31,
    productsCtaOut: 0.76,
    sceneRevealStart: 0.06,
    sceneRevealEnd: 0.5,
    washFadeStart: 0.2,
    washFadeEnd: 0.32,
    textCardOneIn: 0.32,
    textCardOneOut: 0.44,
    textCardTwoIn: 0.48,
    textCardTwoOut: 0.59,
    textCardThreeIn: 0.63,
    textCardThreeOut: 0.76,
    sceneExitStart: 0.82,
    sceneExitEnd: 1,
  },
} as const;

const FOCAL_POINT = {
  xPercent: 50,
  yPercent: 56,
} as const;

const HERO_END_FADE_COLOR = "#f4eadb";
const HERO_END_FADE_INTENSITY = 0.96;

const textCard = "Custom pieces designed around your event and culture";

export function ScrollWalkthrough() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const heroScrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const washRef = useRef<HTMLDivElement | null>(null);
  const endFadeRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const backTableRef = useRef<HTMLDivElement | null>(null);
  const middleTableRef = useRef<HTMLDivElement | null>(null);
  const foregroundRef = useRef<HTMLDivElement | null>(null);
  const textFrameRef = useRef<HTMLDivElement | null>(null);
  const scrollCueRef = useRef<HTMLParagraphElement | null>(null);
  const productsCtaRef = useRef<HTMLButtonElement | null>(null);
  const cardThreeRef = useRef<HTMLDivElement | null>(null);

  const handleProductsClick = () => {
    const nextSection =
      document.getElementById("experience") ??
      document.getElementById("main-content") ??
      document.getElementById("products") ??
      document.querySelector("main > section:last-of-type");

    const nextSectionY =
      nextSection instanceof HTMLElement
        ? nextSection.getBoundingClientRect().top + window.scrollY
        : Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const pinExitY = heroScrollTriggerRef.current?.end ?? 0;
    const targetY = Math.max(nextSectionY, pinExitY + 2);

    gsap.to(window, {
      duration: 2.2,
      ease: "power3.inOut",
      scrollTo: {
        y: targetY,
        autoKill: false,
      },
      overwrite: "auto",
    });
  };

  useEffect(() => {
    const section = sectionRef.current;
    const wash = washRef.current;
    const endFade = endFadeRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    const background = backgroundRef.current;
    const backTable = backTableRef.current;
    const middleTable = middleTableRef.current;
    const foreground = foregroundRef.current;
    const textFrame = textFrameRef.current;
    const scrollCue = scrollCueRef.current;
    const productsCta = productsCtaRef.current;
    const cards = [cardThreeRef.current].filter(Boolean) as HTMLDivElement[];

    if (
      !section ||
      !wash ||
      !endFade ||
      !camera ||
      !scene ||
      !background ||
      !backTable ||
      !middleTable ||
      !foreground ||
      !textFrame ||
      !scrollCue ||
      !productsCta
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      gsap.set(
        [
          wash,
          endFade,
          camera,
          scene,
          background,
          backTable,
          middleTable,
          foreground,
          textFrame,
          scrollCue,
          productsCta,
          ...cards,
        ],
        {
          clearProps: "all",
        },
      );
      return;
    }

    const mm = gsap.matchMedia();
    const context = gsap.context(() => {
      mm.add(
        {
          mobile: "(max-width: 767px)",
          tablet: "(min-width: 768px) and (max-width: 1023px)",
          desktop: "(min-width: 1024px)",
        },
        (matchContext) => {
          const conditions = matchContext.conditions as {
            mobile?: boolean;
            tablet?: boolean;
            desktop?: boolean;
          };
          const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;
          const config = conditions.mobile
            ? TUNING.mobile
            : conditions.tablet
              ? TUNING.tablet
              : TUNING.desktop;

          gsap.set(camera, {
            autoAlpha: 1,
            transformOrigin: `${FOCAL_POINT.xPercent}% ${FOCAL_POINT.yPercent}%`,
          });
          gsap.set(scene, {
            autoAlpha: 1,
            scale: 0.97,
            filter: "blur(12px) saturate(0.84) brightness(0.92)",
            transformOrigin: `${FOCAL_POINT.xPercent}% ${FOCAL_POINT.yPercent}%`,
          });
          gsap.set(textFrame, {
            autoAlpha: 1,
            y: 0,
          });
          gsap.set(scrollCue, {
            autoAlpha: 1,
            y: 0,
          });
          gsap.set(productsCta, {
            autoAlpha: 0,
            y: 18,
          });
          gsap.set(cards, { autoAlpha: 0, y: 28 });
          gsap.set(wash, { autoAlpha: 1 });
          gsap.set(endFade, { autoAlpha: 0 });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: `+=${config.scrollDistance}`,
              pin: true,
              scrub: config.scrub,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate(self) {
                pointerInfluence = Math.abs(self.getVelocity()) > 40 ? 0.35 : 1;
              },
            },
          });

          heroScrollTriggerRef.current = timeline.scrollTrigger ?? null;

          const pointerLayers = [
            { element: background, factorX: 0.2, factorY: 0.12 },
            { element: backTable, factorX: 0.62, factorY: 0.4 },
            { element: middleTable, factorX: 0.82, factorY: 0.56 },
            { element: foreground, factorX: 1, factorY: 0.78 },
          ];

          let removePointerHandlers: (() => void) | undefined;
          let pointerInfluence = 1;

          if (supportsFinePointer && config.pointerShiftX > 0) {
            const setters = pointerLayers.map(({ element }) => ({
              x: gsap.quickTo(element, "x", { duration: 0.9, ease: "power3.out" }),
              y: gsap.quickTo(element, "y", { duration: 0.9, ease: "power3.out" }),
            }));

            const handlePointerMove = (event: PointerEvent) => {
              const bounds = section.getBoundingClientRect();
              const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
              const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

              pointerLayers.forEach((layer, index) => {
                setters[index].x(
                  offsetX * config.pointerShiftX * layer.factorX * pointerInfluence,
                );
                setters[index].y(
                  offsetY * config.pointerShiftY * layer.factorY * pointerInfluence,
                );
              });
            };

            const resetPointer = () => {
              setters.forEach((setter) => {
                setter.x(0);
                setter.y(0);
              });
            };

            section.addEventListener("pointermove", handlePointerMove);
            section.addEventListener("pointerleave", resetPointer);

            removePointerHandlers = () => {
              section.removeEventListener("pointermove", handlePointerMove);
              section.removeEventListener("pointerleave", resetPointer);
            };
          }

          timeline
            .to(
              scene,
              {
                scale: 1,
                filter: "blur(0px) saturate(1) brightness(1)",
              },
              config.sceneRevealStart,
            )
            .to(
              camera,
              {
                scale: config.cameraScaleMid,
                yPercent: config.cameraYPercentMid,
              },
              0.16,
            )
            .to(
              camera,
              {
                scale: config.cameraScaleEnd,
                yPercent: config.cameraYPercentEnd,
              },
              0.62,
            )
            .to(
              background,
              {
                scale: config.backgroundScale,
                yPercent: config.backgroundYPercent,
                transformOrigin: `${FOCAL_POINT.xPercent}% ${FOCAL_POINT.yPercent}%`,
              },
              0.08,
            )
            .to(
              foreground,
              {
                scale: config.foregroundScale,
                yPercent: config.foregroundYPercent,
                xPercent: config.foregroundXPercent,
                transformOrigin: `${FOCAL_POINT.xPercent}% 100%`,
              },
              0.18,
            )
            .to(
              middleTable,
              {
                scale: config.middleTableScale,
                yPercent: config.middleTableYPercent,
                xPercent: config.middleTableXPercent,
                transformOrigin: `${FOCAL_POINT.xPercent}% 100%`,
              },
              0.24,
            )
            .to(
              backTable,
              {
                scale: config.backTableScale,
                yPercent: config.backTableYPercent,
                xPercent: config.backTableXPercent,
                transformOrigin: `${FOCAL_POINT.xPercent}% 100%`,
              },
              0.3,
            )
            .to(
              textFrame,
              {
                y: -40,
                autoAlpha: 0,
                duration: config.textFadeEnd - config.textFadeStart,
              },
              config.textFadeStart,
            )
            .to(
              productsCta,
              {
                y: -12,
                autoAlpha: 0,
                duration: config.textFadeEnd - config.textFadeStart,
              },
              config.textFadeStart,
            )
            .to(
              scrollCue,
              {
                y: -12,
                autoAlpha: 0,
                duration: config.textFadeEnd - config.textFadeStart,
              },
              config.textFadeStart,
            )
            .to(
              productsCta,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.12,
              },
              config.productsCtaIn,
            )
            .to(
              wash,
              {
                autoAlpha: 0.08,
                duration: config.washFadeEnd - config.washFadeStart,
              },
              config.washFadeStart,
            )
            .to(
              cardThreeRef.current,
              { autoAlpha: 1, y: 0, duration: 0.08 },
              config.textCardThreeIn,
            )
            .to(
              cardThreeRef.current,
              { autoAlpha: 0, y: -34, duration: 0.1 },
              config.textCardThreeOut,
            )
            .to(
              productsCta,
              {
                autoAlpha: 0,
                y: -16,
                duration: 0.1,
              },
              config.productsCtaOut,
            )
            .to(
              endFade,
              {
                autoAlpha: HERO_END_FADE_INTENSITY,
                duration: config.sceneExitEnd - config.sceneExitStart,
              },
              config.sceneExitStart + 0.015,
            )
            .to(
              [scene, wash],
              {
                autoAlpha: 0,
              },
              config.sceneExitStart,
            )
            .to(
              camera,
              {
                autoAlpha: 0,
              },
              config.sceneExitEnd - 0.06,
            );

          return () => {
            removePointerHandlers?.();
          };
        },
      );
    }, section);

    return () => {
      heroScrollTriggerRef.current = null;
      context.revert();
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-[100svh] overflow-clip bg-[#f4eadb] [perspective:1200px]"
      aria-label="Watercolor archway hero"
    >
      <div
        ref={washRef}
        className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_16%,rgba(255,249,241,0.22),transparent_34%),radial-gradient(circle_at_50%_54%,rgba(243,228,207,0.14),transparent_48%),linear-gradient(180deg,rgba(255,249,241,0.06),rgba(244,234,219,0.12))]"
      />
      <div
        ref={endFadeRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] opacity-0"
        style={{
          height: "clamp(14rem, 30vw, 24rem)",
          background: `linear-gradient(180deg, rgba(244,234,219,0) 0%, rgba(244,234,219,0.14) 42%, ${HERO_END_FADE_COLOR} 100%)`,
        }}
      />

      <div ref={cameraRef} className="absolute inset-0 z-0 transform-gpu will-change-transform">
        <div ref={sceneRef} className="absolute inset-0 transform-gpu will-change-transform">
          <div
            ref={backgroundRef}
            className="absolute inset-0 transform-gpu will-change-transform"
          >
            <Image
              src="/walkthrough/background_1.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center select-none"
            />
          </div>

          <div
            ref={backTableRef}
            className="absolute inset-0 z-30 transform-gpu will-change-transform"
          >
            <Image
              src="/walkthrough/table_in_back_4.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center select-none"
            />
          </div>

          <div
            ref={middleTableRef}
            className="absolute inset-0 z-40 transform-gpu will-change-transform"
          >
            <Image
              src="/walkthrough/table_middle_5.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center select-none"
            />
          </div>

          <div
            ref={foregroundRef}
            className="absolute inset-0 z-50 transform-gpu will-change-transform"
          >
            <Image
              src="/walkthrough/table_foreground_6.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center select-none"
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[60] flex items-center justify-center px-4 sm:px-8 lg:px-12">
        <div
          ref={textFrameRef}
          className="relative w-full max-w-[19rem] px-2 py-4 text-center text-[#fff9f1] sm:max-w-[25rem] sm:px-5 sm:py-6 md:max-w-[34rem] lg:max-w-3xl lg:px-8 lg:py-8"
        >
          <p className="text-[0.76rem] font-medium uppercase tracking-[0.28em] text-amber-50/92 sm:text-[0.84rem] md:text-[0.9rem] [font-family:var(--font-editorial-sans)]">
            Z.YUE Studio
          </p>
          <h1 className="mt-4 text-[2.05rem] leading-[0.92] text-stone-50 sm:text-[2.8rem] md:text-5xl lg:text-7xl [font-family:var(--font-editorial-serif)]">
            Where Moments Begin—And Become Something You Can Hold.
          </h1>
          <div className="mx-auto my-4 h-px w-16 bg-gradient-to-r from-transparent via-[#fff4e7]/80 to-transparent sm:my-5 sm:w-24 md:my-6 md:w-28" />
          <p className="mx-auto max-w-[18rem] text-[0.95rem] leading-6 text-stone-100/88 sm:max-w-[22rem] sm:text-[1.02rem] sm:leading-7 md:max-w-2xl md:text-base lg:text-lg [font-family:var(--font-editorial-sans)]">
            Live portraits, created in real time—capturing people, moments, and
            atmosphere.
          </p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-20 z-[62] flex justify-center px-4 sm:bottom-24 sm:px-8 md:bottom-28 lg:bottom-32 lg:px-12">
        <button
          ref={productsCtaRef}
          type="button"
          onClick={handleProductsClick}
          data-testid="hero-get-started"
          className="pointer-events-auto inline-flex min-h-14 min-w-14 flex-col items-center justify-center gap-1.5 px-4 py-3 text-[0.74rem] font-medium uppercase tracking-[0.15em] text-[#F8F5F2] opacity-80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)] transition duration-300 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f6e7d1]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#140f0c] [font-family:var(--font-editorial-sans)] sm:min-h-16 sm:min-w-16 sm:px-5"
          aria-label="Get Started"
        >
          <span>Get Started</span>
          <svg
            data-testid="hero-get-started-icon"
            aria-hidden="true"
            viewBox="0 0 28 20"
            className="h-3.5 w-8 shrink-0 sm:h-4 sm:w-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g>
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 4; 0 0"
                dur="2.8s"
                repeatCount="indefinite"
              />
              <path d="M4 6.5 14 14.5 24 6.5" />
            </g>
          </svg>
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-[22vh] z-[65] mx-auto flex max-w-6xl justify-center px-4 sm:top-[24vh] sm:px-8 md:top-[26vh] lg:top-[28vh] lg:px-12">
        <WalkthroughCard ref={cardThreeRef} copy={textCard} centered />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-[61] flex justify-center px-4 text-center sm:bottom-10 sm:px-8 lg:bottom-14 lg:px-12">
        <p
          ref={scrollCueRef}
          data-testid="hero-scroll-cue"
          className="text-[0.7rem] uppercase tracking-[0.3em] text-stone-50/82 sm:text-[0.74rem] [font-family:var(--font-editorial-sans)]"
        >
          Scroll to Continue
        </p>
      </div>

    </section>
  );
}

type WalkthroughCardProps = {
  copy: string;
  centered?: boolean;
};

const WalkthroughCard = forwardRef<HTMLDivElement, WalkthroughCardProps>(
  ({ copy, centered = false }, ref) => (
    <div
      ref={ref}
      data-testid="hero-message-bubble"
      className={[
        "relative max-w-[15rem] border border-[#efe5d6]/44 bg-[#8b7a67]/42 px-5 py-4 text-[#fff9f1] shadow-[0_18px_60px_rgba(58,41,22,0.2)] backdrop-blur-xl sm:max-w-sm sm:px-7 sm:py-6",
        centered ? "text-center" : "",
      ].join(" ")}
      style={{
        boxShadow:
          "0 18px 60px rgba(58, 41, 22, 0.2), inset 0 0 0 1px rgba(255, 249, 241, 0.22)",
      }}
    >
      <span
        data-testid="hero-message-bubble-corner-top-left"
        className="pointer-events-none absolute left-2 top-2 block h-5 w-5 border-l border-t border-[#f4e8d6]/70"
      >
        <span className="absolute left-0 top-0 h-2.5 w-2.5 -translate-x-[1px] -translate-y-[1px] rounded-full border border-[#f4e8d6]/55" />
      </span>
      <span
        data-testid="hero-message-bubble-corner-top-right"
        className="pointer-events-none absolute right-2 top-2 block h-5 w-5 border-r border-t border-[#f4e8d6]/70"
      >
        <span className="absolute right-0 top-0 h-2.5 w-2.5 translate-x-[1px] -translate-y-[1px] rounded-full border border-[#f4e8d6]/55" />
      </span>
      <span
        data-testid="hero-message-bubble-corner-bottom-left"
        className="pointer-events-none absolute bottom-2 left-2 block h-5 w-5 border-b border-l border-[#f4e8d6]/70"
      >
        <span className="absolute bottom-0 left-0 h-2.5 w-2.5 -translate-x-[1px] translate-y-[1px] rounded-full border border-[#f4e8d6]/55" />
      </span>
      <span
        data-testid="hero-message-bubble-corner-bottom-right"
        className="pointer-events-none absolute bottom-2 right-2 block h-5 w-5 border-b border-r border-[#f4e8d6]/70"
      >
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 translate-x-[1px] translate-y-[1px] rounded-full border border-[#f4e8d6]/55" />
      </span>
      <p className="text-[1.45rem] leading-tight text-stone-50 sm:text-3xl [font-family:var(--font-editorial-serif)]">
        {copy}
      </p>
    </div>
  ),
);

WalkthroughCard.displayName = "WalkthroughCard";
