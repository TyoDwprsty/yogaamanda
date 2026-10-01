import { PageHeader } from "@/components/admin/page-header";
import { ProofEditor } from "@/components/admin/proof-editor";
import { FOLLOWER_PLATFORMS } from "@/lib/content/schema";
import { getContent } from "@/lib/content/store";
import { readFollowerSnapshot } from "@/lib/followers/store";

export default async function Page() {
  const [content, snapshot] = await Promise.all([getContent(), readFollowerSnapshot().catch(() => ({}))]);
  // Always edit one row per platform, in a fixed order.
  const proof = {
    ...content.proof,
    followers: FOLLOWER_PLATFORMS.map(
      (platform) =>
        content.proof.followers.find((a) => a.platform === platform) ?? { platform, username: "", mode: "auto" as const, count: 0, show: false },
    ),
  };
  return (
    <>
      <PageHeader
        title="Bukti & pengikut"
        description="Jumlah pengikut, brand yang pernah diajak kerja sama, dan event tempat jadi pembicara."
      />
      <ProofEditor initial={proof} snapshot={snapshot} />
    </>
  );
}
