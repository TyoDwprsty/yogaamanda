import "server-only";

import type { Message } from "@/lib/content/schema";
import { db, hasDatabase } from "@/lib/db";

function toMessage(m: { id: string; name: string; phone: string; email: string; note: string; read: boolean; createdAt: Date }): Message {
  return { ...m, createdAt: m.createdAt.toISOString() };
}

export async function listMessages(): Promise<Message[]> {
  if (!hasDatabase) return [];
  const rows = await db().message.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return rows.map(toMessage);
}

export async function countUnread() {
  if (!hasDatabase) return 0;
  return db().message.count({ where: { read: false } });
}

export async function addMessage(input: Omit<Message, "id" | "createdAt" | "read">) {
  return toMessage(await db().message.create({ data: input }));
}

export async function setRead(id: string, read: boolean) {
  await db().message.updateMany({ where: { id }, data: { read } });
}

export async function markAllRead() {
  await db().message.updateMany({ where: { read: false }, data: { read: true } });
}

export async function removeMessage(id: string) {
  await db().message.deleteMany({ where: { id } });
}
