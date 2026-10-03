import { ProfileEditor } from "@/components/admin/editors";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <PageHeader
        title="Profil"
        description="Bagian paling atas website: foto, nama, tulisan emas, teks pendek, dan akun media sosial. Juga deskripsi untuk Google."
      />
      <ProfileEditor initial={content.profile} />
    </>
  );
}
