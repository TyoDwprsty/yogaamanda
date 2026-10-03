import { Confetti } from "@/components/fx/confetti";
import { Contact } from "@/components/site/contact";
import { ContentMedia } from "@/components/site/content-media";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/site/hero";
import { Nav } from "@/components/site/nav";
import { FollowerBand } from "@/components/site/proof";
import { Tools } from "@/components/site/tools";
import { VideoSection } from "@/components/site/video-section";
import { getContent } from "@/lib/content/store";
import { getFollowerStats } from "@/lib/followers/store";

// Regenerate every 6 hours so automatically read follower counts stay current.
// Admin saves still refresh the page immediately.
export const revalidate = 21600;

export default async function Home() {
  const content = await getContent();
  const followers = await getFollowerStats(content.proof);
  const username = content.proof.followers.find((f) => f.username)?.username;
  const handle = username ? `@${username.replace(/^@/, "")}` : content.profile.name;

  return (
    <div className="relative isolate overflow-x-clip">
      <Confetti />
      <Nav name={content.profile.name} email={content.contact.email} handle={handle} />

      <main>
        <Hero profile={content.profile} />
        <FollowerBand stats={followers} />
        <VideoSection video={content.video} />
        <ContentMedia content={content.contentMedia} />
        <Tools tools={content.tools} />
        <Contact contact={content.contact} socials={content.profile.socials} />
      </main>

      <Footer content={content} />
    </div>
  );
}
