import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const INQUIRY_DESTINATION = "z.yue.illustrations@gmail.com";

type InquiryPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventDate: string;
  guestCount: string;
  preferredOffering: string;
  message: string;
};

const requiredFields: Array<keyof Pick<InquiryPayload, "firstName" | "lastName" | "email" | "message">> =
  ["firstName", "lastName", "email", "message"];

const normalizePayload = (payload: unknown): InquiryPayload => {
  const source = typeof payload === "object" && payload !== null ? payload : {};

  return {
    firstName: String((source as Record<string, unknown>).firstName ?? "").trim(),
    lastName: String((source as Record<string, unknown>).lastName ?? "").trim(),
    email: String((source as Record<string, unknown>).email ?? "").trim(),
    phone: String((source as Record<string, unknown>).phone ?? "").trim(),
    eventDate: String((source as Record<string, unknown>).eventDate ?? "").trim(),
    guestCount: String((source as Record<string, unknown>).guestCount ?? "").trim(),
    preferredOffering: String((source as Record<string, unknown>).preferredOffering ?? "").trim(),
    message: String((source as Record<string, unknown>).message ?? "").trim(),
  };
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const buildEmailText = (payload: InquiryPayload) => `
New inquiry from the Booking form

Name: ${payload.firstName} ${payload.lastName}
Email: ${payload.email}
Phone: ${payload.phone || "Not provided"}
Event date: ${payload.eventDate || "Not provided"}
Estimated guest count: ${payload.guestCount || "Not provided"}
Preferred offering: ${payload.preferredOffering || "Not provided"}

Message:
${payload.message}
`.trim();

export async function POST(request: Request) {
  try {
    const payload = normalizePayload(await request.json());

    for (const field of requiredFields) {
      if (!payload[field]) {
        return NextResponse.json(
          { error: "Please complete the required inquiry fields before sending." },
          { status: 400 },
        );
      }
    }

    if (!isValidEmail(payload.email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: "Z.YUE Inquiry <onboarding@resend.dev>",
      to: INQUIRY_DESTINATION,
      replyTo: payload.email,
      subject: `New inquiry from ${payload.firstName} ${payload.lastName}`,
      text: buildEmailText(payload),
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry submission failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to send your inquiry right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
