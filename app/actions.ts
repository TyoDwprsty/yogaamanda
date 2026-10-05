"use server";

import { headers } from "next/headers";
import { messageInputSchema } from "@/lib/content/schema";
import { getContent } from "@/lib/content/store";
import { addMessage } from "@/lib/messages";

export type ContactState = {
  status: "idle" | "ok" | "error";
  message?: string;
  sentAt?: number;
  /** Echoed back on error so the form keeps what the visitor typed. */
  values?: Partial<Record<"name" | "phone" | "email" | "note", string>>;
  fieldErrors?: Partial<Record<"name" | "phone" | "email" | "note", string>>;
};

// Simple per-IP throttle; resets when the server restarts.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("website")) return { status: "ok" };

  const values = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    note: String(formData.get("note") ?? ""),
  };
  // A page opened before the admin hid the form can still post; turn those away too.
  if (!(await getContent()).contact.showForm) {
    return { status: "error", message: "Form pesan sedang ditutup. Hubungi lewat email atau telepon, ya.", values };
  }

  const parsed = messageInputSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ContactState["fieldErrors"]>;
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Periksa lagi isian yang ditandai.", fieldErrors, values };
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    return { status: "error", message: "Terlalu banyak pesan. Coba lagi beberapa menit lagi.", values };
  }
  hits.set(ip, [...recent, now]);

  try {
    await addMessage(parsed.data);
  } catch (err) {
    console.error("sendMessage failed", err);
    return { status: "error", message: "Pesan gagal terkirim. Coba lagi sebentar lagi, atau kirim lewat email.", values };
  }
  return { status: "ok", message: "Pesan terkirim. Terima kasih sudah menyapa!", sentAt: Date.now() };
}
