import { FooterEditor } from "@/components/admin/editors";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <PageHeader
        title="Footer"
        description="Bagian paling bawah website: nama besar, tulisan emas, ikon media sosial, lalu baris hak cipta, email, dan telepon. Semuanya rata kiri."
      />
      <FooterEditor initial={content.footer} profile={content.profile} />
    </>
  );
}
