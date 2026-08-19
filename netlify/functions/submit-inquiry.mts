import type { Config, Context } from "@netlify/functions";
import { getInquiryStore } from "./_shared/store.mjs";

type InquiryPayload = {
  inquiryId?: string;
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  addons?: string[];
  preferredDate?: string;
  preferredTime?: string;
  notes?: string;
  referralSource?: string;
  inspirationPhotoName?: string;
  policiesAgreed?: string;
  policiesAgreedAt?: string;
  source?: string;
  botField?: string;
};

const clean = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export default async (request: Request, context: Context) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const payload = (await request.json()) as InquiryPayload;
    if (clean(payload.botField)) {
      return Response.json({ ok: true });
    }

    const name = clean(payload.name, 120);
    const phone = clean(payload.phone, 40);
    const email = clean(payload.email, 180).toLowerCase();
    const service = clean(payload.service, 120);
    const preferredDate = clean(payload.preferredDate, 20);
    const preferredTime = clean(payload.preferredTime, 20);
    const policiesAgreed = clean(payload.policiesAgreed, 10);

    if (!name || !phone || !email || !service || !preferredDate || !preferredTime || policiesAgreed !== "yes") {
      return Response.json({ error: "Please complete every required field." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const submittedAt = new Date().toISOString();
    const generatedId = `JHB-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
    const inquiryId = clean(payload.inquiryId, 80) || generatedId;
    const addons = Array.isArray(payload.addons)
      ? payload.addons.map((item) => clean(item, 80)).filter(Boolean).slice(0, 8)
      : [];

    const inquiry = {
      inquiryId,
      submittedAt,
      status: "New",
      name,
      phone,
      email,
      service,
      addons,
      preferredDate,
      preferredTime,
      notes: clean(payload.notes, 2000),
      referralSource: clean(payload.referralSource, 120),
      inspirationPhotoName: clean(payload.inspirationPhotoName, 240),
      policiesAgreed,
      policiesAgreedAt: clean(payload.policiesAgreedAt, 50),
      source: clean(payload.source, 60) || "website"
    };

    const store = getInquiryStore(context);
    await store.setJSON(`inquiries/${submittedAt}-${inquiryId}.json`, inquiry);

    return Response.json({ ok: true, inquiryId });
  } catch (error) {
    console.error("Inquiry submission failed", error);
    return Response.json({ error: "Your inquiry could not be saved. Please try again." }, { status: 500 });
  }
};

export const config: Config = {
  path: "/api/inquiries"
};
