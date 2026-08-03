import Link from "next/link";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import CustomerDetailPageContent from "@/components/customers/CustomerDetailPageContent";
import CustomerProjectsSection from "@/components/customers/CustomerProjectsSection";
import { listCustomerNotes } from "@/lib/customer-notes";
import { getCustomers, getCustomerById } from "@/lib/customers";
import { getProjectsByCustomerId } from "@/lib/projects";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CustomerDetailPageProps = {
  params: Promise<{ customerId: string }>;
};

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { customerId } = await params;

  if (!UUID_PATTERN.test(customerId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const customer = await getCustomerById(customerId, user.id);
  if (!customer) {
    notFound();
  }

  const notes = await listCustomerNotes(customerId, user.id);
  const [linkedProjects, allCustomers] = await Promise.all([
    getProjectsByCustomerId(customerId, user.id),
    getCustomers(),
  ]);
  const customerOptions = allCustomers.map((entry) => ({
    id: entry.id,
    company_name: entry.company_name,
  }));
  const projectsWithCustomer = linkedProjects.map((project) => ({
    ...project,
    customer_company_name: customer.company_name,
  }));
  const ownerLabel =
    user.user_metadata?.full_name?.toString() ||
    user.email?.split("@")[0] ||
    "Ich";

  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <Link
            href="/customers"
            className="mb-6 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            ← Zurück zur Kundenliste
          </Link>
          <CustomerDetailPageContent
            key={`${customer.id}-${customer.updated_at}-${notes.length}`}
            customer={customer}
            notes={notes}
            ownerLabel={ownerLabel}
          />
          <CustomerProjectsSection
            key={`projects-${projectsWithCustomer.length}-${customer.updated_at}`}
            customerId={customer.id}
            customerCompanyName={customer.company_name}
            projects={projectsWithCustomer}
            customerOptions={customerOptions}
          />
        </div>
      </section>
    </main>
  );
}
