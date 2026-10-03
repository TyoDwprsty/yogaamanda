import { Inbox } from "@/components/admin/inbox";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";
import { listMessages } from "@/lib/messages";

export default async function MessagesPage() {
  const [content, messages] = await Promise.all([getContent(), listMessages()]);
  return (
    <>
      <PageHeader title="Pesan masuk" description={`Dikirim lewat form “${content.contact.heading}” di bagian kontak website.`} />
      <Inbox messages={messages} />
    </>
  );
}
