import { ContentMediaEditor } from "@/components/admin/editors";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <PageHeader title="Content Media" description="Kanal-kanal konten beserta foto, GIF, atau videonya." />
      <ContentMediaEditor initial={content.contentMedia} />
    </>
  );
}
