import { getDeployStore, getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

const STORE_NAME = "booking-inquiries";

export function getInquiryStore(context: Context) {
  return context.deploy.context === "production"
    ? getStore(STORE_NAME, { consistency: "strong" })
    : getDeployStore(STORE_NAME, { consistency: "strong" });
}
