"use client";

type WhatsIncludedOffering = {
  id: string;
  label: string;
  title: string;
  description: string;
};

type SeamlessExperienceDetail = {
  label: string;
  value: string;
};

type SeamlessExperienceSection = {
  id: string;
  label: string;
  kicker: string;
  title: string;
  lede: string;
  paragraphs: string[];
  details: SeamlessExperienceDetail[];
  highlights: string[];
  closing: string;
};

export const WHATS_INCLUDED_OFFERINGS: readonly WhatsIncludedOffering[] = [
  {
    id: "portraits-ink-watercolor",
    label: "Watercolor Portraits",
    title: "Watercolor Portraits",
    description:
      "Hand-drawn portraits created in ink and watercolor, capturing each guest with a light, natural feel. These are finished on paper and designed to be simple, timeless keepsakes.",
  },
  {
    id: "digital-portraits",
    label: "Digital Portraits",
    title: "Digital Portraits",
    description:
      "Digitally illustrated portraits with the same soft, minimal approach. Ideal for events that want flexibility, faster turnaround, or easy sharing afterward.",
  },
  {
    id: "custom-backgrounds",
    label: "Custom Backgrounds",
    title: "Custom Backgrounds",
    description:
      "Optional backgrounds that add a sense of place — from subtle color washes to elements inspired by your venue, culture, or theme. Designed to complement the portrait without overpowering it.",
  },
  {
    id: "motion",
    label: "Motion",
    title: "Motion",
    description:
      "A subtle animated version of the portrait, available for digital pieces. Designed for digital sharing, this adds a quiet sense of movement without taking away from the original illustration.",
  },
  {
    id: "custom-commissions",
    label: "Custom Commissions",
    title: "Custom Commissions",
    description:
      "Available for pre-order, or if you want anything created, let's chat and see the possibilities!",
  },
] as const;

export const SEAMLESS_EXPERIENCE_CONTENT: readonly SeamlessExperienceSection[] = [
  {
    id: "experience",
    label: "The Experience",
    kicker: "",
    title: "The Experience",
    lede:
      "I want the experience to feel personal from the very beginning — something that quietly reflects what matters most to you.",
    paragraphs: [
      "During our consultation, we’ll talk through the details together. That might be cultural elements, small personal touches, or simply the atmosphere you want to create. From there, everything is shaped around you.",
      "On the day of the event, I settle into the space and work alongside the flow of the room. Guests can stop by for a quick photo, which I use as reference as I sketch and paint throughout the evening. They often come back to check in, seeing their portrait slowly come to life.",
      "By the end of the night, many pieces are ready to take home. Anything unfinished is completed afterward and sent to you. You can choose between paper portraits or a digital format — whatever feels right for you.",
      "More than anything, it becomes something you share with your guests — a small, thoughtful part of the event that feels like you.",
    ],
    details: [],
    highlights: [],
    closing: "",
  },
  {
    id: "products",
    label: "What’s Offered",
    kicker: "",
    title: "What’s Offered",
    lede: "",
    paragraphs: [],
    details: [],
    highlights: [],
    closing: "",
  },
  {
    id: "gallery",
    label: "Gallery",
    kicker: "",
    title: "Gallery",
    lede: "",
    paragraphs: [],
    details: [],
    highlights: [],
    closing: "",
  },
  {
    id: "booking",
    label: "Booking",
    kicker: "",
    title: "Booking",
    lede: "Choose the path that feels easiest.",
    paragraphs: [],
    details: [],
    highlights: [],
    closing: "",
  },
  {
    id: "about",
    label: "About Z.Yue",
    kicker: "",
    title: "About Z.YUE",
    lede: "",
    paragraphs: [
      "I’ve always drawn as a way of understanding people—not just how they look, but the small details that make them feel like themselves.",
      "I grew up filling notebooks with places and people I wanted to remember. What began as something personal has become a way to create pieces others can keep and return to.",
      "My work is shaped by both my background and my travels. You’ll see it in the balance of simplicity and detail, and in the custom elements woven into each piece—whether cultural, architectural, or personal.",
      "In my free time, I’m often attempting to keep plants alive—an ongoing exercise in patience and attention, much like the process behind each piece.",
      "I believe a portrait should reflect more than a likeness. It should reflect what matters.",
      "There’s something about watching someone recognize themselves in a piece—and feel seen in a way they didn’t expect. That’s what I try to create: something personal, thoughtful, and worth keeping.",
    ],
    details: [],
    highlights: [],
    closing: "",
  },
] as const;
