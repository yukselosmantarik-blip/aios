import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName = user?.email?.split("@")[0] ?? "Tarik";

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold">Willkommen bei AIOS 👋</h1>
        <p className="text-gray-600 mt-2">
          Dein AI Operating System für moderne Unternehmen.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="🔍 Suche..."
          className="rounded-lg border px-4 py-2"
        />

        <button className="text-2xl">🔔</button>

        <div className="font-semibold">{displayName}</div>
        <LogoutButton />
      </div>
    </header>
  );
}
