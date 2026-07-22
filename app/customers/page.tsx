import Sidebar from "@/components/Sidebar";
import CustomersPageContent from "@/components/customers/CustomersPageContent";
import { getCustomers } from "@/lib/customers";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <main className="min-h-screen flex bg-[#09090B]">
      <Sidebar />

      <section className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 lg:px-12 lg:py-10">
          <CustomersPageContent customers={customers} />
        </div>
      </section>
    </main>
  );
}
