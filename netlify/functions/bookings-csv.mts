import type { Config, Context } from "@netlify/functions";
import { getInquiryStore } from "./_shared/store.mjs";

type Inquiry = Record<string, unknown> & { submittedAt?: string; addons?: string[] };

const HEADERS = [
  "Inquiry ID",
  "Submitted At",
  "Status",
  "Name",
  "Phone",
  "Email",
  "Style",
  "Add-ons",
  "Preferred Date",
  "Preferred Time",
  "Notes",
  "Referral Source",
  "Inspiration Photo",
  "Policies Agreed",
  "Agreed At"
];

const csvCell = (value: unknown) => {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
};

export default async (request: Request, context: Context) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const expectedToken = Netlify.env.get("BOOKINGS_EXPORT_TOKEN");
  const providedToken = new URL(request.url).searchParams.get("token");
  if (!expectedToken || providedToken !== expectedToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const store = getInquiryStore(context);
  const { blobs } = await store.list({ prefix: "inquiries/" });
  const rows = await Promise.all(
    blobs.map(async ({ key }) => store.get(key, { type: "json" }) as Promise<Inquiry | null>)
  );

  const sorted = rows
    .filter((row): row is Inquiry => Boolean(row))
    .sort((a, b) => String(b.submittedAt || "").localeCompare(String(a.submittedAt || "")));

  const lines = [HEADERS.map(csvCell).join(",")];
  for (const row of sorted) {
    lines.push([
      row.inquiryId,
      row.submittedAt,
      row.status,
      row.name,
      row.phone,
      row.email,
      row.service,
      Array.isArray(row.addons) ? row.addons.join(", ") : "",
      row.preferredDate,
      row.preferredTime,
      row.notes,
      row.referralSource,
      row.inspirationPhotoName,
      row.policiesAgreed,
      row.policiesAgreedAt
    ].map(csvCell).join(","));
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
};

export const config: Config = {
  path: "/bookings.csv"
};
