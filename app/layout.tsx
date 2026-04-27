import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Z.YUE Studio | Live Event Illustration & Cultural Portraits",
  description:
    "Live event illustration and custom cultural portraits featuring watercolor, ink sketches, and digital artwork. Specializing in weddings, bar and bat mitzvahs, Asian-inspired designs, corporate events, and bespoke commissions in New York, Los Angeles, and beyond.",
  keywords: [
    "cultural illustration",
    "asian American illustration",
    "cultural portraits",
    "Asian inspired art",
    "live event illustration",
    "live event sketching",
    "live wedding painter",
    "live wedding illustrator",
    "bar mitzvah illustrator",
    "bat mitzvah artist",
    "event portrait artist",
    "custom portraits",
    "digital illustration",
    "watercolor portraits",
    "ink sketches",
    "custom commissions",
    "bespoke artwork",
    "wedding illustration",
    "corporate event illustration",
    "birthday party artist",
    "celebration artist",
    "New York event illustrator",
    "Los Angeles event illustrator",
    "NYC live illustrator",
    "LA live illustrator",
  ],
  openGraph: {
    title: "Z.YUE Studio | Live Event Illustration & Custom Commissions",
    description:
      "Live watercolor, ink, and digital portraits with cultural influences for weddings, bar mitzvahs, celebrations, and corporate events.",
    siteName: "Z.YUE Studio",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-stone-950 text-stone-100 antialiased">{children}</body>
    </html>
  );
}
