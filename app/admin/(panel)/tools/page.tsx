import { ToolsEditor } from "@/components/admin/editors";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <PageHeader title="Tools" description="Daftar alat “My daily driver” beserta fotonya." />
      <ToolsEditor initial={content.tools} />
    </>
  );
}
