import { ToolsEditor } from "@/components/admin/editors";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <PageHeader
        title="Alat & studio"
        description={`Bagian “${content.tools.heading}” (menu “Tools” di website), sebelum bagian kontak: tab, daftar per tab, dan foto (satu per tab atau satu per baris).`}
      />
      <ToolsEditor initial={content.tools} />
    </>
  );
}
