import { Inbox } from "@/components/admin/inbox";
import { PageHeader } from "@/components/admin/page-header";
import { listMessages } from "@/lib/messages";

export default async function MessagesPage() {
  const messages = await listMessages();
  return (
    <>
      <PageHeader title="Pesan masuk" description="Dikirim lewat form “Tell me a word” di website." />
      <Inbox messages={messages} />
    </>
  );
}
