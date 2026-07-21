import { deleteProjectAction } from "@/app/actions/projects";

type DeleteProjectButtonProps = {
  id: string;
};

export default function DeleteProjectButton({ id }: DeleteProjectButtonProps) {
  return (
    <form action={deleteProjectAction.bind(null, id)}>
      <button
        type="submit"
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        Löschen
      </button>
    </form>
  );
}
