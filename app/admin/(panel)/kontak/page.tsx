import { ContactEditor } from "@/components/admin/editors";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <PageHeader
        title="Kontak"
        description={`Bagian “${content.contact.heading}” (menu “Contact” di website): judul, teks, email, telepon, media sosial, dan form kirim pesan.`}
      />
      <ContactEditor initial={content.contact} />
    </>
  );
}
