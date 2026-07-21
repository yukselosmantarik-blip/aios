import { createProjectAction } from "@/app/actions/projects";

export default function CreateProjectForm() {
  return (
    <form action={createProjectAction} className="mt-10 flex flex-wrap gap-3">
      <input
        type="text"
        name="name"
        placeholder="Projektname"
        required
        className="rounded-xl border border-gray-200 px-4 py-3"
      />
      <select
        name="type"
        defaultValue="Website"
        className="rounded-xl border border-gray-200 px-4 py-3"
      >
        <option value="Website">Website</option>
        <option value="App">App</option>
        <option value="KI-Agent">KI-Agent</option>
      </select>
      <select
        name="status"
        defaultValue="In Arbeit"
        className="rounded-xl border border-gray-200 px-4 py-3"
      >
        <option value="In Arbeit">In Arbeit</option>
        <option value="Abgeschlossen">Abgeschlossen</option>
        <option value="Geplant">Geplant</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
      >
        + Neues Projekt
      </button>
    </form>
  );
}
