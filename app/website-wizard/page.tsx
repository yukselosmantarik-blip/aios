import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StandaloneWebsiteWizard from "@/components/website-wizard/StandaloneWebsiteWizard";
import { getCustomers } from "@/lib/customers";
import { getOrCreateWebsiteWizardAgent } from "@/lib/website-wizard/default-agent";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function WebsiteWizardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const [customers, agent] = await Promise.all([
    getCustomers(),
    getOrCreateWebsiteWizardAgent(user.id),
  ]);

  const customerOptions = customers.map((customer) => ({
    id: customer.id,
    company_name: customer.company_name,
    industry: customer.industry,
    phone: customer.phone,
    email: customer.email,
  }));

  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <StandaloneWebsiteWizard
            agentId={agent.id}
            userId={user.id}
            customers={customerOptions}
          />
        </div>
      </section>
    </main>
  );
}
