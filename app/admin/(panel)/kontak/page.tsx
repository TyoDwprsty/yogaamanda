import { ContactEditor } from "@/components/admin/editors";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <PageHeader title="Kontak" description="Judul, teks, email, dan nomor telepon." />
      <ContactEditor initial={content.contact} />
    </>
  );
}
