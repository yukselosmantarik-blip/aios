export default function Sidebar() {
    return (
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-10">AIOS</h1>
  
        <nav className="space-y-4">
          <p className="cursor-pointer hover:text-blue-400">🏠 Dashboard</p>
          <p className="cursor-pointer hover:text-blue-400">📂 Projekte</p>
          <p className="cursor-pointer hover:text-blue-400">👥 Kunden</p>
          <p className="cursor-pointer hover:text-blue-400">🤖 KI-Agenten</p>
          <p className="cursor-pointer hover:text-blue-400">⚙️ Einstellungen</p>
        </nav>
      </aside>
    );
  }