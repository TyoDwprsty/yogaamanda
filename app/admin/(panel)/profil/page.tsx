import { ProfileEditor } from "@/components/admin/editors";
import { PageHeader } from "@/components/admin/page-header";
import { getContent } from "@/lib/content/store";

export default async function Page() {
  const content = await getContent();
  return (
    <>
      <PageHeader title="Profil" description="Foto, nama, tagline emas, bio, dan akun media sosial." />
      <ProfileEditor initial={content.profile} />
    </>
  );
}
