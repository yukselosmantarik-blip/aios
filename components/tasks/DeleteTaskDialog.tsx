"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { deleteTaskAction } from "@/app/actions/tasks";
import type { TaskWithProjectName } from "@/components/tasks/TaskList";

type DeleteTaskDialogProps = {
  task: TaskWithProjectName | null;
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string, taskId: string) => void;
};

type DeleteTaskFormProps = {
  task: TaskWithProjectName;
  onClose: () => void;
  onSuccess: (message: string, taskId: string) => void;
};

function DeleteTaskForm({ task, onClose, onSuccess }: DeleteTaskFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTaskAction(task.id);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.success && result.message) {
        onSuccess(result.message, task.id);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label="Dialog schließen"
        className="absolute inset-0 bg-black/70"
        onClick={() => {
          if (!isPending) {
            onClose();
          }
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 shadow-md"
      >
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
            Aufgabe löschen
          </h2>
          <p id={descriptionId} className="mt-2 text-sm text-zinc-400">
            Möchtest du{" "}
            <span className="font-medium text-zinc-200">{task.title}</span>{" "}
            wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>

        <div className="px-6 py-5">
          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-lg bg-red-950/40 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/60 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Wird gelöscht…" : "Aufgabe löschen"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DeleteTaskDialog({
  task,
  open,
  onClose,
  onSuccess,
}: DeleteTaskDialogProps) {
  if (!open || !task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <DeleteTaskForm
        key={task.id}
        task={task}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </div>
  );
}
