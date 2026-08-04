import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import WebsiteBriefDetailView from "@/components/website-briefs/WebsiteBriefDetailView";
import { getCustomerById } from "@/lib/customers";
import { getWebsiteBriefLogoSignedUrl } from "@/lib/website-brief-assets";
import { getWebsiteBrief } from "@/lib/website-briefs";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type WebsiteBriefDetailPageProps = {
  params: Promise<{ briefId: string }>;
};

export default async function WebsiteBriefDetailPage({
  params,
}: WebsiteBriefDetailPageProps) {
  const { briefId } = await params;

  if (!UUID_PATTERN.test(briefId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const brief = await getWebsiteBrief(briefId, user.id);
  if (!brief) {
    notFound();
  }

  const [customer, logoSignedUrl] = await Promise.all([
    brief.customer_id
      ? getCustomerById(brief.customer_id, user.id)
      : Promise.resolve(null),
    getWebsiteBriefLogoSignedUrl(brief.logo_storage_path),
  ]);

  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <WebsiteBriefDetailView
            brief={brief}
            customer={customer}
            logoSignedUrl={logoSignedUrl}
          />
        </div>
      </section>
    </main>
  );
}
