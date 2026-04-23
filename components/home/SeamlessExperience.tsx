"use client";

import Image from "next/image";
import { type CSSProperties, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  SEAMLESS_EXPERIENCE_CONTENT,
  WHATS_INCLUDED_OFFERINGS,
} from "./seamlessExperienceContent";

gsap.registerPlugin(ScrollToPlugin);

const TIMELINE_ITEMS = SEAMLESS_EXPERIENCE_CONTENT.map(({ id, label }) => ({ id, label })) as {
  id: string;
  label: string;
}[];

const SECTION_OFFSET = 112;
const SCROLL_DURATION = 1.5;
const DESKTOP_RAIL_WIDTH = "18.5rem";
const DESKTOP_RAIL_GUTTER = "0.5rem";
const DESKTOP_RAIL_LEFT_NUDGE = "1.25rem";
const CAL_EMBED_URL = "https://cal.com/zyue-illustrations/intro?embed=true";
const SECTION_ACTIVATION_Y = 0.44;
const DOT_SIZE = 16;
const SECTION_STAGE_CLASS =
  "min-h-[72svh] py-10 sm:min-h-[76svh] sm:py-14 lg:min-h-[88svh] lg:py-20";
const OFFERING_MEDIA_FRAME_CLASS =
  "relative mx-auto aspect-[2/3] w-full max-w-[26rem] overflow-hidden rounded-[1.6rem] sm:max-w-[30rem] sm:rounded-[2rem] lg:mx-0 lg:max-w-none";
const OFFERING_MEDIA: Record<
  string,
  { type: "image" | "video" | "placeholder"; src?: string; alt?: string }
> = {
  "portraits-ink-watercolor": {
    type: "image",
    src: "/media/ink-watercolor.jpg",
    alt: "Ink and watercolor portrait sample",
  },
  "digital-portraits": {
    type: "image",
    src: "/media/digital_portrait.png",
    alt: "Digital portrait sample",
  },
  "custom-backgrounds": {
    type: "image",
    src: "/media/background.jpg",
    alt: "Portrait sample with custom background",
  },
  motion: {
    type: "video",
    src: "/media/motion.mp4",
  },
  "custom-commissions": {
    type: "placeholder",
  },
};
const GALLERY_MEDIA = [
  { id: "gallery-image-1", src: "/media/Gallery_1.jpg", alt: "Gallery artwork sample one" },
  { id: "gallery-image-2", src: "/media/Gallery_2.jpg", alt: "Gallery artwork sample two" },
  { id: "gallery-image-3", src: "/media/Gallery_3.png", alt: "Gallery artwork sample three" },
] as const;

export function SeamlessExperience() {
  const [activeId, setActiveId] = useState<(typeof TIMELINE_ITEMS)[number]["id"]>(
    TIMELINE_ITEMS[0].id,
  );
  const [activeOfferingId, setActiveOfferingId] = useState<string>(
    WHATS_INCLUDED_OFFERINGS[0].id,
  );
  const [displayOfferingId, setDisplayOfferingId] = useState<string>(
    WHATS_INCLUDED_OFFERINGS[0].id,
  );
  const [offeringVisible, setOfferingVisible] = useState(true);
  const [bookingPanel, setBookingPanel] = useState<"inquiry" | "consultation" | null>(null);
  const [bookingSubmitState, setBookingSubmitState] = useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
  }>({
    status: "idle",
    message: "",
  });
  const [activeDotTop, setActiveDotTop] = useState(0);
  const [railVisible, setRailVisible] = useState(false);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const railNavRef = useRef<HTMLElement | null>(null);
  const itemDotRefs = useRef(new Map<string, HTMLDivElement>());
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const mobileNavItemRefs = useRef(new Map<string, HTMLButtonElement>());
  const mobileOfferingSelectorRef = useRef<HTMLDivElement | null>(null);
  const mobileOfferingRefs = useRef(new Map<string, HTMLButtonElement>());
  const rootSectionRef = useRef<HTMLElement | null>(null);
  const offeringTransitionRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const sectionIds = useMemo(() => TIMELINE_ITEMS.map((item) => item.id), []);

  useEffect(() => {
    let frameId = 0;

    const resolveActiveSection = () => {
      const activationY = window.innerHeight * SECTION_ACTIVATION_Y;

      const next = sectionIds.reduce<{ id: string; score: number; tieBreaker: number } | null>(
        (best, id) => {
          const section = sectionRefs.current.get(id);
          if (!section) return best;

          const rect = section.getBoundingClientRect();
          const score =
            activationY < rect.top
              ? rect.top - activationY
              : activationY > rect.bottom
                ? activationY - rect.bottom
                : 0;
          const tieBreaker = Math.abs(rect.top - activationY);

          if (
            !best ||
            score < best.score ||
            (score === best.score && tieBreaker < best.tieBreaker)
          ) {
            return { id, score, tieBreaker };
          }

          return best;
        },
        null,
      );

      if (next && next.id !== activeId) {
        setActiveId(next.id as (typeof TIMELINE_ITEMS)[number]["id"]);
      }
    };

    const scheduleResolve = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(resolveActiveSection);
    };

    scheduleResolve();
    window.addEventListener("scroll", scheduleResolve, { passive: true });
    window.addEventListener("resize", scheduleResolve);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", scheduleResolve);
      window.removeEventListener("resize", scheduleResolve);
    };
  }, [activeId, sectionIds]);

  useEffect(() => {
    if (offeringTransitionRef.current) {
      window.clearTimeout(offeringTransitionRef.current);
    }

    if (activeOfferingId === displayOfferingId) {
      setOfferingVisible(true);
      return;
    }

    setOfferingVisible(false);
    offeringTransitionRef.current = window.setTimeout(() => {
      setDisplayOfferingId(activeOfferingId);
      setOfferingVisible(true);
      offeringTransitionRef.current = null;
    }, 180);

    return () => {
      if (offeringTransitionRef.current) {
        window.clearTimeout(offeringTransitionRef.current);
      }
    };
  }, [activeOfferingId, displayOfferingId]);

  useEffect(() => {
    if (activeId === "products" && !activeOfferingId) {
      setActiveOfferingId(WHATS_INCLUDED_OFFERINGS[0].id);
    }
  }, [activeId, activeOfferingId]);

  useEffect(() => {
    const nav = mobileNavRef.current;
    const activeItem = mobileNavItemRefs.current.get(activeId);
    if (!nav || !activeItem || window.innerWidth >= 1280) return;

    activeItem.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [activeId]);

  useEffect(() => {
    const selector = mobileOfferingSelectorRef.current;
    const activeItem = mobileOfferingRefs.current.get(activeOfferingId);
    if (!selector || !activeItem || window.innerWidth >= 768) return;

    activeItem.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [activeOfferingId]);

  useEffect(() => {
    let frameId = 0;
    let timeoutId: ReturnType<typeof window.setTimeout> | null = null;
    let stopAt = 0;

    const updateDotPosition = () => {
      const railNav = railNavRef.current;
      const activeDot = itemDotRefs.current.get(activeId);
      if (!railNav || !activeDot) return;

      const navRect = railNav.getBoundingClientRect();
      const dotRect = activeDot.getBoundingClientRect();
      setActiveDotTop(dotRect.top - navRect.top + dotRect.height / 2 - DOT_SIZE / 2);
    };

    const tick = () => {
      updateDotPosition();
      if (performance.now() < stopAt) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    const startTracking = (duration = 420) => {
      stopAt = performance.now() + duration;
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(tick);
    };

    startTracking();
    window.addEventListener("resize", updateDotPosition);
    window.addEventListener("scroll", updateDotPosition, { passive: true });
    timeoutId = window.setTimeout(() => startTracking(180), 160);

    return () => {
      window.cancelAnimationFrame(frameId);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("resize", updateDotPosition);
      window.removeEventListener("scroll", updateDotPosition);
    };
  }, [activeId]);

  useEffect(() => {
    const updateRailVisibility = () => {
      const root = rootSectionRef.current;
      if (!root) return;

      const desktop = window.innerWidth >= 1024;
      if (!desktop) {
        setRailVisible(false);
        return;
      }

      const rect = root.getBoundingClientRect();
      const shouldShow = rect.top < window.innerHeight && rect.bottom > 0;
      setRailVisible(shouldShow);
    };

    updateRailVisibility();
    window.addEventListener("scroll", updateRailVisibility, { passive: true });
    window.addEventListener("resize", updateRailVisibility);

    return () => {
      window.removeEventListener("scroll", updateRailVisibility);
      window.removeEventListener("resize", updateRailVisibility);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const target = sectionRefs.current.get(id) ?? document.getElementById(id);
    if (!target) return;

    const y = target.getBoundingClientRect().top + window.scrollY - SECTION_OFFSET;

    gsap.to(window, {
      duration: SCROLL_DURATION,
      ease: "power2.inOut",
      scrollTo: { y, autoKill: false },
      overwrite: "auto",
    });
  };

  const showOffering = (id: string) => {
    setActiveOfferingId(id);
  };

  const navigateToOffering = (id: string) => {
    showOffering(id);
    scrollToSection("products");
  };

  const renderWhatsIncludedSection = () => {
    const productsSection = SEAMLESS_EXPERIENCE_CONTENT.find((item) => item.id === "products");
    const activeOffering =
      WHATS_INCLUDED_OFFERINGS.find((offering) => offering.id === displayOfferingId) ??
      WHATS_INCLUDED_OFFERINGS[0];
    const activeOfferingMedia = OFFERING_MEDIA[activeOffering.id];
    if (!productsSection) return null;

    return (
      <div
        key={productsSection.id}
        id={productsSection.id}
        ref={(node) => {
          if (node) {
            sectionRefs.current.set(productsSection.id, node);
          } else {
            sectionRefs.current.delete(productsSection.id);
          }
        }}
        className="scroll-mt-32"
      >
        <article
          className={`max-w-6xl ${SECTION_STAGE_CLASS} flex flex-col justify-center`}
          data-testid="section-products"
        >
          <div className="max-w-3xl">
            <h2
              className="text-[2.1rem] font-light leading-[1.06] text-[#2f2217] sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-editorial-serif)" }}
            >
              {productsSection.title}
            </h2>
            {productsSection.lede ? (
              <p
                className="mt-7 max-w-2xl whitespace-pre-line text-xl leading-[1.95] text-[#5f4a31]"
                style={{ fontFamily: "var(--font-editorial-sans)" }}
              >
                {productsSection.lede}
              </p>
            ) : null}
          </div>

          <div
            className="sticky top-[4.45rem] z-[15] -mx-5 mt-8 border-y border-[#e2cfb3] bg-[#f4eadb]/95 px-5 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 md:static md:mx-0 md:mt-10 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none xl:hidden"
            data-testid="mobile-offering-selector-wrap"
          >
            <div
              ref={mobileOfferingSelectorRef}
              className="flex gap-3 overflow-x-auto"
              data-testid="mobile-offering-selector"
            >
              <div className="flex min-w-max gap-3">
                {WHATS_INCLUDED_OFFERINGS.map((offering) => {
                  const active = activeOfferingId === offering.id;
                  return (
                    <button
                      key={offering.id}
                      ref={(node) => {
                        if (node) {
                          mobileOfferingRefs.current.set(offering.id, node);
                        } else {
                          mobileOfferingRefs.current.delete(offering.id);
                        }
                      }}
                      type="button"
                      data-testid={`offering-selector-${offering.id}`}
                      onClick={() => showOffering(offering.id)}
                      className={`w-auto shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-left text-[0.72rem] uppercase tracking-[0.18em] transition-colors ${
                        active
                          ? "border-[#8f6d44] bg-[#8f6d44] text-[#fff9f1]"
                          : "border-[#dbc5a8] bg-transparent text-[#80684b] hover:border-[#8f6d44] hover:text-[#5e4428]"
                      }`}
                      style={{ fontFamily: "var(--font-editorial-sans)" }}
                    >
                      {offering.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-12 sm:mt-14 lg:mt-16" data-testid="whats-included-viewer">
            <div
              key={activeOffering.id}
              data-testid={`offering-${activeOffering.id}`}
              data-visible={offeringVisible ? "true" : "false"}
              className={`grid gap-8 transition-opacity duration-200 md:gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(18rem,0.9fr)] lg:gap-12 ${
                offeringVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div>
                <h3
                  className="max-w-xl text-[2rem] font-light leading-[1.08] text-[#2f2217] sm:text-3xl md:text-[2.5rem]"
                  style={{ fontFamily: "var(--font-editorial-serif)" }}
                >
                  {activeOffering.title}
                </h3>
                <p
                  className="mt-5 max-w-[34rem] text-[1rem] leading-7 text-[#6d563b] sm:mt-6 sm:text-[1.04rem] sm:leading-8"
                  style={{ fontFamily: "var(--font-editorial-sans)" }}
                >
                  {activeOffering.description}
                </p>
                <p
                  className="mt-6 max-w-[28rem] text-sm leading-6 text-[#8a7357] sm:mt-8"
                  style={{ fontFamily: "var(--font-editorial-sans)" }}
                >
                  Designed to feel personal, unobtrusive, and easy to integrate into the rhythm
                  of the event.
                </p>
              </div>

              <div
                className={OFFERING_MEDIA_FRAME_CLASS}
                data-testid={`offering-sample-${activeOffering.id}`}
              >
                {activeOfferingMedia?.type === "video" ? (
                  <video
                    data-testid={`offering-video-${activeOffering.id}`}
                    className="absolute inset-0 h-full w-full object-cover"
                    src={activeOfferingMedia.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : activeOfferingMedia?.type === "image" ? (
                  <Image
                    src={activeOfferingMedia.src}
                    alt={activeOfferingMedia.alt ?? activeOffering.title}
                    fill
                    sizes="(min-width: 1024px) 32vw, 100vw"
                    className="object-contain object-center"
                    data-testid={`offering-image-${activeOffering.id}`}
                  />
                ) : activeOfferingMedia?.type === "placeholder" ? (
                  <div
                    data-testid={`offering-placeholder-${activeOffering.id}`}
                    className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(180deg,rgba(249,241,230,0.8),rgba(239,226,206,0.72))]"
                  >
                    <div className="flex h-full w-full items-center justify-center border border-[#e1cfb5]/70 bg-[radial-gradient(circle_at_50%_30%,rgba(255,250,244,0.72),transparent_45%)]">
                      <span
                        className="px-8 text-center text-[0.72rem] uppercase tracking-[0.28em] text-[#8c7356]"
                        style={{ fontFamily: "var(--font-editorial-sans)" }}
                      >
                        Custom work preview available on request
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  };

  const renderGallerySection = () => {
    const gallerySection = SEAMLESS_EXPERIENCE_CONTENT.find((item) => item.id === "gallery");
    if (!gallerySection) return null;

    const galleryFrameClass =
      "relative overflow-hidden rounded-[1.75rem] border border-[#e1cfb5]/85 bg-[linear-gradient(180deg,rgba(247,238,225,0.84),rgba(238,223,200,0.74))] shadow-[0_18px_40px_rgba(95,70,41,0.05)]";

    return (
      <div
        key={gallerySection.id}
        id={gallerySection.id}
        ref={(node) => {
          if (node) {
            sectionRefs.current.set(gallerySection.id, node);
          } else {
            sectionRefs.current.delete(gallerySection.id);
          }
        }}
        className="scroll-mt-32"
      >
        <article
          className={`max-w-6xl ${SECTION_STAGE_CLASS} flex flex-col justify-center`}
          data-testid="section-gallery"
        >
          <div className="max-w-3xl">
            <h2
              className="text-[2.1rem] font-light leading-[1.06] text-[#2f2217] sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-editorial-serif)" }}
            >
              {gallerySection.title}
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:mt-16 sm:grid-cols-2 sm:gap-7 lg:mt-20 lg:grid-cols-3 lg:gap-8">
            <div data-testid="gallery-item-1" className={`${galleryFrameClass} aspect-[4/5]`}>
              <Image
                src={GALLERY_MEDIA[0].src}
                alt={GALLERY_MEDIA[0].alt}
                fill
                sizes="(min-width: 1024px) 26vw, (min-width: 640px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div data-testid="gallery-item-2" className={`${galleryFrameClass} aspect-[4/5]`}>
              <Image
                src={GALLERY_MEDIA[1].src}
                alt={GALLERY_MEDIA[1].alt}
                fill
                sizes="(min-width: 1024px) 26vw, (min-width: 640px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
            <div data-testid="gallery-item-3" className={`${galleryFrameClass} aspect-[4/5]`}>
              <Image
                src={GALLERY_MEDIA[2].src}
                alt={GALLERY_MEDIA[2].alt}
                fill
                sizes="(min-width: 1024px) 26vw, (min-width: 640px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </article>
      </div>
    );
  };

  const renderBookingSection = () => {
    const bookingSection = SEAMLESS_EXPERIENCE_CONTENT.find((item) => item.id === "booking");
    if (!bookingSection) return null;

    const inputClass =
      "w-full border-0 border-b border-[#dcc7ab] bg-transparent px-0 pb-3 pt-2 text-[1rem] text-[#4f3925] outline-none transition-colors placeholder:text-[#9d8261] focus:border-[#8f6d44]";
    const labelClass =
      "text-[0.72rem] font-medium uppercase tracking-[0.24em] text-[#987a56]";
    const handleInquirySubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const form = event.currentTarget;
      const formData = new FormData(form);
      const payload = {
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        eventDate: String(formData.get("eventDate") ?? "").trim(),
        guestCount: String(formData.get("guestCount") ?? "").trim(),
        preferredOffering: String(formData.get("preferredOffering") ?? "").trim(),
        message: String(formData.get("message") ?? "").trim(),
      };

      setBookingSubmitState({ status: "submitting", message: "" });

      try {
        const response = await fetch("/api/inquiry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = (await response.json().catch(() => null)) as
          | { error?: string; success?: boolean }
          | null;

        if (!response.ok) {
          throw new Error(result?.error ?? "Unable to send your inquiry right now.");
        }

        form.reset();
        setBookingSubmitState({
          status: "success",
          message: "Inquiry sent. I’ll follow up with availability, next steps, and any questions you have.",
        });
      } catch (error) {
        setBookingSubmitState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while sending your inquiry. Please try again.",
        });
      }
    };

    return (
      <div
        key={bookingSection.id}
        id={bookingSection.id}
        ref={(node) => {
          if (node) {
            sectionRefs.current.set(bookingSection.id, node);
          } else {
            sectionRefs.current.delete(bookingSection.id);
          }
        }}
        className="scroll-mt-32"
      >
        <article
          className={`max-w-6xl ${SECTION_STAGE_CLASS} flex flex-col justify-center`}
          data-testid="section-booking"
        >
          <div className="max-w-3xl">
            <h2
              className="text-[2.1rem] font-light leading-[1.06] text-[#2f2217] sm:text-4xl md:text-5xl"
              style={{ fontFamily: "var(--font-editorial-serif)" }}
            >
              {bookingSection.title}
            </h2>
            <p
              className="mt-4 text-[0.72rem] uppercase tracking-[0.32em] text-[#9b7b57]"
              style={{ fontFamily: "var(--font-editorial-sans)" }}
            >
              Have a quick question? I&apos;m always happy to help-send a note.
              <br />
              If you&apos;d rather talk it through together, we can set up a call.
            </p>
          </div>

          <div className="mt-12 max-w-5xl sm:mt-14">
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                data-testid="booking-toggle-inquiry"
                data-open={bookingPanel === "inquiry" ? "true" : "false"}
                onClick={() =>
                  setBookingPanel((current) => (current === "inquiry" ? null : "inquiry"))
                }
                className={`border px-6 py-3 text-sm uppercase tracking-[0.22em] transition-colors ${
                  bookingPanel === "inquiry"
                    ? "border-[#8f6d44] text-[#8f6d44]"
                    : "border-[#d7c0a0] text-[#5f4328] hover:border-[#8f6d44] hover:text-[#8f6d44]"
                }`}
                style={{ fontFamily: "var(--font-editorial-sans)" }}
              >
                Send an Inquiry
              </button>
              <button
                type="button"
                data-testid="booking-toggle-consultation"
                data-open={bookingPanel === "consultation" ? "true" : "false"}
                onClick={() =>
                  setBookingPanel((current) =>
                    current === "consultation" ? null : "consultation",
                  )
                }
                className={`border px-6 py-3 text-sm uppercase tracking-[0.22em] transition-colors ${
                  bookingPanel === "consultation"
                    ? "border-[#8f6d44] text-[#8f6d44]"
                    : "border-[#d7c0a0] text-[#5f4328] hover:border-[#8f6d44] hover:text-[#8f6d44]"
                }`}
                style={{ fontFamily: "var(--font-editorial-sans)" }}
              >
                Book a Consultation
              </button>
            </div>

            <div
              data-testid="booking-inquiry-panel"
              data-visible={bookingPanel === "inquiry" ? "true" : "false"}
              className={`overflow-hidden transition-all duration-500 ${
                bookingPanel === "inquiry"
                  ? "mt-10 max-h-[80rem] opacity-100"
                  : "mt-0 max-h-0 opacity-0"
              }`}
            >
              <form
                data-testid="booking-form"
                className="max-w-3xl"
                onSubmit={handleInquirySubmit}
              >
                <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
                  <label className="block">
                    <span className={labelClass} style={{ fontFamily: "var(--font-editorial-sans)" }}>
                      First name
                    </span>
                    <input
                      name="firstName"
                      autoComplete="given-name"
                      className={inputClass}
                      placeholder="First name"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass} style={{ fontFamily: "var(--font-editorial-sans)" }}>
                      Last name
                    </span>
                    <input
                      name="lastName"
                      autoComplete="family-name"
                      className={inputClass}
                      placeholder="Last name"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass} style={{ fontFamily: "var(--font-editorial-sans)" }}>
                      Email
                    </span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      className={inputClass}
                      placeholder="Email"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass} style={{ fontFamily: "var(--font-editorial-sans)" }}>
                      Phone number
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      className={inputClass}
                      placeholder="Phone number"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className={labelClass} style={{ fontFamily: "var(--font-editorial-sans)" }}>
                      Event date
                    </span>
                    <input type="date" name="eventDate" className={inputClass} required />
                  </label>

                  <label className="block">
                    <span className={labelClass} style={{ fontFamily: "var(--font-editorial-sans)" }}>
                      Estimated guest count
                    </span>
                    <input
                      name="guestCount"
                      inputMode="numeric"
                      className={inputClass}
                      placeholder="Estimated guest count"
                      required
                    />
                  </label>

                  <label className="block md:col-span-2">
                    <span className={labelClass} style={{ fontFamily: "var(--font-editorial-sans)" }}>
                      Preferred offering
                    </span>
                    <select
                      name="preferredOffering"
                      defaultValue=""
                      className={inputClass}
                      data-testid="preferred-offering"
                      required
                    >
                      <option value="" disabled>
                        Select an offering
                      </option>
                      <option>Watercolor Portraits</option>
                      <option>Digital Portraits</option>
                      <option>Custom Backgrounds</option>
                      <option>Motion</option>
                      <option>Custom Commissions</option>
                      <option>Not sure yet</option>
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className={labelClass} style={{ fontFamily: "var(--font-editorial-sans)" }}>
                      Message
                    </span>
                    <textarea
                      name="message"
                      rows={5}
                      className={`${inputClass} resize-none`}
                      placeholder="Message"
                      required
                    />
                  </label>
                </div>

                <div className="mt-12">
                  <button
                    type="submit"
                    data-testid="booking-submit"
                    disabled={bookingSubmitState.status === "submitting"}
                    className="border border-[#d7c0a0] px-6 py-3 text-sm uppercase tracking-[0.22em] text-[#5f4328] transition-colors hover:border-[#8f6d44] hover:text-[#8f6d44]"
                    style={{ fontFamily: "var(--font-editorial-sans)" }}
                  >
                    {bookingSubmitState.status === "submitting" ? "Sending..." : "Send Inquiry"}
                  </button>
                  {bookingSubmitState.status !== "idle" ? (
                    <p
                      data-testid="booking-submit-message"
                      className={`mt-5 max-w-[34rem] text-[0.92rem] leading-7 ${
                        bookingSubmitState.status === "error"
                          ? "text-[#8a4c41]"
                          : "text-[#6d563b]"
                      }`}
                      style={{ fontFamily: "var(--font-editorial-sans)" }}
                      aria-live="polite"
                    >
                      {bookingSubmitState.message}
                    </p>
                  ) : null}
                </div>
              </form>
            </div>

            <div
              data-testid="booking-consultation-panel"
              data-visible={bookingPanel === "consultation" ? "true" : "false"}
              className={`overflow-hidden transition-all duration-500 ${
                bookingPanel === "consultation"
                  ? "mt-10 max-h-[80rem] opacity-100"
                  : "mt-0 max-h-0 opacity-0"
              }`}
            >
              <div className="max-w-3xl">
                <p
                  className="max-w-[24rem] text-[1rem] leading-7 text-[#6d563b] sm:text-[1.02rem] sm:leading-8"
                  style={{ fontFamily: "var(--font-editorial-sans)" }}
                >
                  If it feels easier to talk things through together, you can choose a
                  consultation time that works for you below.
                </p>
              </div>

              <div
                data-testid="booking-cal-embed"
                className="mt-8 overflow-hidden rounded-[1.5rem] border border-[#e0cdb3]/85 bg-[linear-gradient(180deg,rgba(249,241,230,0.72),rgba(243,231,214,0.6))] px-2 py-3 sm:mt-10 sm:rounded-[1.75rem] sm:px-4 sm:py-4 lg:px-5 lg:py-5"
              >
                {bookingPanel === "consultation" ? (
                  <iframe
                    title="Cal.com booking scheduler"
                    src={CAL_EMBED_URL}
                    className="h-full min-h-[36rem] w-full border-0 bg-transparent sm:min-h-[42rem] lg:min-h-[52rem]"
                    loading="lazy"
                    data-testid="booking-cal-iframe"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </article>
      </div>
    );
  };

  return (
    <section
      ref={rootSectionRef}
      className="relative -mt-16 overflow-x-clip overflow-y-visible bg-[#f4eadb] text-[#3a2c1f] sm:-mt-24 lg:-mt-32 xl:-mt-36"
    >
      <div className="absolute inset-0">
        <div className="absolute left-[10%] top-28 h-80 w-80 rounded-full bg-amber-50/80 blur-3xl" />
        <div className="absolute right-[8%] top-[28rem] h-[26rem] w-[26rem] rounded-full bg-[#f3e4cf]/90 blur-3xl" />
        <div className="absolute bottom-16 left-1/3 h-72 w-72 rounded-full bg-white/25 blur-3xl" />
      </div>

      <div
        className="pointer-events-none fixed left-0 top-0 z-30 hidden h-screen xl:block"
        style={{
          width: `calc((100vw - min(80rem, 100vw - 4rem)) / 2 + ${DESKTOP_RAIL_WIDTH} - ${DESKTOP_RAIL_LEFT_NUDGE})`,
        }}
      >
        <aside
          data-testid="experience-rail"
          aria-label="Section navigation"
          className={`pointer-events-auto flex h-full w-full items-stretch justify-end transition-all duration-500 ${
            railVisible ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"
          }`}
        >
          <div
            className="relative h-full border-r border-[#ddccb2]/80 bg-[linear-gradient(180deg,rgba(248,238,226,0.96),rgba(244,234,219,0.86)_42%,rgba(240,225,204,0.84))] pl-8 pr-8 shadow-[18px_0_48px_rgba(87,64,35,0.06)] backdrop-blur-xl"
            style={{ width: DESKTOP_RAIL_WIDTH }}
          >
            <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#dbc8ae] to-transparent" />
            <div className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-transparent via-white/60 to-transparent opacity-70" />

            <div className="flex h-full flex-col py-14">
              <nav
                ref={railNavRef}
                className="relative flex-1 py-6"
                aria-label="Desktop section navigation"
              >
                <div className="absolute left-[0.8rem] top-0 h-full w-px bg-gradient-to-b from-[#efe1cc] via-[#ceb18a] to-[#efe1cc]" />
                <div
                  data-testid="active-rail-dot"
                  className="absolute left-[0.8rem] h-4 w-4 -translate-x-1/2 rounded-full border border-[#9b7650] bg-[#9b7650] shadow-[0_0_0_6px_rgba(155,118,80,0.09)] transition-[top] duration-300"
                  style={{
                    top: `${activeDotTop}px`,
                  }}
                />

                <div className="space-y-8">
                  {TIMELINE_ITEMS.map((item) => {
                    const active = item.id === activeId;
                    const hasOfferings = item.id === "products";
                    return (
                      <div key={item.id}>
                        <button
                          data-testid={`rail-item-${item.id}`}
                          data-active={active ? "true" : "false"}
                          onClick={() => scrollToSection(item.id)}
                          className="group relative block w-full text-left"
                          aria-current={active ? "location" : undefined}
                        >
                          <div
                            ref={(node) => {
                              if (node) {
                                itemDotRefs.current.set(item.id, node);
                              } else {
                                itemDotRefs.current.delete(item.id);
                              }
                            }}
                            className="absolute left-[0.33rem] top-2.5 h-3 w-3 rounded-full border border-[#d7c0a0] bg-[#f4eadb] transition-all duration-300 group-hover:border-[#9b7650]"
                          />
                          <div className="ml-10 pr-6">
                            <span
                              className={`block text-[0.78rem] uppercase tracking-[0.28em] transition-colors duration-300 ${
                                active
                                  ? "text-[#4a3421]"
                                  : "text-[#94795a] group-hover:text-[#62462a]"
                              }`}
                              style={{ fontFamily: "var(--font-editorial-sans)" }}
                            >
                              {item.label}
                            </span>
                          </div>
                        </button>

                        {hasOfferings ? (
                          <div
                            data-testid="rail-products-subnav"
                            data-expanded={active ? "true" : "false"}
                            className={`ml-10 overflow-hidden transition-all duration-300 ${
                              active ? "mt-4 max-h-64 opacity-100" : "mt-0 max-h-0 opacity-0"
                            }`}
                          >
                            <div className="space-y-3 pb-1">
                            {WHATS_INCLUDED_OFFERINGS.map((offering) => {
                              const subActive = active && activeOfferingId === offering.id;
                              return (
                                <button
                                  key={offering.id}
                                  data-testid={`rail-subitem-${offering.id}`}
                                  onClick={() => navigateToOffering(offering.id)}
                                  className="block text-left"
                                >
                                  <span
                                    className={`block text-[0.72rem] leading-6 transition-colors duration-300 ${
                                      subActive
                                        ? "text-[#5f4328]"
                                        : "text-[#9a8164] hover:text-[#6b4d30]"
                                    }`}
                                    style={{ fontFamily: "var(--font-editorial-sans)" }}
                                  >
                                    {offering.label}
                                  </span>
                                </button>
                              );
                            })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        </aside>
      </div>

      <div
        className="relative mx-auto max-w-7xl px-5 pb-20 pt-24 sm:px-6 sm:pb-24 sm:pt-32 md:px-8 lg:pb-28 lg:pt-40 xl:px-8 xl:pb-32 xl:pt-44 xl:pl-[var(--desktop-rail-offset)]"
        style={
          {
            "--desktop-rail-offset": `max(2rem, calc((100vw - min(80rem, 100vw - 4rem)) / 2 + ${DESKTOP_RAIL_WIDTH} + ${DESKTOP_RAIL_GUTTER} - ${DESKTOP_RAIL_LEFT_NUDGE}))`,
          } as CSSProperties
        }
      >
        <div className="max-w-[68rem]">
          <nav className="sticky top-0 z-20 mb-10 block border-y border-[#e2cfb3] bg-[#f4eadb]/90 backdrop-blur-sm xl:hidden">
            <div ref={mobileNavRef} className="flex overflow-x-auto py-4" data-testid="mobile-top-nav">
              <div className="flex min-w-max gap-3 px-5 sm:gap-4 sm:px-6">
                {TIMELINE_ITEMS.map((item) => {
                  const active = item.id === activeId;
                  return (
                    <button
                      key={item.id}
                      ref={(node) => {
                        if (node) {
                          mobileNavItemRefs.current.set(item.id, node);
                        } else {
                          mobileNavItemRefs.current.delete(item.id);
                        }
                      }}
                      data-testid={`mobile-nav-item-${item.id}`}
                      onClick={() => scrollToSection(item.id)}
                      className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors sm:text-sm ${
                        active
                          ? "border-[#8f6d44] bg-[#8f6d44] text-[#fff9f1]"
                          : "border-[#dbc5a8] bg-transparent text-[#80684b] hover:border-[#8f6d44] hover:text-[#5e4428]"
                      }`}
                      style={{ fontFamily: "var(--font-editorial-sans)" }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="space-y-24 sm:space-y-28 md:space-y-32 lg:space-y-40 xl:space-y-44">
            <div className="max-w-4xl">
              <h1
                className="max-w-3xl text-[2.2rem] font-light leading-[1.04] text-[#2f2217] sm:text-4xl md:text-5xl lg:text-6xl"
                style={{ fontFamily: "var(--font-editorial-serif)" }}
              >
                Welcome!
              </h1>
              <p
                className="mt-6 max-w-2xl text-base leading-7 text-[#6d563b] sm:mt-8 sm:text-lg sm:leading-relaxed"
                style={{ fontFamily: "var(--font-editorial-sans)" }}
              >
                Based in New York, with a perspective shaped by living across the U.S.
                and abroad. I’m available to travel for events, bringing a range of
                cultural influences into each piece. My work reflects this-resulting in
                illustrations that feel personal, considered, and authentic to every
                setting.
              </p>
            </div>

            {SEAMLESS_EXPERIENCE_CONTENT.map((item, index) => {
              const isAboutSection = item.id === "about";
              if (item.id === "products") {
                return renderWhatsIncludedSection();
              }

              if (item.id === "gallery") {
                return renderGallerySection();
              }

              if (item.id === "booking") {
                return renderBookingSection();
              }

              return (
                <div
                  key={item.id}
                  id={item.id}
                  ref={(node) => {
                    if (node) {
                      sectionRefs.current.set(item.id, node);
                    } else {
                      sectionRefs.current.delete(item.id);
                    }
                  }}
                  className="scroll-mt-32"
                >
                  <article
                  className={`max-w-6xl flex flex-col justify-center ${SECTION_STAGE_CLASS} ${
                      index === 0 ? "pt-6 sm:pt-8 lg:pt-12" : ""
                    }`}
                    data-testid={`section-${item.id}`}
                  >
                    <div
                      className={`grid gap-10 ${
                        isAboutSection
                          ? ""
                          : "lg:grid-cols-[minmax(0,1.18fr)_minmax(13rem,0.48fr)] lg:gap-10"
                      }`}
                    >
                      <div>
                        <h2
                          className={`${item.kicker ? "mt-5" : "mt-0"} text-[2.1rem] font-light leading-[1.06] text-[#2f2217] sm:text-4xl md:text-5xl`}
                          style={{ fontFamily: "var(--font-editorial-serif)" }}
                        >
                          {item.title}
                        </h2>
                        {isAboutSection ? (
                          <div
                            data-testid="about-profile-image"
                            className="relative mt-10 aspect-[4/5] w-full max-w-[15rem] overflow-hidden rounded-[1.75rem] border border-[#e1cfb5]/85 bg-[linear-gradient(180deg,rgba(247,238,225,0.84),rgba(238,223,200,0.74))] shadow-[0_18px_40px_rgba(95,70,41,0.05)] sm:max-w-[17rem] lg:float-right lg:ml-8 lg:mt-2 lg:w-[17rem] lg:max-w-none"
                          >
                            <Image
                              src="/media/profile_photo.png"
                              alt="Portrait of Z.YUE"
                              fill
                              sizes="(min-width: 1024px) 17rem, 60vw"
                              className="object-cover"
                            />
                          </div>
                        ) : null}
                        <p
                          className="mt-6 max-w-2xl text-[1.05rem] leading-8 text-[#5f4a31] sm:mt-7 sm:text-xl sm:leading-relaxed"
                          style={{ fontFamily: "var(--font-editorial-sans)" }}
                        >
                          {item.lede}
                        </p>

                        <div
                          className={`${item.id === "experience" ? "mt-8 space-y-6 sm:mt-10 sm:space-y-7" : "mt-10 space-y-7 sm:mt-12 sm:space-y-8"}`}
                        >
                          {item.paragraphs.map((paragraph) => (
                            <p
                              key={paragraph}
                              className={`max-w-[42rem] text-[1rem] leading-7 text-[#6d563b] sm:text-[1.02rem] sm:leading-8 ${
                                item.id === "experience" ? "sm:text-[1.04rem] sm:leading-[2.05]" : ""
                              }`}
                              style={{ fontFamily: "var(--font-editorial-sans)" }}
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>

                        {item.closing ? (
                          <div className={`mt-14 pt-4 ${isAboutSection ? "lg:clear-both" : ""}`}>
                            <p
                              className={`max-w-2xl text-[1.7rem] font-light leading-[1.35] text-[#43301e] sm:text-2xl sm:leading-relaxed ${
                                item.id === "about" ? "whitespace-pre-line" : ""
                              }`}
                              style={{ fontFamily: "var(--font-editorial-serif)" }}
                            >
                              {item.closing}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {!isAboutSection && (item.details.length > 0 || item.highlights.length > 0) ? (
                        <div className="lg:pt-6">
                          {item.details.length > 0 ? (
                            <div className="space-y-7">
                              {item.details.map((detail) => (
                                <div key={detail.label}>
                                  <p
                                    className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-[#987a56]"
                                    style={{ fontFamily: "var(--font-editorial-sans)" }}
                                  >
                                    {detail.label}
                                  </p>
                                  <p
                                    className="mt-2 text-[1.03rem] leading-7 text-[#493523]"
                                    style={{ fontFamily: "var(--font-editorial-sans)" }}
                                  >
                                    {detail.value}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {item.highlights.length > 0 ? (
                            <div className={`${item.details.length > 0 ? "mt-14" : ""} space-y-5`}>
                              {item.highlights.map((highlight) => (
                                <p
                                  key={highlight}
                                  className="text-base leading-7 text-[#6a5339]"
                                  style={{ fontFamily: "var(--font-editorial-sans)" }}
                                >
                                  {highlight}
                                </p>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
