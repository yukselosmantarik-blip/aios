import DeleteProjectButton from "@/components/DeleteProjectButton";
import type { Project } from "@/lib/projects";

type ProjectListProps = {
  projects: Project[];
};

export default function ProjectList({ projects }: ProjectListProps) {
  return (
    <section className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Projekte</h2>

      {projects.length === 0 ? (
        <p className="text-gray-500">Noch keine Projekte vorhanden.</p>
      ) : (
        projects.map((project) => (
          <div
            key={project.id}
            className="flex justify-between items-center border-b py-4 last:border-b-0"
          >
            <div>
              <h3 className="font-semibold">{project.name}</h3>
              <p className="text-gray-500 text-sm">{project.type}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                {project.status}
              </span>
              <DeleteProjectButton id={project.id} />
            </div>
          </div>
        ))
      )}
    </section>
  );
}
