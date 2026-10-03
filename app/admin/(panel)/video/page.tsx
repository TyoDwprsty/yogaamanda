import { VideoEditor } from "@/components/admin/editors";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <PageHeader
        title="Video"
        description={`Bagian “${content.video.heading}” (menu “Video” di website), tepat di bawah angka pengikut. File yang di-upload dioptimalkan otomatis.`}
      />
      <VideoEditor initial={content.video} />
    </>
  );
}
