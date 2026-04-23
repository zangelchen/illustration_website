import { expect, test, type Locator } from "@playwright/test";

const RESPONSIVE_VIEWPORTS = [
  { label: "375x812", width: 375, height: 812 },
  { label: "390x844", width: 390, height: 844 },
  { label: "430x932", width: 430, height: 932 },
  { label: "768x1024", width: 768, height: 1024 },
  { label: "1024x768", width: 1024, height: 768 },
  { label: "1440x900", width: 1440, height: 900 },
  { label: "1728x1117", width: 1728, height: 1117 },
] as const;

test("home page renders hero content", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");

  await expect(page).toHaveTitle(/Cinematic Wedding Walkthrough/i);
  const label = page.getByText(/^Z\.YUE Studio$/);
  const title = page.getByRole("heading", {
    name: /^Where Moments Begin—And Become Something You Can Hold\.$/,
  });
  const subhead = page.getByText(
    /^Live portraits, created in real time—capturing people, moments, and atmosphere\.$/,
  );
  const scrollCue = page.getByTestId("hero-scroll-cue");
  const getStarted = page.getByTestId("hero-get-started");
  const getStartedIcon = page.getByTestId("hero-get-started-icon");

  await expect(label).toBeVisible();
  await expect(title).toBeVisible();
  await expect(subhead).toBeVisible();
  await expect(scrollCue).toBeVisible();
  await expect(getStarted).not.toBeVisible();

  const labelFontSize = await label.evaluate((node) => window.getComputedStyle(node).fontSize);
  const labelFontWeight = await label.evaluate((node) => window.getComputedStyle(node).fontWeight);
  const labelColor = await label.evaluate((node) => window.getComputedStyle(node).color);
  expect(Number.parseFloat(labelFontSize)).toBeGreaterThan(13);
  expect(Number.parseInt(labelFontWeight, 10)).toBeGreaterThanOrEqual(500);
  expect(labelColor).not.toBe("rgba(255, 251, 235, 0.8)");

  const titleBox = await title.boundingBox();
  const subheadBox = await subhead.boundingBox();
  expect(titleBox).not.toBeNull();
  expect(subheadBox).not.toBeNull();
  expect(titleBox!.x).toBeGreaterThanOrEqual(0);
  expect(subheadBox!.x).toBeGreaterThanOrEqual(0);
  expect(titleBox!.x + titleBox!.width).toBeLessThanOrEqual(1440);
  expect(subheadBox!.x + subheadBox!.width).toBeLessThanOrEqual(1440);

  const heroBubbles = page.getByTestId("hero-message-bubble");
  await expect(heroBubbles).toHaveCount(1);
  await expect(heroBubbles.first()).toContainText(
    /Custom pieces designed around your event and culture/i,
  );
  await expect(heroBubbles.first()).not.toContainText(/Live Sketch/i);
  await expect(page.getByText(/Live portraits, hand-sketched in real time/i)).toHaveCount(0);
  await expect(page.getByText(/Digital versions available to revisit and share/i)).toHaveCount(0);
  for (const cornerId of [
    "hero-message-bubble-corner-top-left",
    "hero-message-bubble-corner-top-right",
    "hero-message-bubble-corner-bottom-left",
    "hero-message-bubble-corner-bottom-right",
  ] as const) {
    const borderWidths = await page.getByTestId(cornerId).evaluate((node) => {
      const style = window.getComputedStyle(node);
      return {
        top: style.borderTopWidth,
        right: style.borderRightWidth,
        bottom: style.borderBottomWidth,
        left: style.borderLeftWidth,
      };
    });

    expect(
      [borderWidths.top, borderWidths.right, borderWidths.bottom, borderWidths.left].some(
        (value) => value !== "0px",
      ),
    ).toBe(true);
  }

  const bubbleBackground = await heroBubbles.first().evaluate((node) =>
    window.getComputedStyle(node).backgroundColor,
  );
  const bubbleBorderRadius = await heroBubbles.first().evaluate((node) =>
    window.getComputedStyle(node).borderRadius,
  );
  expect(bubbleBackground).not.toBe("rgba(199, 193, 209, 0.3)");
  expect(bubbleBorderRadius).toBe("0px");

  await page.evaluate(() => {
    window.scrollTo({ top: 1250, behavior: "instant" });
  });

  await expect(title).not.toBeVisible();
  await expect(subhead).not.toBeVisible();
  await expect(scrollCue).not.toBeVisible();
  await expect(getStarted).toBeVisible();
  await expect(getStarted).toContainText(/^Get Started$/);
  await expect(getStartedIcon).toBeVisible();

  const buttonBackground = await getStarted.evaluate((node) =>
    window.getComputedStyle(node).backgroundColor,
  );
  expect(buttonBackground).toBe("rgba(0, 0, 0, 0)");

  const getStartedBox = await getStarted.boundingBox();
  expect(getStartedBox).not.toBeNull();
  expect(getStartedBox!.width).toBeGreaterThanOrEqual(56);
  expect(getStartedBox!.height).toBeGreaterThanOrEqual(56);

  const getStartedText = getStarted.getByText(/^Get Started$/);
  const textBox = await getStartedText.boundingBox();
  const iconBox = await getStartedIcon.boundingBox();
  expect(textBox).not.toBeNull();
  expect(iconBox).not.toBeNull();
  expect(iconBox!.y).toBeGreaterThan(textBox!.y + textBox!.height - 1);
  expect(Math.abs(iconBox!.x + iconBox!.width / 2 - (textBox!.x + textBox!.width / 2))).toBeLessThanOrEqual(2);
  expect(iconBox!.width).toBeGreaterThan(iconBox!.height * 1.9);

  await getStarted.click();
  await expect(page.getByTestId("section-experience")).toBeInViewport();
  await expect(page.getByTestId("rail-item-experience")).toHaveAttribute("data-active", "true");

  await expect(getStarted).not.toBeVisible();
});

test("desktop lower-page rail stays persistent and tracks sections", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");

  await page.evaluate(() => {
    document.getElementById("experience")?.scrollIntoView({ behavior: "instant", block: "center" });
  });

  const rail = page.getByTestId("experience-rail");
  await expect(rail).toBeVisible();

  await expect.poll(async () => rail.evaluate((node) => window.getComputedStyle(node).opacity)).toBe(
    "1",
  );

  const initialRailBox = await rail.boundingBox();
  expect(initialRailBox).not.toBeNull();
  expect(initialRailBox!.height).toBeGreaterThanOrEqual(1078);
  expect(initialRailBox!.x).toBeLessThan(220);

  const experienceHeading = page.getByRole("heading", {
    level: 2,
    name: /^The Experience$/i,
  });
  const experienceBox = await experienceHeading.boundingBox();
  expect(experienceBox).not.toBeNull();
  expect(experienceBox!.x).toBeGreaterThan(initialRailBox!.x + initialRailBox!.width + 24);
  expect(experienceBox!.x - (initialRailBox!.x + initialRailBox!.width)).toBeLessThan(90);

  await expect(page.getByText(/^Lower Page$/).first()).toHaveCount(0);
  await expect(
    page.getByText(/A continuous editorial story, designed to feel calm after the hero\./i),
  ).toHaveCount(0);
  await expect(
    page.getByText(/The walkthrough remains untouched above\./i),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /I.m based in New York, with a perspective shaped by living across the U\.S\. and abroad\./i,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /My work is influenced by a range of cultures and environments, resulting in pieces that feel personal, considered, and authentic to each event\./i,
    ),
  ).toBeVisible();
  await expect(page.getByText(/Section 01/i)).toHaveCount(0);

  const lowerPageIntro = page
    .getByRole("heading", {
      level: 1,
      name: /I.m based in New York, with a perspective shaped by living across the U\.S\. and abroad\./i,
    })
    .locator("xpath=..");
  await lowerPageIntro.screenshot({ path: "test-results/lower-page-intro.png" });

  const experienceItem = page.getByTestId("rail-item-experience");
  await expect(experienceItem).toHaveAttribute("data-active", "true");
  await expect(page.locator('[data-active="true"]')).toHaveCount(1);

  const activeRailDot = page.getByTestId("active-rail-dot");
  const railLine = rail.locator('.bg-gradient-to-b.from-\\[\\#efe1cc\\].via-\\[\\#ceb18a\\].to-\\[\\#efe1cc\\]').first();
  const experienceDot = experienceItem.locator("div").first();
  const bookingDot = page.getByTestId("rail-item-booking").locator("div").first();

  const getCenterY = async (locator: Locator) => {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return box!.y + box!.height / 2;
  };

  const getCenterX = async (locator: Locator) => {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return box!.x + box!.width / 2;
  };

  const initialActiveDotCenter = await getCenterY(activeRailDot);
  const experienceDotCenter = await getCenterY(experienceDot);
  expect(Math.abs(initialActiveDotCenter - experienceDotCenter)).toBeLessThanOrEqual(1);
  const activeRailDotCenterX = await getCenterX(activeRailDot);
  const railLineCenterX = await getCenterX(railLine);
  expect(Math.abs(activeRailDotCenterX - railLineCenterX)).toBeLessThanOrEqual(1);

  const firstSection = page.getByTestId("section-experience");
  await expect(firstSection).toBeVisible();
  await expect(
    firstSection.getByText(
      /I want the experience to feel personal from the very beginning/i,
    ),
  ).toBeVisible();

  const sectionBackground = await firstSection.evaluate((node) => {
    const style = window.getComputedStyle(node);
    return {
      backgroundColor: style.backgroundColor,
      borderTopWidth: style.borderTopWidth,
      borderRightWidth: style.borderRightWidth,
      borderBottomWidth: style.borderBottomWidth,
      borderLeftWidth: style.borderLeftWidth,
      borderRadius: style.borderRadius,
    };
  });
  expect(sectionBackground.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  expect(sectionBackground.borderTopWidth).toBe("0px");
  expect(sectionBackground.borderRightWidth).toBe("0px");
  expect(sectionBackground.borderBottomWidth).toBe("0px");
  expect(sectionBackground.borderLeftWidth).toBe("0px");

  const rightColumnContent = await firstSection.locator("div").evaluateAll((nodes) =>
    nodes.map((node) => window.getComputedStyle(node).backgroundColor),
  );
  expect(rightColumnContent).not.toContain("rgb(248, 238, 226)");

  const railProductsItem = page.getByTestId("rail-item-products");
  await expect(railProductsItem).toContainText("What’s Offered");
  await expect(rail).not.toContainText("What’s Included");
  await expect(rail).not.toContainText("Products & Pricing");
  const productsSubnav = page.getByTestId("rail-products-subnav");
  await expect(productsSubnav).toHaveAttribute("data-expanded", "false");

  const offeringSubitems = [
    "portraits-ink-watercolor",
    "digital-portraits",
    "custom-backgrounds",
    "motion",
    "custom-commissions",
  ] as const;
  for (const subitem of offeringSubitems) {
    await expect(page.getByTestId(`rail-subitem-${subitem}`)).toBeAttached();
  }

  await page.evaluate(() => {
    document.getElementById("products")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  const whatsOfferedSection = page.getByTestId("section-products");
  await expect(whatsOfferedSection).toBeVisible();
  await expect(productsSubnav).toHaveAttribute("data-expanded", "true");
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: /^What’s Offered$/i,
    }),
  ).toBeVisible();
  await expect(
    whatsOfferedSection.getByText(
      /Flexible by design,\s*so it can reflect your event naturally\./i,
    ),
  ).toHaveCount(0);
  await expect(whatsOfferedSection.getByText(/Selected Offering/i)).toHaveCount(0);

  await expect(
    whatsOfferedSection.getByText(/Offerings stay flexible while the presentation stays refined\./i),
  ).toHaveCount(0);
  await expect(whatsOfferedSection.getByText(/^Structure$/i)).toHaveCount(0);
  await expect(whatsOfferedSection.getByText(/^Add-Ons$/i)).toHaveCount(0);
  await expect(whatsOfferedSection.getByText(/^Tone$/i)).toHaveCount(0);

  const viewer = page.getByTestId("whats-included-viewer");
  await expect(viewer).toContainText("Watercolor Portraits");
  await expect(viewer).toContainText(
    /Hand-drawn portraits created in ink and watercolor, capturing each guest with a light, natural feel\./i,
  );
  await expect(page.getByTestId("offering-image-portraits-ink-watercolor")).toBeVisible();
  await expect(page.getByTestId("offering-image-portraits-ink-watercolor")).toHaveAttribute(
    "src",
    /ink-watercolor\.jpg/i,
  );
  const inkWatercolorFit = await page
    .getByTestId("offering-image-portraits-ink-watercolor")
    .evaluate((node) => window.getComputedStyle(node).objectFit);
  expect(inkWatercolorFit).toBe("contain");
  const inkFrameBox = await page.getByTestId("offering-sample-portraits-ink-watercolor").boundingBox();
  const inkFrameBackground = await page
    .getByTestId("offering-sample-portraits-ink-watercolor")
    .evaluate((node) => window.getComputedStyle(node).backgroundColor);
  const inkImagePadding = await page
    .getByTestId("offering-image-portraits-ink-watercolor")
    .evaluate((node) => window.getComputedStyle(node).padding);
  expect(inkFrameBox).not.toBeNull();
  expect(inkFrameBackground).toBe("rgba(0, 0, 0, 0)");
  expect(inkImagePadding).toBe("0px");
  await expect(viewer).not.toContainText("Digital Portraits");
  await expect(viewer).not.toContainText("Custom Backgrounds");
  await expect(viewer).not.toContainText("Motion");

  const activeViewer = page.getByTestId("offering-portraits-ink-watercolor");
  await expect(activeViewer).toHaveAttribute("data-visible", "true");
  await page
    .getByTestId("offering-sample-portraits-ink-watercolor")
    .screenshot({ path: "test-results/whats-included-ink-watercolor.png" });

  await page.getByTestId("rail-subitem-digital-portraits").click();
  await expect
    .poll(async () => page.getByTestId("whats-included-viewer").textContent())
    .toContain("Digital Portraits");
  await expect(page.getByTestId("offering-digital-portraits")).toHaveAttribute(
    "data-visible",
    "true",
  );
  await expect(page.getByTestId("offering-image-digital-portraits")).toHaveAttribute(
    "src",
    /digital_portrait\.png/i,
  );
  const digitalFrameBox = await page.getByTestId("offering-sample-digital-portraits").boundingBox();
  const digitalFrameBackground = await page
    .getByTestId("offering-sample-digital-portraits")
    .evaluate((node) => window.getComputedStyle(node).backgroundColor);
  const digitalImagePadding = await page
    .getByTestId("offering-image-digital-portraits")
    .evaluate((node) => window.getComputedStyle(node).padding);
  expect(digitalFrameBox).not.toBeNull();
  expect(digitalFrameBackground).toBe("rgba(0, 0, 0, 0)");
  expect(digitalImagePadding).toBe("0px");
  await expect(viewer).not.toContainText("Watercolor Portraits");
  await page
    .getByTestId("offering-sample-digital-portraits")
    .screenshot({ path: "test-results/whats-included-digital-portraits.png" });

  await page.getByTestId("rail-subitem-custom-backgrounds").click();
  await expect
    .poll(async () => page.getByTestId("whats-included-viewer").textContent())
    .toContain("Custom Backgrounds");
  await expect(page.getByTestId("offering-custom-backgrounds")).toHaveAttribute(
    "data-visible",
    "true",
  );
  await expect(page.getByTestId("offering-image-custom-backgrounds")).toHaveAttribute(
    "src",
    /background\.jpg/i,
  );
  const backgroundsFrameBox = await page
    .getByTestId("offering-sample-custom-backgrounds")
    .boundingBox();
  const backgroundsFrameBackground = await page
    .getByTestId("offering-sample-custom-backgrounds")
    .evaluate((node) => window.getComputedStyle(node).backgroundColor);
  const backgroundsImagePadding = await page
    .getByTestId("offering-image-custom-backgrounds")
    .evaluate((node) => window.getComputedStyle(node).padding);
  expect(backgroundsFrameBox).not.toBeNull();
  expect(backgroundsFrameBackground).toBe("rgba(0, 0, 0, 0)");
  expect(backgroundsImagePadding).toBe("0px");
  await page
    .getByTestId("offering-sample-custom-backgrounds")
    .screenshot({ path: "test-results/whats-included-custom-backgrounds.png" });

  await page.getByTestId("rail-subitem-motion").click();
  await expect
    .poll(async () => page.getByTestId("whats-included-viewer").textContent())
    .toContain("Motion");
  await expect(page.getByTestId("offering-motion")).toHaveAttribute("data-visible", "true");
  await expect(page.getByTestId("offering-video-motion")).toBeVisible();
  await expect(page.getByTestId("offering-video-motion")).toHaveAttribute("src", /motion\.mp4/i);
  await expect(page.getByTestId("offering-video-motion")).toHaveJSProperty("muted", true);
  await expect(page.getByTestId("offering-video-motion")).toHaveJSProperty("loop", true);
  await expect(page.getByTestId("offering-video-motion")).toHaveJSProperty("playsInline", true);
  await expect(viewer).not.toContainText("Custom Backgrounds");

  const motionFrameBox = await page.getByTestId("offering-sample-motion").boundingBox();
  const motionFrameBackground = await page
    .getByTestId("offering-sample-motion")
    .evaluate((node) => window.getComputedStyle(node).backgroundColor);
  expect(motionFrameBox).not.toBeNull();
  expect(motionFrameBackground).toBe("rgba(0, 0, 0, 0)");
  expect(Math.abs(inkFrameBox!.width - motionFrameBox!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(inkFrameBox!.height - motionFrameBox!.height)).toBeLessThanOrEqual(2);
  expect(Math.abs(digitalFrameBox!.width - motionFrameBox!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(digitalFrameBox!.height - motionFrameBox!.height)).toBeLessThanOrEqual(2);
  expect(Math.abs(backgroundsFrameBox!.width - motionFrameBox!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(backgroundsFrameBox!.height - motionFrameBox!.height)).toBeLessThanOrEqual(2);
  await page
    .getByTestId("offering-sample-motion")
    .screenshot({ path: "test-results/whats-included-motion.png" });

  await page.getByTestId("rail-subitem-custom-commissions").click();
  await expect
    .poll(async () => page.getByTestId("whats-included-viewer").textContent())
    .toContain("Custom Commissions");
  await expect(viewer).toContainText(
    "Available for pre-order, or if you want anything created, let's chat and see the possibilities!",
  );
  await expect(page.getByTestId("offering-placeholder-custom-commissions")).toBeVisible();
  const commissionsFrameBox = await page
    .getByTestId("offering-sample-custom-commissions")
    .boundingBox();
  expect(commissionsFrameBox).not.toBeNull();
  expect(Math.abs(commissionsFrameBox!.width - motionFrameBox!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(commissionsFrameBox!.height - motionFrameBox!.height)).toBeLessThanOrEqual(2);

  await page.evaluate(() => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "instant", block: "start" });
  });
  const bookingItem = page.getByTestId("rail-item-booking");
  await expect(bookingItem).toHaveAttribute("data-active", "true");
  await expect(page.locator('[data-active="true"]')).toHaveCount(1);
  await expect(productsSubnav).toHaveAttribute("data-expanded", "false");

  const bookingActiveDotCenter = await getCenterY(activeRailDot);
  expect(Math.abs(bookingActiveDotCenter - initialActiveDotCenter)).toBeGreaterThan(20);

  const afterScrollRailBox = await rail.boundingBox();
  expect(afterScrollRailBox).not.toBeNull();
  expect(afterScrollRailBox!.y).toBe(0);
  expect(afterScrollRailBox!.height).toBeGreaterThanOrEqual(1078);

  const aboutItem = page.getByTestId("rail-item-about");
  await aboutItem.click();
  await expect(page.getByTestId("rail-item-about")).toHaveAttribute("data-active", "true");
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: /^About Z\.YUE$/i,
    }),
  ).toBeInViewport();
  const aboutSection = page.getByTestId("section-about");
  await expect(
    aboutSection.getByText(/I’ve always drawn as a way of understanding people\./i),
  ).toBeVisible();
  await expect(
    aboutSection.getByText(
      /Not just how they look, but the small things — how they stand, how their clothing moves/i,
    ),
  ).toBeVisible();
  await expect(
    aboutSection.getByText(
      /My work is shaped by both my Asian and American background\./i,
    ),
  ).toBeVisible();
  await expect(
    aboutSection.getByText(
      /That’s what I try to create in every piece:\s*something personal, something thoughtful, something worth keeping\./i,
    ),
  ).toBeVisible();
  await expect(page.getByTestId("about-profile-image")).toBeVisible();
  await expect(page.getByTestId("about-profile-image").locator("img")).toHaveAttribute(
    "src",
    /profile_photo\.(png|jpg)/i,
  );
  const aboutImageState = await page
    .getByTestId("about-profile-image")
    .locator("img")
    .evaluate((node: HTMLImageElement) => ({
      complete: node.complete,
      naturalWidth: node.naturalWidth,
      currentSrc: node.currentSrc,
    }));
  expect(aboutImageState.complete).toBe(true);
  expect(aboutImageState.naturalWidth).toBeGreaterThan(0);
  expect(aboutImageState.currentSrc).toMatch(/(profile_photo\.(png|jpg)|_next\/image)/i);
  const aboutImageRequest = await page.request.get(aboutImageState.currentSrc);
  expect(aboutImageRequest.ok()).toBe(true);
  await expect(
    aboutSection.getByText(/The page ends with authorship, not filler\./i),
  ).toHaveCount(0);
  await expect(
    aboutSection.getByText(/The final impression should feel personal, memorable, and quietly definitive\./i),
  ).toHaveCount(0);
  await expect(aboutSection.locator("input, textarea, select, form")).toHaveCount(0);
  await aboutSection.screenshot({ path: "test-results/about-section-fixed.png" });

  const sectionIds = ["experience", "products", "gallery", "booking", "about"] as const;
  const sectionNames = {
    experience: "The Experience",
    products: "What’s Offered",
    gallery: "Gallery",
    booking: "Booking",
    about: "About Z.YUE",
  } as const;

  await page.evaluate(() => {
    document.getElementById("experience")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  const lowerPageBounds = await page.evaluate(() => {
    const first = document.getElementById("experience");
    const last = document.getElementById("about");
    if (!first || !last) return null;

    const firstTop = first.getBoundingClientRect().top + window.scrollY;
    const lastBottom = last.getBoundingClientRect().bottom + window.scrollY;
    return {
      start: Math.max(0, firstTop),
      end: Math.max(firstTop, lastBottom - window.innerHeight * 0.35),
    };
  });

  expect(lowerPageBounds).not.toBeNull();

  const stepCount = 16;
  const scrollDistance = lowerPageBounds!.end - lowerPageBounds!.start;

  for (let step = 0; step <= stepCount; step += 1) {
    const y = lowerPageBounds!.start + (scrollDistance * step) / stepCount;
    await page.evaluate((nextY) => {
      window.scrollTo({ top: nextY, behavior: "instant" });
    }, y);

    await expect(page.locator('[data-active="true"]')).toHaveCount(1);
    const activeItem = page.locator('[data-testid^="rail-item-"][data-active="true"]').first();
    const activeTestId = await activeItem.getAttribute("data-testid");
    const activeId = activeTestId?.replace("rail-item-", "");
    expect(activeId && sectionIds.includes(activeId as (typeof sectionIds)[number])).toBeTruthy();

    const activeItemDot = activeItem.locator("div").first();
    await expect
      .poll(
        async () => {
          const activeCenterY = await getCenterY(activeRailDot);
          const itemCenterY = await getCenterY(activeItemDot);
          return Math.abs(activeCenterY - itemCenterY);
        },
        {
          message: `dot misaligned at step ${step} for ${sectionNames[activeId as keyof typeof sectionNames]}`,
        },
      )
      .toBeLessThanOrEqual(1.5);

    await expect
      .poll(
        async () => {
          const activeCenterX = await getCenterX(activeRailDot);
          return Math.abs(activeCenterX - railLineCenterX);
        },
        {
          message: `dot drifted off rail at step ${step}`,
        },
      )
      .toBeLessThanOrEqual(1);
  }
});

test("lower-page sections stay dominant without introducing scroll snapping", async ({ page }) => {
  const verifySectionStaging = async (minNextHeadingTopRatio: number) => {
    const sectionPairs = [
      { currentId: "experience", nextHeading: /^What’s Offered$/i },
      { currentId: "products", nextHeading: /^Gallery$/i },
      { currentId: "gallery", nextHeading: /^Booking$/i },
      { currentId: "booking", nextHeading: /^About Z\.YUE$/i },
    ] as const;

    for (const pair of sectionPairs) {
      await page.evaluate((id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
      }, pair.currentId);

      const nextHeading = page.getByRole("heading", { level: 2, name: pair.nextHeading });
      const box = await nextHeading.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThan(page.viewportSize()!.height * minNextHeadingTopRatio);
    }
  };

  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");

  const scrollSnap = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).scrollSnapType,
    body: getComputedStyle(document.body).scrollSnapType,
  }));
  expect(scrollSnap.html).toBe("none");
  expect(scrollSnap.body).toBe("none");

  await page.evaluate(() => {
    document.getElementById("experience")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  const beforeScroll = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => {
    window.scrollBy({ top: 173, behavior: "instant" });
  });
  const afterScroll = await page.evaluate(() => window.scrollY);
  expect(afterScroll - beforeScroll).toBeGreaterThanOrEqual(170);
  expect(afterScroll - beforeScroll).toBeLessThanOrEqual(176);

  await verifySectionStaging(0.82);

  await expect(page.locator('[data-active="true"]')).toHaveCount(1);

  const desktopOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(desktopOverflow.scrollWidth).toBeLessThanOrEqual(desktopOverflow.clientWidth);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  const mobileScrollSnap = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).scrollSnapType,
    body: getComputedStyle(document.body).scrollSnapType,
  }));
  expect(mobileScrollSnap.html).toBe("none");
  expect(mobileScrollSnap.body).toBe("none");

  await verifySectionStaging(0.7);

  const mobileOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(mobileOverflow.scrollWidth).toBeLessThanOrEqual(mobileOverflow.clientWidth);
});

test("gallery section is visual-first and responsive", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");

  await page.evaluate(() => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  const gallerySection = page.getByTestId("section-gallery");
  await expect(gallerySection).toBeVisible();
  await expect(
    gallerySection.getByRole("heading", {
      level: 2,
      name: /^Gallery$/i,
    }),
  ).toHaveCount(1);
  await expect(gallerySection.locator("p")).toHaveCount(0);
  await expect(gallerySection.locator('[data-testid^="gallery-placeholder-"]')).toHaveCount(0);
  await expect(gallerySection.locator('[data-testid^="gallery-item-"]')).toHaveCount(3);

  const galleryItem1 = page.getByTestId("gallery-item-1");
  const galleryItem2 = page.getByTestId("gallery-item-2");
  const galleryItem3 = page.getByTestId("gallery-item-3");
  await expect(galleryItem1.locator("img")).toHaveAttribute("src", /Gallery_1\.jpg/i);
  await expect(galleryItem2.locator("img")).toHaveAttribute("src", /Gallery_2\.jpg/i);
  await expect(galleryItem3.locator("img")).toHaveAttribute("src", /Gallery_3\.(png|jpg)/i);

  const galleryItem1Box = await galleryItem1.boundingBox();
  const galleryItem2Box = await galleryItem2.boundingBox();
  const galleryItem3Box = await galleryItem3.boundingBox();
  expect(galleryItem1Box).not.toBeNull();
  expect(galleryItem2Box).not.toBeNull();
  expect(galleryItem3Box).not.toBeNull();
  expect(Math.abs(galleryItem1Box!.y - galleryItem2Box!.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(galleryItem2Box!.y - galleryItem3Box!.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(galleryItem1Box!.width - galleryItem2Box!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(galleryItem2Box!.width - galleryItem3Box!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(galleryItem1Box!.height - galleryItem2Box!.height)).toBeLessThanOrEqual(2);
  expect(Math.abs(galleryItem2Box!.height - galleryItem3Box!.height)).toBeLessThanOrEqual(2);

  const desktopGap12 = galleryItem2Box!.x - (galleryItem1Box!.x + galleryItem1Box!.width);
  const desktopGap23 = galleryItem3Box!.x - (galleryItem2Box!.x + galleryItem2Box!.width);
  expect(desktopGap12).toBeGreaterThan(0);
  expect(Math.abs(desktopGap12 - desktopGap23)).toBeLessThanOrEqual(4);

  const desktopOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(desktopOverflow.scrollWidth).toBeLessThanOrEqual(desktopOverflow.clientWidth);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.evaluate(() => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  const mobileGalleryItem2 = page.getByTestId("gallery-item-2");
  const mobileGalleryItem3 = page.getByTestId("gallery-item-3");
  const mobileGalleryItem1 = page.getByTestId("gallery-item-1");
  const mobileBox1 = await mobileGalleryItem1.boundingBox();
  const mobileBox2 = await mobileGalleryItem2.boundingBox();
  const mobileBox3 = await mobileGalleryItem3.boundingBox();
  expect(mobileBox1).not.toBeNull();
  expect(mobileBox2).not.toBeNull();
  expect(mobileBox3).not.toBeNull();
  expect(Math.abs(mobileBox1!.x - mobileBox2!.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(mobileBox2!.x - mobileBox3!.x)).toBeLessThanOrEqual(2);
  expect(mobileBox2!.y).toBeGreaterThan(mobileBox1!.y + mobileBox1!.height - 2);
  expect(mobileBox3!.y).toBeGreaterThan(mobileBox2!.y + mobileBox2!.height - 2);

  const mobileOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(mobileOverflow.scrollWidth).toBeLessThanOrEqual(mobileOverflow.clientWidth);
});

test("booking section uses one expanded path at a time", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");

  await page.evaluate(() => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  const bookingSection = page.getByTestId("section-booking");
  await expect(bookingSection).toBeVisible();
  await expect(
    bookingSection.getByRole("heading", {
      level: 2,
      name: /^Booking$/i,
    }),
  ).toBeVisible();
  const bookingSubtitle = bookingSection.locator("p").first();
  await expect(bookingSubtitle).toContainText(
    /Have a quick question\? I.m always happy to help-send a note\./i,
  );
  await expect(bookingSubtitle).toContainText(
    /If you.d rather talk it through together, we can set up a call\./i,
  );
  await expect(bookingSubtitle).not.toContainText(/Choose the path that feels easiest\./i);
  await expect
    .poll(async () => bookingSubtitle.evaluate((node) => node.innerHTML.includes("<br")))
    .toBe(true);

  await expect(
    bookingSection.getByText(/Booking should feel guided, calm, and immediate\./i),
  ).toHaveCount(0);
  await expect(
    bookingSection.getByText(/Once the user is convinced, the next step should arrive without friction\./i),
  ).toHaveCount(0);
  await expect(bookingSection.getByText(/^Inquiry$/i)).toHaveCount(0);
  await expect(bookingSection.getByText(/^Response$/i)).toHaveCount(0);
  await expect(bookingSection.getByText(/^Outcome$/i)).toHaveCount(0);
  await expect(
    bookingSection.getByText(/Reach out in the way that feels most natural\./i),
  ).toHaveCount(0);

  const inquiryToggle = page.getByTestId("booking-toggle-inquiry");
  const consultationToggle = page.getByTestId("booking-toggle-consultation");
  await expect(inquiryToggle).toBeVisible();
  await expect(consultationToggle).toBeVisible();
  await expect(inquiryToggle).toContainText(/^Send an Inquiry$/i);
  await expect(consultationToggle).toContainText(/^Book a Consultation$/i);
  await expect(inquiryToggle).toHaveAttribute("data-open", "false");
  await expect(consultationToggle).toHaveAttribute("data-open", "false");

  const inquiryPanel = page.getByTestId("booking-inquiry-panel");
  const consultationPanel = page.getByTestId("booking-consultation-panel");
  await expect(inquiryPanel).toHaveAttribute("data-visible", "false");
  await expect(consultationPanel).toHaveAttribute("data-visible", "false");

  const form = page.getByTestId("booking-form");
  await expect(page.getByTestId("booking-cal-iframe")).toHaveCount(0);

  await inquiryToggle.click();
  await expect(inquiryToggle).toHaveAttribute("data-open", "true");
  await expect(consultationToggle).toHaveAttribute("data-open", "false");
  await expect(inquiryPanel).toHaveAttribute("data-visible", "true");
  await expect(consultationPanel).toHaveAttribute("data-visible", "false");
  await expect(form).toBeVisible();
  await expect(form.getByLabel(/First name/i)).toBeVisible();
  await expect(form.getByLabel(/Last name/i)).toBeVisible();
  await expect(form.getByLabel(/^Email$/i)).toBeVisible();
  await expect(form.getByLabel(/Phone number/i)).toBeVisible();
  await expect(form.getByLabel(/Event date/i)).toBeVisible();
  await expect(form.getByLabel(/Estimated guest count/i)).toBeVisible();
  await expect(form.getByLabel(/Preferred offering/i)).toBeVisible();
  await expect(form.getByLabel(/Message/i)).toBeVisible();
  await expect(form.getByRole("button", { name: /Send Inquiry/i })).toBeVisible();
  await expect(
    bookingSection.getByText(
      /If it feels easier to talk things through together, you can open my consultation calendar/i,
    ),
  ).toHaveCount(0);

  await consultationToggle.click();
  await expect(inquiryToggle).toHaveAttribute("data-open", "false");
  await expect(consultationToggle).toHaveAttribute("data-open", "true");
  await expect(inquiryPanel).toHaveAttribute("data-visible", "false");
  await expect(consultationPanel).toHaveAttribute("data-visible", "true");

  const calEmbed = page.getByTestId("booking-cal-embed");
  await expect(calEmbed).toBeVisible();
  const calIframe = page.getByTestId("booking-cal-iframe");
  await expect(calIframe).toBeVisible();
  await expect(calIframe).toHaveAttribute(
    "src",
    /https:\/\/cal\.com\/zyue-illustrations\/intro\?embed=true/i,
  );
  await expect(
    bookingSection.getByText(
      /If it feels easier to talk things through together, you can choose a consultation time that works for you below\./i,
    ),
  ).toBeVisible();

  const desktopOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(desktopOverflow.scrollWidth).toBeLessThanOrEqual(desktopOverflow.clientWidth);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.evaluate(() => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "instant", block: "start" });
  });
  const mobileOverflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(mobileOverflow.scrollWidth).toBeLessThanOrEqual(mobileOverflow.clientWidth);

  await bookingSection.screenshot({ path: "test-results/booking-section.png" });
});

test("booking inquiry form submits with loading and success states", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  let inquiryRequests = 0;
  await page.route("**/api/inquiry", async (route) => {
    inquiryRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    });
  });

  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");
  const initialUrl = page.url();

  await page.evaluate(() => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  await page.getByTestId("booking-toggle-inquiry").click();
  const form = page.getByTestId("booking-form");
  await form.getByLabel(/First name/i).fill("Zoe");
  await form.getByLabel(/Last name/i).fill("Yue");
  await form.getByLabel(/^Email$/i).fill("zoe@example.com");
  await form.getByLabel(/Phone number/i).fill("555-123-4567");
  await form.getByLabel(/Event date/i).fill("2026-08-15");
  await form.getByLabel(/Estimated guest count/i).fill("120");
  await form.getByLabel(/Preferred offering/i).selectOption("Digital Portraits");
  await form.getByLabel(/Message/i).fill("Would love to learn more about availability.");

  const submitButton = page.getByTestId("booking-submit");
  await submitButton.click();
  await expect(submitButton).toBeDisabled();
  await expect(submitButton).toContainText(/Sending/i);

  const submitMessage = page.getByTestId("booking-submit-message");
  await expect(submitMessage).toContainText(
    /Inquiry sent\. I’ll follow up with availability, next steps, and any questions you have\./i,
  );
  await expect(submitButton).toBeEnabled();
  await expect(form.getByLabel(/First name/i)).toHaveValue("");
  expect(inquiryRequests).toBe(1);
  await expect(page).toHaveURL(initialUrl);
  expect(consoleErrors).toEqual([]);
});

test("booking inquiry form shows an error message when submission fails", async ({ page }) => {
  await page.route("**/api/inquiry", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Unable to send your inquiry right now." }),
    });
  });

  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");

  await page.evaluate(() => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  await page.getByTestId("booking-toggle-inquiry").click();
  const form = page.getByTestId("booking-form");
  await form.getByLabel(/First name/i).fill("Zoe");
  await form.getByLabel(/Last name/i).fill("Yue");
  await form.getByLabel(/^Email$/i).fill("zoe@example.com");
  await form.getByLabel(/Phone number/i).fill("555-123-4567");
  await form.getByLabel(/Event date/i).fill("2026-08-15");
  await form.getByLabel(/Estimated guest count/i).fill("120");
  await form.getByLabel(/Preferred offering/i).selectOption("Motion");
  await form.getByLabel(/Message/i).fill("Checking in about a consultation.");

  const submitButton = page.getByTestId("booking-submit");
  await submitButton.click();

  await expect(page.getByTestId("booking-submit-message")).toContainText(
    /Unable to send your inquiry right now\./i,
  );
  await expect(submitButton).toBeEnabled();
});

test("about portrait renders correctly without load errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");

  await page.evaluate(() => {
    document.getElementById("about")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  const aboutSection = page.getByTestId("section-about");
  await expect(aboutSection).toBeVisible();
  await expect(
    aboutSection.getByRole("heading", {
      level: 2,
      name: /^About Z\.YUE$/i,
    }),
  ).toBeVisible();
  await expect(
    aboutSection.getByText(/I’ve always drawn as a way of understanding people\./i),
  ).toBeVisible();
  await expect(
    aboutSection.getByText(
      /Not just how they look, but the small things — how they stand, how their clothing moves/i,
    ),
  ).toBeVisible();

  const portrait = page.getByTestId("about-profile-image").locator("img");
  await expect(portrait).toBeVisible();
  await expect(portrait).toHaveAttribute("src", /profile_photo\.(png|jpg)/i);

  const portraitState = await portrait.evaluate((node: HTMLImageElement) => ({
    complete: node.complete,
    naturalWidth: node.naturalWidth,
    naturalHeight: node.naturalHeight,
    currentSrc: node.currentSrc,
  }));

  expect(portraitState.complete).toBe(true);
  expect(portraitState.naturalWidth).toBeGreaterThan(0);
  expect(portraitState.naturalHeight).toBeGreaterThan(0);
  expect(portraitState.currentSrc).toMatch(/(profile_photo\.(png|jpg)|_next\/image)/i);

  const portraitResponse = await page.request.get(portraitState.currentSrc);
  expect(portraitResponse.ok()).toBe(true);

  expect(
    consoleErrors.filter((message) =>
      /profile_photo|failed to load resource|decode|unsupported image|image/i.test(message),
    ),
  ).toHaveLength(0);

  await aboutSection.screenshot({ path: "test-results/about-section-fixed.png" });
});

test("gallery 3 renders correctly without load errors", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto("/");

  await page.evaluate(() => {
    document.getElementById("gallery")?.scrollIntoView({ behavior: "instant", block: "start" });
  });

  const gallerySection = page.getByTestId("section-gallery");
  await expect(gallerySection).toBeVisible();

  const galleryItem1 = page.getByTestId("gallery-item-1").locator("img");
  const galleryItem2 = page.getByTestId("gallery-item-2").locator("img");
  const galleryItem3 = page.getByTestId("gallery-item-3").locator("img");

  await expect(galleryItem1).toBeVisible();
  await expect(galleryItem2).toBeVisible();
  await expect(galleryItem3).toBeVisible();

  await expect(galleryItem1).toHaveAttribute("src", /Gallery_1\.jpg/i);
  await expect(galleryItem2).toHaveAttribute("src", /Gallery_2\.jpg/i);
  await expect(galleryItem3).toHaveAttribute("src", /Gallery_3\.(png|jpg)/i);

  await expect
    .poll(async () =>
      galleryItem3.evaluate((node: HTMLImageElement) => ({
        complete: node.complete,
        naturalWidth: node.naturalWidth,
        naturalHeight: node.naturalHeight,
        currentSrc: node.currentSrc,
      })),
    )
    .toMatchObject({
      complete: true,
    });

  const gallery3State = await galleryItem3.evaluate((node: HTMLImageElement) => ({
    complete: node.complete,
    naturalWidth: node.naturalWidth,
    naturalHeight: node.naturalHeight,
    currentSrc: node.currentSrc,
  }));

  expect(gallery3State.naturalWidth).toBeGreaterThan(0);
  expect(gallery3State.naturalHeight).toBeGreaterThan(0);
  expect(gallery3State.currentSrc).toMatch(/(Gallery_3\.(png|jpg)|_next\/image)/i);

  const gallery3Response = await page.request.get(gallery3State.currentSrc);
  expect(gallery3Response.ok()).toBe(true);

  const galleryBoxes = await Promise.all([
    page.getByTestId("gallery-item-1").boundingBox(),
    page.getByTestId("gallery-item-2").boundingBox(),
    page.getByTestId("gallery-item-3").boundingBox(),
  ]);

  expect(galleryBoxes[0]).not.toBeNull();
  expect(galleryBoxes[1]).not.toBeNull();
  expect(galleryBoxes[2]).not.toBeNull();
  expect(Math.abs(galleryBoxes[0]!.width - galleryBoxes[1]!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(galleryBoxes[1]!.width - galleryBoxes[2]!.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(galleryBoxes[0]!.height - galleryBoxes[1]!.height)).toBeLessThanOrEqual(2);
  expect(Math.abs(galleryBoxes[1]!.height - galleryBoxes[2]!.height)).toBeLessThanOrEqual(2);

  expect(
    consoleErrors.filter((message) =>
      /Gallery_3|failed to load resource|decode|unsupported image|image/i.test(message),
    ),
  ).toHaveLength(0);

  await gallerySection.screenshot({ path: "test-results/gallery-section-fixed.png" });
});

for (const viewport of [
  { label: "1440", width: 1440, height: 900 },
  { label: "768", width: 768, height: 1024 },
  { label: "375", width: 375, height: 812 },
] as const) {
  test(`about biography typography stays consistent at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

    await page.evaluate(() => {
      document.getElementById("about")?.scrollIntoView({ behavior: "instant", block: "start" });
    });

    const aboutSection = page.getByTestId("section-about");
    await expect(aboutSection).toBeVisible();
    await expect(
      aboutSection.getByText(
        "I’ve always drawn as a way of understanding people—not just how they look, but the small details that make them feel like themselves.",
      ),
    ).toBeVisible();
    await expect(
      aboutSection.getByText(
        "There’s something about watching someone recognize themselves in a piece—and feel seen in a way they didn’t expect. That’s what I try to create: something personal, thoughtful, and worth keeping.",
      ),
    ).toBeVisible();

    const paragraphs = aboutSection.locator("p").filter({
      hasNot: aboutSection.getByTestId("about-profile-image"),
    });

    const styles = await paragraphs.evaluateAll((nodes) =>
      nodes
        .filter((node) => node.textContent && node.textContent.trim().length > 0)
        .map((node) => {
          const style = window.getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return {
            text: node.textContent?.trim() ?? "",
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
            fontWeight: style.fontWeight,
            color: style.color,
            top: rect.top,
            height: rect.height,
          };
        }),
    );

    const bioStyles = styles.filter(
      ({ text }) =>
        text.includes("I’ve always drawn as a way of understanding people") ||
        text.includes("I grew up filling notebooks") ||
        text.includes("My work is shaped by both my background and my travels") ||
        text.includes("In my free time, I’m often attempting to keep plants alive") ||
        text.includes("I believe a portrait should reflect more than a likeness") ||
        text.includes("There’s something about watching someone recognize themselves"),
    );

    expect(bioStyles).toHaveLength(6);
    const [firstStyle] = bioStyles;
    for (const style of bioStyles) {
      expect(style.fontSize).toBe(firstStyle.fontSize);
      expect(style.lineHeight).toBe(firstStyle.lineHeight);
      expect(style.fontWeight).toBe(firstStyle.fontWeight);
      expect(style.color).toBe(firstStyle.color);
    }

    for (let index = 1; index < bioStyles.length; index += 1) {
      const previous = bioStyles[index - 1];
      const current = bioStyles[index];
      const gap = current.top - (previous.top + previous.height);
      expect(gap).toBeGreaterThanOrEqual(24);
      expect(gap).toBeLessThanOrEqual(48);
    }

    const aboutImageBox = await page.getByTestId("about-profile-image").boundingBox();
    expect(aboutImageBox).not.toBeNull();

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    await aboutSection.screenshot({
      path: `test-results/about-biography-${viewport.label}.png`,
    });
  });
}

for (const viewport of RESPONSIVE_VIEWPORTS) {
  test(`responsive layout stays clean at ${viewport.label}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

    const label = page.getByText(/^Z\.YUE Studio$/);
    const title = page.getByRole("heading", {
      name: /^Where Moments Begin—And Become Something You Can Hold\.$/,
    });
    const subhead = page.getByText(
      /^Live portraits, created in real time—capturing people, moments, and atmosphere\.$/,
    );
    const scrollCue = page.getByTestId("hero-scroll-cue");

    await expect(label).toBeVisible();
    await expect(title).toBeVisible();
    await expect(subhead).toBeVisible();
    await expect(scrollCue).toBeVisible();

    const [titleBox, subheadBox] = await Promise.all([title.boundingBox(), subhead.boundingBox()]);
    expect(titleBox).not.toBeNull();
    expect(subheadBox).not.toBeNull();
    expect(titleBox!.x).toBeGreaterThanOrEqual(0);
    expect(titleBox!.x + titleBox!.width).toBeLessThanOrEqual(viewport.width);
    expect(subheadBox!.x).toBeGreaterThanOrEqual(0);
    expect(subheadBox!.x + subheadBox!.width).toBeLessThanOrEqual(viewport.width);

    await page.evaluate(() => {
      window.scrollTo({ top: 1250, behavior: "instant" });
    });

    const getStarted = page.getByTestId("hero-get-started");
    await expect(getStarted).toBeVisible();
    await getStarted.click();
    await expect(page.getByTestId("section-experience")).toBeInViewport();

    const rail = page.getByTestId("experience-rail");
    if (viewport.width >= 1280) {
      await expect(rail).toBeVisible();
    } else {
      await expect(rail).toBeHidden();
    }

    await page.evaluate(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "instant", block: "start" });
    });

    const whatsIncluded = page.getByTestId("section-products");
    await expect(whatsIncluded).toBeVisible();
    await expect(whatsIncluded).toContainText("What’s Offered");
    await expect(whatsIncluded).not.toContainText("What’s Included");

    if (viewport.width >= 1280) {
      await page.getByTestId("rail-subitem-custom-commissions").click();
    } else {
      await page.getByTestId("offering-selector-custom-commissions").click();
    }
    await expect(page.getByTestId("whats-included-viewer")).toContainText("Custom Commissions");
    await expect(page.getByTestId("whats-included-viewer")).toContainText(
      "Available for pre-order, or if you want anything created, let's chat and see the possibilities!",
    );
    await expect(page.getByTestId("offering-sample-custom-commissions")).toBeVisible();

    await page.evaluate(() => {
      document.getElementById("gallery")?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    const gallerySection = page.getByTestId("section-gallery");
    await expect(gallerySection).toBeVisible();
    await expect(gallerySection.locator('[data-testid^="gallery-item-"]')).toHaveCount(3);
    for (const id of ["gallery-item-1", "gallery-item-2", "gallery-item-3"] as const) {
      const image = page.getByTestId(id).locator("img");
      await expect(image).toBeVisible();
      await expect
        .poll(() =>
          image.evaluate((node: HTMLImageElement) => ({
            complete: node.complete,
            naturalWidth: node.naturalWidth,
          })),
        )
        .toMatchObject({ complete: true });
    }

    await page.evaluate(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    const inquiryToggle = page.getByTestId("booking-toggle-inquiry");
    const consultationToggle = page.getByTestId("booking-toggle-consultation");
    await expect(inquiryToggle).toBeVisible();
    await expect(consultationToggle).toBeVisible();
    if (viewport.width < 640) {
      const inquiryBox = await inquiryToggle.boundingBox();
      const consultationBox = await consultationToggle.boundingBox();
      expect(inquiryBox).not.toBeNull();
      expect(consultationBox).not.toBeNull();
      expect(consultationBox!.y).toBeGreaterThan(inquiryBox!.y + inquiryBox!.height - 2);
    }
    await inquiryToggle.click();
    await expect(page.getByTestId("booking-form")).toBeVisible();
    await consultationToggle.click();
    await expect(page.getByTestId("booking-cal-embed")).toBeVisible();
    await expect(page.getByTestId("booking-cal-iframe")).toBeVisible();

    await page.evaluate(() => {
      document.getElementById("about")?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    const aboutImage = page.getByTestId("about-profile-image").locator("img");
    await expect(aboutImage).toBeVisible();
    await expect
      .poll(() =>
        aboutImage.evaluate((node: HTMLImageElement) => ({
          complete: node.complete,
          naturalWidth: node.naturalWidth,
        })),
      )
      .toMatchObject({ complete: true });

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    expect(consoleErrors).toEqual([]);

    await page.screenshot({
      path: `test-results/responsive-${viewport.label}.png`,
      fullPage: true,
    });
  });
}

for (const viewport of RESPONSIVE_VIEWPORTS.filter(({ width }) => width <= 430)) {
  test(`mobile nav stays accessible at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");

    await page.evaluate(() => {
      window.scrollTo({ top: 1250, behavior: "instant" });
    });
    await page.getByTestId("hero-get-started").click();

    const mobileNav = page.getByTestId("mobile-top-nav");
    await expect(mobileNav).toBeVisible();

    for (const sectionId of ["experience", "products", "gallery", "booking", "about"] as const) {
      await page.evaluate((id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
      }, sectionId);

      const activeButton = page.getByTestId(`mobile-nav-item-${sectionId}`);
      await expect(activeButton).toBeVisible();

      await expect
        .poll(async () => {
          const navBox = await mobileNav.boundingBox();
          const buttonBox = await activeButton.boundingBox();
          if (!navBox || !buttonBox) return false;
          return (
            buttonBox.x >= navBox.x - 1 &&
            buttonBox.x + buttonBox.width <= navBox.x + navBox.width + 1
          );
        })
        .toBe(true);
    }

    await page.evaluate(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "instant", block: "start" });
    });

    const selectorWrap = page.getByTestId("mobile-offering-selector-wrap");
    const selector = page.getByTestId("mobile-offering-selector");
    await expect(selectorWrap).toBeVisible();
    await expect(selector).toBeVisible();

    const initialSelectorTop = await selectorWrap.evaluate((node) => Math.round(node.getBoundingClientRect().top));

    await page.mouse.wheel(0, 900);
    await expect(selectorWrap).toBeVisible();
    const stickySelectorTop = await selectorWrap.evaluate((node) => Math.round(node.getBoundingClientRect().top));
    expect(Math.abs(stickySelectorTop - initialSelectorTop)).toBeLessThanOrEqual(4);

    await page.getByTestId("offering-selector-digital-portraits").click();
    await expect(page.getByTestId("whats-included-viewer")).toContainText("Digital Portraits");

    await page.mouse.wheel(0, 500);
    await expect(selectorWrap).toBeVisible();
    await page.getByTestId("offering-selector-motion").click();
    await expect(page.getByTestId("whats-included-viewer")).toContainText("Motion");

    const navBox = await mobileNav.boundingBox();
    const selectorWrapBox = await selectorWrap.boundingBox();
    expect(navBox).not.toBeNull();
    expect(selectorWrapBox).not.toBeNull();
    expect(selectorWrapBox!.y).toBeGreaterThanOrEqual(navBox!.y + navBox!.height - 1);

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);

    await page.screenshot({
      path: `test-results/mobile-nav-${viewport.label}.png`,
      fullPage: true,
    });
  });
}

for (const viewport of [
  { label: "1440x900", width: 1440, height: 900 },
  { label: "768x1024", width: 768, height: 1024 },
  { label: "375x812", width: 375, height: 812 },
  { label: "390x844", width: 390, height: 844 },
] as const) {
  test(`what's offered labels and custom commissions work at ${viewport.label}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await page.evaluate(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "instant", block: "start" });
    });

    await expect(page.getByText("What’s Included")).toHaveCount(0);

    if (viewport.width >= 1280) {
      await expect(page.getByTestId("rail-item-products")).toContainText("What’s Offered");
      await expect(page.getByTestId("rail-subitem-portraits-ink-watercolor")).toContainText(
        "Watercolor Portraits",
      );
    } else {
      await expect(page.getByTestId("mobile-nav-item-products")).toContainText("What’s Offered");
    }

    await page.evaluate(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "instant", block: "start" });
    });

    const section = page.getByTestId("section-products");
    await expect(section).toContainText("What’s Offered");
    await expect(section).toContainText("Watercolor Portraits");

    const selectorTarget =
      viewport.width >= 1280
        ? page.getByTestId("rail-subitem-custom-commissions")
        : page.getByTestId("offering-selector-custom-commissions");
    await expect(selectorTarget).toBeVisible();
    await selectorTarget.click();

    const viewer = page.getByTestId("whats-included-viewer");
    await expect(viewer).toContainText("Custom Commissions");
    await expect(viewer).toContainText(
      "Available for pre-order, or if you want anything created, let's chat and see the possibilities!",
    );
    await expect(page.getByTestId("offering-placeholder-custom-commissions")).toBeVisible();

    const placeholderBox = await page
      .getByTestId("offering-sample-custom-commissions")
      .boundingBox();
    const motionTarget =
      viewport.width >= 1280
        ? page.getByTestId("rail-subitem-motion")
        : page.getByTestId("offering-selector-motion");
    await motionTarget.click();
    const motionBox = await page.getByTestId("offering-sample-motion").boundingBox();
    expect(placeholderBox).not.toBeNull();
    expect(motionBox).not.toBeNull();
    expect(Math.abs(placeholderBox!.width - motionBox!.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(placeholderBox!.height - motionBox!.height)).toBeLessThanOrEqual(2);

    if (viewport.width <= 390) {
      const commissionsButton = page.getByTestId("offering-selector-custom-commissions");
      const whiteSpace = await commissionsButton.evaluate(
        (node) => window.getComputedStyle(node).whiteSpace,
      );
      const buttonBox = await commissionsButton.boundingBox();
      expect(buttonBox).not.toBeNull();
      expect(whiteSpace).toBe("nowrap");
      expect(buttonBox!.height).toBeLessThanOrEqual(44);
    }

    const overflow = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
  });
}
